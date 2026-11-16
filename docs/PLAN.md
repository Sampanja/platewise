# PlatePal – suunnitelma

Maksullinen mobiilisovellus (iOS + Android), yksilösovellus: profiili, tavoitteet ja päiväkirja ovat yhden ihmisen. Suunnitelman voi tehdä 1–6 syöjälle (oletus 1), ja määrä valitaan vain kyselyssä. Käyttäjä syöttää budjetin, allergiat ja ruokavalion. Tekoäly generoi annoksia, joissa on ainesosat, makrot, hinta-arvio ja kuva ruoasta. Lisäksi sovelluksessa on kalorilaskuri (päiväkirja). Sovelluksen pitää olla todella selkeä ja helppokäyttöinen.

Suunnittelussa on yksi moottori: **N päivällistä + budjetti → yksi ostoslista**. Käyttäjä käy sen läpi yhdellä kyselyllä (Suunnittele-välilehti, kohta 4.3). Kyselyn ateriamäärä ratkaisee tilan:

- **Viikkosuunnitelma:** "Koko viikko" eli N = 7. Budjetiksi esitäytetään profiilin viikkobudjetti.
- **Kauppareissu:** käyttäjä valitsee 2–6 ateriaa ja budjetin yhdelle ostoskerralle.

Budjetti kattaa vain sovelluksen ehdottamat ateriat, ei käyttäjän kaikkia ruokaostoksia. Tämä kerrotaan käyttöliittymässä selvästi.

## 1. Kolme asiaa, jotka kannattaa ratkaista ennen koodia

1. **Hinnat.** Ruokakaupoilla ei ole avointa hinta-APIa, ja hintojen raapiminen rikkoo käyttöehtoja ja hajoaa helposti. Siksi sovellus ei ole kauppakohtainen: hinta lasketaan omasta hintataulukosta, jossa on noin 300–500 yleisintä ainesosaa Suomen keskihintoina. Hinta-alue (maa → valuutta ja hintataso) valitaan puhelimen alueasetuksesta, ja sen voi vaihtaa Profiilissa. Suomi on oikeaa hintatietoa; muille tuetuille maille hinta lasketaan karkealla hintatasokertoimella, ja se merkitään käyttöliittymässä selvästi arvioksi. Sovelluksessa luvun nimi on aina "hinta-arvio". Myöhemmin maakohtaista hintatietoa voi lisätä (`ingredient_region_prices`) tai käyttää kuittien skannausta.
2. **Makroja ei anneta tekoälyn laskea.** Kielimallit arvioivat ravintoarvot epätarkasti. Tekoäly tuottaa ainesosat ja grammamäärät, ja backend laskee makrot **Fineli-tietokannasta** (THL:n avoin elintarvikkeiden koostumustietokanta). Sama pätee päiväkirjan kuvantunnistukseen: tekoäly tunnistaa ruoat ja arvioi grammat, makrot tulevat Finelistä.
3. **Allergiat ovat turvallisuuskysymys.** Tekoälyn tuottama resepti tarkistetaan aina erikseen säännöillä: jokainen ainesosa verrataan allergeenilistaan ja kielletyt sanat (esim. pähkinä, maapähkinä, cashew) estetään. Jos resepti ei läpäise tarkistusta, se generoidaan uudelleen. Sovellukseen tarvitaan lisäksi selkeä vastuuvapauslauseke. GDPR:n kannalta allergia- ja ruokavaliotiedot, kaloritavoitteet, kehon tiedot (pituus, ikä, paino), painotavoite ja -kirjaukset sekä ruokapäiväkirja voivat olla terveystietoja, joten niiden tallennus ja suostumus on suunniteltava huolella.

## 2. Teknologiat

| Osa-alue | Valinta | Perustelu |
|---|---|---|
| Mobiili | **React Native + Expo** (TypeScript) | Sama koodi iOSille ja Androidille. EAS Build ja Submit hoitavat kauppajulkaisut, ja päivitykset voi viedä over-the-air. Sama kieli käy backendissä. |
| UI | Expo Router ja oma pieni komponenttikirjasto ("Iltapöytä"-design-järjestelmä) | Kun komponentteja ja näkymiä on vähän, sovellus pysyy selkeänä. |
| Tila ja data | TanStack Query ja Zustand | Välimuisti, offline-luku ja yksinkertainen tilanhallinta. |
| Backend | **Supabase** (Postgres, Auth, Storage, Edge Functions) | Yksi palvelu kattaa tietokannan, kirjautumisen ja kuvat. Data EU-alueelle. Käyttäjäkohtaiset tietoturvasäännöt (RLS) valmiina. |
| Tekoäly, reseptit | **Claude API**, oletuksena Sonnet 5.5 (vaihdettavissa asetuksesta, Opus 5.5 vertailukohtana testiaineistolla), rakenteinen JSON-tuloste | Luotettava rakenteinen tuloste ja hyvä suomen kieli. Kutsut aina backendistä, joten API-avain ei päädy sovellukseen. |
| Tekoäly, ruokakuvan tunnistus | **Claude API** kuvasyötteellä, oletuksena Haiku 5.5 (vaihdettavissa asetuksesta, Sonnet 5.5 vertailukohtana) | Halpa ja nopea. Malli valitsee ruoat suljetusta Fineli-listasta ja arvioi grammat; makrot lasketaan Finelistä. Kustannusraja: [GENERATION.md, kohta 11](GENERATION.md#11-ruokakuvan-tunnistus-päiväkirja). |
| Tekoäly, kuvat | Erillinen kuvageneraatiomalli (esim. Flux palvelun fal.ai tai Replicate kautta, tai OpenAI:n kuvamalli) | Claude ei tuota kuvia. Kuvat tallennetaan välimuistiin ja niitä käytetään uudelleen samankaltaisille annoksille. |
| Ravintoarvot | Fineli-data tuotuna omaan Postgres-tauluun | Ilmainen ja luotettava. Päiväkirjan ruokahaku käyttää samaa taulua. Lähde mainitaan sovelluksessa (CC BY 4.0). |
| Viivakoodit | **Open Food Facts** (avoin API, ODbL) ja `expo-camera` | Ainoa toiminto, joka toimii oikeasti jo käyttöliittymävaiheessa. Tuotteet välimuistiin laitteelle; lähdemaininta Lähteet-sivulla. |
| Paikallisilmoitukset | `expo-notifications` | Ateriamuistutukset ilman palvelinta tai push-tokenia. |
| Maksut | **RevenueCat** sekä App Storen ja Google Playn sovelluksen sisäiset ostot | Kaupat vaativat sisäiset ostot digitaalisiin tilauksiin. |
| Taustatyöt | Supabase Edge Functions ja jono (pg-boss tai Supabasen Queues) | Kuvien generointi asynkronisesti. |
| Analytiikka ja virheet | PostHog (EU) ja Sentry | Käyttöpolkujen mittaus ja kaatumisraportit. Ei terveystietoja. |

## 3. Arkkitehtuuri

```
┌──────────────────────────────────────┐
│  Mobiilisovellus (Expo)              │
│  Koti · Reseptit · Suunnittele ·     │
│  Päiväkirja · Profiili               │
└────────────┬─────────────────────────┘
             │ HTTPS (Supabase Auth JWT)
┌────────────▼──────────────────────────────────────────┐
│  Supabase                                             │
│  ┌────────────────┐   ┌─────────────────────────────┐ │
│  │ Postgres       │   │ Edge Functions              │ │
│  │ - profiles     │◄──┤ generate-plan:              │ │
│  │ - meal_plans   │   │  1. kyselyn vastaukset      │ │
│  │ - recipes      │   │  2. Claude → JSON-resepti   │ │
│  │ - ingredients  │   │  3. allergiatarkistus       │ │
│  │ - fineli_foods │   │  4. makrot Finelistä        │ │
│  │ - price_regions│   │  5. hinta hintataulukosta   │ │
│  │ - diary_entries│   │  6. budjetin tarkistus      │ │
│  └────────────────┘   │  7. kuva jonoon             │ │
│  ┌────────────────┐   │ list-recipes (kirjasto)     │ │
│  │ Storage (kuvat)│◄──┤ recognize-food-photo        │ │
│  └────────────────┘   │ image-worker → kuvamalli    │ │
│                       └─────────────────────────────┘ │
└───────────────────────────────────────────────────────┘
             │
   RevenueCat (webhook → tilaustila Postgresiin)
```

**Generoinnin periaatteet:**
- Tekoäly valitsee ainesosat **suljetusta ainesosalistasta**, eli omasta hinta- ja Fineli-taulusta. Jokaiselle ainesosalle löytyy siis sekä hinta että ravintoarvot. Tämä on arkkitehtuurin tärkein yksittäinen päätös.
- Jos budjetti ylittyy, backend pyytää tekoälyä vaihtamaan kalleimmat ainesosat.
- Reseptit tallennetaan ja niitä käytetään uudelleen muilla käyttäjillä, joilla on yhteensopiva profiili. Tekoälykustannukset laskevat ja vastaukset nopeutuvat. Samat reseptit muodostavat Reseptit-välilehden kirjaston.
- Syöjiä on 1–6. Reseptin määrät ovat yhdelle annokselle ja skaalautuvat syöjien määrällä. Ostoslista optimoi ainesosien käytön koko suunnitelman ajalle (esim. puolikas kaalinpää kahteen ruokaan).
- Yksi generointimoottori: "N päivällistä + budjetti → yksi ostoslista". Viikkosuunnitelma ja kauppareissu eroavat vain esiasetuksiltaan.
- Kyselyn "mitä tekee mieli" -valinnat ovat toiveita, eivät ehtoja: malli ja uudelleenkäyttö suosivat niitä, mutta budjetti ja allergiat menevät aina edelle.
- MVP:ssä generoidaan vain päivällisiä. "Tee tuplana → huomisen lounas" tuplaa päivällisen annokset ja lisää lounaan seuraavalle päivälle; lounas ei maksa erikseen, koska kustannus on jo päivällisessä. Tuplaus on mahdollinen kaikille päivällisille, myös suunnitelman viimeiselle.
- Rajat (vaihdot, suunnitelmat, kuvantunnistukset) ja mallit ovat konfiguroitavia arvoja, joita voi muuttaa ilman julkaisua.
- Perusvarat (öljy, suola, pippuri, sokeri, vehnäjauho, peruskuivamausteet) oletetaan löytyvän kotoa: ne eivät tule ostoslistaan eivätkä budjettiin, ja reseptissä ne merkitään "kotoa". Käyttäjä voi muokata listaa profiilista. Muut mausteet lasketaan kokonaisina pakkauksina.
- Generoinnin ja kuvantunnistuksen tarkempi kuvaus (prompt, JSON-skeema, budjetin korjaussilmukka, allergiatarkistus, kustannusraja): [GENERATION.md](GENERATION.md).

## 4. Käyttöliittymä

Kaikki näkymät käyttävät Iltapöytä-design-järjestelmää (värit, typografia, kortit, sirut, napit). Yksi pääkehotus per näkymä, dynaaminen tekstikoko ja riittävät kontrastit. Jokaisella listalla ja datanäkymällä on suunniteltu tyhjä tila (selitys + yksi kehotus) ja latausnäkymä (luurankokortit, ei pelkkää spinneriä).

### 4.1 Navigaatio

Alapalkissa viisi välilehteä:

| Välilehti | Sisältö |
|---|---|
| **Koti** | Yleiskatsaus |
| **Reseptit** | Reseptikirjasto |
| **Suunnittele** | Kysely → ehdotukset → ostoslista. Keskellä, korostettu painike. |
| **Päiväkirja** | Kalorilaskuri |
| **Profiili** | Asetukset ja tili |

Alapalkki kelluu näytön alareunassa (leveällä näytöllä enintään 520 dp ja keskitettynä). Viisi välilehteä on jaettu tasaisesti, ikonit ja tekstit keskitetty, ja kapealla näytöllä tekstit lyhenevät. Keskimmäinen Suunnittele-painike nousee pehmeästi palkista loveen, joka piirretään SVG:llä (geometria `tabBarShape.ts`, testattu). Värit tulevat valitun hahmon teemasta.

**Järjestelmän navigointipalkki:**
- **Android:** palkki piilotetaan immersiivisesti (`expo-navigation-bar`), ja se tulee esiin hetkeksi pyyhkäisemällä ylös näytön alareunasta. Sovelluksen oma alapalkki varaa tilan turva-alueen mukaan, joten sisältö ei jää eleen alle.
- **iOS:** sovellus ei voi piilottaa kotipalkkia (home indicator) pysyvästi. Mahdollista on (a) automaattinen himmennys muutaman sekunnin käyttämättömyyden jälkeen (`prefersHomeIndicatorAutoHidden`, vaatii natiivimoduulin tai config pluginin) ja (b) eleen lykkäys niin, että alareunan pyyhkäisy pitää tehdä kahdesti (`preferredScreenEdgesDeferringSystemGestures`). Kumpikin on tarkoitettu videoille ja peleille, ja tavallisessa sovelluksessa palkki palaa heti kosketuksesta. MVP:ssä iOS:n kotipalkkiin ei kosketa: alapalkki sijoitetaan turva-alueen yläpuolelle.

### 4.2 Koti

- **Nykyinen ruokalista:** hyväksytyn suunnitelman ateriat kuvakortteina päivämäärän mukaan, tämän päivän ateria ensimmäisenä.
- **Budjettimittari:** esim. "42 € / 50 €" ja selitys "Budjetti kattaa vain sovelluksen ehdottamat ateriat – ei muita ruokaostoksiasi."
- **Säästöt:** budjetin ja hinta-arvion erotus kuluvalta kuukaudelta hyväksytyistä suunnitelmista, esim. "Hinta-arvio alitti budjettisi 18 € tässä kuussa". Lasketaan vain silloin, kun hinta-arvio jää budjetin alle; ylitystä ei näytetä "negatiivisena säästönä".
- **Päivän yhteenveto:** kalorit ja makrot (proteiini, hiilihydraatit, rasva) suhteessa päivätavoitteeseen, napautus avaa Päiväkirjan.
- **Pääkehotus:** "Tee uusi lista" → Suunnittele. Tyhjä tila (ei suunnitelmaa): esittely ja sama kehotus.
- **Nupun tervehdys** (kohta 4.9) tilanteen mukaan, putki, taso ja päivän tehtävät yhdellä rivillä (napautus avaa Edistymisen) sekä "Kysy Nupulta".

### 4.3 Suunnittele (kysely)

Yksi kysymys per näkymä, edistymispalkki ylhäällä, "Takaisin" jokaisessa vaiheessa. Arvot esitäytetään edellisestä kyselystä tai profiilista, joten tavallisesti käyttäjä vain vahvistaa.

1. **Budjetti** – liukusäädin ja lukukenttä. Budjetin selitys näkyy säätimen alla. Realistinen vähimmäisbudjetti näytetään, kun syöjät ja ateriamäärä tiedetään (vaihe 3); liian pieni budjetti palauttaa tähän vaiheeseen selityksen kanssa.
2. **Syöjien määrä** – 1–6, isot napit, oletus 1 (yksilösovellus). Kokkauskerran annosmäärä (syöjät × tuplaus) näkyy tuplausvaiheessa ja yhteenvedossa.
3. **Ruokakertojen määrä** – 2–6 tai "Koko viikko (7)". Koko viikko esitäyttää budjetiksi profiilin viikkobudjetin, jos käyttäjä ei ole muuttanut budjettia.
4. **Allergiat ja ruokavalio** – esitäytetty profiilista, käyttäjä vahvistaa. Tässä voi **lisätä** allergioita tai ruokavalion vain tälle suunnitelmalle (esim. vieras), mutta profiilin allergioita ei voi poistaa tässä: poisto tehdään profiilissa. Näin turvallisuusasetus ei katoa vahingossa.
5. **Mitä tekee mieli** – valintasirut, useampi sallittu, voi ohittaa: kana, kala, jauheliha, kasvis, pasta, keitto, aasialainen, meksikolainen, nopea, uunissa.
6. **Generointianimaatio** – rauhallinen, toistuva animaatio ja vaihtuvat tilaviestit ("Etsitään sopivia reseptejä…", "Lasketaan hinta-arviota…"). Virhetilassa selitys ja "Yritä uudelleen".
7. **Ehdotukset** – ateriakortit (kuva, nimi, hinta-arvio, kcal/annos, aika). Jokaisessa kortissa "Vaihda". Yläreunassa yhteishinta suhteessa budjettiin ja keskimääräiset makrot annosta kohden; ne päivittyvät heti vaihdon jälkeen (numeroiden animoitu siirtymä). "Tee tuplana → huomisen lounas" -valinta sopiville aterioille. Pääkehotus "Hyväksy".
   - **Kriteerit:** ehdotuksen pitää täyttää budjetti, allergiat, ruokavalio ja toiveet. Allergioista ja ruokavaliosta ei jousteta koskaan. Jos budjetti ylittyy, näkymä kertoo paljonko ja tarjoaa yhden napautuksen ratkaisut: "Nosta budjettia 6 €" ja "Vähennä yksi ruokakerta – 38 €" (vain jos loput mahtuvat budjettiin, lukittuja aterioita ei poisteta). Täyttymätön toive selitetään: joko se ei sovi allergioihin tai ruokavalioon, tai sopivaa ruokaa ei löytynyt budjettiin. Sävy on neutraali, ei punaista.
   - **Hinta-alue:** ehdotuksen alla kerrotaan, minkä maan hintatasolla arvio on laskettu; muualla kuin Suomessa lisäksi "karkea arvio". Napautus avaa hinta-alueen valinnan.
   - Jo kyselyn yhteenvedossa liian pieni budjetti näyttää halvimman realistisen listan hinnan ja napit "Nosta budjetiksi X €" ja (jos riittää) "Vähennä yksi ruokakerta".
8. **Ostoslista** – kaupan osastojen mukaan ryhmiteltynä ja rastittavana. Perusvarat eivät näy listalla. Summan alla budjetin selitys.

### 4.4 Reseptit

- Iso reseptikirjasto korttinäkymänä (kuva, nimi, hinta-arvio/annos, aika, kcal/annos). Testikirjastossa on 319 reseptiä: aamiaiset, lounaat, päivälliset, välipalat, keitot, salaatit, kala, kana, liha, kasvis, vegaani, gluteeniton, laktoositon, nopeat, edulliset, meal prep ja suomalaiset klassikot ([GENERATION.md, kohta 10.1](GENERATION.md#101-testikirjasto-vaihe-1-tehty)).
- Ateriavalitsin (Kaikki / Aamiainen / Lounas / Päivällinen / Välipala), haku nimellä tai ainesosalla ja suodattimet (suosikit, nopeat, edulliset, kasvis, vegaaninen, gluteeniton, proteiinipitoinen, kala, kana, liha, keitot, salaatit, pasta, suomalainen, aasialainen, meksikolainen, riittää huomiseksi). Järjestys: suositellut, hinta, aika, kalorit.
- **Tiukka suodatus:** käyttäjä näkee vain itselleen sopivat ruoat. Yksi koodissa tehtävä tarkistus (`isRecipeAllowed`) kattaa kirjaston, haun, suositukset, Kodin, Suunnittele-ehdotukset, vaihtovaihtoehdot, päiväkirjan reseptilistat, reseptisivun ja chatin. Piilotettujen määrää ei kerrota, eikä "näytä kaikki" -valintaa ole.
- **Reseptisivu:** kuva tai kategoriakuvituskortti teeman väreissä, kategoria, vaikeus, kokonais- ja työaika, hinta-arvio, makrot per annos (Fineli), allergeenit, ainesosat määrineen (perusvarat merkitty "kotoa"), numeroidut vaiheet, vinkit sekä säilytys ja lämmitys. Päivällisen pääkehotus on "Lisää suunnitelmaan", muiden "Lisää päiväkirjaan".
- Tyhjä tila (haulla ei tuloksia): "Ei osumia – kokeile poistaa suodattimia" ja nappi suodattimien tyhjennykseen.

### 4.5 Päiväkirja (kalorilaskuri)

- Päivän kalorit ja makrot rengasmittarina suhteessa päivätavoitteisiin. Päivää vaihdetaan nuolilla tai pyyhkäisemällä.
- Ateriat ryhmissä: aamiainen, lounas, päivällinen, välipalat. Jokaisessa ryhmässä summa ja "Lisää".
- **Ruoan lisäys kolmella tavalla:**
  1. **Ota kuva:** tekoäly tunnistaa ruoat ja arvioi määrät. Tulos näytetään merkinnällä "arvio", ja käyttäjä voi korjata määriä tai poistaa ja lisätä rivejä ennen tallennusta. Tunnistamaton ruoka ohjataan nimihakuun.
  2. **Hae ruokaa nimellä:** Fineli-haku, annoskoot (esim. "1 keskikokoinen", "1 dl") ja viimeksi käytetyt ensin.
  3. **Lisää resepti omalta listalta:** nykyisen suunnitelman ateriat, yksi napautus lisää yhden annoksen oikeaan ateriaryhmään.
  4. **Pikalisäys:** pelkkä kalorimäärä ilman ruokaa (esim. "300 kcal").
- Annoskoot: grammat, kappaleet, desilitrat ja annokset; suosikkiruoat ja viimeksi käytetyt ensin.
- Merkinnän muokkaus ja poisto (poistossa "Kumoa"), aterian kopiointi toiselle päivälle.
- Kuvantunnistus on erillinen palvelu (`services/foodRecognition.ts`), jonka testidatatoteutuksen voi vaihtaa `recognize-food-photo`-kutsuun muuttamatta näkymiä.
- Päivätavoitteet tulevat kalorilaskimesta (kohta 4.7) tai asetetaan käsin profiilissa. Kaloritavoite näkyy Kodissa ja Päiväkirjassa.
- **Piilota kalorit:** profiilin asetus, jolla päiväkirja ja Koti näyttävät ateriat ilman lukuja.
- Sävy on neutraali: tavoitteen ylitystä ei näytetä punaisella varoituksena, vaan pelkkänä lukuna. Kaloritavoitteella on alaraja (kohta 4.7).

**Kilpailijatason lisäykset (marraskuu 2026):**

- **Oma kameranäkymä** kolmella tilalla: annos (lautasopas ja vinkki "kuvaa ylhäältä, koko lautanen näkyvissä"), viivakoodi (skannausviiva, käsin syöttö tarkistusnumerolla) ja ravintoarvotaulukko. Salama, galleria ja lupatilat.
- **Kuvantunnistuksen tulos:** jokainen ruoka erikseen: grammat, kcal ja makrot; epävarma rivi merkitään "Tarkista". Ennen backendia tunnistus on **testitilassa**, ja kamera ja tulos kertovat sen selvästi ("Testitila – oikea tunnistus tulossa"). Muokkaus liukusäätimellä ja käsivertailuilla ("kämmenen kokoinen", "nyrkin kokoinen"), ruoan vaihto, poisto ja puuttuvan lisäys. Merkintä "arvio" näkyy aina.
- **Viivakoodi** (toimii oikeasti): Open Food Facts, nimi, merkki, kuva, ravintoarvot / 100 g ja annoskoko. Ei löydy / puutteellinen / ei yhteyttä → "Lisää tuote itse".
- **Ravintoarvotaulukon luku** (`services/nutritionLabel.ts`, testidata): luvut esitäytetään, käyttäjä tarkistaa, energian ja makrojen ristiriidasta kerrotaan.
- **Omat ruoat, omat ateriat** (päiväkirjan ateria tallennetaan yhdellä napautuksella) **ja omat reseptit** (ainesosat ja annosmäärä, lisätään annos kerrallaan). Lisäysnäkymässä välilehdet Haku / Omat / Reseptit ja pikapainikkeet Kuva, Viivakoodi, Taulukko, Pikalisäys.
- **Pikalisäys** kaloreilla ja valinnaisilla makroilla; **koko päivän kopiointi**.
- **Vesi ja juomat:** henkilökohtainen vesitavoite (paino, aktiivisuus, raskaus tai imetys; päivän liikunta ja helle), oma tavoite vaihtoehtona, juomatyypit ja pikakoot (1–5 dl), päivän loki kumoamisella, 7 päivän kaavio, putki, lempeät juomamuistutukset hahmon äänellä ja rauhallinen huomautus yli 4 litrasta. Päiväkirjan vesikortissa yhden napautuksen lasi. Laskenta `domain/hydration.ts` (testattu). **Kuitu, sokerit ja suola** päivän näkymässä viitearvoineen (kuitu 25–35 g, suola enintään 5 g).
- **Raportit:** päivä (energia aterioittain, energian jakauma, kuitu/sokeri/suola, vesi) ja viikko (kcal- ja proteiinipylväät, kirjatut päivät, proteiinitavoitepäivät, vesi). Keskiarvot vain kirjatuista päivistä. Raportti kuvaa, ei arvostele.
- **Ateriamuistutukset** paikallisilmoituksina, oletuksena pois päältä. Käyttäjä valitsee ateriat ja kellonajat. Teksti ei koskaan mainitse kaloreita tai painoa.

### 4.6 Profiili

- Profiilin tiedot (nimi, viikkobudjetti). PlatePal on yksilösovellus: syöjien määrä valitaan vain kyselyssä suunnitelmakohtaisesti.
- Allergiat ja ruokavalio (terveystietosuostumus)
- Perusvarat
- Hinta-alue (oletuksena puhelimen alue; Suomi oikeaa hintatietoa, muut maat karkea arvio)
- Kalorilaskin ja painotavoite (kohta 4.7), painonseuranta
- Kaloritavoitteet (kcal, proteiini, hiilihydraatit, rasva) ja "Piilota kalorit"
- Edistyminen, Kysy Nupulta ja pelillistämisen kytkin
- Ateriamuistutukset, ulkoasu (puhelimen asetus / vaalea / tumma) ja haptiikka
- Tilaus (MVP:n käyttöliittymävaiheessa paikkamerkki)
- Tietosuoja, käyttöehdot, Fineli- ja Open Food Facts -lähdemaininnat
- Tilin poisto (vahvistusdialogi, App Storen vaatimus)

### 4.7 Kalorilaskin, painotavoite ja painonseuranta

Peruskäyttäjä ei tiedä kalorintarvettaan, joten sovellus laskee sen. Laskin on osa ensikäynnistystä (ohitettavissa) ja löytyy Profiilista.

- **Tiedot:** biologinen sukupuoli (vain kaavaa varten), syntymävuosi, pituus, paino, raskaus tai imetys, aktiivisuustaso viidellä arkisella kuvauksella (esim. "Istumatyö, vähän liikuntaa") ja liikuntakerrat viikossa.
- **Laskenta:** perusaineenvaihdunta Mifflin–St Jeor -kaavalla × aktiivisuuskerroin = kokonaiskulutus. Luvut näytetään ja selitetään selkokielellä.
- **Tavoite:** laihdutus, ylläpito tai painonnousu. Tavoitepaino liukusäätimellä ja vauhti 0,25 / 0,5 / 0,75 kg viikossa. Näytetään päivittäinen kalorimäärä ja arvioitu tavoitepäivä (1 kg ≈ 7 700 kcal).
- **Makrot:** proteiini g/kg (laihdutus 1,8, ylläpito 1,4, nousu 1,6), rasva vähintään 25 % energiasta, hiilihydraatit loput. Käyttäjä voi säätää käsin.
- **Turvarajat (pakolliset, koodissa ja yksikkötestattu):** vähintään 1 200 kcal (naiset) / 1 500 kcal (miehet), vaje enintään 25 % kokonaiskulutuksesta. Alle 18-vuotiaille sekä raskaana oleville ja imettäville ei lasketa vajetta, vaan ohjataan terveydenhoitajalle tai lääkärille. Alipainon puolelle (BMI < 18,5) jäävää tavoitepainoa ei hyväksytä. Jos valinta ylittäisi rajan, sovellus säätää sen turvalliseksi ja kertoo ystävällisesti miksi.
- **Painonseuranta:** painon kirjaus, kaavio 7 päivän liukuvalla keskiarvolla ja edistyminen kohti tavoitetta. Kun keskiarvo muuttuu yli 2 kg, sovellus ehdottaa tavoitteen päivittämistä.
- **Terveystieto:** pituus, ikä, paino, raskaus/imetys, tavoite ja painokirjaukset kuuluvat samaan terveystietosuostumukseen kuin allergiat. Ei lokeihin eikä analytiikkaan.

**Edistynyt versio (marraskuu 2026)**, turvarajat ennallaan:

- **Tavoitetyypit:** laihdutus, ylläpito, lihasmassan kasvatus (maltillinen ylijäämä, 0,1–0,4 kg/vko, enintään 15 % kulutuksesta) ja kehonkoostumuksen muutos (10 % vaje, paljon proteiinia, ei tavoitepainoa). Rekompositiokaan ei tee vajetta alle 18-vuotiaille, raskaana oleville tai imettäville.
- **Tarkempi kulutus:** valinnainen rasvaprosentti → Katch–McArdle. Arkiaktiivisuus työn tyypistä tai askelista, treenit lajeittain (kerrat ja kesto, MET-arvot).
- **Ruokavaliotyylit:** tasapainoinen, korkea proteiini, vähähiilihydraattinen (25 % energiasta, vähintään 100 g, ei ketogeeninen) sekä kasvis/vegaani (+10 % proteiinia). Rasva vähintään 25 % kaikissa. Käsin säädettävissä.
- **Kalorien jaksotus:** sama viikkokokonaisuus, valittuina päivinä enemmän. Pienet päivät eivät koskaan alita kalorilattiaa. Koti ja Päiväkirja näyttävät päivän tavoitteen.
- **Mukautuva kulutusarvio ja viikkotarkistus:** 2–4 viikon punnituksista ja kirjauksista lasketaan todellinen kulutus (syöty energia − painotrendi × 7 700). Tarkistus selittää laskennan selkokielellä ja ehdottaa tavoitteen päivitystä. Mitään ei muuteta automaattisesti. Jos arvio poikkeaa kaavasta yli 35 %, se merkitään epäluotettavaksi (todennäköisesti kirjaamatta jääneitä aterioita).
- **Välitavoitteet ja ennuste:** 25 / 50 / 75 / 100 % -merkit, ennuste nykyisellä tahdilla ja suunnitelman mukainen päivä.
- Jokainen valinta kertoo, mitä se tarkoittaa ja kenelle se sopii.

### 4.8 Pelillistäminen

- **XP ja tasot** (10 tasonimeä), **putki** jäädytyksillä (yksi jäädytys jokaisesta 7 päivän putkesta, enintään 2, ja yksi väliin jäänyt päivä silloitetaan automaattisesti), **3 päivittäistä tehtävää**, **viikkohaaste** ja **39 saavutusta** mitaleina (pronssi, hopea, kulta).
- **Juhlistus:** konfetti, juhliva Nuppu ja haptiikka, kerran jokaisesta uudesta saavutuksesta tai tasosta.
- **Pakolliset säännöt:** palkitaan vain säännöllisyydestä ja hyvistä tavoista (kirjaaminen, kokkaaminen, vesi, budjetissa pysyminen, uudet reseptit, proteiinitavoite). Vähemmästä syömisestä, isommasta vajeesta tai nopeasta laihtumisesta ei koskaan palkita. Ei rangaistuksia, ja XP ei koskaan laske. Testi varmistaa, että samat tavat antavat saman XP:n millä tahansa kalorimäärällä.
- Kaikki johdetaan kirjatusta datasta (`domain/gamification.ts`), joten mitään ei lasketa kahteen kertaan. Pelillistämisen voi kytkeä pois Profiilista.

### 4.9 Hahmot ja chat

- **Kahdeksan hahmoa** ([MASCOT.md](MASCOT.md)), joista käyttäjä valitsee yhden ensikäynnistyksessä; valinta määrää väriteeman, äänen ja ulkonäön. Tilat perus, iloinen, miettivä, juhliva, kokkaava, uninen ja kannustava. Näkyy onboardingissa, tyhjissä tiloissa, juhlistuksissa, Kodin tervehdyksessä, muistutuksissa ja chatissa. Lopulliset kuvat vaihdetaan kansioon `assets/mascot`.
- **Kysy hahmolta:** valmiit kysymysehdotukset. Reseptiehdotukset tulevat vain käyttäjälle sallituista resepteistä ja näkyvät napautettavina kortteina. Hahmo näkee päivän kirjaukset ja tavoitteet vain luvalla, jonka voi perua. Päiväraja 20 viestiä. Turvallisuus: ei diagnooseja, ohjaus ammattilaiselle, syömishäiriöherkkyys, ei äärimmäisiä dieettejä eikä neuvoja alle turvarajojen ([GENERATION.md, kohta 17](GENERATION.md#17-avustajachat-kysy-nupulta)).

### 4.10 Väriteema

Hahmokohtainen paletti vaaleana ja tummana ([MASCOT.md](MASCOT.md)). Käyttäjä voi valita "Puhelimen asetus" (oletus), "Vaalea" tai "Tumma". Kaikki tekstitokenit täyttävät WCAG AA:n kaikilla taustoilla molemmissa teemoissa (`theme/contrast.test.ts`). Värit luetaan aina aktiivisesta teemasta (`colors`, `themedStyles`), ja teeman vaihto säilyttää navigointitilan. Kamera- ja hahmografiikka käyttävät kiinteitä värejä.

### 4.11 Kielet, hinta-alueet ja mittayksiköt

- **Kielet:** suomi, englanti ja ruotsi. Ensikäynnistyksen ensimmäinen näkymä on kielen valinta; oletuksena puhelimen kieli (`expo-localization`), muuten englanti. Kieli vaihtuu heti ilman uudelleenkäynnistystä, ja sen voi vaihtaa Profiilissa. Aiemmat käyttäjät pitävät suomen.
- **Kaikki teksti käännetään:** valikot, painikkeet, virheet, ilmoitukset, onboarding, saavutukset, tehtävät, chatin vastaukset ja jokaisen hahmon repliikit omalla puhetyylillään. Hahmojen nimet ovat samat kaikilla kielillä. Reseptien nimet, kuvaukset, vaiheet, vinkit ja säilytysohjeet sekä ainesosien ja päiväkirjan ruokien nimet ovat käännöstiedostoissa erillään rakenteesta.
- **Uusi kieli** = käyttöliittymän käännöstiedostot (`i18n/<kieli>*.ts`), katalogin tekstit (`data/catalog/text/<kieli>/`) ja rivi kahteen rekisteriin. Testit kaatuvat, kunnes jokainen avain, hahmon repliikki, resepti, ainesosa ja ruoka on käännetty (`keys.test.ts`, `characterVoices.test.ts`, `text.test.ts`). Lint-sääntö `platepal/no-untranslated-text` estää kovakoodatut tekstit.
- **Muotoilu Intl-rajapinnalla:** numerot, desimaalit, päivämäärät, viikonpäivät ja valuutta kielen ja alueen mukaan. Viikon ensimmäinen päivä tulee puhelimesta (Yhdysvalloissa sunnuntai). Hermes tuntee vain oikeat lokaalit (`fi-FI`, `sv-SE`, `en-GB`, `en-US`), joten kieli ja alue yhdistetään niihin.
- **Hinta-alueet** (maa → valuutta ja hintataso) ilman kauppoja: Suomi on oikeaa hintatietoa, muut tuetut maat (SE, NO, DK, EE, DE, NL, FR, IE, GB, US) karkea arvio hintatasokertoimella, ja käyttöliittymä sanoo sen.
- **Mittayksiköt:** metrinen (g, kg, ml, dl, l, cm) tai imperiaalinen (oz, lb, fl oz, cups, ft ja in). Oletus puhelimen mittajärjestelmästä tai alueesta; paino- ja pituusyksiköt tulevat samasta asetuksesta. Kaikki tallennetaan ja lasketaan metrisenä.
- **Ravintoarvot:** Fineli säilyy toistaiseksi pohjana kaikilla kielillä ja kaikissa maissa. Muihin maihin laajennettaessa voidaan ottaa lisäksi käyttöön esim. USDA FoodData Central ja Open Food Facts (ks. DATA_MODEL.md, päätös 26).

### 4.12 Suorituskyky

Tavoite: jokainen napautus antaa visuaalisen palautteen alle 100 ms:ssa release-buildissa. Periaatteet, jotta samat virheet eivät toistu:

- **Tarkat Zustand-selektorit:** luetaan vain tarvittavat kentät (`useShallow`), ei koko storea. Selektori ei palauta uutta taulukkoa tai oliota.
- **Ei staattista dataa persistiin:** AsyncStorageen tallennetaan vain käyttäjän tila, ei reseptejä, ainesosia tai muuta katalogia. Kirjoitukset ryhmitellään (400 ms hiljaisuus, heti kun sovellus menee taustalle).
- **Johdettu data välimuistiin:** suodatukset ja allergialaskenta `useMemo`lla ja olioidentiteettiin perustuvilla välimuisteilla (resepti on muuttumaton arvo). Satojen reseptien suodatus ei saa tapahtua joka renderissä.
- **Virtualisoidut listat:** pitkät listat `FlatList`illa, vakaalla `renderItem`illä ja memoisoiduilla riveillä (`React.memo`), ei `.map()`-renderöintiä ScrollViewissä.
- **Piilotetut välilehdet jäädytetään** (`freezeOnBlur`), jotta ne eivät renderöidy jokaisesta muutoksesta.
- **Käyttöliittymä ensin:** tila päivitetään heti (optimistinen päivitys), hidas työ (tallennus, haptiikka, ilmoitusten ajastus) sen jälkeen, ei `await`ia ennen päivitystä.
- **Mittaa ensin:** muutokset perustellaan mittauksella (renderilaskurit, `performance.now()`, emulaattorin release-build), ja tulokset kirjataan commit-viestiin.

## 5. Vaiheittainen toteutussuunnitelma

### Vaihe 0: Validointi (1–2 viikkoa)
- Kilpailija-analyysi (esim. Mealime, Eat This Much, Yazio, MyFitnessPal ja suomalaiset vaihtoehdot).
- Figma-prototyyppi ja 5–10 käyttäjähaastattelua kohderyhmälle.
- Promptin käsitestaus: tuottaako tekoäly järkeviä 1–6 hengen listoja annetulla budjetilla?
- Hinnoitteluhypoteesi, esim. 4,99 €/kk tai 34,99 €/v ja 7 päivän ilmainen kokeilu.

### Vaihe 1: MVP (9–11 viikkoa)
Päiväkirja ja reseptikirjasto lisäävät laajuutta, joten arvio nousi aiemmasta 6–8 viikosta.

1. Projektipohja: Expo, Supabase (EU), CI ja EAS Build.
2. **Käyttöliittymä testidatalla** (nykyinen työvaihe): navigaatio ja Koti → Reseptit → Suunnittele → Päiväkirja → Profiili. Ei Supabasea eikä tekoälyä; testidata noudattaa [DATA_MODEL.md](DATA_MODEL.md):n rakennetta, jotta vaihto oikeaan dataan on suoraviivainen. Tehty: yksilösovellus (ei kotitalouden kokoa), 8 hahmoa teemoineen, alapalkki, Fineli-ainesosataulu (235 ainesosaa), 319 validoitua reseptiä, tiukka allergia- ja ruokavaliosuodatus, kuvantunnistuksen testitila ja vesitavoite.
3. Fineli-tuonti tauluihin: sovelluksen ainesosataulu on jo rakennettu Finelin avoimesta datasta (`scripts/fineli`); backendissä sama aineisto ja hinta-alueet (`price_regions`) tauluihin. Finelin annoskoot päiväkirjaa varten.
4. Kirjautuminen (Apple, Google, sähköposti) ja ensikäynnistyksen perusasetukset (kieli, hahmo, allergiat, ruokavalio).
5. `generate-plan`-funktio: Claude, allergiatarkistus, makrot, hinta ja budjettisilmukka. Ehdotus → hyväksyntä → ostoslista.
6. Reseptikirjaston siirto tauluihin (319 testireseptiä pohjana, täydennys generoinnilla ja ihmistarkistuksella) ja `list-recipes`-funktio.
7. Kuvageneraatio asynkronisesti ja välimuistiin. Odotellessa näytetään paikkamerkki.
8. Päiväkirja: Fineli-haku, reseptin lisäys, `recognize-food-photo`-funktio ja kustannusraja.
9. RevenueCat: maksumuuri ja kokeilujakso.
10. Tietosuojaseloste, käyttöehdot, allergiavastuuvapaus ja tilin poisto (App Store vaatii).
11. Suljettu beta TestFlightissa ja Google Playn sisäisessä testauksessa 20–50 käyttäjällä.

**MVP:stä jätetään pois:** aamiaisten ja välipalojen suunnittelu ostoslistaan (ne ovat kirjastossa ja päiväkirjassa, mutta Suunnittele tekee vain päivällisiä; lounas tuplauksen kautta), halal- ja kosher-ruokavaliot, sosiaaliset ominaisuudet, reaaliaikaiset hinnat ja puettavien laitteiden integraatiot. Monikielisyys on MVP:ssä: suomi, englanti ja ruotsi (kohta 4.11).

### Vaihe 2: Julkaisu ja oppiminen (4–6 viikkoa)
- Julkaisu kauppoihin ja kauppasivujen optimointi (ASO).
- Mittarit: aktivointi (ensimmäinen suunnitelma hyväksytty), viikkosuunnitelman ja kauppareissun käyttösuhde, päiväkirjan käyttö, kokeilusta maksavaksi, säilyvyys viikoilla 1 ja 4, tekoälykustannus per käyttäjä (generointi ja kuvantunnistus erikseen).
- Palaute resepteistä (peukku ylös/alas), joka ohjaa tulevia generointeja.
- Hintataulun päivitysprosessi (esim. kuukausittainen tarkistus).

### Vaihe 3: Laajennukset
- Ruokahävikin minimointi: "mitä jääkaapissa on" -syöte.
- Tarkemmat hinnat: maakohtainen hintatieto (`ingredient_region_prices`) ja kuittiskannaus (OCR).
- Ostoslistan jakaminen toiselle sovelluksen käyttäjälle.
- Lisää kieliä ja maita (esim. norja, tanska, saksa). Uusi kieli = käännöstiedostot ja reseptikäännökset; maakohtainen hintatieto ja ravintoarvolähteet (USDA FoodData Central, Open Food Facts) maan mukaan.
- Ilmoitukset ("huomenna on kanapastaa, ota kana sulamaan").

## 6. Riskit ja kustannukset

| Riski | Toimenpide |
|---|---|
| Tekoäly- ja kuvakustannukset nousevat tilausmaksua suuremmiksi | Reseptien ja kuvien uudelleenkäyttö, valmiiksi lasketut vaihtoehdot ehdotusnäkymässä, rajat (vaihdot, suunnitelmat, kuvantunnistukset) ja käyttäjäkohtainen 30 päivän kustannuskatto. Kustannusseuranta per käyttäjä alusta asti. |
| Hinta-arviot ovat epätarkkoja | Rehellinen nimeäminen ("arvio"), käyttäjien korjausehdotukset, hintataulun säännöllinen päivitys |
| Allergiavirhe | Sääntöpohjainen tarkistus jokaiselle reseptille (myös kirjastossa), vastuuvapaus, allergeenien korostus reseptinäkymässä |
| Kuvantunnistus arvioi määrät väärin | Merkintä "arvio", käyttäjä vahvistaa ja korjaa ennen tallennusta, makrot aina Finelistä |
| Kalorilaskuri voi olla haitallinen syömishäiriöistä kärsiville | Neutraali sävy, ei varoitusvärejä ylityksestä, kaloritavoitteen alaraja 1 200 / 1 500 kcal, vaje enintään 25 %, ei laihdutustavoitetta alle 18-vuotiaille, raskaana oleville tai imettäville eikä alipainon puolelle, "Piilota kalorit" -asetus |
| Pelillistäminen ohjaa syömään vähemmän | Palkitaan vain tavoista; vähemmästä syömisestä ei koskaan palkita (testattu), ei rangaistuksia, kytkettävissä pois |
| Chat antaa vaarallisen neuvon | Kaksikerroksinen sääntöpohjainen turvaluokitus ennen ja jälkeen mallin, testiaineisto rajatapauksista, ohjaus ammattilaiselle |
| Open Food Factsin tiedot ovat puutteellisia tai virheellisiä | Zod-validointi, järkevyysrajat, lähdemerkintä "Open Food Facts", käyttäjä voi korjata ja täydentää |
| Kaupan tarkastus hylkää sovelluksen | Sisäiset ostot oikein, tilin poisto mahdollinen, tietosuojaseloste kunnossa |
