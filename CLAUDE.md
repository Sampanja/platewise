# PlatePal

Lue docs/PROGRESS.md jokaisen keskustelun alussa ja päivitä se ennen jokaista committia (mitä tehtiin, mikä on kesken, seuraava askel).

Maksullinen mobiilisovellus (iOS + Android), **yksilösovellus**: profiili, tavoitteet ja päiväkirja ovat yhden ihmisen. Kotitalouden kokoa ei ole; syöjien määrä (1–6, oletus 1) valitaan vain ruokalistakyselyssä suunnitelmakohtaisesti. Käyttäjä antaa allergiat ja ruokavalion; hinta-alue (maa) tulee puhelimen alueasetuksesta. Kielet ovat suomi, englanti ja ruotsi (ensikäynnistyksen ensimmäinen näkymä on kielen valinta), ja mittayksiköt metriset tai imperiaaliset. Tekoäly generoi päivälliset, joissa on ainesosat, makrot, hinta-arvio ja kuva, sekä niistä yhden ostoslistan. Lisäksi sovelluksessa on reseptikirjasto (aamiaiset, lounaat, päivälliset, välipalat), kalorilaskuri (päiväkirja), johon ruoan voi lisätä kuvasta, puhumalla, kirjoittamalla, viivakoodilla, nimihaulla tai omalta listalta, ravintoaineet (NNR2023) ja laatuarvio A–E, viikko- ja kuukausiraportit, Ruokavarasto ("mitä voin tehdä kotona olevista aineksista"), reseptin tuonti linkistä, Android-kotinäytön widget sekä henkilökohtainen vesitavoite. Tärkein laatuvaatimus on selkeys ja helppokäyttöisyys.

Alapalkissa on neljä välilehteä ja keskellä ＋: Koti, Reseptit (Kirjasto | Varastosta | Suosikit | Omat), ＋, Päiväkirja (Tänään | Raportit) ja Profiili. ＋ avaa pikatoimintopaneelin (`features/quick/QuickActions.tsx`): kirjaa ateria (Kuva, Puhu, Kirjoita, Viivakoodi, Hae), skannaa jääkaappi, tee ruokalista, lisää paino. Jokaisella ominaisuudella on yksi looginen paikka ([PLAN.md 4.1](docs/PLAN.md)). Ruokalista (`/plan`) on kysely (budjetti → syöjät 1–6 → ateriamäärä 2–7 → allergiat ja ruokavalio → toiveet), jonka tuloksena syntyy ehdotus. Ehdotus hyväksytään erikseen, ja siitä tulee ostoslista. Moottori on yksi, **N päivällistä + budjetti → yksi ostoslista**:

- **Viikkosuunnitelma:** "Koko viikko" eli N = 7 ja profiilin viikkobudjetti esitäytettynä.
- **Kauppareissu:** 2–6 ateriaa ja budjetti yhdelle ostoskerralle.

Budjetti kattaa vain sovelluksen ehdottamat ateriat. MVP:ssä generoidaan vain päivällisiä; lounas syntyy tuplaamalla päivällinen. Generointimalli ja rajat ovat ylläpidon asetuksia (`app_config`), eivät käyttäjän valintoja. Tarkemmin: [docs/GENERATION.md](docs/GENERATION.md) ja [docs/DATA_MODEL.md](docs/DATA_MODEL.md).

Koko suunnitelma, vaiheet ja riskit: [docs/PLAN.md](docs/PLAN.md). Nykyinen vaihe: **MVP (vaihe 1), käyttöliittymä testidatalla** (ei vielä Supabasea eikä tekoälyä). Poikkeus: viivakoodihaku toimii oikeasti Open Food Factsin kautta. Kuvantunnistus on testitilassa, ja käyttöliittymä kertoo sen ("Testitila – oikea tunnistus tulossa"). Tekoälyä vaativat toiminnot (kuvantunnistus, ravintoarvotaulukko, chat, jääkaappiskannaus `pantryRecognition`, tekstin tulkinta `foodTextParser`, reseptin luonti `recipeGeneration`, reseptituonti `recipeImport`, raporttien oivallukset `insights`) ovat palvelukerroksen takana (`src/services/*`), jotta oikean toteutuksen voi kytkeä muuttamatta näkymiä. Kaikki näkymät käyttävät Iltapöytä-design-järjestelmää. Käyttäjä valitsee yhden kuudesta hahmosta (Nuppu, Avo, Tomo, Karo, Lemo, Blu), joka määrää koko sovelluksen väriteeman (vaalea ja tumma), äänen ja ulkonäön. Hahmot, teemat ja kuvatiedostot: [docs/MASCOT.md](docs/MASCOT.md).

Reseptit (testikirjasto 319 kpl, rakenne `src/data/catalog/recipes*.ts`, tekstit kielittäin `src/data/catalog/text/<kieli>/`) viittaavat vain ainesosatauluun, joka on rakennettu Finelin avoimesta datasta (`scripts/fineli`). Makrot, kalorit, allergeenit, ruokavaliosopivuus ja hinta **lasketaan** ainesosista, eikä niitä kirjoiteta käsin. Uusi resepti- tai ainesosaerä ajetaan validointitestien läpi (`catalog.test.ts`, `fineli.test.ts`). Sopimattomia reseptejä ei näytetä missään: ainoa portti on `isRecipeAllowed`, ja sitä käytetään kaikkialla (kirjasto, haku, suositukset, Koti, ruokalista, vaihdot, Varastosta-ehdotukset, varastoresepti, päiväkirja, chat). Poikkeus: käyttäjän itse tuomat reseptit näytetään, mutta niissä on selvä allergeenivaroitus (`importWarnings`). Hivenaineet tulevat Finelistä (`scripts/fineli`, myös päiväkirjan testiruoille `match-foods.mjs`), laatuarvio lasketaan koodissa ([docs/QUALITY_SCORE.md](docs/QUALITY_SCORE.md)).

## Teknologiat

- **Mobiili:** React Native + Expo (TypeScript), Expo Router, TanStack Query, Zustand
- **Backend:** Supabase (Postgres, Auth, Storage, Edge Functions), EU-alue
- **Tekoäly:** Claude API reseptien generointiin (rakenteinen JSON-tuloste), erillinen kuvamalli annoskuville
- **Ravintoarvot:** Fineli (THL) tuotuna omaan tauluun
- **Maksut:** RevenueCat (App Store / Google Play -tilaukset)
- **Seuranta:** PostHog (EU), Sentry

## Arkkitehtuurin pääperiaatteet

Näistä ei poiketa ilman erillistä päätöstä:

1. **Suljettu ainesosalista.** Tekoäly saa käyttää vain omassa ainesosataulussa olevia ainesosia (viitataan ID:llä). Jokaisella ainesosalla on hinta ja Fineli-linkitys. Tuntematon ainesosa tarkoittaa, että generointi hylätään.
2. **Makrot Finelistä.** Tekoäly antaa vain ainesosat ja grammamäärät. Backend laskee makrot deterministisesti Fineli-datasta. Tekoälyn ilmoittamia ravintoarvoja ei koskaan näytetä käyttäjälle. Sama pätee päiväkirjan kuvantunnistukseen: malli valitsee ruoat Fineli-listasta ja arvioi grammat, ja tulos näytetään merkinnällä "arvio".
3. **Hinta on arvio, ei kauppakohtainen.** Hinta on ainesosan keskihinta hinta-alueella (maa → valuutta + hintataso, `domain/priceRegion.ts`). Suomi on oikeaa hintatietoa; muut maat lasketaan Suomen hinnoista kertoimella ja merkitään karkeaksi arvioksi. UI:ssa sana on aina "hinta-arvio". Kauppoja, ketjuja tai kauppavertailua ei ole.
4. **Sääntöpohjainen allergiatarkistus.** Jokainen resepti tarkistetaan koodissa käyttäjän allergioita ja ruokavaliota vasten ennen tallennusta tai näyttämistä. Hylätty resepti generoidaan uudelleen. Tarkistusta ei korvata promptilla, ja sillä on kattavat yksikkötestit.
5. **API-avaimet vain backendissä.** Claude-, kuvamalli- ja muut salaiset avaimet ovat vain Edge Functionien ympäristömuuttujissa. Mobiilisovelluksessa on ainoastaan Supabasen julkinen anon-avain. Kaikki tekoälykutsut kulkevat backendin kautta.
6. **Uudelleenkäyttö ennen generointia.** Reseptit ja kuvat tallennetaan, ja olemassa olevaa yhteensopivaa reseptiä käytetään ennen uuden generointia.

## Koodauskäytännöt

- TypeScript strict-tilassa kaikkialla, ei `any`-tyyppiä ilman perusteltua kommenttia.
- Tekoälyn JSON-vastaukset validoidaan skeemalla (esim. Zod) ennen käyttöä.
- Tietokantamuutokset tehdään vain Supabase-migraatioina. RLS on päällä jokaisessa käyttäjädataa sisältävässä taulussa.
- Koodi, tunnisteet ja commit-viestit englanniksi. Käyttäjälle näkyvät tekstit käännöstiedostoissa, ei koskaan kovakoodattuina: käyttöliittymä `src/i18n/<kieli>*.ts` (suomi `fi.ts` on avainten lähde), hahmot `<kieli>Characters.ts`, reseptit, ainesosat ja ruoat `src/data/catalog/text/<kieli>/`. Lint-sääntö `platepal/no-untranslated-text` estää kovakoodatut tekstit, ja `keys.test.ts`, `characterVoices.test.ts` ja `text.test.ts` vaativat jokaisen avaimen, repliikin ja reseptin jokaisella kielellä. Uusi kieli = käännöstiedostot + rivi rekistereihin (`i18n/languages.ts`, `i18n/registry.ts`, `data/catalog/text/index.ts`).
- Kielen vaihto ei käynnistä sovellusta uudelleen: `strings` lukee aktiivisen kielen renderöinnin aikana, ja juurilayout remountaa näkymät. Moduulitasolla saa ottaa `const t = strings.osio`, mutta ei valmiita merkkijonoja (`format(…)`) tai taulukoita, koska ne jäisivät vanhalle kielelle. Katalogin tekstit luetaan gettereillä samoista olioista.
- Muotoilu aina apufunktioilla (`formatMoney`, `formatDecimal`, `lib/dates.ts`, `lib/amounts.ts`), ei `toFixed`/`'fi-FI'`-kovakoodausta. Hermes tuntee vain oikeat lokaalit (`intlLocale`), ja valuutan lyhyt symboli korvaa ISO-koodin. Määrät, paino, pituus ja vesi tallennetaan metrisinä ja näytetään käyttäjän yksiköillä.
- Allergeenien avainsanatarkistus lukee reseptin suomenkielisen lähdetekstin (`sourceText`); käännökset tarkistetaan oman kielensä sanoilla (`text/allergenKeywords.ts`). Chatin turvaluokitus kattaa kaikki kielet riippumatta käyttöliittymän kielestä.
- UI: pieni määrä uudelleenkäytettäviä komponentteja, yksi pääkehotus per näkymä, dynaaminen tekstikoko ja riittävät kontrastit.
- Värit vain teematokeneista (`colors`, ei kovakoodattuja hex-arvoja näkymissä) ja tyylit `themedStyles(() => StyleSheet.create(…))` -muodossa, jotta vaalea ja tumma teema toimivat. Uusien tekstitokenien on läpäistävä `theme/contrast.test.ts` (WCAG AA).
- Zustand-valitsin ei saa palauttaa uutta taulukkoa tai oliota (`s.entries.filter(…)`), koska se aiheuttaa ikuisen päivityssilmukan. Valitse vakaa arvo ja johda `useMemo`lla.
- Suorituskyky (napautuksen palaute alle 100 ms, [PLAN.md 4.12](docs/PLAN.md)): tarkat selektorit (`useShallow`), ei koko storea; ei staattista dataa (reseptit, ainesosat) persistiin, ja kirjoitukset ryhmitellään; raskas johdettu data `useMemo`lla tai olioidentiteettiin perustuvalla välimuistilla; pitkät listat virtualisoituna (`FlatList`, vakaa `renderItem`, `React.memo`-rivit), ei `.map()`-renderöintiä ScrollViewissä; käyttöliittymä päivitetään ennen hidasta työtä. Mittaa ennen ja jälkeen.
- Liiketoimintalogiikalle (allergiatarkistus, makro- ja hintalaskenta, budjetti) yksikkötestit ennen kuin ominaisuus on valmis.
- Allergia- ja ruokavaliotiedot, kaloritavoitteet, kehon tiedot (pituus, ikä, paino, raskaus/imetys), painotavoite ja painokirjaukset, päiväkirja, omat ruoat, ateriat ja reseptit sekä chat-viestit käsitellään terveystietoina: ei lokeihin eikä analytiikkaan.
- Kalorilaskimen turvarajat (1 200 / 1 500 kcal, vaje ≤ 25 %, ei vajetta alle 18-vuotiaille, raskaana oleville tai imettäville, ei alipainotavoitetta) ovat koodissa (`domain/energy.ts`) ja yksikkötestattuja; niitä ei poisteta eikä siirretä pelkkään käyttöliittymään. Ne koskevat myös rekompositiota, kalorien jaksotusta ja mukautuvaa kulutusarviota.
- Allergeenien avainsanalistoissa on myös taivutusvartalot (maido-, pähkinö-, rukii-): suomen astevaihtelu muuttaa sanan alkua. Uusi sana testataan `recipes.test.ts`:ssä.
- Raporttien ja hahmon yhteenvedot puhuvat vain tavoista (`services/insights.ts`, testi kieltää kalori-, paino- ja laihdutussanat). Laatuarvio ei käytä punaista eikä arvostele.
- Widgetin tilannekuva (`features/widget/snapshot.ts`) sisältää valmiit tekstit aktiivisella kielellä; widget ei lue storeja. Hahmojen widget-SVG:t generoidaan `scripts/widget/generate-mascots.gen.tsx`:llä, kun `CharacterSvg.tsx` muuttuu.
- Vesitavoite lasketaan koodissa (`domain/hydration.ts`, testattu): enintään 4 l, eikä yli tavoitteen juomisesta palkita.
- Pelillistäminen palkitsee vain tavoista (kirjaaminen, kokkaaminen, vesi, budjetti, uudet reseptit, proteiinitavoite), ei koskaan vähemmästä syömisestä, vajeesta tai laihtumisesta, eikä siinä ole rangaistuksia (`domain/gamification.ts`, testattu).
- Chatin turvallisuus on sääntöpohjainen ennen ja jälkeen mallin (`domain/assistantRules.ts`): ei diagnooseja, ohjaus ammattilaiselle, syömishäiriöherkkyys, ei neuvoja alle turvarajojen. Päivän tiedot välitetään vain käyttäjän luvalla.
