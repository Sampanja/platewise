# Platewise – reseptien generointi

Miten ateriasuunnitelma generoidaan Claude API:lla: mallin asetukset, system prompt, JSON-skeema (Zod), allergiatarkistuksen kulku ja budjetin korjaussilmukka. Pohjana [PLAN.md](PLAN.md), [DATA_MODEL.md](DATA_MODEL.md) ja [CLAUDE.md](../CLAUDE.md):n arkkitehtuuriperiaatteet. Tämä on suunnitelma; koodi kirjoitetaan myöhemmin Edge Functioneihin (TypeScript, `@anthropic-ai/sdk`).

## 1. Periaatteet

1. **Yksi moottori: N päivällistä + budjetti → yksi ostoslista.** Viikkosuunnitelma (N = 7, profiilin viikkobudjetti) ja kauppareissu (N = 2–7, oma budjetti) ovat saman putken esiasetuksia. Putki ei tiedä tilasta muuta kuin N:n ja budjetin.
2. **Malli suunnittelee, koodi päättää.** Claude valitsee ruoat, ainesosat ja grammamäärät. Kaikki, mikä voi olla väärin vaarallisella tai harhaanjohtavalla tavalla (allergeenit, ruokavalio, makrot, hinta, budjetti), lasketaan ja tarkistetaan deterministisesti koodissa.
3. **Suljettu ainesosalista kahdessa kerroksessa.** Skeema sallii vain katalogin slugit (`enum`), ja käyttäjälle kielletyt slugit suodatetaan jo ennen mallia. Koodi tarkistaa silti jokaisen reseptin.
4. **Terveystiedot eivät lähde backendistä.** Mallille ei kerrota käyttäjän allergioita eikä ruokavaliota. Se saa vain listan slugeista, joita ei saa käyttää, ilman syytä.
5. **Mallilta ei pyydetä lukuja, joita näytetään käyttäjälle.** Skeemassa ei ole kenttiä kaloreille, makroille eikä hinnoille.
6. **Uudelleenkäyttö ensin.** Mitä enemmän sopivia reseptejä kannassa on, sitä vähemmän aterioita generoidaan.

## 2. Kulku yleiskuvana

```
Sovellus: "Suunnittele viikko" (N = 7) tai "Kauppareissu" (N = 2–7)
   │  POST /generate-plan { kind, meal_count, budget_cents, start_date }
   │  → palauttaa heti plan_id (status = generating)
   ▼
Edge Function (taustatyö, EdgeRuntime.waitUntil)
   │
   ├─ 0. Tilaus voimassa? Suunnitelmaraja? Budjetti realistinen? (esitarkistus)
   ├─ 1. Rakenna käyttäjän sääntöjoukko (allergeenit, ruokavaliot, inhokit, perusvarat)
   ├─ 2. Uudelleenkäyttö: hae sopivat valmiit reseptit → täytä osa aterioista
   ├─ 3. Claude: generoi puuttuvat ateriat (strukturoitu JSON)
   │        │
   │        ▼
   ├─ 4. Zod-validointi ─────────────────┐
   ├─ 5. Allergia- ja ruokavaliotarkistus ┤ virheet → korjauspyyntö Claudelle
   ├─ 6. Makrot (Fineli) + hinnat         │   (enintään max_correction_rounds)
   ├─ 7. Ostoslista + budjettivertailu ───┘
   ├─ 8. Tallenna reseptit, ateriat, ostoslista; status = ready
   └─ 9. Kuvat jonoon (tai liitä olemassa oleva kuva)
   ▼
Sovellus kuuntelee meal_plans-riviä (Supabase Realtime) → näyttää suunnitelman
```

Generointi on asynkroninen, koska se voi kestää kymmeniä sekunteja korjauskierroksineen. Sovellus näyttää sillä välin edistymisnäkymän ("Suunnitellaan aterioitasi…"). Edge Functionin aikaraja tarkistetaan toteutusvaiheessa. Jos se ei riitä, generointi siirretään jonotyöksi samalla tavalla kuin kuvat.

## 3. Malli ja API-asetukset

| Asetus | Arvo | Perustelu |
|---|---|---|
| Malli | `app_config.generation_model`, oletus `claude-sonnet-5-5` | Hyvä laatu ja hinta. Vaihdettavissa ilman julkaisua. `claude-opus-5-5` on testiaineiston vertailukohta (kohta 12). |
| Kutsu | `client.beta.messages.create()` + `output_config.format` (Zod-skeemasta johdettu JSON-skeema), vastaus validoidaan omalla Zod-skeemalla | Beta-endpoint tarvitaan varamallin vuoksi. Jos SDK tarjoaa `parse()`-apufunktion myös beta-nimiavaruudessa, käytetään sitä; tarkistetaan toteutuksessa. Zod-validointi tehdään joka tapauksessa. |
| Thinking | adaptiivinen (oletus, parametri jätetään pois) | Suunnittelu (pakkausten jako, vaihtelu, budjetti) hyötyy ajattelusta. |
| Effort | `app_config.generation_effort`, aluksi `"medium"` | Sonnet 5.5:n oletus on `high`, mutta tasot on kalibroitu uudelleen. Testiaineistolla mitataan `low`, `medium` ja `high`. |
| `max_tokens` | 16 000 | Seitsemän reseptiä mahtuu hyvin; streamingia ei tarvita. |
| Prompt caching | `cache_control` system promptin (ohjeet + katalogi) loppuun | System prompt on sama kaikille käyttäjille saman katalogiversion ajan. |
| Varamalli | `fallbacks: "default"` + beta-otsake `server-side-fallback-2026-07-01` | Tarkistettu dokumentaatiosta, ks. alla. |
| Lopetussyyt | `stop_reason` tarkistetaan aina ennen sisällön lukemista | `refusal` → oma uusintayritys (alla); `max_tokens` → virhe. |
| Uudelleenyritykset | SDK:n oletus (2) 429-, 5xx- ja yhteysvirheille | Lisäksi yksi uusintayritys koko generoinnille ennen `failed`-tilaa. |

### Varamalli (tarkistettu Anthropicin dokumentaatiosta 2026-10-28)

Lähteet: [Refusals and fallback](https://platform.claude.com/docs/en/build-with-claude/refusals-and-fallback) ja [Claude Sonnet 5.5 migration guide](https://platform.claude.com/docs/en/models/sonnet-5-5/migration-guide).

- Toimii kuvatulla tavalla: `fallbacks: "default"` ja beta-otsake `server-side-fallback-2026-07-01`. Kun turvallisuusluokittelija hylkää pyynnön, API ajaa saman pyynnön suositellulla varamallilla saman kutsun sisällä.
- Saatavilla Claude API:ssa (beta). Ei Message Batches API:ssa.
- **Sonnet 5.5:llä** varamalli ajetaan vain luokille `cyber` ja `frontier_llm`. Luokkia `bio`, `reasoning_extraction` ja `general_harms` ei yritetä uudelleen. Resepteille todennäköisin väärä hylkäys olisi `general_harms`, joten varamallin hyöty meille on pieni. Siitä ei kuitenkaan ole haittaa, ja se on yksi parametri.
- Varamalli ei auta rate limit-, ylikuormitus- tai palvelinvirheissä; ne palautuvat sellaisenaan.
- Vastauksen `model`-kenttä kertoo, mikä malli vastasi. Se kirjataan `generation_runs.model`-kenttään ja pyydetty malli `requested_model`-kenttään.
- **Haiku 5.5:llä** palvelinpuolen varamallia ei ole: `"default"` ei aiheuta virhettä, mutta hylätty pyyntö pysyy hylättynä. Malliluettelomuoto palauttaisi 400-virheen, joten sitä ei käytetä.

**Oma uusintayritys hylkäykselle:** jos vastaus on silti `stop_reason: "refusal"`, pyyntö lähetetään kerran uudelleen. Jos vastauksen `stop_details.recommended_model` on asetettu, uusinta tehdään sillä mallilla. Toinen hylkäys merkitään `generation_runs.outcome = 'refusal'`, ja käsittely jatkuu kuten kohdassa 7.3 tyhjäksi jääneelle aterialle.

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
- aterioiden kokonaismäärä N ja generoitavien aterioiden indeksit
- jo valitut ateriat (uudelleenkäytetyt tai vaihdossa säilyvät): nimi ja ainesosat grammoina, jotta malli voi hyödyntää samoja pakkauksia
- budjettitavoite **perushinnoissa**: `budjetti / ketjun kerroin`, jolloin katalogin hinnat pätevät suoraan
- kotoa löytyvät slugit (käyttäjän perusvarat)
- **"Älä käytä" -slugit**: allergeenit (myös "saattaa sisältää", jos `strict`), ruokavalion kieltämät tagit ja inhokit yhdessä listassa, ilman syytä
- viimeaikaisten reseptien nimet toiston välttämiseksi

## 5. System prompt

Versio `plan-v1`. Kirjoitettu suomeksi, koska tuotos on suomeksi ja tiimi ylläpitää sitä.

```text
Olet Platewisen ruokasuunnittelija. Suunnittelet arkipäivällisiä yhden tai kahden hengen
talouksille Suomessa. Kaikki ainesosat ostetaan yhdellä kauppareissulla tavallisesta
suomalaisesta ruokakaupasta, ja ateriat syödään peräkkäisinä päivinä.

TEHTÄVÄ
Saat käyttäjän viestissä aterioiden määrän, generoitavat ateriat, henkilömäärän,
budjettitavoitteen, jo valitut ateriat, kotoa löytyvät perusvarat ja listan ainesosista,
joita ei saa käyttää. Palauta jokaiselle generoitavalle aterialle yksi päivällisresepti
annetun skeeman mukaisesti.

AINESOSAT
- Käytä vain alla olevan katalogin ainesosia ja viittaa niihin täsmälleen niiden slugilla.
- Älä koskaan käytä käyttäjän viestin "Älä käytä" -listan ainesosia.
- Älä mainitse nimessä, kuvauksessa, valmistusohjeessa tai esikäsittelyssä yhtään ruoka-ainetta,
  joka ei ole reseptin ainesosalistassa. Ei tarjoiluehdotuksia ("tarjoile pähkinöiden kanssa"),
  ei vaihtoehtoja ("tai käytä kermaa") eikä tuotemerkkejä.
- grams_per_serving on yhden annoksen syötävä määrä grammoina.

HINTA JA HÄVIKKI
- Kaikkien aterioiden yhteiset ostokset tulee mahtua budjettitavoitteeseen.
  Katalogin hinnat ovat €/kg.
- Ostokset tehdään kokonaisina pakkauksina (pakkaus_g). Suunnittele ateriat niin, että avatut
  pakkaukset käytetään loppuun: jos yksi resepti käyttää puolet kermasta, käytä loput toisessa.
- Kotoa löytyvät perusvarat ovat ilmaisia; käytä niitä normaalisti.
- Muut mausteet ostetaan kokonaisina pakkauksina, joten käytä samoja mausteita useassa
  ateriassa äläkä ota uutta maustetta yhteen reseptiin.
- Herkästi pilaantuvat ainesosat (tuore kala, jauheliha, salaatti) sopivat parhaiten
  ensimmäisiin aterioihin; säilyvät myöhempiin.
- Suosi edullisia, kotimaisia ja sesongin perusraaka-aineita.

RUOAT
- Arkiruokaa: valmistusaika yleensä enintään 40 minuuttia, vaikeustaso helppo tai keskitaso.
- Vaihtelua: ei samaa pääproteiinia eikä samaa ruokatyyppiä kahdessa peräkkäisessä ateriassa,
  eikä toistoa viimeaikaisista resepteistä.
- Vähintään puolet aterioista säilyy ja lämpenee hyvin seuraavan päivän lounaaksi.
  Merkitse good_for_leftovers rehellisesti.
- Ruokaturvallisuus: kypsennä broileri, jauheliha ja kala kunnolla; mainitse tämä ohjeessa.

KIRJOITUSTYYLI
- Selkeää yleiskieltä. Nimi lyhyt ja houkutteleva, kuvaus yksi lause.
- Valmistusohje 3–8 vaihetta, jokainen yksi tai kaksi lyhyttä käskymuotoista lausetta.
- Älä kirjoita ravintoarvoja, kaloreita tai hintoja – ne lasketaan muualla.
- image_prompt_en: lyhyt englanninkielinen kuvaus valmiista annoksesta lautasella kuvaa varten.

KORJAUKSET
- Jos saat korjauspyynnön, palauta vain pyydetyt ateriat samalla skeemalla. Muut pysyvät.

KATALOGI (versio {catalog_version})
slug | nimi | osasto | pakkaus_g | hinta_eur_kg | perusvara_mahdollinen
{catalog_rows}
```

### Käyttäjäviestin pohja

```text
Henkilömäärä: {household_size}
Aterioita yhteensä: {meal_count} (indeksit 0–{meal_count-1}, peräkkäiset päivät)
Generoitavat ateriat: {meals_to_generate}           esim. "0, 1, 3"
Budjettitavoite kaikille aterioille perushinnoin: noin {target_eur} €, enintään {max_eur} €
Jo valitut ateriat:
{fixed_meals}                                         esim. "2: Linssikeitto – red_lentils 80 g, carrot 100 g, …"
Kotoa löytyy: {pantry_slugs}
Älä käytä: {forbidden_slugs}
Viimeaikaiset ruoat (älä toista): {recent_titles}
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
  meal_index: z.number().int().min(0).max(6),  // 0 … meal_count − 1
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

- API ei tue numero- ja pituusrajoja (`min`, `max`) skeemassa. TypeScript-SDK:n Zod-apufunktiot poistavat ne API:lle lähetettävästä skeemasta ja validoivat ne itse vastauksesta. Jos beta-kutsussa ei käytetä SDK:n apufunktiota, JSON-skeema johdetaan Zodista ilman näitä rajoja ja Zod-validointi ajetaan erikseen.
- Lisävalidointi koodissa (ei skeemassa): `meal_index` on pyydetyissä aterioissa ja kukin vain kerran, ja reseptin sisällä slug esiintyy vain kerran.
- Slug-enumin koko (~300–500 arvoa) testataan heti alussa. Jos API rajoittaa enumin kokoa, `slug` muutetaan `z.string()`:ksi ja tuntemattomat slugit hylätään koodissa, kuten tarkistus tekee joka tapauksessa.
- Validointivirhe käsitellään kuten tarkistusvirhe: korjauskierros, jossa virhe kerrotaan mallille.

## 7. Allergia- ja ruokavaliotarkistus

### 7.1 Sääntöjoukko (ennen generointia)
`buildUserRules(userId)` muodostaa yhdestä paikasta:

- `forbiddenAllergens`: käyttäjän allergeenikoodit sekä tieto, onko `strict` päällä
- `forbiddenTags`: valittujen ruokavalioiden `diet_excluded_tags`-tagien unioni
- `dislikedIngredientIds`
- `forbiddenIngredientIds`: aktiiviset ainesosat, joilla on kielletty allergeeni (strict-tilassa myös `may_contain`), kielletty tagi tai jotka ovat inhokkeja. Tästä tehdään promptin "Älä käytä" -lista.

### 7.2 Tarkistus (jokaiselle reseptille, myös uudelleenkäytetyille)
`checkRecipe(recipe, rules, catalog)` on puhdas funktio, joka palauttaa listan rikkeitä. Tyhjä lista tarkoittaa hyväksyttyä reseptiä. Kaikki rikkeet kerätään (ei lopeteta ensimmäiseen):

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
- Korjauspyynnössä mallille kerrotaan rike neutraalisti, ilman allergiaa: *"Ateria 2: ainesosa `cashew_nuts` ei ole sallittu."* tai *"Ateria 4: valmistusohje mainitsee 'pähkinä', jota ei ole ainesosissa. Poista maininta."*
- `generation_runs.outcome` saa arvon `rejected_allergen` tai `rejected_diet` sen mukaan, mikä esti onnistumisen. Rikkeiden yksityiskohtia ei lokiteta.
- Jos ateria ei läpäise tarkistusta korjauskierrostenkaan jälkeen, se täytetään uudelleenkäytettävällä hyväksytyllä reseptillä. Jos sellaista ei ole, ateria jätetään tyhjäksi ja käyttäjä näkee viestin "Yhtä ateriaa ei saatu suunniteltua – kokeile Vaihda annos". Jos tyhjiä aterioita on yli puolet, suunnitelma merkitään `failed`.

### 7.4 Milloin tarkistus ajetaan uudelleen
- **Uudelleenkäytössä** aina, vaikka resepti olisi hyväksytty aiemmin toiselle käyttäjälle. Taulukkokentät (`allergen_codes` ym.) ovat vain esisuodatin.
- **Kun käyttäjä muuttaa allergioitaan tai ruokavaliotaan**, keskeneräiset ja tulevat suunnitelmat tarkistetaan heti. Ristiriitaiset ateriat merkitään sovelluksessa varoituksella ja vaihdetaan automaattisesti. Nämä vaihdot eivät kuluta vaihtorajaa.
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

### 8.1 Mitä budjetti kattaa
Budjetti kattaa **vain sovelluksen ehdottamat ateriat**: suunnitelman päivälliset ja niiden tuplaukset, perusvaroja lukuun ottamatta. Se ei ole käyttäjän koko ruokabudjetti. Käyttöliittymä sanoo tämän budjettisyötteen vieressä ja ostoslistan summan alla: *"Budjetti kattaa vain sovelluksen ehdottamat ateriat – ei muita ruokaostoksiasi."*

### 8.2 Laskenta (koodissa)
1. **Ainesosan kg-hinta ketjulle**: `coalesce(ketjukohtainen hinta, round(perushinta × kerroin))`.
2. **Ostoslista**: kaikkien suunnitelman päivällisten ainesosat summattuna (`grams_per_serving × servings`, tuplatut kahdesti), **perusvarat pois**. Pakkaukset: `ceil(total_g / package_size_g)`.
3. **Suunnitelman hinta-arvio** = Σ `pakkaukset × pakkauskoko × kg-hinta`. Tätä verrataan budjettiin.
4. **Aterian osuus** (kortissa näytettävä hinta ja korjauksen kohdistus): jokaisen ostettavan ainesosan pakkauskustannus jaetaan aterioille käytettyjen grammojen suhteessa. Aterioiden summa on siis sama kuin ostoslistan summa.

### 8.3 Esitarkistus
Ennen generointia: jos `budjetti < N × henkilömäärä × min_cost_per_serving_cents` (`app_config`, aluksi 1,50 €), generointia ei aloiteta. Sovellus näyttää jo syöttövaiheessa realistisen vähimmäisbudjetin valitulla N:llä.

### 8.4 Silmukka

```
kierros = 0
vastaus = Claude(generoi puuttuvat ateriat)
toista:
    hylätyt = validoi + checkRecipe jokaiselle
    hinta   = laske ostoslista (hyväksytyt + jo valitut)
    jos ei hylättyjä ja hinta ≤ budjetti: VALMIS
    jos kierros == max_correction_rounds (2): lopeta, valitse paras tulos
    # Halpa korjaus ensin: ei API-kutsua
    jos vain budjetti ylittyy:
        yritä korvata kallein ateria halvemmalla uudelleenkäytettävällä reseptillä
        jos nyt ≤ budjetti: VALMIS
    vastaus = Claude(korjauspyyntö), joka jatkaa samaa keskustelua
    kierros += 1
```

- **Korjauspyyntö jatkaa samaa keskustelua**: edellinen vastaus lisätään assistant-viestiksi ja korjaus uudeksi user-viestiksi. Mallilla on näin konteksti, ja välimuistissa oleva system prompt osuu edelleen. Historiaa ei muokata, vaan siihen vain lisätään.
- **Korjauspyynnön sisältö** budjetin ylittyessä: hinta-arvio, budjetti, ylitys, kahden kalleimman aterian hinta ja kalleimmat ainesosat sekä ainesosat, joista jää ylijäämää. Pyydetään korvaamaan nimetyt ateriat edullisemmilla ja hyödyntämään jo ostettavia ainesosia. Rikkeet ja budjetti kerrotaan samassa viestissä, jotta yksi kierros korjaa molemmat.
- **Paras tulos**, jos kierrokset loppuvat: valitaan versio, jossa on vähiten tyhjiä aterioita ja sitten pienin ylitys. Ylitetty suunnitelma tallennetaan `ready`-tilassa. Sovellus näyttää rehellisesti esim. "Ateriat ylittävät budjetin 3,20 € – vaihda jokin annos halvempaan" ja korostaa kalleimman aterian. `generation_runs.outcome = over_budget`.
- **Selvästi alle budjetin** (esim. alle 60 %) hyväksytään sellaisenaan, eikä silmukkaa ajeta. Säästö on käyttäjälle hyvä asia.

## 9. Annoksen vaihto, tuplaus, perusvarat ja rajat

| Toiminto | Kulku | Tekoälykutsu? |
|---|---|---|
| **Vaihda annos** | Sama putki yhdelle aterialle: muut ateriat annetaan "jo valittuina". Ensin yritetään uudelleenkäyttöä. Budjetti tarkistetaan koko suunnitelmalle. Kirjataan `generation_runs`-riviksi (`kind = 'swap'`). | Vain jos uudelleenkäyttö ei löydä sopivaa |
| **Tee tuplana** | `recalculate-plan`: asetetaan `cook_double`, luodaan lounasrivi seuraavalle päivälle, lasketaan ostoslista ja budjetti uudelleen. Valinta näytetään, kun `good_for_leftovers = true`, myös suunnitelman viimeiselle aterialle. | Ei |
| **Perusvarojen muutos** | `recalculate-plan`: ostoslista ja budjetti lasketaan uudelleen, ja reseptinäkymän "kotoa"-merkinnät päivittyvät. | Ei |

Tuplaus voi viedä suunnitelman yli budjetin. Silloin budjettimittari näyttää ylityksen, mutta mitään ei vaihdeta automaattisesti: käyttäjä teki valinnan itse.

**Rajat** (`app_config`, käyttäjäkohtaisia ja liukuvia 7 päivää, laskettu `generation_runs`-taulusta):

| Raja | Oletus | Kun raja täyttyy |
|---|---|---|
| `max_swaps_per_7_days` | 5 | Vaihda-nappi näyttää "Vaihdot käytetty – uusia ma 3.11." Jäljellä olevien vaihtojen määrä näkyy napin vieressä. |
| `max_plans_per_7_days` | 4 | Uutta suunnitelmaa ei voi luoda ennen ilmoitettua päivää. Raja tarvitaan, koska kauppareissuja voi tehdä useita viikossa. |

Allergiamuutoksen aiheuttamat automaattiset vaihdot (kohta 7.4) eivät kuluta rajaa.

## 10. Kuvat

1. Kun resepti tallennetaan, lasketaan `dish_signature` = `dish_type` + kolme grammamäärältään suurinta ei-perusvara-ainesosaa aakkosjärjestyksessä (esim. `stew:carrot,chickpeas,crushed_tomatoes`).
2. Jos samalla signaturella on `ready`-kuva, se liitetään reseptiin heti.
3. Muuten `recipe_images`-riville tulee `queued`, ja image-worker generoi kuvan kuvamallilla. Prompt = `image_prompt_en` + kiinteä tyylipohja (*"Overhead photo of a home-cooked dish on a simple plate, natural daylight, realistic, no text, no hands, no packaging"*).
4. Kunnes kuva on valmis, sovellus näyttää `dish_type`-kohtaisen piirroskuvan.

## 11. Kustannukset ja mallin valinta

Karkea arvio yhdelle seitsemän päivällisen suunnitelmalle:

| Osa | Tokenit (arvio) |
|---|---|
| System prompt + katalogi (välimuistista) | ~8 000 |
| Käyttäjäviesti | ~800 |
| Tuloste + ajattelu | ~6 000–10 000 |
| Korjauskierroksia keskimäärin | ~0,5 |

| Malli | Listahinnat (per MTok) | Hinta / suunnitelma (arvio) | Rooli |
|---|---|---|---|
| `claude-sonnet-5-5` | $2 / $10, välimuistiluku $0,10 | ~0,07–0,15 $ | **Oletus** |
| `claude-opus-5-5` | $4 / $20 | ~0,15–0,30 $ | Testiaineiston vertailukohta |
| `claude-haiku-5-5` | $0,10 / $0,50 | < 0,01 $ | Mahdollinen myöhemmin vaihtoihin, jos laatu riittää. Ei palvelinpuolen varamallia. |

Kuukaudessa muutama suunnitelma ja vaihto per käyttäjä tarkoittaa Sonnetilla noin 0,3–0,8 $. Hinnat on tarkistettava julkaisuhetkellä [hinnastosta](https://platform.claude.com/docs/en/about-claude/pricing).

Kustannukset kirjataan jokaisesta kutsusta `generation_runs`-tauluun (`input_tokens`, `output_tokens`, `cost_micro_usd`, välimuistiosumat, vastannut malli), ja niitä seurataan käyttäjää kohden alusta asti.

## 12. Laadunvarmistus

- **Yksikkötestit**: `checkRecipe`, `buildUserRules`, hinta- ja pakkauslaskenta, aterioiden osuuksien jako, tuplauksen ja perusvarojen vaikutus ostoslistaan, budjettisilmukan päätöslogiikka (mallin vastaukset mockattuina), rajojen laskenta.
- **Testiaineisto** ennen julkaisua: noin 30 testiprofiilia, joissa vaihtelevat henkilömäärä (1/2), tila ja N (viikko N = 7, kauppareissu N = 2, 4 ja 5), budjetit, ketjut ja allergiayhdistelmät (myös vegaani + useampi allergia sekä tiukka budjetti). Jokaisesta mitataan:
  - hyväksyttyjen reseptien osuus ensimmäisellä kierroksella
  - korjauskierrosten määrä
  - budjetissa pysyminen ja ylijäämägrammat
  - kustannus ja kesto
  - ihmisarvio 1–5 (houkuttelevuus, realistisuus, ohjeiden selkeys)
- **Opus vertailukohtana**: sama aineisto ajetaan `claude-opus-5-5`:llä ja oletusmallilla. Jos Sonnet jää selvästi jälkeen jossain mittarissa, se korjataan ensin promptilla tai effortilla; mallin vaihto on viimeinen keino. Myöhemmin samalla menetelmällä arvioidaan, riittäisikö Haiku.
- Jokainen promptin muutos nostaa `prompt_version`-arvoa (`plan-v1` → `plan-v2`), ja tulos kirjataan.
- **Tuotannossa**: hylkäysprosentti, ylitysprosentti, varamallin käyttö (`model ≠ requested_model`), peukut ja `retired`-reseptien määrä prompt-versioittain.

## 13. Tietosuoja

- Anthropicille lähetetään vain katalogi, henkilömäärä, budjetti, aterioiden määrä, perusvarat ja kielletyt slugit ilman syytä. Allergia- ja ruokavaliotietoja ei lähetetä.
- Anthropic on henkilötietojen käsittelijä (DPA ja tietosuojaselosteeseen maininta). Pyyntöihin ei liitetä käyttäjän nimeä tai sähköpostia.
- Lokeihin ja Sentryyn ei kirjata promptteja eikä mallin vastauksia sellaisenaan, koska "Älä käytä" -listasta voi päätellä allergioita. Vianselvitykseen tallennetaan vain `generation_runs`-rivin metatiedot.

## 14. Päätökset ja avoimet kysymykset

**Päätetty (2026-10-28):**

1. Kaksi tilaa yhdellä moottorilla: viikkosuunnitelma (N = 7) ja kauppareissu (N = 2–7). Budjetti kattaa vain ehdotetut ateriat, ja se kerrotaan käyttöliittymässä.
2. Sunnuntain tuplausrajoitus poistuu: suunnitelma ei ole sidottu kalenteriviikkoon, ja viimeisenkin aterian lounaan ainekset ovat saman suunnitelman ostoslistalla.
3. Oletusmalli Sonnet 5.5, vaihdettavissa `app_config`-asetuksesta; Opus 5.5 vertailukohtana.
4. Vaihtoraja 5 / 7 päivää, konfiguroitava.
5. Varamalli (`fallbacks: "default"`) tarkistettu dokumentaatiosta ja pidetään, täydennettynä omalla uusintayrityksellä.

**Avoinna:**

1. **Suunnitelmaraja** `max_plans_per_7_days = 4`: sopiiko oletusarvo?
2. **Mallin vaihto käyttöliittymästä:** "vaihdettavissa asetuksesta" on tässä tulkittu ylläpidon asetukseksi (`app_config`), ei loppukäyttäjän valinnaksi.
