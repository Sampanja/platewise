# Platewise – reseptien generointi

Miten ateriasuunnitelma generoidaan Claude API:lla: mallin asetukset, system prompt, JSON-skeema (Zod), allergiatarkistuksen kulku ja budjetin korjaussilmukka. Lisäksi reseptikirjaston esitäyttö (kohta 10) ja päiväkirjan ruokakuvan tunnistus kustannusrajoineen (kohta 11). Pohjana [PLAN.md](PLAN.md), [DATA_MODEL.md](DATA_MODEL.md) ja [CLAUDE.md](../CLAUDE.md):n arkkitehtuuriperiaatteet. Tämä on suunnitelma; koodi kirjoitetaan myöhemmin Edge Functioneihin (TypeScript, `@anthropic-ai/sdk`).

## 1. Periaatteet

1. **Yksi moottori: N päivällistä + budjetti → yksi ostoslista.** Suunnittele-kysely (budjetti → syöjät 1–6 → ateriamäärä → allergiat ja ruokavalio → toiveet) tuottaa putken syötteen. Viikkosuunnitelma (N = 7) ja kauppareissu (N = 2–6) ovat saman putken esiasetuksia. Putki ei tiedä tilasta muuta kuin N:n, syöjät, budjetin, toiveet ja hinta-alueen.
2. **Malli suunnittelee, koodi päättää.** Claude valitsee ruoat, ainesosat ja grammamäärät. Kaikki, mikä voi olla väärin vaarallisella tai harhaanjohtavalla tavalla (allergeenit, ruokavalio, makrot, hinta, budjetti), lasketaan ja tarkistetaan deterministisesti koodissa.
3. **Suljettu ainesosalista kahdessa kerroksessa.** Skeema sallii vain katalogin slugit (`enum`), ja käyttäjälle kielletyt slugit suodatetaan jo ennen mallia. Koodi tarkistaa silti jokaisen reseptin.
4. **Terveystiedot eivät lähde backendistä.** Mallille ei kerrota käyttäjän allergioita eikä ruokavaliota. Se saa vain listan slugeista, joita ei saa käyttää, ilman syytä.
5. **Mallilta ei pyydetä lukuja, joita näytetään käyttäjälle.** Skeemassa ei ole kenttiä kaloreille, makroille eikä hinnoille.
6. **Uudelleenkäyttö ensin.** Mitä enemmän sopivia reseptejä kannassa on, sitä vähemmän aterioita generoidaan.

## 2. Kulku yleiskuvana

```
Sovellus: Suunnittele-kysely valmis
   │  POST /generate-plan { meal_count, eaters, budget_cents, price_region,
   │                        craving_codes, extra_allergen_codes, extra_diet_codes, start_date }
   │  → palauttaa heti plan_id (status = generating)
   ▼
Edge Function (taustatyö, EdgeRuntime.waitUntil)
   │
   ├─ 0. Tilaus voimassa? Suunnitelmaraja? Budjetti realistinen? (esitarkistus)
   ├─ 1. Rakenna sääntöjoukko (profiilin + kyselyssä lisätyt allergeenit ja ruokavaliot,
   │     inhokit, perusvarat)
   ├─ 2. Uudelleenkäyttö: hae sopivat valmiit reseptit (toiveet järjestävät) → täytä osa aterioista
   ├─ 3. Claude: generoi puuttuvat ateriat (strukturoitu JSON)
   │        │
   │        ▼
   ├─ 4. Zod-validointi ─────────────────┐
   ├─ 5. Allergia- ja ruokavaliotarkistus ┤ virheet → korjauspyyntö Claudelle
   ├─ 6. Makrot (Fineli) + hinnat         │   (enintään max_correction_rounds)
   ├─ 7. Ostoslista + budjettivertailu ───┘
   ├─ 8. Tallenna reseptit, ateriat, ostoslista ja valmiit vaihtoehdot; status = proposed
   └─ 9. Kuvat jonoon (tai liitä olemassa oleva kuva)
   ▼
Sovellus kuuntelee meal_plans-riviä (Supabase Realtime) → ehdotusnäkymä
   │  Vaihda / Tee tuplana → swap-meal, recalculate-plan (summat päivittyvät)
   ▼
"Hyväksy" → POST /accept-plan → status = accepted → ostoslista
```

Generointi on asynkroninen, koska se voi kestää kymmeniä sekunteja korjauskierroksineen. Sovellus näyttää sillä välin kyselyn generointianimaation ("Etsitään sopivia reseptejä…"). Edge Functionin aikaraja tarkistetaan toteutusvaiheessa. Jos se ei riitä, generointi siirretään jonotyöksi samalla tavalla kuin kuvat.

## 3. Malli ja API-asetukset

| Asetus | Arvo | Perustelu |
|---|---|---|
| Malli | `app_config.generation_model`, oletus `claude-sonnet-5-5` | Hyvä laatu ja hinta. Vaihdettavissa ilman julkaisua. `claude-opus-5-5` on testiaineiston vertailukohta (kohta 14). |
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

- syöjien määrä (1–6)
- aterioiden kokonaismäärä N ja generoitavien aterioiden indeksit
- jo valitut ateriat (uudelleenkäytetyt tai vaihdossa säilyvät): nimi ja ainesosat grammoina, jotta malli voi hyödyntää samoja pakkauksia
- budjettitavoite **Suomen hinnoissa**: `budjetti / alueen hintakerroin` (`price_level × per_euro`), jolloin katalogin hinnat pätevät suoraan
- kotoa löytyvät slugit (käyttäjän perusvarat)
- **"Älä käytä" -slugit**: allergeenit (myös "saattaa sisältää", jos `strict`; kyselyssä lisätyt aina `strict`), ruokavalion kieltämät tagit ja inhokit yhdessä listassa, ilman syytä
- **toiveet** suomenkielisinä sanoina ("kana, nopea"), jos käyttäjä valitsi niitä. Toiveet eivät ole terveystietoa.
- viimeaikaisten reseptien nimet toiston välttämiseksi

## 5. System prompt

Versio `plan-v2` (v1 → v2: 1–6 syöjää, toiveet, `cuisine` ja `main_protein`). Kirjoitettu suomeksi, koska tuotos on suomeksi ja tiimi ylläpitää sitä.

```text
Olet Platewisen ruokasuunnittelija. Suunnittelet arkipäivällisiä 1–6 hengen
talouksille Suomessa. Kaikki ainesosat ostetaan yhdellä kauppareissulla tavallisesta
suomalaisesta ruokakaupasta, ja ateriat syödään peräkkäisinä päivinä.

TEHTÄVÄ
Saat käyttäjän viestissä aterioiden määrän, generoitavat ateriat, syöjien määrän,
budjettitavoitteen, toiveet, jo valitut ateriat, kotoa löytyvät perusvarat ja listan
ainesosista, joita ei saa käyttää. Palauta jokaiselle generoitavalle aterialle yksi päivällisresepti
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
- Toiveet: jos käyttäjä antoi toiveita, vähintään puolet generoitavista aterioista vastaa
  jotakin niistä. Budjetti ja "Älä käytä" -lista menevät aina toiveiden edelle.
- Merkitse cuisine (keittiö) ja main_protein (pääproteiini) rehellisesti.
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
Syöjiä: {eaters}
Aterioita yhteensä: {meal_count} (indeksit 0–{meal_count-1}, peräkkäiset päivät)
Generoitavat ateriat: {meals_to_generate}           esim. "0, 1, 3"
Budjettitavoite kaikille aterioille perushinnoin: noin {target_eur} €, enintään {max_eur} €
Jo valitut ateriat:
{fixed_meals}                                         esim. "2: Linssikeitto – red_lentils 80 g, carrot 100 g, …"
Toiveet: {cravings_fi}                               esim. "kana, nopea" tai "ei toiveita"
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
  cuisine: z.enum(["finnish", "nordic", "italian", "asian", "mexican",
                   "middle_eastern", "indian", "other"]),
  main_protein: z.enum(["chicken", "beef", "pork", "minced_meat", "fish", "seafood",
                        "egg", "dairy", "legumes", "tofu", "none"]),
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
`buildUserRules(userId, planExtras)` muodostaa yhdestä paikasta:

- `forbiddenAllergens`: profiilin allergeenikoodit sekä tieto, onko `strict` päällä, ja kyselyssä vain tälle suunnitelmalle lisätyt allergeenit (`extra_allergen_codes`, aina `strict`)
- `forbiddenTags`: profiilin ja kyselyn ruokavalioiden `diet_excluded_tags`-tagien unioni
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
- **Uudelleenkäytössä** aina, vaikka resepti olisi hyväksytty aiemmin toiselle käyttäjälle. Taulukkokentät (`allergen_codes` ym.) ovat vain esisuodatin. Sama koskee reseptikirjastoa (`list-recipes`) ja ehdotusnäkymän valmiita vaihtoehtoja.
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
- kyselyssä lisätty allergeeni (`planExtras`) → hylkäys myös "saattaa sisältää" -tasolla; profiilin ja kyselyn ruokavaliot yhdistyvät
- `matchesCraving` jokaiselle toiveelle (DATA_MODEL.md, toiveiden kartoitus)
- tuntematon ja passivoitu slug → hylkäys
- useita rikkeitä samassa reseptissä → kaikki raportoidaan

## 8. Hinta ja budjetin korjaussilmukka

### 8.1 Mitä budjetti kattaa
Budjetti kattaa **vain sovelluksen ehdottamat ateriat**: suunnitelman päivälliset ja niiden tuplaukset, perusvaroja lukuun ottamatta. Se ei ole käyttäjän koko ruokabudjetti. Käyttöliittymä sanoo tämän budjettisyötteen vieressä ja ostoslistan summan alla: *"Budjetti kattaa vain sovelluksen ehdottamat ateriat – ei muita ruokaostoksiasi."*

### 8.2 Laskenta (koodissa)
1. **Ainesosan kg-hinta hinta-alueella**: `coalesce(alueen oma hinta, round(Suomen hinta × hintataso × valuuttakurssi))` ([DATA_MODEL.md](DATA_MODEL.md), `price_regions`).
2. **Ostoslista**: kaikkien suunnitelman päivällisten ainesosat summattuna (`grams_per_serving × servings`, tuplatut kahdesti), **perusvarat pois**. Pakkaukset: `ceil(total_g / package_size_g)`.
3. **Suunnitelman hinta-arvio** = Σ `pakkaukset × pakkauskoko × kg-hinta`. Tätä verrataan budjettiin.
4. **Aterian osuus** (kortissa näytettävä hinta ja korjauksen kohdistus): jokaisen ostettavan ainesosan pakkauskustannus jaetaan aterioille käytettyjen grammojen suhteessa. Aterioiden summa on siis sama kuin ostoslistan summa.

### 8.3 Esitarkistus
Ennen generointia: jos `budjetti < N × syöjät × min_cost_per_serving_cents` (`app_config`, aluksi 1,50 €), generointia ei aloiteta. Kysely näyttää realistisen vähimmäisbudjetin heti, kun syöjät ja ateriamäärä tiedetään, ja palauttaa tarvittaessa budjettivaiheeseen. Esimerkki: 6 syöjää × 7 ateriaa × 1,50 € = 63 €.

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
- **Paras tulos**, jos kierrokset loppuvat: valitaan versio, jossa on vähiten tyhjiä aterioita ja sitten pienin ylitys. Ylitetty suunnitelma tallennetaan `proposed`-tilassa. Sovellus näyttää rehellisesti esim. "Ateriat ylittävät budjetin 3,20 € – vaihda jokin annos halvempaan" ja korostaa kalleimman aterian. `generation_runs.outcome = over_budget`.
- **Selvästi alle budjetin** (esim. alle 60 %) hyväksytään sellaisenaan, eikä silmukkaa ajeta. Säästö on käyttäjälle hyvä asia.

## 9. Ehdotusnäkymä: vaihto, tuplaus, hyväksyntä, perusvarat ja rajat

| Toiminto | Kulku | Tekoälykutsu? |
|---|---|---|
| **Vaihda (valmis vaihtoehto)** | Ehdotusvaiheessa otetaan aterian seuraava käyttämätön `meal_plan_alternatives`-rivi. `recalculate-plan` laskee ostoslistan, hinnan ja keskimääräiset makrot uudelleen (tavoite < 500 ms). Sovellus päivittää kortin ja summat animoidusti. Ei kuluta vaihtorajaa. | Ei |
| **Vaihda annos** (vaihtoehdot loppuneet tai suunnitelma hyväksytty) | Sama putki yhdelle aterialle: muut ateriat annetaan "jo valittuina". Ensin yritetään uudelleenkäyttöä. Budjetti tarkistetaan koko suunnitelmalle. Kirjataan `generation_runs`-riviksi (`kind = 'swap'`). | Vain jos uudelleenkäyttö ei löydä sopivaa |
| **Tee tuplana** | `recalculate-plan`: asetetaan `cook_double`, luodaan lounasrivi seuraavalle päivälle, lasketaan ostoslista ja budjetti uudelleen. Valinta näytetään, kun `good_for_leftovers = true`, myös suunnitelman viimeiselle aterialle. | Ei |
| **Hyväksy** | `accept-plan`: tarkistaa, että suunnitelma on oma ja `proposed`, ajaa `checkRecipe`-tarkistuksen vielä kerran kaikille aterioille (profiili on voinut muuttua), asettaa `accepted` ja poistaa vaihtoehdot. Sovellus siirtyy ostoslistaan. | Ei |
| **Perusvarojen muutos** | `recalculate-plan`: ostoslista ja budjetti lasketaan uudelleen, ja reseptinäkymän "kotoa"-merkinnät päivittyvät. | Ei |

Tuplaus voi viedä suunnitelman yli budjetin. Silloin budjettimittari näyttää ylityksen, mutta mitään ei vaihdeta automaattisesti: käyttäjä teki valinnan itse.

Kun "Vaihda" vaatii tekoälyä, kortti näyttää latausnäkymän (luurankokortti) ja muut kortit pysyvät käytettävinä. Summat päivittyvät, kun uusi ateria on valmis.

**Rajat** (`app_config`, käyttäjäkohtaisia ja liukuvia 7 päivää, laskettu `generation_runs`-taulusta):

| Raja | Oletus | Kun raja täyttyy |
|---|---|---|
| `max_swaps_per_7_days` | 5 | Vaihda-nappi näyttää "Vaihdot käytetty – uusia ma 3.11." Jäljellä olevien vaihtojen määrä näkyy napin vieressä. |
| `max_plans_per_7_days` | 4 | Uutta suunnitelmaa ei voi luoda ennen ilmoitettua päivää. Raja tarvitaan, koska kauppareissuja voi tehdä useita viikossa. |

Allergiamuutoksen aiheuttamat automaattiset vaihdot (kohta 7.4) eivät kuluta rajaa.

## 10. Reseptikirjaston esitäyttö

Reseptit-välilehti tarvitsee julkaisuhetkellä kattavan kirjaston, vaikka käyttäjiä ei vielä ole. Kirjasto esitäytetään samalla putkella ennen julkaisua:

- **Noin 200 reseptiä**, jaettuna tasaisesti toiveiden (kohta 4), ruokavalioiden (sekasyöjä, kasvis, vegaani, pescetaristi) ja yleisten allergiayhdistelmien (gluteeniton, maidoton, kananmunaton) kesken. Jako kirjataan skriptiin, jotta täyttö on toistettavissa.
- **Message Batches API** (50 % halvempi, ei kiirettä). Batches API ei tue palvelinpuolen varamallia, joten hylätyt pyynnöt jätetään pois ja korvataan seuraavassa erässä.
- Jokainen resepti kulkee saman validoinnin, `checkRecipe`-tarkistuksen ja makro- ja hintalaskennan kautta. `generation_runs.kind = 'library_seed'`, `user_id` NULL.
- **Ihmistarkistus:** jokainen esitäytetty resepti luetaan ennen julkaisua (nimi, ohjeen järkevyys, määrät). Hylätyt merkitään `retired`.
- Kustannus: noin 40 pyyntöä × 5 reseptiä, arviolta alle 5 $ Sonnet 5.5:llä.

Julkaisun jälkeen kirjasto kasvaa itsestään, kun käyttäjien suunnitelmiin generoidaan uusia reseptejä.

### 10.1 Testikirjasto (vaihe 1, tehty)

Käyttöliittymävaiheen kirjasto on kirjoitettu käsin samaan muotoon, jota generointi tuottaa: **319 reseptiä 13 erässä** (`app/src/data/catalog/recipes1–13.ts`). Resepti antaa vain ainesosat (`ainesosa-id grammat` per annos), vaiheet, vinkit ja luokittelun; makrot, kalorit, allergeenit, ruokavaliosopivuus ja hinta lasketaan koodissa ainesosataulusta (`deriveRecipe`). Säilytys- ja lämmitysohje tulee kategorian oletuksesta, ellei resepti ohita sitä.

| Kategoria | Määrä | | Ateria | Määrä |
|---|---|---|---|---|
| Keitot | 35 | | Päivällinen | 236 |
| Padat | 27 | | Lounas | 254 |
| Pastat | 24 | | Aamiainen | 60 |
| Salaatit | 23 | | Välipala | 56 |
| Wokit ja pannut | 22 | | | |
| Uuniruoat | 20 | | **Ruokavalio / tyyppi** | |
| Riisiruoat | 17 | | Kasvis | 158 |
| Kulhot | 17 | | Vegaaninen | 81 |
| Tortillat ja täytetyt leivät | 16 | | Gluteeniton | 174 |
| Puurot | 14 | | Laktoositon | 190 |
| Laatikot | 11 | | Maidoton | 169 |
| Perunaruoat, pihvit ja pyörykät | 10 + 10 | | Nopeat (≤ 20 min) | 108 |
| Leivät, letut, smoothiet, munaruoat | 9 + 7 + 8 + 7 | | Edulliset (≤ 2,50 €/annos) | 218 |
| Piirakat | 5 | | Meal prep (riittää huomiseksi) | 88 |
| Välipalat | 28 | | Suomalaiset | 64 |
| Muut | 9 | | | |

**Validointi** (`catalog.test.ts`, ajetaan jokaisen erän jälkeen): jokainen ainesosa löytyy suljetusta taulusta (kerran, grammat > 0), vaiheita ja vinkkejä on, kcal per annos 100–1 500 (päivälliset 300–1 300), makrot vastaavat energiaa, nimet ja id:t ovat yksilöllisiä, allergeenit ja tagit vastaavat täsmälleen ainesosia, tekstissä ei mainita allergeenia, jota ainesosissa ei ole, pääproteiini vastaa ainesosia, nimen ruokavaliosanat ("vegaaninen", "kasvis", "laktoositon", "gluteeniton") pitävät paikkansa, ja **21 yleiselle allergia- ja ruokavalioyhdistelmälle** jää vähintään 25 päivällistä ja lounasta, 6 aamiaista ja 5 välipalaa.

Avainsanatarkistus (`keywordAllergens`) tunnistaa yhdyssanat (maapähkinävoi → maapähkinä), mutta ei hälytä vapaamuotoisista kieltosanoista ("gluteeniton korppujauho", "soijaton", "pähkinätön") eikä taivutetuista harhaanjohtavista sanoista (munakoiso-, kookosmai-, juustokumin-).

## 11. Ruokakuvan tunnistus (päiväkirja)

Päiväkirjan "Ota kuva" tunnistaa ruoat valokuvasta ja arvioi määrät. Periaatteet ovat samat kuin reseptigeneroinnissa: **malli valitsee suljetusta listasta ja arvioi grammat, makrot lasketaan Finelistä**. Mallin ilmoittamia ravintoarvoja ei pyydetä eikä näytetä.

> **Nykyinen vaihe: testitila.** "Ota kuva" palauttaa esimerkkiaterian lyhyen viiveen jälkeen. Kameranäkymässä ja tuloksessa näkyy selvästi "Testitila – oikea tunnistus tulossa", eikä testituloksissa ole varmuusmerkintöjä. Palvelu (`services/foodRecognition.ts`) on valmis oikealle toteutukselle: `createBackendRecognition` lähettää kuvan multipart-lomakkeena Edge Functionille ja validoi vastauksen Zodilla (`parseRecognitionResponse`: tuntemattomat id:t pudotetaan, grammat rajataan 1–2 000, mallin ravintoarvot jätetään huomiotta). Käyttöön otto: vaihda `foodRecognition` = `createBackendRecognition(...)`; näkymät eivät muutu. Tulosrivi näyttää vain "Tarkista", kun `confidence` < 0,55; "varma"-merkintää ei ole koskaan, koska jokainen tulos on arvio.

### 11.1 Kulku

```
Sovellus: Päiväkirja → "Ota kuva" (kamera tai galleria)
   │  kuva pienennetään laitteella: pitkä sivu 1024 px, JPEG ~0,7
   │  (uudelleenkoodaus poistaa EXIF- ja sijaintitiedot)
   │  POST /recognize-food-photo { image_base64, slot }
   ▼
Edge Function (synkroninen, tavoite < 6 s)
   ├─ 0. Tilaus voimassa? Päivä- ja 30 päivän raja? Kustannuskatto? (kohta 11.4)
   ├─ 1. Claude (photo_model): system prompt + Fineli-ehdokaslista (välimuistissa) + kuva
   ├─ 2. Zod-validointi; tuntematon tai listaan kuulumaton fineli_id → rivi "tunnistamaton"
   ├─ 3. Makrot Finelistä jokaiselle riville (esikatselua varten)
   └─ 4. Kirjaa generation_runs (vain metatiedot); kuvaa ei tallenneta
   ▼
Sovellus: tulosnäkymä, jokainen rivi merkinnällä "arvio"
   │  käyttäjä korjaa määrät, poistaa rivejä tai lisää hakemalla
   ▼
"Lisää päiväkirjaan" → diary_entries (source = photo, is_estimate = true)
```

Tunnistus on synkroninen, koska käyttäjä odottaa tulosta näkymässä. Odotuksen ajan sovellus näyttää kuvan himmennettynä ja skannausanimaation.

### 11.2 Malli ja prompt

| Asetus | Arvo |
|---|---|
| Malli | `app_config.photo_model`, oletus `claude-haiku-5-5`. `claude-sonnet-5-5` on testiaineiston vertailukohta (kohta 11.5). Kuvasyötteen tuki varmistetaan toteutuksessa Models API:n `capabilities`-kentästä. |
| Effort | `app_config.photo_effort`, oletus `low` |
| `max_tokens` | 2 000 |
| Välimuisti | `cache_control` system promptin loppuun (ohjeet + ehdokaslista) |
| Varamalli | Haiku 5.5:llä ei palvelinpuolen varamallia. Hylkäys (`refusal`) → käyttäjälle "Kuvasta ei löytynyt ruokaa – lisää ruoka hakemalla". |

**Ehdokaslista:** `fineli_foods`-rivit, joilla `photo_candidate = true` (noin 600–900 yleistä ruokaa ja annosta, myös valmiita ruokia kuten "makaronilaatikko" ja "kaurapuuro"). Muoto `fineli_id | nimi | tyypillinen annos g`. Arvio noin 12 000 tokenia.

System prompt (versio `photo-v1`, tiivistetysti):

```text
Tunnistat ruoat valokuvasta suomalaista ruokapäiväkirjaa varten.
- Valitse jokaiselle kuvassa näkyvälle ruoalle tai juomalle lähin vaihtoehto alla olevasta
  listasta ja anna sen fineli_id. Jos mikään ei sovi, fineli_id = null ja kerro label_fi:ssä,
  mitä näet.
- Arvioi syötävä määrä grammoina lautasen, aterimien ja pakkausten koon perusteella.
  Käytä listan tyypillistä annosta lähtökohtana.
- Yhdistelmäruoka (esim. makaronilaatikko) on yksi rivi, jos se löytyy listasta sellaisenaan.
  Muuten erittele osat (esim. riisi, broileri, kastike).
- confidence: high, jos ruoka ja määrä ovat selvät; low, jos arvaat.
- Jos kuvassa ei ole ruokaa, is_food = false ja items on tyhjä.
- Älä kommentoi ihmisiä, paikkaa tai muuta kuin ruokaa. Älä anna ravintoarvoja.

LISTA (versio {photo_list_version})
fineli_id | nimi | tyypillinen_annos_g
{rows}
```

### 11.3 JSON-skeema (Zod)

```ts
// Luonnos – ei vielä toteutusta.
const RecognizedItem = z.object({
  fineli_id: z.number().int().nullable(),  // null = ei löytynyt listasta
  label_fi: z.string().max(60),            // mitä malli näkee, näytetään tunnistamattomalle riville
  grams: z.number().min(1).max(1500),
  confidence: z.enum(["high", "medium", "low"]),
});

export const PhotoRecognition = z.object({
  is_food: z.boolean(),
  items: z.array(RecognizedItem).max(8),
});
```

Koodissa lisäksi: `fineli_id` hyväksytään vain, jos se on ehdokaslistalla; muuten rivi käsitellään tunnistamattomana. `is_food = false` tai tyhjä `items` → `generation_runs.outcome = 'no_food_found'`.

**UI:** `low`-rivit korostetaan ("Tarkista määrä"). Määrää korjataan Finelin annoskoilla (`fineli_food_units`) tai grammoina. Tunnistamaton rivi avaa nimihaun valmiiksi täytetyllä hakusanalla (`label_fi`).

### 11.4 Kustannusraja

Kuvan tokenimäärä on noin `leveys × korkeus / 784` (yksi token per 28 × 28 pikselin ruutu; tarkistetaan toteutushetkellä Vision-dokumentaatiosta). 1024 × 768 px → noin 1 000 tokenia.

| Osa | Tokenit (arvio) |
|---|---|
| System prompt + ehdokaslista (välimuistista) | ~12 000 |
| Kuva + käyttäjäviesti | ~1 200 |
| Tuloste + ajattelu (effort `low`) | ~600 |

| Malli | Listahinnat (per MTok) | Hinta / kuva (arvio) | 150 kuvaa / 30 pv |
|---|---|---|---|
| `claude-haiku-5-5` | $0,10 / $0,50 | ~0,001 $ (välimuistin kirjoituksella ~0,002 $) | ~0,15–0,30 $ |
| `claude-sonnet-5-5` | $2 / $10, välimuistiluku $0,20 | ~0,011 $ (välimuistin kirjoituksella ~0,04 $) | ~1,7 $ |

**Rajat** (`app_config`, käyttäjäkohtaiset):

| Raja | Oletus | Kun raja täyttyy |
|---|---|---|
| `max_photo_recognitions_per_day` | 10 | "Kuvantunnistus on käytetty tältä päivältä – voit lisätä ruoat hakemalla." Haku ja reseptin lisäys toimivat aina. |
| `max_photo_recognitions_per_30_days` | 150 | Sama viesti ja päivä, jolloin tunnistus palaa. |
| `max_ai_cost_per_user_30_days_micro_usd` | 1 500 000 (1,50 $) | Käyttäjän **kaikkien** tekoälykutsujen summa liukuvalta 30 päivältä (`generation_runs.cost_micro_usd`). Ennen jokaista kuvantunnistusta tarkistetaan, ettei summa + tämän kutsun enimmäishinta ylitä kattoa. Ylityksessä kuvantunnistus keskeytyy. Suunnitelmia ja vaihtoja ei estetä katolla, koska niillä on omat rajansa ja ne ovat sovelluksen ydin; katon ylitys nostaa kuitenkin hälytyksen kustannusseurannassa. |

- Haiku-oletuksella kuvantunnistus maksaa käyttäjää kohden enintään noin 0,30 $ kuukaudessa, eli selvästi alle tilausmaksun.
- **Mallin vaihto Sonnetiin** on sallittu vain, jos samalla `max_photo_recognitions_per_30_days` lasketaan enintään 60:een. Kustannuskatto suojaa joka tapauksessa.
- Laskettu kustannus kirjataan jokaisesta kutsusta `generation_runs`-tauluun (`kind = 'food_photo'`), myös epäonnistuneista. Tunnistettuja ruokia ei kirjata.
- Rajat lasketaan Edge Functionissa ennen API-kutsua. Sovellus saa jäljellä olevien tunnistusten määrän vastauksessa ja näyttää sen, kun jäljellä on alle 3.

### 11.5 Laadunvarmistus
- **Testiaineisto:** noin 100 kuvaa tavallisista suomalaisista kotiaterioista, joiden annokset on punnittu. Mitataan: oikein tunnistettujen ruokien osuus, grammavirhe (keskimääräinen suhteellinen virhe), kcal-virhe aterialle, tunnistamattomien osuus, kesto ja hinta.
- Sama aineisto ajetaan Haikulla ja Sonnetilla. Haiku pysyy oletuksena, jos kcal-virhe ei ole selvästi suurempi; ero kirjataan päätökseksi.
- **Yksikkötestit:** skeemavalidointi, ehdokaslistan ulkopuolisen ID:n käsittely, rajojen ja kustannuskaton laskenta, makrojen laskenta grammoista.

## 12. Reseptikuvat

1. Kun resepti tallennetaan, lasketaan `dish_signature` = `dish_type` + kolme grammamäärältään suurinta ei-perusvara-ainesosaa aakkosjärjestyksessä (esim. `stew:carrot,chickpeas,crushed_tomatoes`).
2. Jos samalla signaturella on `ready`-kuva, se liitetään reseptiin heti.
3. Muuten `recipe_images`-riville tulee `queued`, ja image-worker generoi kuvan kuvamallilla. Prompt = `image_prompt_en` + kiinteä tyylipohja (*"Overhead photo of a home-cooked dish on a simple plate, natural daylight, realistic, no text, no hands, no packaging"*).
4. Kunnes kuva on valmis, sovellus näyttää `dish_type`-kohtaisen piirroskuvan.

## 13. Kustannukset ja mallin valinta

Karkea arvio yhdelle seitsemän päivällisen suunnitelmalle (kuvantunnistus: kohta 11.4):

| Osa | Tokenit (arvio) |
|---|---|
| System prompt + katalogi (välimuistista) | ~8 000 |
| Käyttäjäviesti | ~800 |
| Tuloste + ajattelu | ~6 000–10 000 |
| Korjauskierroksia keskimäärin | ~0,5 |

| Malli | Listahinnat (per MTok) | Hinta / suunnitelma (arvio) | Rooli |
|---|---|---|---|
| `claude-sonnet-5-5` | $2 / $10, välimuistiluku $0,20 | ~0,07–0,15 $ | **Oletus** |
| `claude-opus-5-5` | $4 / $20 | ~0,15–0,30 $ | Testiaineiston vertailukohta |
| `claude-haiku-5-5` | $0,10 / $0,50 | < 0,01 $ | Mahdollinen myöhemmin vaihtoihin, jos laatu riittää. Ei palvelinpuolen varamallia. Kuvantunnistuksen oletus. |

Kuukaudessa muutama suunnitelma ja vaihto per käyttäjä tarkoittaa Sonnetilla noin 0,3–0,8 $. Kuuden syöjän suunnitelma ei juuri muuta tokenimäärää, koska määrät ovat annosta kohden. Valmiista vaihtoehdoista tehdyt vaihdot eivät maksa mitään. Kuvantunnistus Haikulla lisää enintään noin 0,30 $, ja käyttäjäkohtainen katto on 1,50 $ / 30 päivää (kohta 11.4). Hinnat on tarkistettava julkaisuhetkellä [hinnastosta](https://platform.claude.com/docs/en/about-claude/pricing).

Kustannukset kirjataan jokaisesta kutsusta `generation_runs`-tauluun (`input_tokens`, `output_tokens`, `cost_micro_usd`, välimuistiosumat, vastannut malli), ja niitä seurataan käyttäjää kohden alusta asti.

## 14. Laadunvarmistus

- **Yksikkötestit**: `checkRecipe`, `buildUserRules`, hinta- ja pakkauslaskenta, aterioiden osuuksien jako, tuplauksen ja perusvarojen vaikutus ostoslistaan, budjettisilmukan päätöslogiikka (mallin vastaukset mockattuina), rajojen laskenta.
- **Testiaineisto** ennen julkaisua: noin 30 testiprofiilia, joissa vaihtelevat syöjät (1, 2, 4 ja 6), tila ja N (viikko N = 7, kauppareissu N = 2, 4 ja 5), toiveet (ei toiveita, yksi, useita), budjetit, hinta-alueet ja allergiayhdistelmät (myös vegaani + useampi allergia sekä tiukka budjetti). Jokaisesta mitataan:
  - hyväksyttyjen reseptien osuus ensimmäisellä kierroksella
  - korjauskierrosten määrä
  - budjetissa pysyminen ja ylijäämägrammat
  - toiveita vastaavien aterioiden osuus
  - kustannus ja kesto
  - ihmisarvio 1–5 (houkuttelevuus, realistisuus, ohjeiden selkeys)
- **Opus vertailukohtana**: sama aineisto ajetaan `claude-opus-5-5`:llä ja oletusmallilla. Jos Sonnet jää selvästi jälkeen jossain mittarissa, se korjataan ensin promptilla tai effortilla; mallin vaihto on viimeinen keino. Myöhemmin samalla menetelmällä arvioidaan, riittäisikö Haiku.
- Jokainen promptin muutos nostaa `prompt_version`-arvoa (`plan-v1` → `plan-v2`), ja tulos kirjataan.
- **Tuotannossa**: hylkäysprosentti, ylitysprosentti, varamallin käyttö (`model ≠ requested_model`), peukut ja `retired`-reseptien määrä prompt-versioittain.

## 15. Tietosuoja

- Anthropicille lähetetään vain katalogi, syöjien määrä, budjetti, aterioiden määrä, toiveet, perusvarat ja kielletyt slugit ilman syytä. Allergia- ja ruokavaliotietoja ei lähetetä, eivät myöskään kyselyssä lisätyt.
- **Ruokakuva** lähetetään Anthropicille tunnistusta varten, mutta sitä ei tallenneta Platewisen järjestelmiin. Kuva pienennetään ja uudelleenkoodataan laitteella, jolloin EXIF- ja sijaintitiedot poistuvat. Tietosuojaselosteessa ja ensimmäisellä käyttökerralla kerrotaan, että kuva käsitellään tekoälypalvelussa.
- Tunnistuksen tulos (mitä käyttäjä söi) on päiväkirjatietoa ja siten terveystietoa: sitä ei lokiteta, ei lähetetä analytiikkaan eikä Sentryyn.
- Anthropic on henkilötietojen käsittelijä (DPA ja tietosuojaselosteeseen maininta). Pyyntöihin ei liitetä käyttäjän nimeä tai sähköpostia.
- Lokeihin ja Sentryyn ei kirjata promptteja eikä mallin vastauksia sellaisenaan, koska "Älä käytä" -listasta voi päätellä allergioita. Vianselvitykseen tallennetaan vain `generation_runs`-rivin metatiedot.

## 16. Päätökset ja avoimet kysymykset

**Päätetty (2026-10-28):**

1. Kaksi tilaa yhdellä moottorilla: viikkosuunnitelma (N = 7) ja kauppareissu (N = 2–7). Budjetti kattaa vain ehdotetut ateriat, ja se kerrotaan käyttöliittymässä.
2. Sunnuntain tuplausrajoitus poistuu: suunnitelma ei ole sidottu kalenteriviikkoon, ja viimeisenkin aterian lounaan ainekset ovat saman suunnitelman ostoslistalla.
3. Oletusmalli Sonnet 5.5, vaihdettavissa `app_config`-asetuksesta; Opus 5.5 vertailukohtana.
4. Vaihtoraja 5 / 7 päivää, konfiguroitava.
5. Varamalli (`fallbacks: "default"`) tarkistettu dokumentaatiosta ja pidetään, täydennettynä omalla uusintayrityksellä.
6. Suunnitelmaraja `max_plans_per_7_days = 4`, konfiguroitava.
7. Mallin vaihto on vain ylläpidon asetus (`app_config`), ei loppukäyttäjän valinta.

**Päätetty (2026-10-30):**

8. Suunnittele-kysely korvaa kaksi aloitusnappia. Syöjiä 1–6, ateriamäärä 2–6 tai koko viikko (7).
9. Toiveet ("mitä tekee mieli") ovat järjestämiskriteeri ja promptin pehmeä ohje, eivät suodatin.
10. Kyselyssä voi lisätä allergioita ja ruokavalioita vain tälle suunnitelmalle, mutta ei poistaa profiilin allergioita.
11. Suunnitelma on ehdotus, kunnes käyttäjä hyväksyy sen. Ehdotukseen lasketaan valmiiksi kaksi vaihtoehtoa per ateria; niistä tehty vaihto ei kuluta vaihtorajaa.
12. Ruokakuvan tunnistus: Haiku 5.5, suljettu Fineli-ehdokaslista, makrot Finelistä, kuvaa ei tallenneta. Rajat 10 / päivä ja 150 / 30 päivää sekä käyttäjän kustannuskatto 1,50 $ / 30 päivää.

**Päätetty (2026-11-10):**

13. Reseptit ovat aamiaisia, lounaita, päivällisiä tai välipaloja (`meal_types`). Suunnittelija ja generointi käyttävät vain päivällisiä; muut näkyvät kirjastossa ja päiväkirjassa.
14. Generoinnin tulosteeseen lisätään tekstikentät vinkit, säilytys ja lämmitys sekä työaika, kokonaisaika, vaikeus ja annosmäärä; ravintoarvot ja allergeenit lasketaan aina koodissa.
15. `isRecipeAllowed` on ainoa näyttöportti kaikkialla, myös chatissa: avustajalle annetaan vain sallitut reseptit, ja se ehdottaa vain niistä. Sama portti ajetaan backendissä.
16. Kuvantunnistus on testitilassa, kunnes backend on valmis; käyttöliittymä kertoo sen selvästi.

**Avoimet:**

- Ehdokaslistan koko ja sisältö kuvantunnistukseen (600–900 riviä) valitaan Fineli-tuonnin yhteydessä.
- Riittääkö Haikun tarkkuus (kohta 11.5), vai tarvitaanko Sonnet pienemmällä rajalla.

## 17. Avustajachat "Kysy Nupulta"

Chat, jossa hahmo Nuppu (docs/MASCOT.md) vastaa ruokaan, resepteihin ja kirjauksiin liittyviin kysymyksiin. Käyttöliittymä on valmis testivastauksilla (`services/assistant.ts`, `domain/assistantRules.ts`). Oikea toteutus vaihtaa vain palvelun toteutuksen, joten näkymät eivät muutu.

### 17.1 Kulku

```
Sovellus ──► Edge Function `assistant-chat`
               1. Auth + tilaus + päiväraja (app_config.max_chat_messages_per_day)
               2. Turvaluokitus ENNEN mallia (sama sääntöjoukko kuin domain/assistantRules.ts)
                  └─ osuma → valmis turvavastaus, mallia ei kutsuta
               3. Konteksti: vain jos käyttäjä on sallinut (chat_share_consent)
               4. Claude (system prompt + keskustelu, enintään 12 viimeisintä viestiä)
               5. Turvatarkistus JÄLKEEN: vastauksessa ei lukuja alle kalorilattian,
                  ei diagnooseja, ei lääkeohjeita → muuten korvataan turvavastauksella
               6. Kustannus generation_runs-tauluun (kind = 'chat'), ei viestien sisältöä
```

### 17.2 Malli

| Asetus | Arvo | Perustelu |
|---|---|---|
| Malli | `app_config.chat_model`, oletus `claude-haiku-5-5` | Lyhyet, keskustelevat vastaukset; halpa ja nopea. Sonnet 5.5 vertailukohtana testiaineistolla. |
| Thinking | pois / effort `low` | Vastaukset ovat lyhyitä; viive pidetään alle 3 sekunnin. |
| `max_tokens` | 600 | Noin 150–250 sanaa riittää. Pitkät vastaukset ovat mobiilissa raskaita. |
| Streaming | kyllä | Teksti alkaa näkyä heti, "Nuppu miettii…" korvautuu sujuvasti. |
| Prompt caching | system prompt | Sama kaikille käyttäjille. |

### 17.3 System prompt (luonnos)

```
Olet Nuppu, Platewise-sovelluksen ystävällinen nauris-hahmo. Puhut suomea,
sinuttelet, olet lämmin, lyhytsanainen ja vähän hassu. Autat arjen ruoassa:
reseptivinkit, kasvikset, ylijäämät, ostoslista, kirjaaminen ja juominen.

Rajat (ehdottomat):
- Et tee diagnooseja etkä anna lääke- tai hoito-ohjeita. Terveyskysymyksissä
  ohjaat lääkärille, terveydenhoitajalle tai ravitsemusterapeutille.
- Et koskaan ehdota alle 1 200 kcal (naiset) / 1 500 kcal (miehet) päivässä,
  yli 25 %:n vajetta, paastoja, ateriankorvikkeita laihdutukseen tai yli
  0,75 kg:n viikkovauhtia. Jos käyttäjä pyytää näitä, kieltäydyt ystävällisesti
  ja tarjoat rauhallisen vaihtoehdon.
- Syömishäiriöön viittaavissa viesteissä (oksentelu, syömättömyys,
  kompensointi, voimakas kehoahdistus) et anna lukuja, vaan kuuntelet,
  kannustat hakemaan apua (terveydenhoitaja, lääkäri, SYLI ry:n tukipuhelin)
  ja kerrot, että kalorit voi piilottaa.
- Et kommentoi kehoa tai painoa arvottavasti. Et kehu vähäistä syömistä.
- Jos käyttäjällä on "Piilota kalorit" päällä, et mainitse kaloreita etkä
  grammamääriä.
- Allergioista: kehotat aina tarkistamaan pakkausmerkinnät; et vakuuta
  minkään tuotteen olevan turvallinen allergikolle.
- Et keksi ravintoarvoja. Jos tarvitset lukuja, käytät vain annettua kontekstia.
- Jos et tiedä, sanot sen.
```

**Konteksti** (vain luvalla): tämän päivän syödyt ruoat nimeltä, kcal ja proteiini, päivätavoitteet, vesi, tavoitteen tyyppi ja "Piilota kalorit" -tila. Allergiat ja ruokavalio lähetetään vain sääntöinä ("älä ehdota: maito, gluteeni") eikä syinä, kuten resepteissäkin (kohta 15).

### 17.4 Turvallisuus

- **Reseptiehdotukset:** sovellus lähettää avustajalle vain käyttäjälle sallitut reseptit (`RecipeHint`, `isRecipeAllowed`), ja vastauksen reseptikortit tarkistetaan vielä näytettäessä. Testivastaus (`suggestRecipes`) valitsee proteiinikysymykseen kolme proteiinipitoisinta sallittua päivällistä eikä mainitse muita ruokia.

- **Kaksi kerrosta:** sääntöpohjainen luokitus ennen mallia ja jälkeen sen (`classifySafety`, yksikkötestattu). Prompti yksin ei riitä (vrt. CLAUDE.md, periaate 4).
- **Luokat:** `eatingDisorder` → välittävä vastaus ja tukitahot, ei lukuja; `extremeDiet` → kieltäytyminen ja turvarajat; `medical` → ohjaus ammattilaiselle.
- **Laadunvarmistus:** testiaineisto noin 150 kysymystä, joista 50 rajatapauksia (alle lattian, paastot, diagnoosit, syömishäiriön merkit). Hyväksymisraja: 100 % rajatapauksista turvallisia. Ajetaan jokaisen prompti- tai mallimuutoksen yhteydessä.
- **Tietosuoja:** viestit ovat terveystietoa. Ne tallennetaan vain laitteelle (MVP), niitä ei lokiteta eikä lähetetä analytiikkaan, ja Anthropic on käsittelijä (DPA). Keskustelun voi tyhjentää.

### 17.5 Kustannusraja

| Raja | Oletus |
|---|---|
| `max_chat_messages_per_day` | 20 (sovelluksessa sama raja, `DAILY_MESSAGE_LIMIT`) |
| `max_ai_cost_per_user_30_days_micro_usd` | sama yhteinen katto kuin kohdassa 11.4 |

Haikulla viesti maksaa noin 0,0005–0,001 $, eli 20 viestiä päivässä on enintään noin 0,6 $ / 30 pv. Katto pysäyttää chatin ennen kuin kustannus ylittää tilausmaksun osuuden.

## 18. Ravintoarvotaulukon luku

Käyttäjä kuvaa pakkauksen ravintoarvotaulukon, ja palvelu lukee 100 g -sarakkeen (`services/nutritionLabel.ts`, nyt testidataa).

- **Edge Function** `read-nutrition-label`: kuvamalli (`app_config.label_model`, oletus Haiku 5.5) palauttaa Zod-skeemalla validoidun JSONin: `{ kcal, protein_g, carbs_g, sugar_g, fat_g, fiber_g?, salt_g?, serving_g?, confidence }`.
- **Tarkistus koodissa:** energian ja makrojen yhteensopivuus (`energyMismatch`, 4/4/9 + kuitu 2), järkevät rajat (0–950 kcal / 100 g). Poikkeama näytetään käyttäjälle, mutta se ei estä tallennusta.
- **Käyttäjä tarkistaa aina luvut** ennen tallennusta. Ruoka merkitään lähteellä "Taulukosta" ja tallennetaan omiin ruokiin (`user_foods`). Periaate 2 (makrot Finelistä) ei koske näitä, ja se kerrotaan käyttöliittymässä.
- Kuvaa ei tallenneta. Raja on sama kuin kuvantunnistuksessa (kohta 11.4).

**Päätetty (2026-11-09):**

13. Avustajachat Haiku 5.5:llä, kaksikerroksinen sääntöpohjainen turvallisuus, konteksti vain luvalla, 20 viestiä päivässä.
14. Ravintoarvotaulukon luku kuvamallilla, ja käyttäjä vahvistaa luvut. Viivakoodihaku käyttää Open Food Factsia ilman tekoälyä.
