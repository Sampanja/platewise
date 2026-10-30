# Platewise – tietomalli

Postgres-tietomalli (Supabase) MVP:lle. Pohjana [PLAN.md](PLAN.md) ja [CLAUDE.md](../CLAUDE.md):n arkkitehtuuriperiaatteet. Tämä on suunnitelma; varsinainen toteutus tehdään Supabase-migraatioina.

## Yleiset linjaukset

| Asia | Linjaus |
|---|---|
| Tunnisteet | Käyttäjä- ja transaktiodata: `uuid` (`gen_random_uuid()`). Pienet viitetaulut (allergeenit, ruokavaliot, ketjut): `text`-koodi pääavaimena, esim. `'milk'`, `'vegan'`, `'lidl'`. |
| Raha | Kokonaislukuina sentteinä (`integer`, pääte `_cents`). Ei liukulukuja. |
| Määrät | Grammoina `numeric(8,2)` (pääte `_g`). Nesteet muunnetaan grammoiksi ainesosan tiheydellä tuonnissa. |
| Aika | `timestamptz`, aina UTC. Suunnitelman ateriapäivät ovat `start_date + day_offset` (ei sidottu kalenteriviikkoon). Päiväkirjan päivä on käyttäjän paikallinen päivämäärä (`date`), jonka sovellus antaa. |
| Aikaleimat | Jokaisessa taulussa `created_at`, muokattavissa tauluissa `updated_at` (triggeri). |
| Kirjoitukset | Kaikki generointi, hinnoittelu, kuvantunnistus ja viitedatan ylläpito tehdään Edge Functioneista `service_role`-avaimella (ohittaa RLS:n). Mobiilisovellus kirjoittaa suoraan vain omaan profiiliinsa, ruokavaliovalintoihinsa, perusvaroihinsa, ravintotavoitteisiinsa, päiväkirjaansa, palautteeseensa ja ostoslistan rasteihin. |
| Ravintoarvot | Aina Finelistä laskettuina, myös päiväkirjassa. Päiväkirjarivin makrot laskee tietokantatriggeri; sovellus ei voi kirjoittaa niitä. |
| RLS | Päällä **jokaisessa** taulussa. Taulu ilman policyja = vain backend pääsee käsiksi. |
| Tilin poisto | `auth.users`-poisto kaskadoi kaikkeen käyttäjädataan (`ON DELETE CASCADE`). Kustannusseuranta säilyy anonymisoituna (`ON DELETE SET NULL`). |

## Suhteet yleiskuvana

```mermaid
erDiagram
    auth_users ||--|| profiles : ""
    profiles ||--o{ profile_allergens : ""
    profiles ||--o{ profile_diets : ""
    profiles ||--o{ profile_excluded_ingredients : ""
    profiles ||--o{ profile_pantry_items : ""
    ingredients ||--o{ profile_pantry_items : ""
    profiles ||--o| subscriptions : ""
    profiles ||--o{ meal_plans : ""
    profiles ||--o{ recipe_feedback : ""
    profiles ||--o| profile_nutrition_goals : ""
    profiles ||--o{ diary_entries : ""
    fineli_foods ||--o{ diary_entries : ""
    recipes ||--o{ diary_entries : ""
    fineli_foods ||--o{ fineli_food_units : ""
    store_chains ||--o{ profiles : "oletuskauppa"
    store_chains ||--o{ ingredient_chain_prices : ""

    fineli_foods ||--o{ ingredients : ""
    ingredients ||--o{ ingredient_allergens : ""
    ingredients ||--o{ ingredient_tags : ""
    ingredients ||--o{ ingredient_chain_prices : ""
    ingredients ||--o{ recipe_ingredients : ""
    allergens ||--o{ ingredient_allergens : ""
    allergens ||--o{ allergen_keywords : ""
    diets ||--o{ diet_excluded_tags : ""

    recipes ||--o{ recipe_ingredients : ""
    recipe_images |o--o{ recipes : ""
    recipes ||--o{ meal_plan_items : ""
    meal_plans ||--o{ meal_plan_items : ""
    meal_plans ||--o{ meal_plan_alternatives : ""
    recipes ||--o{ meal_plan_alternatives : ""
    meal_plans ||--o{ shopping_list_items : ""
    ingredients ||--o{ shopping_list_items : ""
    generation_runs }o--o| meal_plans : ""
```

Taulut jakautuvat viiteen ryhmään:

1. **Viitedata** (jaettu, vain luku): kaupat, Fineli ja annoskoot, ainesosat, allergeenit, ruokavaliot
2. **Käyttäjädata** (oma, osin terveystietoa): profiili, allergiat, ruokavaliot, perusvarat, ravintotavoitteet, tilaus
3. **Reseptit** (jaettu, uudelleenkäytettävä): reseptit, ainesosat, kuvat. Muodostavat myös reseptikirjaston.
4. **Suunnitelmat ja seuranta** (oma / backend): ateriasuunnitelmat (viikko tai kauppareissu), vaihtoehdot, ostoslistat, palaute, generointiajot, asetukset
5. **Päiväkirja** (oma, terveystietoa): päiväkirjan rivit

---

## 1. Viitedata

### `store_chains`
Kauppaketjut ja niiden hintatasokerroin.

| Kenttä | Tyyppi | Huom. |
|---|---|---|
| `code` | `text` PK | `'lidl'`, `'prisma'`, `'k_market'`, `'k_citymarket'`, `'s_market'` |
| `name` | `text` NOT NULL | Näytettävä nimi |
| `price_multiplier` | `numeric(4,3)` NOT NULL | Esim. `0.850`, `1.000`, `1.150`; CHECK > 0 |
| `logo_path` | `text` | Polku Storageen |
| `sort_order` | `smallint` | Onboardingin järjestys |
| `is_active` | `boolean` NOT NULL DEFAULT true | |

### `fineli_foods`
Fineli-tuonti. Arvot per 100 g syötävää osaa.

| Kenttä | Tyyppi | Huom. |
|---|---|---|
| `fineli_id` | `integer` PK | Finelin oma FOODID |
| `name_fi` | `text` NOT NULL | |
| `energy_kcal` | `numeric(7,2)` NOT NULL | |
| `protein_g` | `numeric(6,2)` NOT NULL | |
| `carbs_g` | `numeric(6,2)` NOT NULL | Hiilihydraatit imeytyvät |
| `fat_g` | `numeric(6,2)` NOT NULL | |
| `fiber_g` | `numeric(6,2)` | |
| `sugar_g` | `numeric(6,2)` | |
| `saturated_fat_g` | `numeric(6,2)` | |
| `salt_g` | `numeric(6,2)` | |
| `source_version` | `text` NOT NULL | Fineli-julkaisun versio |
| `imported_at` | `timestamptz` NOT NULL | |
| `display_name_fi` | `text` | Siistitty näyttönimi päiväkirjan hakuun (Finelin nimet ovat osin teknisiä). NULL → `name_fi`. |
| `is_searchable` | `boolean` NOT NULL DEFAULT true | Piilottaa päiväkirjan hausta rivit, jotka eivät ole järkeviä syötäviä (esim. pelkät raaka-aineosat) |
| `photo_candidate` | `boolean` NOT NULL DEFAULT false | Kuuluu kuvantunnistuksen suljettuun listaan (noin 600–900 yleistä ruokaa ja annosta). Ks. [GENERATION.md, kohta 11](GENERATION.md#11-ruokakuvan-tunnistus-päiväkirja). |

Fineli on avointa dataa (CC BY 4.0). Lähde mainitaan sovelluksessa ("Ravintoarvot: Fineli, THL").

### `fineli_food_units`
Finelin annos- ja yksikkökoot päiväkirjan määrävalintaan (esim. "1 keskikokoinen omena = 140 g", "1 dl = 60 g").

| Kenttä | Tyyppi | Huom. |
|---|---|---|
| `fineli_id` | `integer` FK → `fineli_foods` | PK (`fineli_id`, `unit_code`) |
| `unit_code` | `text` NOT NULL | Finelin yksikkökoodi, esim. `KPL_M`, `DL`, `PORTM` |
| `name_fi` | `text` NOT NULL | "keskikokoinen kpl", "dl", "keskikokoinen annos" |
| `grams` | `numeric(8,2)` NOT NULL | CHECK > 0 |
| `sort_order` | `smallint` | |

### `ingredients`
**Suljettu ainesosalista.** Tekoäly saa viitata vain tämän taulun aktiivisiin riveihin.

| Kenttä | Tyyppi | Huom. |
|---|---|---|
| `id` | `uuid` PK | |
| `slug` | `text` UNIQUE NOT NULL | Promptissa käytettävä vakaa tunniste, esim. `chicken_breast` |
| `name_fi` | `text` NOT NULL | |
| `fineli_id` | `integer` NOT NULL FK → `fineli_foods` | Pakollinen: ilman sitä makroja ei voi laskea |
| `shop_section` | enum `shop_section` NOT NULL | Ostoslistan ryhmittely: `produce`, `meat_fish`, `dairy_eggs`, `bakery`, `dry_goods`, `canned`, `frozen`, `spices_oils`, `other` |
| `display_unit` | enum `display_unit` NOT NULL | `g`, `ml`, `pcs`, `tbsp`, `tsp` – miten määrä näytetään |
| `grams_per_unit` | `numeric(8,2)` | Pakollinen, jos `display_unit` ≠ `g` (esim. 1 sipuli = 80 g) |
| `base_price_per_kg_cents` | `integer` NOT NULL | Perushinta kertoimella 1,0; CHECK > 0 |
| `package_size_g` | `numeric(8,2)` NOT NULL | Tyypillinen pakkauskoko ostoslistaa varten |
| `pantry_eligible` | `boolean` NOT NULL DEFAULT false | Voiko käyttäjä lisätä ainesosan perusvaroihinsa (säilyvät kuivatuotteet, öljyt, mausteet) |
| `is_default_pantry` | `boolean` NOT NULL DEFAULT false | Kuuluu oletusperusvaroihin: öljy, suola, pippuri, sokeri, vehnäjauho, peruskuivamausteet. CHECK: `NOT is_default_pantry OR pantry_eligible` |
| `price_reviewed_at` | `date` NOT NULL | Milloin hinta tarkistettu viimeksi |
| `is_active` | `boolean` NOT NULL DEFAULT true | Passivointi, ei poistoa (resepteillä viittauksia) |

### `ingredient_chain_prices`
Valinnainen ketjukohtainen ylikirjoitus, kun pelkkä kerroin ei riitä (esim. Lidlin oma merkki selvästi halvempi).

| Kenttä | Tyyppi | Huom. |
|---|---|---|
| `ingredient_id` | `uuid` FK → `ingredients` | PK (`ingredient_id`, `chain_code`) |
| `chain_code` | `text` FK → `store_chains` | |
| `price_per_kg_cents` | `integer` NOT NULL | CHECK > 0 |
| `reviewed_at` | `date` NOT NULL | |

**Hintakaava:** `hinta/kg = coalesce(ingredient_chain_prices.price_per_kg_cents, round(base_price_per_kg_cents × price_multiplier))`. Laskenta tehdään backendissä yhdessä paikassa (yksikkötestattu funktio).

### `allergens`
EU:n 14 pakollista allergeeniryhmää (+ tarvittaessa lisäyksiä).

| Kenttä | Tyyppi | Huom. |
|---|---|---|
| `code` | `text` PK | `gluten`, `crustaceans`, `egg`, `fish`, `peanut`, `soy`, `milk`, `tree_nuts`, `celery`, `mustard`, `sesame`, `sulphites`, `lupin`, `molluscs` |
| `name_fi` | `text` NOT NULL | |
| `sort_order` | `smallint` | |

### `ingredient_allergens`
Mitä allergeeneja ainesosa sisältää. **Allergiatarkistuksen ensisijainen lähde.**

| Kenttä | Tyyppi | Huom. |
|---|---|---|
| `ingredient_id` | `uuid` FK → `ingredients` | PK (`ingredient_id`, `allergen_code`) |
| `allergen_code` | `text` FK → `allergens` | |
| `may_contain` | `boolean` NOT NULL DEFAULT false | "Saattaa sisältää" -jäämät; tiukka tila voi hylätä nämäkin |

### `allergen_keywords`
Toissijainen varmistus: reseptin vapaat tekstit (nimi, kuvaus, vaiheet) skannataan näillä sanoilla. Estää tilanteen, jossa tekoäly mainitsee vaiheissa ainesosan, jota ei ole ainesosalistassa ("ripottele päälle cashew-pähkinöitä").

| Kenttä | Tyyppi | Huom. |
|---|---|---|
| `id` | `uuid` PK | |
| `allergen_code` | `text` FK → `allergens` | |
| `keyword` | `text` NOT NULL | Pienaakkosin, vartalo: `pähkinä`, `cashew`, `maapähkinä`, `vehnä`, `maito`, `kerma`… |
| `except_phrases` | `text[]` NOT NULL DEFAULT `'{}'` | Ilmaukset, jotka poistetaan tekstistä ennen hakua, esim. `maito` → `{kookosmaito, kauramaito}`. Estää turhat hylkäykset; lisätään vain tarkistetusti. |
| | | UNIQUE (`allergen_code`, `keyword`) |

### `ingredient_tags`
Ruokavaliotarkistuksen tagit (ei allergeeneja).

| Kenttä | Tyyppi | Huom. |
|---|---|---|
| `ingredient_id` | `uuid` FK → `ingredients` | PK (`ingredient_id`, `tag`) |
| `tag` | enum `ingredient_tag` | `meat`, `pork`, `beef`, `poultry`, `fish`, `seafood`, `dairy`, `lactose`, `egg`, `honey`, `gelatin`, `alcohol` |

### `diets`

| Kenttä | Tyyppi | Huom. |
|---|---|---|
| `code` | `text` PK | `vegan`, `vegetarian`, `pescatarian`, `lactose_free`, `pork_free`, `alcohol_free` |
| `name_fi` | `text` NOT NULL | |
| `sort_order` | `smallint` | |

### `diet_excluded_tags`
Ruokavalion säännöt datana, jotta ne ovat testattavissa ja muokattavissa ilman koodimuutosta.

| Kenttä | Tyyppi | Huom. |
|---|---|---|
| `diet_code` | `text` FK → `diets` | PK (`diet_code`, `tag`) |
| `tag` | enum `ingredient_tag` | Esim. `vegan` → `meat`, `pork`, `beef`, `poultry`, `fish`, `seafood`, `dairy`, `lactose`, `egg`, `honey`, `gelatin` |

> Gluteeniton ei ole ruokavalio vaan allergia (`gluten`), jotta se kulkee saman tiukan tarkistuksen läpi.

---

## 2. Käyttäjädata

### `profiles`
Yksi rivi per käyttäjä. Luodaan triggerillä `auth.users`-insertin yhteydessä.

| Kenttä | Tyyppi | Huom. |
|---|---|---|
| `id` | `uuid` PK, FK → `auth.users` ON DELETE CASCADE | |
| `display_name` | `text` | Valinnainen, näytetään profiilissa ja Kodin tervehdyksessä. CHECK pituus ≤ 40 |
| `household_size` | `smallint` NOT NULL DEFAULT 1 | Talouden koko eli kyselyn oletussyöjät. CHECK BETWEEN 1 AND 6 |
| `weekly_budget_cents` | `integer` | Viikkosuunnitelman (7 päivällistä) budjetti. CHECK BETWEEN 1000 AND 50000; NULL ennen onboardingia |
| `chain_code` | `text` FK → `store_chains` | Oletuskauppa. NULL ennen onboardingia |
| `last_meal_count` | `smallint` | Edellisen kyselyn ateriamäärä esitäyttöä varten. CHECK BETWEEN 2 AND 7 |
| `last_budget_cents` | `integer` | Edellisen kyselyn budjetti esitäyttöä varten |
| `last_eaters` | `smallint` | Edellisen kyselyn syöjien määrä. CHECK BETWEEN 1 AND 6 |
| `last_craving_codes` | `text[]` NOT NULL DEFAULT `'{}'` | Edellisen kyselyn "mitä tekee mieli" -valinnat (ei terveystietoa) |
| `health_data_consent_at` | `timestamptz` | GDPR art. 9 -suostumus allergia- ja ruokavaliotiedoille, ravintotavoitteille ja päiväkirjalle. Ilman sitä näitä ei voi tallentaa. |
| `onboarding_completed_at` | `timestamptz` | |
| `locale` | `text` NOT NULL DEFAULT `'fi'` | |

### `profile_allergens` *(terveystieto)*

| Kenttä | Tyyppi | Huom. |
|---|---|---|
| `user_id` | `uuid` FK → `profiles` ON DELETE CASCADE | PK (`user_id`, `allergen_code`) |
| `allergen_code` | `text` FK → `allergens` | |
| `strict` | `boolean` NOT NULL DEFAULT true | true = myös "saattaa sisältää" hylätään |

### `profile_diets` *(terveystieto)*

| Kenttä | Tyyppi | Huom. |
|---|---|---|
| `user_id` | `uuid` FK → `profiles` ON DELETE CASCADE | PK (`user_id`, `diet_code`) |
| `diet_code` | `text` FK → `diets` | |

### `profile_excluded_ingredients`
"En pidä näistä" -lista. Ei terveystieto, mutta käsitellään samoin säännöin.

| Kenttä | Tyyppi | Huom. |
|---|---|---|
| `user_id` | `uuid` FK → `profiles` ON DELETE CASCADE | PK (`user_id`, `ingredient_id`) |
| `ingredient_id` | `uuid` FK → `ingredients` | |

### `profile_pantry_items`
Käyttäjän perusvarat: ainesosat, joiden oletetaan löytyvän kotoa. Ne eivät tule ostoslistaan eivätkä budjettiin, ja reseptissä ne merkitään "kotoa".

| Kenttä | Tyyppi | Huom. |
|---|---|---|
| `user_id` | `uuid` FK → `profiles` ON DELETE CASCADE | PK (`user_id`, `ingredient_id`) |
| `ingredient_id` | `uuid` FK → `ingredients` | Vain `pantry_eligible = true` (tarkistetaan triggerillä) |

- Täytetään profiilin luonnissa kaikilla `is_default_pantry`-ainesosilla. Käyttäjä voi poistaa ja lisätä asetuksista.
- Perusvaroihin kuulumattomat mausteet ostetaan ja lasketaan budjettiin kokonaisina pakkauksina.
- Perusvarat eivät vaikuta allergiatarkistukseen: myös kotoa löytyvä vehnäjauho hylätään gluteeniallergikolta.

### `profile_nutrition_goals` *(terveystieto)*
Päiväkirjan päivätavoitteet. Käyttäjä asettaa ne itse profiilissa; MVP:ssä ei kerätä painoa, pituutta eikä ikää tavoitteen laskemiseen.

| Kenttä | Tyyppi | Huom. |
|---|---|---|
| `user_id` | `uuid` PK, FK → `profiles` ON DELETE CASCADE | |
| `kcal` | `smallint` NOT NULL DEFAULT 2000 | CHECK BETWEEN 1200 AND 5000 (alaraja: ks. PLAN.md, riskit) |
| `protein_g` | `smallint` NOT NULL DEFAULT 100 | CHECK BETWEEN 0 AND 400 |
| `carbs_g` | `smallint` NOT NULL DEFAULT 230 | CHECK BETWEEN 0 AND 700 |
| `fat_g` | `smallint` NOT NULL DEFAULT 70 | CHECK BETWEEN 0 AND 300 |

Rivi luodaan oletusarvoilla, kun käyttäjä avaa päiväkirjan ensimmäisen kerran suostumuksen jälkeen. Sovellus ehdottaa makrogrammoja kcal-tavoitteesta (esim. 20 / 45 / 35 % energiasta), mutta käyttäjä voi muuttaa niitä.

### `subscriptions`
Tilauksen tila. Kirjoittaa vain RevenueCat-webhookin Edge Function.

| Kenttä | Tyyppi | Huom. |
|---|---|---|
| `user_id` | `uuid` PK, FK → `profiles` ON DELETE CASCADE | RevenueCatin `app_user_id` = tämä |
| `status` | enum `subscription_status` NOT NULL | `trialing`, `active`, `in_grace_period`, `expired`, `cancelled`, `billing_issue` |
| `product_id` | `text` NOT NULL | Esim. `platewise_monthly`, `platewise_yearly` |
| `store` | enum `app_store` NOT NULL | `app_store`, `play_store` |
| `current_period_ends_at` | `timestamptz` NOT NULL | |
| `will_renew` | `boolean` NOT NULL | |
| `last_event_at` | `timestamptz` NOT NULL | Vanhempia webhook-tapahtumia ei sovelleta |

### `revenuecat_events`
Webhookien raakaloki idempotenssia ja vianselvitystä varten.

| Kenttä | Tyyppi | Huom. |
|---|---|---|
| `event_id` | `text` PK | RevenueCatin tapahtuma-ID; duplikaatit ohitetaan |
| `user_id` | `uuid` FK → `profiles` ON DELETE SET NULL | |
| `event_type` | `text` NOT NULL | |
| `payload` | `jsonb` NOT NULL | |
| `received_at` | `timestamptz` NOT NULL | |

---

## 3. Reseptit (jaettu)

Reseptit eivät kuulu kenellekään käyttäjälle. Sama resepti käytetään uudelleen kaikille yhteensopiville profiileille (periaate 6). Määrät tallennetaan **yhdelle annokselle** ja skaalataan suunnitelman syöjien määrällä.

**Reseptikirjasto** (Reseptit-välilehti) näyttää `active`-reseptit, jotka läpäisevät käyttäjän allergia- ja ruokavaliotarkistuksen. Kirjasto haetaan Edge Functionilla `list-recipes`, joka suodattaa (hinta, aika, ruokavalio, kalorit, hakusana), ajaa `checkRecipe`-tarkistuksen jokaiselle palautettavalle reseptille ja laskee hinta-arvion käyttäjän ketjulle. RLS pysyy suppeana (vain omien suunnitelmien reseptit), joten koko kantaa ei voi ladata suoraan. Kirjasto esitäytetään ennen julkaisua noin 200 reseptillä ([GENERATION.md, kohta 10](GENERATION.md#10-reseptikirjaston-esitäyttö)).

### `recipes`

| Kenttä | Tyyppi | Huom. |
|---|---|---|
| `id` | `uuid` PK | |
| `title_fi` | `text` NOT NULL | |
| `description_fi` | `text` | Yksi lause |
| `steps_fi` | `jsonb` NOT NULL | Taulukko merkkijonoja; validoitu Zodilla ennen tallennusta |
| `cook_time_min` | `smallint` NOT NULL | CHECK BETWEEN 5 AND 120 |
| `difficulty` | enum `difficulty` NOT NULL | `easy`, `medium` (MVP: ei vaikeita) |
| `dish_type` | enum `dish_type` NOT NULL | `soup`, `stew`, `pasta`, `rice`, `potato`, `oven`, `stir_fry`, `salad`, `bowl`, `wrap`, `other`; vaihtelun ja kuvien uudelleenkäytön tunnistukseen |
| `cuisine` | enum `cuisine` NOT NULL | `finnish`, `nordic`, `italian`, `asian`, `mexican`, `middle_eastern`, `indian`, `other`; "mitä tekee mieli" -toiveisiin ja kirjaston suodatukseen |
| `main_protein` | enum `main_protein` NOT NULL | `chicken`, `beef`, `pork`, `minced_meat`, `fish`, `seafood`, `egg`, `dairy`, `legumes`, `tofu`, `none`; toiveisiin ja vaihtelun tarkistukseen |
| `good_for_leftovers` | `boolean` NOT NULL | Säilyykö ja lämpeneekö seuraavan päivän lounaaksi. Vain näitä tarjotaan "tee tuplana" -päiville. |
| `kcal_per_serving` | `numeric(7,1)` NOT NULL | **Laskettu Finelistä** tallennushetkellä, ei tekoälyltä |
| `protein_g_per_serving` | `numeric(6,1)` NOT NULL | 〃 |
| `carbs_g_per_serving` | `numeric(6,1)` NOT NULL | 〃 |
| `fat_g_per_serving` | `numeric(6,1)` NOT NULL | 〃 |
| `allergen_codes` | `text[]` NOT NULL | Johdettu `ingredient_allergens`ista (vain varmat). Uudelleenkäytön nopeaan suodatukseen. |
| `may_contain_codes` | `text[]` NOT NULL | Johdettu "saattaa sisältää" -allergeeneista |
| `ingredient_tags` | `ingredient_tag[]` NOT NULL | Johdettu `ingredient_tags`ista |
| `base_cost_per_serving_cents` | `integer` NOT NULL | Hinta kertoimella 1,0, uudelleenkäytön esisuodatukseen. Lopullinen hinta lasketaan ketjulle. |
| `image_id` | `uuid` FK → `recipe_images` ON DELETE SET NULL | NULL kunnes kuva valmis |
| `status` | enum `recipe_status` NOT NULL DEFAULT `'active'` | `active`, `retired` (esim. ainesosa passivoitu tai huono palaute) |
| `source_generation_id` | `uuid` FK → `generation_runs` ON DELETE SET NULL | Mistä ajosta syntyi |
| `prompt_version` | `text` NOT NULL | Promptin versio, jotta laatua voi verrata |
| `checks_version` | `text` NOT NULL | Minkä allergia- ja ruokavaliosääntöjen version läpi resepti meni |

**Toiveiden kartoitus** ("mitä tekee mieli" → reseptin kentät) on koodissa yksi puhdas, testattu funktio `matchesCraving(recipe, craving)`:

| Toive (`craving_code`) | Ehto |
|---|---|
| `chicken` | `main_protein = 'chicken'` |
| `fish` | `main_protein IN ('fish', 'seafood')` |
| `minced_meat` | `main_protein = 'minced_meat'` |
| `vegetarian` | ei tageja `meat`, `pork`, `beef`, `poultry`, `fish`, `seafood` |
| `pasta` | `dish_type = 'pasta'` |
| `soup` | `dish_type = 'soup'` |
| `asian` | `cuisine = 'asian'` |
| `mexican` | `cuisine = 'mexican'` |
| `quick` | `cook_time_min <= 25` |
| `oven` | `dish_type = 'oven'` |

Toiveet ovat järjestämiskriteeri, eivät suodatin (ks. GENERATION.md, kohta 4).

Johdetut kentät (`allergen_codes`, `may_contain_codes`, `ingredient_tags`, makrot, `base_cost_…`) lasketaan backendissä uudelleen aina, kun reseptin ainesosat tai viitedata muuttuvat. **Allergiatarkistus ajetaan silti aina uudelleen ainesosatasolla** ennen kuin resepti päätyy käyttäjän listalle. Johdetut taulukot ovat vain esisuodatin.

**Rejected-reseptejä ei tallenneta tähän tauluun.** Tarkistuksessa hylätty tekoälyvastaus kirjataan vain `generation_runs`-riville.

### `recipe_ingredients`

| Kenttä | Tyyppi | Huom. |
|---|---|---|
| `recipe_id` | `uuid` FK → `recipes` ON DELETE CASCADE | PK (`recipe_id`, `position`) |
| `position` | `smallint` NOT NULL | Näyttöjärjestys |
| `ingredient_id` | `uuid` NOT NULL FK → `ingredients` | **Suljettu lista:** FK takaa, ettei tuntematonta ainesosaa voi tallentaa |
| `grams_per_serving` | `numeric(8,2)` NOT NULL | CHECK > 0 |
| `preparation_fi` | `text` | "hienonnettuna", "kuutioina" |
| | | UNIQUE (`recipe_id`, `ingredient_id`) |

### `recipe_images`

| Kenttä | Tyyppi | Huom. |
|---|---|---|
| `id` | `uuid` PK | |
| `dish_signature` | `text` NOT NULL | Normalisoitu avain samankaltaisten annosten tunnistukseen (esim. pääraaka-aineet + ruokatyyppi). Uusi resepti saa olemassa olevan kuvan, jos signature täsmää. |
| `status` | enum `image_status` NOT NULL | `queued`, `generating`, `ready`, `failed` |
| `storage_path` | `text` | Storage-polku, kun `ready` |
| `model` | `text` | |
| `prompt` | `text` | |
| `attempts` | `smallint` NOT NULL DEFAULT 0 | |
| `last_error` | `text` | |
| | | INDEX (`dish_signature`) WHERE `status = 'ready'` |

Tämä taulu toimii samalla kuvajonona: image-worker hakee `queued`-rivit (`FOR UPDATE SKIP LOCKED`).

---

## 4. Suunnitelmat, ostoslista ja seuranta

### `meal_plans`
Yksi suunnitelma = **N päivällistä + budjetti → yksi ostoslista**. Suunnitelma syntyy Suunnittele-kyselystä (PLAN.md, kohta 4.3), ja ateriamäärä ratkaisee tilan:

- **Viikkosuunnitelma** (`kind = 'week'`): "Koko viikko" eli N = 7. Budjetiksi esitäytetään profiilin `weekly_budget_cents`.
- **Kauppareissu** (`kind = 'trip'`): N = 2–6 ja budjetti yhdelle ostoskerralle.

Budjetti kattaa vain sovelluksen ehdottamat ateriat, ei käyttäjän muita ruokaostoksia. Kyselyn vastaukset tallennetaan **snapshottina**, koska profiilia voi muuttaa suunnitelman aikana.

**Elinkaari:** `generating` → `proposed` (ehdotusnäkymä: vaihdot ja tuplaukset) → `accepted` ("Hyväksy" → ostoslista). Hyväksymätön ehdotus vanhenee: `proposed`-suunnitelmat, joita ei ole hyväksytty 7 päivässä, poistetaan taustatyöllä. Koti näyttää uusimman `accepted`-suunnitelman.

| Kenttä | Tyyppi | Huom. |
|---|---|---|
| `id` | `uuid` PK | |
| `user_id` | `uuid` NOT NULL FK → `profiles` ON DELETE CASCADE | |
| `kind` | enum `plan_kind` NOT NULL | `week`, `trip`. CHECK `(kind = 'week') = (meal_count = 7)` |
| `start_date` | `date` NOT NULL | Ensimmäisen aterian päivä (oletus: tänään) |
| `meal_count` | `smallint` NOT NULL | N päivällistä. CHECK BETWEEN 2 AND 7 |
| `household_size` | `smallint` NOT NULL | Syöjien määrä tässä suunnitelmassa (kyselyn vaihe 2). CHECK BETWEEN 1 AND 6 |
| `budget_cents` | `integer` NOT NULL | Snapshot |
| `chain_code` | `text` NOT NULL FK → `store_chains` | Snapshot (kyselyn vaihe 6) |
| `craving_codes` | `text[]` NOT NULL DEFAULT `'{}'` | "Mitä tekee mieli" -toiveet. Arvot tarkistetaan koodissa tunnettua listaa vasten. |
| `extra_allergen_codes` | `text[]` NOT NULL DEFAULT `'{}'` | *(terveystieto)* Vain tälle suunnitelmalle lisätyt allergeenit (esim. vieras). Profiilin allergiat tulevat aina mukaan, joten tähän tallennetaan vain lisäykset. Käsitellään aina `strict`-tilassa. |
| `extra_diet_codes` | `text[]` NOT NULL DEFAULT `'{}'` | *(terveystieto)* Vain tälle suunnitelmalle lisätyt ruokavaliot |
| `estimated_total_cents` | `integer` | Ostoslistan summa (pakkauksina), päivitetään vaihdon ja uudelleenlaskennan jälkeen |
| `avg_kcal_per_serving` | `numeric(7,1)` | Ehdotusnäkymän yhteenveto; päivitetään vaihdon jälkeen. Samoin `avg_protein_g`, `avg_carbs_g`, `avg_fat_g`. |
| `status` | enum `plan_status` NOT NULL | `generating`, `proposed`, `accepted`, `failed` |
| `accepted_at` | `timestamptz` | Asetetaan "Hyväksy"-toiminnossa. CHECK `(status = 'accepted') = (accepted_at IS NOT NULL)` |

Vaihtoraja ei ole suunnitelmakohtainen vaan käyttäjäkohtainen (liukuva 7 päivää), koska kauppareissuja voi tehdä useita viikossa. Vaihdot lasketaan `generation_runs`-taulusta.

**Kodin säästöt** lasketaan kyselyllä: kuluvan kuukauden `accepted`-suunnitelmista Σ `max(budget_cents − estimated_total_cents, 0)`. Erillistä taulua ei tarvita.

### `meal_plan_alternatives`
Ehdotusnäkymän valmiiksi lasketut vaihtoehdot. Generoinnin yhteydessä backend valitsee jokaiselle aterialle enintään `proposal_alternatives_per_meal` (oletus 2) uudelleenkäytettävää reseptiä, jotka läpäisevät tarkistuksen. "Vaihda" ottaa ensin seuraavan käyttämättömän vaihtoehdon, jolloin vaihto on nopea eikä vaadi tekoälyä. Vasta kun vaihtoehdot loppuvat, tehdään tavallinen vaihto (GENERATION.md, kohta 9).

| Kenttä | Tyyppi | Huom. |
|---|---|---|
| `meal_plan_id` | `uuid` FK → `meal_plans` ON DELETE CASCADE | PK (`meal_plan_id`, `day_offset`, `rank`) |
| `day_offset` | `smallint` NOT NULL | Mihin päivälliseen vaihtoehto kuuluu |
| `rank` | `smallint` NOT NULL | Tarjousjärjestys (1 = ensin) |
| `recipe_id` | `uuid` NOT NULL FK → `recipes` | |
| `used_at` | `timestamptz` | Asetetaan, kun vaihtoehto otetaan käyttöön; käytettyä ei tarjota uudelleen |

Rivit poistetaan, kun suunnitelma hyväksytään.

### `meal_plan_items`
MVP:ssä generoidaan vain päivällisiä. Lounas syntyy ainoastaan "tee tuplana → huomisen lounas" -valinnasta.

| Kenttä | Tyyppi | Huom. |
|---|---|---|
| `id` | `uuid` PK | |
| `meal_plan_id` | `uuid` NOT NULL FK → `meal_plans` ON DELETE CASCADE | |
| `day_offset` | `smallint` NOT NULL | Päivä = `start_date + day_offset`. Päivälliset 0 … `meal_count − 1`; lounas voi olla `meal_count` (viimeisen päivällisen tuplaus). |
| `meal_slot` | enum `meal_slot` NOT NULL | `dinner`, `lunch` |
| `recipe_id` | `uuid` NOT NULL FK → `recipes` | Ei kaskadia: reseptejä ei poisteta, vain `retired` |
| `servings` | `smallint` NOT NULL | Päivällinen: `household_size` (1–6), tuplana `2 × household_size`. Lounas: `household_size`. CHECK BETWEEN 1 AND 12 |
| `cook_double` | `boolean` NOT NULL DEFAULT false | CHECK: `NOT cook_double OR meal_slot = 'dinner'` |
| `leftover_from_item_id` | `uuid` FK → `meal_plan_items` ON DELETE CASCADE | Lounasrivillä viittaus edellisen päivän tuplattuun päivälliseen; muilla NULL. CHECK: `(meal_slot = 'lunch') = (leftover_from_item_id IS NOT NULL)`. Triggeri varmistaa, että lounaan `day_offset` = päivällisen `day_offset + 1`. |
| `estimated_cost_cents` | `integer` NOT NULL | Päivällisellä annosten osuus (sisältää tuplauksen). Lounaalla aina 0, koska kustannus on jo päivällisellä. |
| `replaced_recipe_id` | `uuid` FK → `recipes` | Täytetään vaihdossa, palautteeksi |
| | | UNIQUE (`meal_plan_id`, `day_offset`, `meal_slot`) |

**Sunnuntairajoitus poistuu.** Koska suunnitelma ei ole sidottu kalenteriviikkoon, viimeisenkin päivällisen voi tuplata: lounas tulee riville `day_offset = meal_count`, ja sen ainekset ovat jo tämän suunnitelman ostoslistalla. Jos seuraava suunnitelma alkaa samana päivänä, sovelluksen päivänäkymä näyttää molempien suunnitelmien rivit päivämäärän mukaan; lounas ja päivällinen eivät törmää.

Tuplauksen kytkeminen päälle tai pois tehdään Edge Functionilla (`recalculate-plan`), joka luo tai poistaa lounasrivin ja laskee ostoslistan ja budjetin uudelleen. Sovellus ei kirjoita tähän tauluun suoraan.

### `shopping_list_items`
Backend muodostaa yhden listan kaikkien suunnitelman aterioiden ainesosista (tuplaukset mukaan lukien). Lista lasketaan jo ehdotusvaiheessa, koska sen summa on budjettivertailun luku, mutta sovellus näyttää sen vasta hyväksynnän jälkeen. Sama ainesosa yhdistetään yhdeksi riviksi ja pyöristetään pakkauksiin. Käyttäjän perusvarat (`profile_pantry_items`) jätetään listalta ja budjetista kokonaan pois. Lista lasketaan uudelleen (`recalculate-plan`), kun käyttäjä muuttaa perusvarojaan tai tuplausvalintoja.

| Kenttä | Tyyppi | Huom. |
|---|---|---|
| `id` | `uuid` PK | |
| `meal_plan_id` | `uuid` NOT NULL FK → `meal_plans` ON DELETE CASCADE | |
| `ingredient_id` | `uuid` NOT NULL FK → `ingredients` | |
| `total_grams` | `numeric(10,2)` NOT NULL | Tarve koko suunnitelmalle |
| `packages` | `smallint` NOT NULL | `ceil(total_grams / package_size_g)` |
| `estimated_cost_cents` | `integer` NOT NULL | `packages × package_size_g × kg-hinta`. **Tämä on budjettivertailun luku**, koska käyttäjä maksaa kokonaisista pakkauksista. |
| `leftover_grams` | `numeric(10,2)` NOT NULL | Hävikkiarvio; generointi pyrkii minimoimaan tätä |
| `checked` | `boolean` NOT NULL DEFAULT false | Ainoa kenttä, jota käyttäjä muokkaa |
| `checked_at` | `timestamptz` | |
| | | UNIQUE (`meal_plan_id`, `ingredient_id`) |

### `recipe_feedback`

| Kenttä | Tyyppi | Huom. |
|---|---|---|
| `user_id` | `uuid` FK → `profiles` ON DELETE CASCADE | PK (`user_id`, `recipe_id`) |
| `recipe_id` | `uuid` FK → `recipes` | |
| `rating` | `smallint` NOT NULL | CHECK IN (-1, 1) |

Käytetään uudelleenkäytön järjestämiseen ja huonojen reseptien `retired`-tilaan siirtämiseen.

### `generation_runs`
Jokainen tekoälyä mahdollisesti käyttävä pyyntö (suunnitelma, vaihto, reseptikuva, ruokakuvan tunnistus, kirjaston esitäyttö): kustannusseuranta, rajat ja laadun seuranta. Myös uudelleenkäytöllä ilman tekoälykutsua hoidettu vaihto kirjataan (`model` NULL, `outcome = 'reused'`), jotta vaihtoraja lasketaan yhdestä paikasta. Valmiista vaihtoehdosta (`meal_plan_alternatives`) tehty vaihto ei luo riviä eikä kuluta rajaa. **Ei terveystietoja**: hylkäyssyyksi kirjataan sääntötyyppi, ei käyttäjän allergioita, eikä kuvantunnistuksesta tallenneta tunnistettuja ruokia.

| Kenttä | Tyyppi | Huom. |
|---|---|---|
| `id` | `uuid` PK | |
| `user_id` | `uuid` FK → `profiles` ON DELETE SET NULL | Anonymisoituu tilin poistossa |
| `meal_plan_id` | `uuid` FK → `meal_plans` ON DELETE SET NULL | |
| `kind` | enum `generation_kind` NOT NULL | `plan`, `swap`, `image`, `food_photo`, `library_seed` |
| `model` | `text` | Vastanneen mallin ID API-vastauksen `model`-kentästä (voi olla varamalli); NULL, jos tekoälyä ei kutsuttu |
| `requested_model` | `text` | Pyydetty malli (`app_config`), jotta varamallin käyttö näkyy |
| `prompt_version` | `text` | |
| `input_tokens` | `integer` | |
| `output_tokens` | `integer` | |
| `cost_micro_usd` | `bigint` NOT NULL | Kustannus miljoonasosadollareina |
| `attempts` | `smallint` NOT NULL | Montako kierrosta tarvittiin (hylkäykset, budjettikorjaukset) |
| `outcome` | enum `generation_outcome` NOT NULL | `success`, `reused`, `rejected_validation`, `rejected_allergen`, `rejected_diet`, `over_budget`, `no_food_found`, `refusal`, `error` |
| `reused_recipes` | `smallint` NOT NULL DEFAULT 0 | Montako reseptiä saatiin uudelleenkäytöstä |
| `duration_ms` | `integer` | |

### `app_config`
Ajonaikaiset asetukset, joita voi muuttaa ilman julkaisua. Edge Functionit lukevat ne (lyhyt välimuisti).

| Kenttä | Tyyppi | Huom. |
|---|---|---|
| `key` | `text` PK | |
| `value` | `jsonb` NOT NULL | Validoidaan Zod-skeemalla lukuhetkellä |
| `updated_at` | `timestamptz` NOT NULL | |

MVP:n avaimet ja oletusarvot:

| Avain | Oletus | Käyttö |
|---|---|---|
| `generation_model` | `"claude-sonnet-5-5"` | Reseptien generointimalli |
| `generation_effort` | `"medium"` | `output_config.effort` |
| `max_swaps_per_7_days` | `5` | Vaihtoraja käyttäjää kohden |
| `max_plans_per_7_days` | `4` | Suunnitelmien (viikko + kauppareissu) raja käyttäjää kohden |
| `max_correction_rounds` | `2` | Korjauskierrokset generoinnissa |
| `min_cost_per_serving_cents` | `150` | Budjetin esitarkistus |
| `proposal_alternatives_per_meal` | `2` | Valmiit vaihtoehdot per ateria ehdotusnäkymässä |
| `photo_model` | `"claude-haiku-5-5"` | Ruokakuvan tunnistuksen malli |
| `photo_effort` | `"low"` | Tunnistuksen `output_config.effort` |
| `max_photo_recognitions_per_day` | `10` | Kuvantunnistukset käyttäjää kohden (kalenteripäivä, Suomen aikaa) |
| `max_photo_recognitions_per_30_days` | `150` | Kuvantunnistukset käyttäjää kohden, liukuva 30 päivää |
| `max_ai_cost_per_user_30_days_micro_usd` | `1500000` | Käyttäjän kaikkien tekoälykutsujen kustannuskatto (1,50 $ / 30 pv). Ylityksessä kuvantunnistus keskeytyy ensin; ks. GENERATION.md, kohta 11. |

---

## 5. Päiväkirja (kalorilaskuri)

### `diary_entries` *(terveystieto)*
Yksi rivi = yksi syöty ruoka tai resepti. Rivi viittaa joko Finelin ruokaan grammoina tai reseptiin annoksina. Makrot lasketaan tietokannassa `BEFORE INSERT OR UPDATE` -triggerillä (`fineli_foods`-arvot × grammat / 100, tai reseptin per annos -arvot × annokset). Sovellus ei voi kirjoittaa makrokenttiä (sarakekohtainen `GRANT`), joten näytetyt luvut tulevat aina Finelistä (periaate 2).

| Kenttä | Tyyppi | Huom. |
|---|---|---|
| `id` | `uuid` PK | |
| `user_id` | `uuid` NOT NULL FK → `profiles` ON DELETE CASCADE | |
| `entry_date` | `date` NOT NULL | Käyttäjän paikallinen päivä |
| `slot` | enum `diary_slot` NOT NULL | `breakfast`, `lunch`, `dinner`, `snack` |
| `source` | enum `diary_source` NOT NULL | `food_search`, `recipe`, `photo` |
| `fineli_id` | `integer` FK → `fineli_foods` | Ruokahaku ja kuvantunnistus |
| `grams` | `numeric(8,2)` | CHECK BETWEEN 1 AND 3000 |
| `unit_code` | `text` | Valittu annoskoko näyttöä varten (esim. `KPL_M`); grammat ratkaisevat |
| `recipe_id` | `uuid` FK → `recipes` | Reseptin lisäys omalta listalta |
| `servings` | `numeric(4,2)` | CHECK BETWEEN 0.25 AND 10 |
| `kcal`, `protein_g`, `carbs_g`, `fat_g` | `numeric(7,1)` NOT NULL | **Triggerin laskemat**, ei sovelluksen |
| `is_estimate` | `boolean` NOT NULL DEFAULT false | `true` kuvantunnistuksen riveillä, jolloin UI näyttää merkinnän "arvio". Muuttuu `false`:ksi, kun käyttäjä muuttaa määrää tallennuksen jälkeen. |
| `photo_batch_id` | `uuid` | Saman kuvan rivit ryhmitellään (UI näyttää ne yhtenä ateriana). Ei viittaa tauluun: kuvaa ei tallenneta. |
| | | CHECK: (`fineli_id` IS NOT NULL AND `grams` IS NOT NULL AND `recipe_id` IS NULL) OR (`recipe_id` IS NOT NULL AND `servings` IS NOT NULL AND `fineli_id` IS NULL) |
| | | CHECK: `source <> 'recipe' OR recipe_id IS NOT NULL` |

- **Ruokakuvaa ei tallenneta.** Sovellus pienentää kuvan, lähettää sen `recognize-food-photo`-funktiolle ja saa takaisin ehdotusrivit (Fineli-ID + grammat). Käyttäjä korjaa ne ja tallentaa rivit itse. Kuva ei päädy Storageen eikä tietokantaan.
- **Reseptin lisäys yhdellä napautuksella:** `recipe_id` + `servings = 1`, `slot` päätellään kellonajasta tai ateriaryhmästä, josta "Lisää" painettiin. Lounaaksi tuplatun päivällisen voi lisätä lounaaksi samalla tavalla.
- **Viimeksi käytetyt** haetaan päiväkirjasta (`fineli_id`, uusin ensin), erillistä taulua ei tarvita.
- **Päivän summat** lasketaan kyselyllä (`sum(kcal) … GROUP BY entry_date, slot`). Näkymää tai välitaulua ei tarvita MVP:ssä.

---

## RLS-säännöt

Merkinnät: **R** = select, **I** = insert, **U** = update, **D** = delete. `auth.uid()` = kirjautunut käyttäjä. Backend (`service_role`) ohittaa RLS:n kaikissa tauluissa.

| Taulu | authenticated | Ehto | anon |
|---|---|---|---|
| `store_chains`, `allergens`, `diets` | R | `is_active` (kun kenttä on) | R (onboarding voi alkaa ennen kirjautumista) |
| `fineli_foods`, `fineli_food_units` | R | Päiväkirjan ruokahaku (avointa dataa) | – |
| `ingredient_chain_prices`, `ingredient_tags`, `diet_excluded_tags`, `allergen_keywords` | – | Vain backend | – |
| `ingredients` | R | `is_active` (tarvitaan "en pidä tästä"- ja perusvaravalintoihin sekä ostoslistan nimiin) | – |
| `ingredient_allergens` | R | Reseptinäkymän allergeenikorostusta varten | – |
| `profiles` | R, U | `id = auth.uid()` | – |
| `profile_allergens`, `profile_diets` | R, I, D | `user_id = auth.uid()`; I vaatii lisäksi `profiles.health_data_consent_at IS NOT NULL` | – |
| `profile_excluded_ingredients`, `profile_pantry_items` | R, I, D | `user_id = auth.uid()`. Perusvarojen muutoksen jälkeen sovellus kutsuu `recalculate-plan`-funktiota. | – |
| `profile_nutrition_goals` | R, I, U | `user_id = auth.uid()`; I ja U vaativat `health_data_consent_at IS NOT NULL` | – |
| `diary_entries` | R, I, U, D | `user_id = auth.uid()`; I ja U vaativat suostumuksen. `GRANT INSERT/UPDATE` vain sarakkeisiin `entry_date`, `slot`, `source`, `fineli_id`, `grams`, `unit_code`, `recipe_id`, `servings`, `is_estimate`, `photo_batch_id`. `recipe_id` sallitaan vain, jos resepti on luettavissa (oma suunnitelma). | – |
| `subscriptions` | R | `user_id = auth.uid()` | – |
| `revenuecat_events` | – | Vain backend | – |
| `recipes`, `recipe_ingredients` | R | Resepti on jonkin oman `meal_plan_items`- tai `meal_plan_alternatives`-rivin kohteena (EXISTS-alikysely `meal_plans.user_id = auth.uid()`). Estää koko reseptikannan lataamisen maksumuurin ohi. Kirjasto haetaan `list-recipes`-funktiolla. | – |
| `meal_plan_alternatives` | R | Emo-`meal_plans` on oma | – |
| `recipe_images` | R | `status = 'ready'` | – |
| `meal_plans` | R | `user_id = auth.uid()` | – |
| `meal_plan_items` | R | Emo-`meal_plans` on oma. Tuplaus muutetaan Edge Functionin kautta, ei suoraan. | – |
| `shopping_list_items` | R, U | Emo-`meal_plans` on oma. U rajataan sarakkeisiin: `GRANT UPDATE (checked, checked_at)` – RLS ei yksin rajaa sarakkeita. | – |
| `recipe_feedback` | R, I, U, D | `user_id = auth.uid()` | – |
| `generation_runs`, `app_config` | – | Vain backend. Sovellus saa jäljellä olevat vaihdot ja rajat Edge Functionin vastauksessa. | – |

Huomioita:

- **`profiles.insert`** tehdään `auth.users`-triggerillä (`security definer`), ei sovelluksesta.
- **`profiles.update`**: sovellus ei saa muuttaa `id`:tä. Toteutetaan sarakekohtaisella `GRANT UPDATE (display_name, household_size, weekly_budget_cents, chain_code, last_meal_count, last_budget_cents, last_eaters, last_craving_codes, health_data_consent_at, onboarding_completed_at, locale)`.
- **Suostumuksen peruminen** (`health_data_consent_at` → NULL) poistaa `profile_allergens`-, `profile_diets`-, `profile_nutrition_goals`- ja `diary_entries`-rivit triggerillä. Sovellus kertoo tämän ennen vahvistusta.
- **Suunnitelman hyväksyntä ja vaihdot** tehdään Edge Functioneilla (`accept-plan`, `swap-meal`, `recalculate-plan`); sovellus ei kirjoita `meal_plans`-tauluun.
- **Maksumuuria ei toteuteta RLS:llä.** Edge Functionit tarkistavat `subscriptions`-tilan ennen generointia. Vanhentuneen tilauksen käyttäjä näkee yhä aiemmat listansa (lukuoikeus säilyy), mutta ei saa uusia.
- **Tilin poisto** tehdään Edge Functionilla (`auth.admin.deleteUser`), joka kaskadoi kaiken yllä kuvatun.

## Storage

| Bucket | Näkyvyys | Kirjoitus | Perustelu |
|---|---|---|---|
| `recipe-images` | Julkinen luku | Vain backend | Kuvat eivät ole arkaluonteisia, polut ovat UUID:itä ja julkinen bucket mahdollistaa CDN-välimuistin. |
| `store-logos` | Julkinen luku | Vain backend | |

## Indeksit (keskeisimmät)

- `meal_plans (user_id, created_at DESC)` – nykyinen ja aiemmat suunnitelmat
- `meal_plans (user_id, start_date)` – päivänäkymä päivämäärän mukaan
- `meal_plan_items (meal_plan_id)`, `meal_plan_items (recipe_id)` – RLS:n EXISTS-alikysely
- `shopping_list_items (meal_plan_id)`
- `recipes USING GIN (allergen_codes)`, `GIN (may_contain_codes)`, `GIN (ingredient_tags)` – uudelleenkäytön suodatus (`NOT (allergen_codes && :user_allergens)`)
- `recipes (base_cost_per_serving_cents) WHERE status = 'active'`
- `recipe_images (status) WHERE status IN ('queued', 'generating')` – kuvajono
- `generation_runs (user_id, kind, created_at DESC)` – vaihto- ja suunnitelmarajat, kustannukset per käyttäjä
- `ingredients (fineli_id)`, `recipe_ingredients (ingredient_id)`
- `diary_entries (user_id, entry_date)` – päivänäkymä ja summat
- `diary_entries (user_id, created_at DESC) WHERE fineli_id IS NOT NULL` – viimeksi käytetyt
- `fineli_foods USING GIN (coalesce(display_name_fi, name_fi) gin_trgm_ops) WHERE is_searchable` – ruokahaku (`pg_trgm`, kestää kirjoitusvirheitä ja osasanoja)
- `recipes (cook_time_min, kcal_per_serving) WHERE status = 'active'` – kirjaston suodattimet
- `meal_plans (user_id, status, accepted_at DESC)` – Kodin nykyinen suunnitelma ja säästöt

## Generoinnin tietovirta tauluihin

1. Lue kyselyn vastaukset sekä `profiles`, `profile_allergens`, `profile_diets`, `profile_excluded_ingredients`, `profile_pantry_items`, `subscriptions`. Säännöt = profiilin allergiat ja ruokavaliot ∪ kyselyssä lisätyt.
2. Tarkista rajat (`app_config`, `generation_runs`) ja luo `meal_plans`-rivi tilassa `generating` (`kind`, `meal_count`, `household_size`, `budget_cents`, `chain_code`, `craving_codes`, `extra_*`). Päivitä profiilin `last_*`-esitäyttökentät.
3. **Uudelleenkäyttö:** hae `active`-reseptit, jotka läpäisevät esisuodattimen (allergeenit, tagit, poissuljetut ainesosat, hinta). Täytä niillä osa päivistä.
4. **Generointi:** anna tekoälylle aktiivisten ainesosien `slug`-lista (jo valmiiksi suodatettuna käyttäjälle sopiviin) ja pyydä puuttuvat päivät. Validoi Zodilla.
5. **Tarkistus** (koodissa, jokaiselle reseptille, myös uudelleenkäytetyille): tuntemattomat slugit → hylkäys; `ingredient_allergens` + `allergen_keywords` vapaasta tekstistä → hylkäys; `diet_excluded_tags` → hylkäys.
6. Laske makrot (`fineli_foods`) ja hinnat (`ingredients` + `ingredient_chain_prices` + `store_chains`), tallenna uudet `recipes` + `recipe_ingredients`.
7. Muodosta `shopping_list_items` (tuplaukset mukaan, perusvarat pois), vertaa summaa budjettiin; ylityksessä vaihda kalleimpia (palaa kohtaan 3/4). Tarkempi kulku: [GENERATION.md](GENERATION.md).
8. Tallenna `meal_plan_items` ja `meal_plan_alternatives`, aseta `meal_plans.status = 'proposed'`, kirjaa `generation_runs`.
9. Lisää puuttuvat kuvat `recipe_images`-jonoon (tai liitä olemassa oleva `dish_signature`-osuman perusteella).
10. Ehdotusnäkymässä vaihdot ja tuplaukset päivittävät rivit ja summat (`swap-meal`, `recalculate-plan`). "Hyväksy" (`accept-plan`) asettaa `status = 'accepted'`, `accepted_at` ja poistaa vaihtoehtorivit.

## Päätökset

1. **Yksi moottori, kaksi tilaa, yksi kysely:** "N päivällistä + budjetti → yksi ostoslista". Kysely kulkee budjetti → syöjät (1–6) → ateriamäärä → allergiat ja ruokavalio → toiveet → kauppa. "Koko viikko" (N = 7) on viikkosuunnitelma, N = 2–6 kauppareissu. Budjetti kattaa vain sovelluksen ehdottamat ateriat. Suunnitelma on ensin ehdotus (`proposed`) ja hyväksytään erikseen (`accepted`).
2. **Ateriat:** MVP:ssä vain päivälliset. "Tee tuplana → huomisen lounas" tuplaa annokset ja lisää lounasrivin seuraavalle päivälle (`cook_double`, `leftover_from_item_id`). Tuplaus on mahdollinen kaikille päivällisille, myös viimeiselle.
3. **Perusvarat:** käyttäjäkohtainen `profile_pantry_items`, oletuksena öljy, suola, pippuri, sokeri, vehnäjauho ja peruskuivamausteet. Ne eivät tule ostoslistaan eivätkä budjettiin, ja reseptissä ne merkitään "kotoa". Muut mausteet lasketaan kokonaisina pakkauksina.
4. **Ruokavaliot:** `vegan`, `vegetarian`, `pescatarian`, `lactose_free`, `pork_free`, `alcohol_free`. Halal ja kosher eivät ole MVP:ssä.
5. **Rajat ja malli konfiguroitavina** (`app_config`, vain ylläpito): generointimalli (oletus Sonnet 5.5), kuvantunnistusmalli (oletus Haiku 5.5), vaihtoraja (5 / 7 päivää), suunnitelmaraja (4 / 7 päivää), kuvantunnistusrajat (10 / päivä, 150 / 30 päivää) ja käyttäjän kustannuskatto (1,50 $ / 30 päivää).
6. **Syöjiä 1–6** (`household_size` profiilissa oletuksena, suunnitelmassa snapshotina).
7. **Kyselyssä lisätyt allergiat ja ruokavaliot** koskevat vain sitä suunnitelmaa (`extra_*`). Profiilin allergioita ei voi poistaa kyselyssä.
8. **Päiväkirja** viittaa Fineliin tai reseptiin; makrot laskee triggeri. Ruokakuvaa ei tallenneta. Päiväkirja ja ravintotavoitteet ovat terveystietoa samalla suostumuksella kuin allergiat.
9. **Reseptikirjasto** haetaan Edge Functionilla, joka ajaa allergiatarkistuksen jokaiselle reseptille; RLS ei avaa koko reseptikantaa.

## Avoimet kysymykset

1. **Kotitalouden jakaminen** (vaihe 3) vaatii myöhemmin `households`-taulun ja `meal_plans.user_id` → `household_id`. Malli on tehty niin, että muutos on yksi migraatio.
2. **Hintojen korjausehdotukset** (vaihe 2): uusi taulu `price_reports` (käyttäjä, ainesosa, ketju, havaittu hinta).
3. **Omat ruoat ja viivakoodit päiväkirjaan** (vaihe 3): uusi taulu `user_foods` (nimi, makrot per 100 g) tai avoimen viivakooditietokannan linkitys. Omat ruoat rikkoisivat periaatteen "makrot Finelistä", joten ne merkitään UI:ssa käyttäjän syöttämiksi.
