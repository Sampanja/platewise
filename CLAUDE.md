# Platewise

Maksullinen mobiilisovellus (iOS + Android) pienille talouksille: pääkohderyhmä on yksin tai kaksin asuvat, mutta suunnitelman voi tehdä 1–6 syöjälle. Käyttäjä antaa lähikaupan, allergiat ja ruokavalion. Tekoäly generoi päivälliset, joissa on ainesosat, makrot, hinta-arvio ja kuva, sekä niistä yhden ostoslistan. Lisäksi sovelluksessa on kalorilaskuri (päiväkirja), johon ruoan voi lisätä kuvasta, nimihaulla tai omalta listalta. Tärkein laatuvaatimus on selkeys ja helppokäyttöisyys.

Alapalkissa on viisi välilehteä: Koti, Reseptit, Suunnittele (keskellä, korostettu), Päiväkirja ja Profiili. Suunnittele on kysely (budjetti → syöjät 1–6 → ateriamäärä 2–7 → allergiat ja ruokavalio → toiveet → kauppa), jonka tuloksena syntyy ehdotus. Ehdotus hyväksytään erikseen, ja siitä tulee ostoslista. Moottori on yksi, **N päivällistä + budjetti → yksi ostoslista**:

- **Viikkosuunnitelma:** "Koko viikko" eli N = 7 ja profiilin viikkobudjetti esitäytettynä.
- **Kauppareissu:** 2–6 ateriaa ja budjetti yhdelle ostoskerralle.

Budjetti kattaa vain sovelluksen ehdottamat ateriat. MVP:ssä generoidaan vain päivällisiä; lounas syntyy tuplaamalla päivällinen. Generointimalli ja rajat ovat ylläpidon asetuksia (`app_config`), eivät käyttäjän valintoja. Tarkemmin: [docs/GENERATION.md](docs/GENERATION.md) ja [docs/DATA_MODEL.md](docs/DATA_MODEL.md).

Koko suunnitelma, vaiheet ja riskit: [docs/PLAN.md](docs/PLAN.md). Nykyinen vaihe: **MVP (vaihe 1), käyttöliittymä testidatalla** (ei vielä Supabasea eikä tekoälyä). Poikkeus: viivakoodihaku toimii oikeasti Open Food Factsin kautta. Tekoälyä vaativat toiminnot (kuvantunnistus, ravintoarvotaulukko, chat) ovat palvelukerroksen takana (`src/services/*`), jotta oikean toteutuksen voi kytkeä muuttamatta näkymiä. Kaikki näkymät käyttävät Iltapöytä-design-järjestelmää (Paprika-paletti, vaalea ja tumma teema). Hahmo Nuppu ja sen tiedostot: [docs/MASCOT.md](docs/MASCOT.md).

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
3. **Hinta on arvio.** Hinta lasketaan omasta hintataulusta ja kaupan ketjukerroimesta. UI:ssa sana on aina "hinta-arvio".
4. **Sääntöpohjainen allergiatarkistus.** Jokainen resepti tarkistetaan koodissa käyttäjän allergioita ja ruokavaliota vasten ennen tallennusta tai näyttämistä. Hylätty resepti generoidaan uudelleen. Tarkistusta ei korvata promptilla, ja sillä on kattavat yksikkötestit.
5. **API-avaimet vain backendissä.** Claude-, kuvamalli- ja muut salaiset avaimet ovat vain Edge Functionien ympäristömuuttujissa. Mobiilisovelluksessa on ainoastaan Supabasen julkinen anon-avain. Kaikki tekoälykutsut kulkevat backendin kautta.
6. **Uudelleenkäyttö ennen generointia.** Reseptit ja kuvat tallennetaan, ja olemassa olevaa yhteensopivaa reseptiä käytetään ennen uuden generointia.

## Koodauskäytännöt

- TypeScript strict-tilassa kaikkialla, ei `any`-tyyppiä ilman perusteltua kommenttia.
- Tekoälyn JSON-vastaukset validoidaan skeemalla (esim. Zod) ennen käyttöä.
- Tietokantamuutokset tehdään vain Supabase-migraatioina. RLS on päällä jokaisessa käyttäjädataa sisältävässä taulussa.
- Koodi, tunnisteet ja commit-viestit englanniksi. Käyttäjälle näkyvät tekstit suomeksi lokalisointitiedostoissa, ei kovakoodattuina.
- UI: pieni määrä uudelleenkäytettäviä komponentteja, yksi pääkehotus per näkymä, dynaaminen tekstikoko ja riittävät kontrastit.
- Värit vain teematokeneista (`colors`, ei kovakoodattuja hex-arvoja näkymissä) ja tyylit `themedStyles(() => StyleSheet.create(…))` -muodossa, jotta vaalea ja tumma teema toimivat. Uusien tekstitokenien on läpäistävä `theme/contrast.test.ts` (WCAG AA).
- Zustand-valitsin ei saa palauttaa uutta taulukkoa tai oliota (`s.entries.filter(…)`), koska se aiheuttaa ikuisen päivityssilmukan. Valitse vakaa arvo ja johda `useMemo`lla.
- Liiketoimintalogiikalle (allergiatarkistus, makro- ja hintalaskenta, budjetti) yksikkötestit ennen kuin ominaisuus on valmis.
- Allergia- ja ruokavaliotiedot, kaloritavoitteet, kehon tiedot (pituus, ikä, paino, raskaus/imetys), painotavoite ja painokirjaukset, päiväkirja, omat ruoat, ateriat ja reseptit sekä chat-viestit käsitellään terveystietoina: ei lokeihin eikä analytiikkaan.
- Kalorilaskimen turvarajat (1 200 / 1 500 kcal, vaje ≤ 25 %, ei vajetta alle 18-vuotiaille, raskaana oleville tai imettäville, ei alipainotavoitetta) ovat koodissa (`domain/energy.ts`) ja yksikkötestattuja; niitä ei poisteta eikä siirretä pelkkään käyttöliittymään. Ne koskevat myös rekompositiota, kalorien jaksotusta ja mukautuvaa kulutusarviota.
- Pelillistäminen palkitsee vain tavoista (kirjaaminen, kokkaaminen, vesi, budjetti, uudet reseptit, proteiinitavoite), ei koskaan vähemmästä syömisestä, vajeesta tai laihtumisesta, eikä siinä ole rangaistuksia (`domain/gamification.ts`, testattu).
- Chatin turvallisuus on sääntöpohjainen ennen ja jälkeen mallin (`domain/assistantRules.ts`): ei diagnooseja, ohjaus ammattilaiselle, syömishäiriöherkkyys, ei neuvoja alle turvarajojen. Päivän tiedot välitetään vain käyttäjän luvalla.
