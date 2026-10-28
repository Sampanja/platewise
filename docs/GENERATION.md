# Platewise – reseptien generointi

Miten viikon päivälliset generoidaan Claude API:lla: mallin asetukset, system prompt, JSON-skeema (Zod), allergiatarkistuksen kulku ja budjetin korjaussilmukka. Pohjana [PLAN.md](PLAN.md), [DATA_MODEL.md](DATA_MODEL.md) ja [CLAUDE.md](../CLAUDE.md):n arkkitehtuuriperiaatteet. Tämä on suunnitelma; koodi kirjoitetaan myöhemmin Edge Functioneihin (TypeScript, `@anthropic-ai/sdk`).

## 1. Periaatteet

1. **Malli suunnittelee, koodi päättää.** Claude valitsee ruoat, ainesosat ja grammamäärät. Kaikki, mikä voi olla väärin vaarallisella tai harhaanjohtavalla tavalla (allergeenit, ruokavalio, makrot, hinta, budjetti), lasketaan ja tarkistetaan deterministisesti koodissa.
2. **Suljettu ainesosalista kahdessa kerroksessa.** Skeema sallii vain katalogin slugit (`enum`), ja käyttäjälle kielletyt slugit suodatetaan jo ennen mallia. Koodi tarkistaa silti jokaisen reseptin.
3. **Terveystiedot eivät lähde backendistä.** Mallille ei kerrota käyttäjän allergioita eikä ruokavaliota. Se saa vain listan slugeista, joita ei saa käyttää, ilman syytä. Allergia- ja ruokavaliotietoa ei siis lähetetä Anthropicille, eikä se päädy lokeihin.
4. **Mallilta ei pyydetä lukuja, joita näytetään käyttäjälle.** Skeemassa ei ole kenttiä kaloreille, makroille eikä hinnoille.
5. **Uudelleenkäyttö ensin.** Mitä enemmän sopivia reseptejä kannassa on, sitä vähemmän päiviä generoidaan.

## 2. Kulku yleiskuvana

```
Sovellus: "Luo viikko"
   │  POST /generate-plan  → palauttaa heti plan_id (status = generating)
   ▼
Edge Function (taustatyö, EdgeRuntime.waitUntil)
   │
   ├─ 0. Tilaus voimassa? Budjetti realistinen? (esitarkistus)
   ├─ 1. Rakenna käyttäjän sääntöjoukko (allergeenit, ruokavaliot, inhokit, perusvarat)
   ├─ 2. Uudelleenkäyttö: hae sopivat valmiit reseptit → täytä osa päivistä
   ├─ 3. Claude: generoi puuttuvat päivät (strukturoitu JSON)
   │        │
   │        ▼
   ├─ 4. Zod-validointi ──────────────┐
   ├─ 5. Allergia- ja ruokavaliotarkistus ┤ virheet → korjauspyyntö Claudelle
   ├─ 6. Makrot (Fineli) + hinnat         │   (enintään 2 korjauskierrosta)
   ├─ 7. Ostoslista + budjettivertailu ───┘
   ├─ 8. Tallenna reseptit, viikkolista, ostoslista; status = ready
   └─ 9. Kuvat jonoon (tai liitä olemassa oleva kuva)
   ▼
Sovellus kuuntelee meal_plans-riviä (Supabase Realtime) → näyttää viikon
```

Generointi on asynkroninen, koska se voi kestää kymmeniä sekunteja korjauskierroksineen. Sovellus näyttää sillä välin edistymisnäkymän ("Suunnitellaan viikkoasi…"). Edge Functionin aikaraja tarkistetaan toteutusvaiheessa. Jos se ei riitä, generointi siirretään jonotyöksi samalla tavalla kuin kuvat.

## 3. Malli ja API-asetukset

| Asetus | Arvo | Perustelu |
|---|---|---|
| Malli | `claude-opus-5-5` (ympäristömuuttuja `GENERATION_MODEL`) | Paras laatu suomeksi ja rajoitteiden noudattamisessa. Halvemmat vaihtoehdot ks. kohta 11. |
| Kutsu | `client.messages.parse()` + `output_config.format: zodOutputFormat(GenerationResponse)` | SDK validoi vastauksen skeemaa vasten ja palauttaa `parsed_output`. |
| Thinking | adaptiivinen (oletus; Opus 5.5:llä ei voi kytkeä pois) | Viikon suunnittelu (pakkausten jako, vaihtelu, budjetti) hyötyy ajattelusta. |
| Effort | `output_config.effort: "medium"` aluksi, mitataan myös `"low"` | Opus 5.5:n oletus on `medium`; asetetaan silti eksplisiittisesti. |
| `max_tokens` | 16 000 | Viikko (≤ 7 reseptiä) mahtuu hyvin; ei streamingia tarvita. |
| Prompt caching | `cache_control` system promptin (ohjeet + katalogi) loppuun | System prompt on sama kaikille käyttäjille saman katalogiversion ajan. |
| Refusal-fallback | `fallbacks: "default"` + beta `server-side-fallback-2026-07-01` | Kieltäytyminen on reseptien kohdalla epätodennäköistä, mutta fallback on oletuksena päällä. Tarkistetaan toteutuksessa, toimiiko yhdessä `parse()`-kutsun kanssa (beta-endpoint). |
| Lopetussyyt | `stop_reason` tarkistetaan aina ennen `parsed_output`ia | `refusal` → virhe ja uusi yritys; `max_tokens` → virhe (ei pitäisi tapahtua). |
| Uudelleenyritykset | SDK:n oletus (2) 429/5xx-virheille | Lisäksi oma yksi uusintayritys koko generoinnille ennen `failed`-tilaa. |

## 4. Mitä mallille lähetetään

### Välimuistissa oleva osa (system prompt)
Sama kaikille käyttäjille: ohjeet (kohta 5) ja **koko aktiivinen ainesosakatalogi perushinnoin** (kerroin 1,0). Katalogi päivittyy harvoin, joten välimuisti osuu lähes aina. Muoto, yksi rivi per ainesosa:

```
slug | nimi | osasto | pakkaus_g | hinta_eur_kg | perusvara_mahdollinen
chicken_breast | broilerin rintafile | meat_fish | 400 | 13.50 | ei
crushed_tomatoes | tomaattimurska | canned | 390 | 3.10 | ei
cumin_ground | juustokumina, jauhettu | spices_oils | 30 | 60.00 | kyllä
```

### Käyttäjäkohtainen osa (user message)
Muuttuu joka pyynnöllä, eikä siksi ole välimuistissa:

- henkilömäärä (1 tai 2)
- generoitavat päivät (esim. ma, ti, to, pe)
- jo täytetyt päivät uudelleenkäytetyillä resepteillä: nimi ja ainesosat grammoina, jotta malli voi hyödyntää samoja pakkauksia
- budjettitavoite **perushinnoissa**: `budjetti / ketjun kerroin`, jolloin katalogin hinnat pätevät suoraan
- kotoa löytyvät slugit (käyttäjän perusvarat)
- **"Älä käytä" -slugit**: allergeenit (myös "saattaa sisältää", jos `strict`), ruokavalion kieltämät tagit ja inhokit yhdessä listassa, ilman syytä
- viime viikkojen reseptien nimet toiston välttämiseksi

## 5. System prompt

Versio `plan-v1`. Kirjoitettu suomeksi, koska tuotos on suomeksi ja tiimi ylläpitää sitä.

```text
Olet Platewisen ruokasuunnittelija. Suunnittelet arkipäivällisiä yhden tai kahden hengen
talouksille Suomessa. Ainesosat ostetaan tavallisesta suomalaisesta ruokakaupasta.

TEHTÄVÄ
Saat käyttäjän viestissä generoitavat päivät, henkilömäärän, viikon budjettitavoitteen,
jo suunnitellut päivät, kotoa löytyvät perusvarat ja listan ainesosista, joita ei saa käyttää.
Palauta jokaiselle generoitavalle päivälle yksi päivällisresepti annetun skeeman mukaisesti.

AINESOSAT
- Käytä vain alla olevan katalogin ainesosia ja viittaa niihin täsmälleen niiden slugilla.
- Älä koskaan käytä käyttäjän viestin "Älä käytä" -listan ainesosia.
- Älä mainitse nimessä, kuvauksessa, valmistusohjeessa tai esikäsittelyssä yhtään ruoka-ainetta,
  joka ei ole reseptin ainesosalistassa. Ei tarjoiluehdotuksia ("tarjoile pähkinöiden kanssa"),
  ei vaihtoehtoja ("tai käytä kermaa") eikä tuotemerkkejä.
- grams_per_serving on yhden annoksen syötävä määrä grammoina.

HINTA JA HÄVIKKI
- Viikon ostosten tulee mahtua budjettitavoitteeseen. Katalogin hinnat ovat €/kg.
- Ostokset tehdään kokonaisina pakkauksina (pakkaus_g). Suunnittele viikko niin, että avatut
  pakkaukset käytetään loppuun: jos yksi resepti käyttää puolet kermasta, käytä loput toisessa.
- Kotoa löytyvät perusvarat ovat ilmaisia; käytä niitä normaalisti.
- Muut mausteet ostetaan kokonaisina pakkauksina, joten käytä samoja mausteita useana päivänä
  äläkä ota uutta maustetta yhteen reseptiin.
- Suosi edullisia, kotimaisia ja sesongin perusraaka-aineita.

RUOAT
- Arkiruokaa: valmistusaika yleensä enintään 40 minuuttia, vaikeustaso helppo tai keskitaso.
- Vaihtelua: ei samaa pääproteiinia eikä samaa ruokatyyppiä kahtena peräkkäisenä päivänä,
  eikä toistoa viime viikkojen resepteistä.
- Vähintään kaksi viikon ruoista säilyy ja lämpenee hyvin seuraavan päivän lounaaksi.
  Merkitse good_for_leftovers rehellisesti.
- Ruokaturvallisuus: kypsennä broileri, jauheliha ja kala kunnolla; mainitse tämä ohjeessa.

KIRJOITUSTYYLI
- Selkeää yleiskieltä. Nimi lyhyt ja houkutteleva, kuvaus yksi lause.
- Valmistusohje 3–8 vaihetta, jokainen yksi tai kaksi lyhyttä käskymuotoista lausetta.
- Älä kirjoita ravintoarvoja, kaloreita tai hintoja – ne lasketaan muualla.
- image_prompt_en: lyhyt englanninkielinen kuvaus valmiista annoksesta lautasella kuvaa varten.

KORJAUKSET
- Jos saat korjauspyynnön, palauta vain pyydetyt päivät samalla skeemalla. Muut päivät pysyvät.

KATALOGI (versio {catalog_version})
slug | nimi | osasto | pakkaus_g | hinta_eur_kg | perusvara_mahdollinen
{catalog_rows}
```

### Käyttäjäviestin pohja

```text
Henkilömäärä: {household_size}
Generoitavat päivät: {days_to_generate}            esim. "0 (ma), 1 (ti), 3 (to)"
Budjettitavoite koko viikolle perushinnoin: noin {target_eur} €, enintään {max_eur} €
Jo suunnitellut päivät:
{fixed_days}                                          esim. "2 (ke): Linssikeitto – red_lentils 80 g, carrot 100 g, …"
Kotoa löytyy: {pantry_slugs}
Älä käytä: {forbidden_slugs}
Viime viikkojen ruoat (älä toista): {recent_titles}
```

`target_eur` on 90 % budjetista ja `max_eur` 100 %. Tavoite jätetään alle maksimin, koska malli arvioi pakkausmatematiikan epätarkasti.

## 6. JSON-skeema (Zod)

Skeema on staattinen yhden katalogiversion ajan, jolloin API:n skeemakäännös (24 h välimuisti) osuu. Slug-`enum` sisältää **koko aktiivisen katalogin**, ei käyttäjäkohtaisesti suodatettua listaa: käyttäjäkohtainen enum tekisi jokaisesta skeemasta uniikin. Käyttäjäkohtaiset kiellot hoitavat prompti ja koodin tarkistus.

```ts
// Luonnos – ei vielä toteutusta.
const IngredientLine = z.object({
  slug: z.enum(CATALOG_SLUGS),                 // koko aktiivinen katalogi
  grams_per_serving: z.number().min(1).max(600),
  preparation_fi: z.string().max(60).nullable(), // "hienonnettuna"
});

const GeneratedRecipe = z.object({
  day_index: z.number().int().min(0).max(6),
  title_fi: z.string().min(3).max(60),
  description_fi: z.string().max(160),
  dish_type: z.enum(["soup", "stew", "pasta", "rice", "potato", "oven",
                     "stir_fry", "salad", "bowl", "wrap", "other"]),
  difficulty: z.enum(["easy", "medium"]),
  cook_time_min: z.number().int().min(5).max(120),
  good_for_leftovers: z.boolean(),
  ingredients: z.array(IngredientLine).min(3).max(15),
  steps_fi: z.array(z.string().max(300)).min(3).max(8),
  image_prompt_en: z.string().max(300),
});

export const GenerationResponse = z.object({
  recipes: z.array(GeneratedRecipe).min(1).max(7),
});
```

Huomiot:

- API ei tue numero- ja pituusrajoja (`min`, `max`) skeemassa. TypeScript-SDK poistaa ne API:lle lähetettävästä skeemasta ja validoi ne itse vastauksesta, joten ne voi kirjoittaa Zodiin normaalisti.
- Lisävalidointi koodissa (ei skeemassa): `day_index` on pyydetyissä päivissä ja kukin vain kerran, ja reseptin sisällä slug esiintyy vain kerran.
- Slug-enumin koko (~300–500 arvoa) testataan heti alussa. Jos API rajoittaa enumin kokoa, `slug` muutetaan `z.string()`:ksi ja tuntemattomat slugit hylätään koodissa, kuten tarkistus tekee joka tapauksessa.
- Validointivirhe (`parsed_output` puuttuu tai Zod hylkää) käsitellään kuten tarkistusvirhe: korjauskierros, jossa virhe kerrotaan mallille.

## 7. Allergia- ja ruokavaliotarkistus

### 7.1 Sääntöjoukko (ennen generointia)
`buildUserRules(userId)` muodostaa yhdestä paikasta:

- `forbiddenAllergens`: käyttäjän allergeenikoodit sekä tieto, onko `strict` päällä
- `forbiddenTags`: valittujen ruokavalioiden `diet_excluded_tags`-tagien unioni
- `dislikedIngredientIds`
- `forbiddenIngredientIds`: aktiiviset ainesosat, joilla on kielletty allergeeni (strict-tilassa myös `may_contain`), kielletty tagi tai jotka ovat inhokkeja. Tästä tehdään promptin "Älä käytä" -lista.

### 7.2 Tarkistus (jokaiselle reseptille, myös uudelleenkäytetyille)
`checkRecipe(recipe, rules, catalog)` on puhdas funktio, joka palauttaa listan rikkeitä. Tyhjä lista tarkoittaa hyväksyttyä reseptiä. Tarkistukset tehdään järjestyksessä, ja kaikki rikkeet kerätään (ei lopeteta ensimmäiseen):

| # | Tarkistus | Rike |
|---|---|---|
| 1 | Slug löytyy katalogista ja on aktiivinen | `UNKNOWN_INGREDIENT`, `INACTIVE_INGREDIENT` |
| 2 | Ainesosalla ei ole kiellettyä allergeenia (`ingredient_allergens`) | `ALLERGEN` |
| 3 | Strict-tilassa ainesosalla ei ole kiellettyä "saattaa sisältää" -allergeenia | `ALLERGEN_MAY_CONTAIN` |
| 4 | Ainesosalla ei ole ruokavalion kieltämää tagia | `DIET_TAG` |
| 5 | Ainesosa ei ole inhokki | `DISLIKED` |
| 6 | Vapaat tekstit (`title_fi`, `description_fi`, `steps_fi`, `preparation_fi`) eivät sisällä kielletyn allergeenin avainsanaa | `ALLERGEN_KEYWORD` |

Avainsanahaun (6) yksityiskohdat:

- Teksti normalisoidaan: pienet kirjaimet, Unicode NFC ja ylimääräiset välit pois.
- `except_phrases` poistetaan tekstistä ennen hakua (esim. "kookosmaito" ei laukaise `maito`-sanaa).
- Haku on **osajonohaku**, ei kokosanahaku, koska suomen yhdyssanat ("maapähkinävoi", "vehnätortilla") pitää löytää. Väärät positiiviset ovat hyväksyttäviä: ne johtavat vain uuteen yritykseen. Toistuvat väärät positiiviset korjataan lisäämällä `except_phrases`.
- Perusvarat tarkistetaan samoin kuin muut ainesosat. Kotoa löytyvä vehnäjauho ei ole sallittu gluteeniallergikolle.

### 7.3 Mitä rikkeille tehdään
- Rikkeitä sisältävä resepti **ei koskaan** tallennu `recipes`-tauluun eikä näy käyttäjälle.
- Korjauspyynnössä mallille kerrotaan rike neutraalisti, ilman allergiaa: *"Päivä 2: ainesosa `cashew_nuts` ei ole sallittu."* tai *"Päivä 4: valmistusohje mainitsee 'pähkinä', jota ei ole ainesosissa. Poista maininta."*
- `generation_runs.outcome` saa arvon `rejected_allergen` tai `rejected_diet` sen mukaan, mikä esti onnistumisen. Rikkeiden yksityiskohtia ei lokiteta.
- Jos päivä ei läpäise tarkistusta korjauskierrostenkaan jälkeen, se täytetään uudelleenkäytettävällä hyväksytyllä reseptillä. Jos sellaista ei ole, päivä jätetään tyhjäksi ja käyttäjä näkee viestin "Yhtä päivää ei saatu suunniteltua – kokeile Vaihda annos". Jos tyhjiä päiviä on yli puolet, suunnitelma merkitään `failed`.

### 7.4 Milloin tarkistus ajetaan uudelleen
- **Uudelleenkäytössä** aina, vaikka resepti olisi hyväksytty aiemmin toiselle käyttäjälle. Taulukkokentät (`allergen_codes` ym.) ovat vain esisuodatin.
- **Kun käyttäjä muuttaa allergioitaan tai ruokavaliotaan**, kuluvan ja tulevien viikkojen listat tarkistetaan heti. Ristiriitaiset päivät merkitään sovelluksessa varoituksella ja vaihdetaan automaattisesti (`swap`, ei lasketa vaihtorajaan).
- **Kun viitedata muuttuu** (ainesosan allergeenit, avainsanat, ruokavaliosäännöt), `checks_version` nousee. Taustatyö tarkistaa kaikki `active`-reseptit uudelleen ja siirtää rikkovat `retired`-tilaan, ja niitä käyttävät tulevat suunnitelmat tarkistetaan kuten edellä.

### 7.5 Testit
`checkRecipe` ja `buildUserRules` testataan taulukkotesteinä ennen kuin generointi kytketään päälle. Vähintään nämä tapaukset:

- jokainen EU-allergeeni: suora ainesosa → hylkäys
- "saattaa sisältää": strict → hylkäys, ei-strict → hyväksyntä
- avainsana vaiheissa, kun ainesosa puuttuu ainesosista → hylkäys
- yhdyssanat: "maapähkinävoi", "vehnätortilla", "kermaviili" → hylkäys oikealla allergeenilla
- poikkeukset: "kookosmaito" maitoallergikolle → hyväksyntä
- isot kirjaimet, ääkköset ja NFD-muotoinen teksti → sama tulos kuin normaalissa tekstissä
- vegaani + hunaja / gelatiini → hylkäys; pescetaristi + kala → hyväksyntä, + broileri → hylkäys
- perusvaroissa oleva vehnäjauho gluteeniallergikolle → hylkäys
- tuntematon ja passivoitu slug → hylkäys
- useita rikkeitä samassa reseptissä → kaikki raportoidaan

## 8. Hinta ja budjetin korjaussilmukka

### 8.1 Laskenta (koodissa)
1. **Ainesosan kg-hinta ketjulle**: `coalesce(ketjukohtainen hinta, round(perushinta × kerroin))`.
2. **Ostoslista**: kaikkien päivällisten ainesosat summattuna (`grams_per_serving × servings`, tuplatut päivät kahdesti), **perusvarat pois**. Pakkaukset: `ceil(total_g / package_size_g)`.
3. **Viikon hinta-arvio** = Σ `pakkaukset × pakkauskoko × kg-hinta`. Tätä verrataan budjettiin.
4. **Päivän osuus** (kortissa näytettävä hinta ja korjauksen kohdistus): jokaisen ostettavan ainesosan pakkauskustannus jaetaan päiville käytettyjen grammojen suhteessa. Päivien summa on siis sama kuin ostoslistan summa.

Budjetti tarkoittaa MVP:ssä **viikon päivällisten ostoksia** (perusvaroja lukuun ottamatta). UI:ssa käytetään samaa muotoilua.

### 8.2 Esitarkistus
Ennen generointia: jos `budjetti < päivälliset × henkilömäärä × MIN_COST_PER_SERVING` (aluksi 1,50 €, säädettävä), generointia ei aloiteta. Sovellus kertoo jo onboardingissa ja asetuksissa, mikä on realistinen vähimmäisbudjetti valinnoilla.

### 8.3 Silmukka

```
kierros = 1
vastaus = Claude(generoi puuttuvat päivät)
toista:
    hylätyt = validoi + checkRecipe jokaiselle
    hinta   = laske ostoslista (hyväksytyt + uudelleenkäytetyt)
    jos ei hylättyjä ja hinta ≤ budjetti: VALMIS
    jos kierros == MAX_ROUNDS (3): lopeta, valitse paras tulos
    # Halpa korjaus ensin: ei API-kutsua
    jos vain budjetti ylittyy:
        yritä korvata kallein päivä halvemmalla uudelleenkäytettävällä reseptillä
        jos nyt ≤ budjetti: VALMIS
    vastaus = Claude(korjauspyyntö), joka jatkaa samaa keskustelua
    kierros += 1
```

- **Korjauspyyntö jatkaa samaa keskustelua**: edellinen vastaus lisätään assistant-viestiksi ja korjaus uudeksi user-viestiksi. Mallilla on näin konteksti, ja välimuistissa oleva system prompt osuu edelleen. Historiaa ei muokata (vain lisätään).
- **Korjauspyynnön sisältö** budjetin ylittyessä: viikon hinta-arvio, budjetti, ylitys, kahden kalleimman päivän hinta ja kalleimmat ainesosat sekä ainesosat, joista jää ylijäämää. Pyydetään korvaamaan nimetyt päivät edullisemmilla ja hyödyntämään jo ostettavia ainesosia. Rikkeet ja budjetti kerrotaan samassa viestissä, jotta yksi kierros korjaa molemmat.
- **Paras tulos**, jos kierrokset loppuvat: valitaan versio, jossa on vähiten tyhjiä päiviä ja sitten pienin ylitys. Ylitetty suunnitelma tallennetaan `ready`-tilassa. Sovellus näyttää rehellisesti esim. "Viikko ylittää budjetin 3,20 € – vaihda jokin annos halvempaan" ja korostaa kalleimman päivän. `generation_runs.outcome = over_budget`.
- **Selvästi alle budjetin** (esim. alle 60 %) hyväksytään sellaisenaan, eikä silmukkaa ajeta. Säästö on käyttäjälle hyvä asia.

## 9. Annoksen vaihto, tuplaus ja perusvarat

| Toiminto | Kulku | Tekoälykutsu? |
|---|---|---|
| **Vaihda annos** | Sama putki yhdelle päivälle: muut päivät annetaan "jo suunniteltuina". Ensin yritetään uudelleenkäyttöä. Budjetti tarkistetaan koko viikolle. `meal_plans.swaps_used += 1`, raja aluksi 5 / viikko. | Vain jos uudelleenkäyttö ei löydä sopivaa |
| **Tee tuplana** | `recalculate-plan`: asetetaan `cook_double`, luodaan lounasrivi seuraavalle päivälle, lasketaan ostoslista ja budjetti uudelleen. Valinta näytetään vain, kun `good_for_leftovers = true` ja päivä on ma–la. | Ei |
| **Perusvarojen muutos** | `recalculate-plan`: ostoslista ja budjetti lasketaan uudelleen, ja reseptinäkymän "kotoa"-merkinnät päivittyvät. | Ei |

Tuplaus voi viedä viikon yli budjetin. Silloin budjettimittari näyttää ylityksen, mutta mitään ei vaihdeta automaattisesti: käyttäjä teki valinnan itse.

## 10. Kuvat

1. Kun resepti tallennetaan, lasketaan `dish_signature` = `dish_type` + kolme grammamäärältään suurinta ei-perusvara-ainesosaa aakkosjärjestyksessä (esim. `stew:carrot,chickpeas,crushed_tomatoes`).
2. Jos samalla signaturella on `ready`-kuva, se liitetään reseptiin heti.
3. Muuten `recipe_images`-riville tulee `queued`, ja image-worker generoi kuvan kuvamallilla. Prompt = `image_prompt_en` + kiinteä tyylipohja (*"Overhead photo of a home-cooked dish on a simple plate, natural daylight, realistic, no text, no hands, no packaging"*).
4. Kunnes kuva on valmis, sovellus näyttää `dish_type`-kohtaisen piirroskuvan.

## 11. Kustannukset ja mallin valinta

Karkea arvio yhdelle viikkosuunnitelmalle, jossa on viisi generoitua päivällistä (listahinnat 10/2026):

| Osa | Tokenit (arvio) |
|---|---|
| System prompt + katalogi (välimuistista) | ~8 000 |
| Käyttäjäviesti | ~800 |
| Tuloste + ajattelu | ~5 000–8 000 |
| Korjauskierroksia keskimäärin | ~0,5 |

| Malli | Hinta / suunnitelma (arvio) | Huom. |
|---|---|---|
| `claude-opus-5-5` ($4 / $20 per MTok, välimuistiluku $0,20) | ~0,12–0,25 $ | Oletus |
| `claude-sonnet-5-5` ($2 / $10) | ~0,06–0,12 $ | Todennäköisesti riittävä; mitataan |
| `claude-haiku-5-5` ($0,10 / $0,50) | < 0,01 $ | Kokeiltava vaihdoille ja uudelleengeneroinneille |

Kuukaudessa noin neljä suunnitelmaa ja muutama vaihto per käyttäjä tarkoittaa Opuksella noin 0,5–1,2 $, mikä mahtuu 4,99 €:n tilaukseen. Mallin vaihto on yksi ympäristömuuttuja. **Halvempaan malliin vaihdetaan vasta, kun eval (kohta 12) näyttää laadun pysyvän.** Päätös on tuotteen omistajan.

Kustannukset kirjataan jokaisesta kutsusta `generation_runs`-tauluun (`input_tokens`, `output_tokens`, `cost_micro_usd`, välimuistiosumat), ja niitä seurataan käyttäjää kohden alusta asti.

## 12. Laadunvarmistus

- **Yksikkötestit**: `checkRecipe`, `buildUserRules`, hinta- ja pakkauslaskenta, päiväosuuksien jako, budjettisilmukan päätöslogiikka (mallin vastaukset mockattuina).
- **Eval-aineisto** ennen julkaisua: noin 30 testiprofiilia (1/2 henkeä, eri budjetit, ketjut, allergiayhdistelmät, vegaani + useampi allergia, tiukka budjetti). Jokaisesta mitataan:
  - hyväksyttyjen reseptien osuus ensimmäisellä kierroksella
  - korjauskierrosten määrä
  - budjetissa pysyminen ja ylijäämägrammat
  - kustannus ja kesto
  - ihmisarvio 1–5 (houkuttelevuus, realistisuus, ohjeiden selkeys)
- Evalilla verrataan malleja (Opus/Sonnet/Haiku), effort-tasoja ja prompt-versioita. Jokainen promptin muutos nostaa `prompt_version`-arvoa (`plan-v1` → `plan-v2`), ja tulos kirjataan.
- **Tuotannossa**: hylkäysprosentti, ylitysprosentti, peukut ja `retired`-reseptien määrä prompt-versioittain.

## 13. Tietosuoja

- Anthropicille lähetetään vain katalogi, henkilömäärä, budjetti, päivät, perusvarat ja kielletyt slugit ilman syytä. Allergia- ja ruokavaliotietoja ei lähetetä.
- Anthropic on henkilötietojen käsittelijä (DPA ja tietosuojaselosteeseen maininta). Pyyntöihin ei liitetä käyttäjän nimeä tai sähköpostia.
- Lokeihin ja Sentryyn ei kirjata promptteja eikä mallin vastauksia sellaisenaan, koska "Älä käytä" -listasta voi päätellä allergioita. Vianselvitykseen tallennetaan vain `generation_runs`-rivin metatiedot.

## 14. Avoimet kysymykset

1. **Budjetin merkitys:** kattaako käyttäjän viikkobudjetti vain päivälliset (tämän dokumentin oletus) vai kaikki ruokaostokset? Jos kaikki, tarvitaan profiiliin erillinen "päivällisten osuus".
2. **Malli:** aloitetaanko Opus 5.5:llä ja kokeillaan halvempia evalin jälkeen (suositus), vai aloitetaanko suoraan Sonnet 5.5:llä?
3. **Vaihtoraja:** riittääkö 5 vaihtoa viikossa, ja näytetäänkö raja käyttäjälle?
