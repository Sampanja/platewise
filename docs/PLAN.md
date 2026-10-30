# Platewise – suunnitelma

Maksullinen mobiilisovellus (iOS + Android) pienille talouksille. Pääkohderyhmä on yksin tai kaksin asuvat, mutta suunnitelman voi tehdä 1–6 syöjälle. Käyttäjä syöttää budjetin, lähikauppansa, allergiat ja ruokavalion. Tekoäly generoi annoksia, joissa on ainesosat, makrot, hinta-arvio ja kuva ruoasta. Lisäksi sovelluksessa on kalorilaskuri (päiväkirja). Sovelluksen pitää olla todella selkeä ja helppokäyttöinen.

Suunnittelussa on yksi moottori: **N päivällistä + budjetti → yksi ostoslista**. Käyttäjä käy sen läpi yhdellä kyselyllä (Suunnittele-välilehti, kohta 4.3). Kyselyn ateriamäärä ratkaisee tilan:

- **Viikkosuunnitelma:** "Koko viikko" eli N = 7. Budjetiksi esitäytetään profiilin viikkobudjetti.
- **Kauppareissu:** käyttäjä valitsee 2–6 ateriaa ja budjetin yhdelle ostoskerralle.

Budjetti kattaa vain sovelluksen ehdottamat ateriat, ei käyttäjän kaikkia ruokaostoksia. Tämä kerrotaan käyttöliittymässä selvästi.

## 1. Kolme asiaa, jotka kannattaa ratkaista ennen koodia

1. **Kauppojen hinnat.** K-Ruoalla, S-kaupoilla tai Lidlillä ei ole avointa hinta-APIa. Hintojen raapiminen niiden sivuilta rikkoo käyttöehtoja ja hajoaa helposti. MVP:ssä hinta lasketaan omasta hintataulukosta, jossa on noin 300–500 yleisintä ainesosaa ja jokaiselle ketjukohtainen hintataso (esim. Lidl 0,85×, Prisma 1,0×, K-Market 1,15×). Sovelluksessa luvun nimi on "hinta-arvio", ei tarkka hinta. Myöhemmin voi neuvotella kumppanuuksista tai käyttää kuittien skannausta.
2. **Makroja ei anneta tekoälyn laskea.** Kielimallit arvioivat ravintoarvot epätarkasti. Tekoäly tuottaa ainesosat ja grammamäärät, ja backend laskee makrot **Fineli-tietokannasta** (THL:n avoin elintarvikkeiden koostumustietokanta). Sama pätee päiväkirjan kuvantunnistukseen: tekoäly tunnistaa ruoat ja arvioi grammat, makrot tulevat Finelistä.
3. **Allergiat ovat turvallisuuskysymys.** Tekoälyn tuottama resepti tarkistetaan aina erikseen säännöillä: jokainen ainesosa verrataan allergeenilistaan ja kielletyt sanat (esim. pähkinä, maapähkinä, cashew) estetään. Jos resepti ei läpäise tarkistusta, se generoidaan uudelleen. Sovellukseen tarvitaan lisäksi selkeä vastuuvapauslauseke. GDPR:n kannalta allergia- ja ruokavaliotiedot, kaloritavoitteet ja ruokapäiväkirja voivat olla terveystietoja, joten niiden tallennus ja suostumus on suunniteltava huolella.

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
│  │ - store_prices │   │  5. hinta hintataulukosta   │ │
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

**Järjestelmän navigointipalkki:**
- **Android:** palkki piilotetaan immersiivisesti (`expo-navigation-bar`), ja se tulee esiin hetkeksi pyyhkäisemällä ylös näytön alareunasta. Sovelluksen oma alapalkki varaa tilan turva-alueen mukaan, joten sisältö ei jää eleen alle.
- **iOS:** sovellus ei voi piilottaa kotipalkkia (home indicator) pysyvästi. Mahdollista on (a) automaattinen himmennys muutaman sekunnin käyttämättömyyden jälkeen (`prefersHomeIndicatorAutoHidden`, vaatii natiivimoduulin tai config pluginin) ja (b) eleen lykkäys niin, että alareunan pyyhkäisy pitää tehdä kahdesti (`preferredScreenEdgesDeferringSystemGestures`). Kumpikin on tarkoitettu videoille ja peleille, ja tavallisessa sovelluksessa palkki palaa heti kosketuksesta. MVP:ssä iOS:n kotipalkkiin ei kosketa: alapalkki sijoitetaan turva-alueen yläpuolelle.

### 4.2 Koti

- **Nykyinen ruokalista:** hyväksytyn suunnitelman ateriat kuvakortteina päivämäärän mukaan, tämän päivän ateria ensimmäisenä.
- **Budjettimittari:** esim. "42 € / 50 €" ja selitys "Budjetti kattaa vain sovelluksen ehdottamat ateriat – ei muita ruokaostoksiasi."
- **Säästöt:** budjetin ja hinta-arvion erotus kuluvalta kuukaudelta hyväksytyistä suunnitelmista, esim. "Hinta-arvio alitti budjettisi 18 € tässä kuussa". Lasketaan vain silloin, kun hinta-arvio jää budjetin alle; ylitystä ei näytetä "negatiivisena säästönä".
- **Päivän yhteenveto:** kalorit ja makrot (proteiini, hiilihydraatit, rasva) suhteessa päivätavoitteeseen, napautus avaa Päiväkirjan.
- **Pääkehotus:** "Tee uusi lista" → Suunnittele. Tyhjä tila (ei suunnitelmaa): esittely ja sama kehotus.

### 4.3 Suunnittele (kysely)

Yksi kysymys per näkymä, edistymispalkki ylhäällä, "Takaisin" jokaisessa vaiheessa. Arvot esitäytetään edellisestä kyselystä tai profiilista, joten tavallisesti käyttäjä vain vahvistaa.

1. **Budjetti** – liukusäädin ja lukukenttä. Budjetin selitys näkyy säätimen alla. Realistinen vähimmäisbudjetti näytetään, kun syöjät ja ateriamäärä tiedetään (vaihe 3); liian pieni budjetti palauttaa tähän vaiheeseen selityksen kanssa.
2. **Syöjien määrä** – 1–6, isot napit. Oletus profiilin talouden koosta.
3. **Ruokakertojen määrä** – 2–6 tai "Koko viikko (7)". Koko viikko esitäyttää budjetiksi profiilin viikkobudjetin, jos käyttäjä ei ole muuttanut budjettia.
4. **Allergiat ja ruokavalio** – esitäytetty profiilista, käyttäjä vahvistaa. Tässä voi **lisätä** allergioita tai ruokavalion vain tälle suunnitelmalle (esim. vieras), mutta profiilin allergioita ei voi poistaa tässä: poisto tehdään profiilissa. Näin turvallisuusasetus ei katoa vahingossa.
5. **Mitä tekee mieli** – valintasirut, useampi sallittu, voi ohittaa: kana, kala, jauheliha, kasvis, pasta, keitto, aasialainen, meksikolainen, nopea, uunissa.
6. **Kauppa** – ketjujen logot, oletuksena profiilin oletuskauppa.
7. **Generointianimaatio** – rauhallinen, toistuva animaatio ja vaihtuvat tilaviestit ("Etsitään sopivia reseptejä…", "Lasketaan hinta-arviota…"). Virhetilassa selitys ja "Yritä uudelleen".
8. **Ehdotukset** – ateriakortit (kuva, nimi, hinta-arvio, kcal/annos, aika). Jokaisessa kortissa "Vaihda". Yläreunassa yhteishinta suhteessa budjettiin ja keskimääräiset makrot annosta kohden; ne päivittyvät heti vaihdon jälkeen (numeroiden animoitu siirtymä). "Tee tuplana → huomisen lounas" -valinta sopiville aterioille. Pääkehotus "Hyväksy".
9. **Ostoslista** – kaupan osastojen mukaan ryhmiteltynä ja rastittavana. Perusvarat eivät näy listalla. Summan alla budjetin selitys.

### 4.4 Reseptit

- Iso reseptikirjasto korttinäkymänä (kuva, nimi, hinta-arvio/annos, aika, kcal/annos).
- Haku nimellä ja suodattimet: hinta, valmistusaika, ruokavalio, kalorit. Kirjastossa näytetään vain käyttäjän allergioille ja ruokavaliolle sopivat reseptit (sama koodissa tehtävä tarkistus kuin generoinnissa).
- **Reseptisivu:** kuva, hinta-arvio, makrot per annos (kcal, proteiini, hiilihydraatit, rasva), ainesosat määrineen (perusvarat merkitty "kotoa") ja numeroidut vaiheet. Makrot näkyvät kaikissa resepteissä.
- Tyhjä tila (haulla ei tuloksia): "Ei osumia – kokeile poistaa suodattimia" ja nappi suodattimien tyhjennykseen.

### 4.5 Päiväkirja (kalorilaskuri)

- Päivän kalorit ja makrot rengasmittarina suhteessa päivätavoitteisiin. Päivää vaihdetaan nuolilla tai pyyhkäisemällä.
- Ateriat ryhmissä: aamiainen, lounas, päivällinen, välipalat. Jokaisessa ryhmässä summa ja "Lisää".
- **Ruoan lisäys kolmella tavalla:**
  1. **Ota kuva:** tekoäly tunnistaa ruoat ja arvioi määrät. Tulos näytetään merkinnällä "arvio", ja käyttäjä voi korjata määriä tai poistaa ja lisätä rivejä ennen tallennusta. Tunnistamaton ruoka ohjataan nimihakuun.
  2. **Hae ruokaa nimellä:** Fineli-haku, annoskoot (esim. "1 keskikokoinen", "1 dl") ja viimeksi käytetyt ensin.
  3. **Lisää resepti omalta listalta:** nykyisen suunnitelman ateriat, yksi napautus lisää yhden annoksen oikeaan ateriaryhmään.
- Päivätavoitteet (kcal ja makrot) asetetaan profiilissa.
- Sävy on neutraali: tavoitteen ylitystä ei näytetä punaisella varoituksena, vaan pelkkänä lukuna. Kaloritavoitteella on alaraja (kohta 6).

### 4.6 Profiili

- Profiilin tiedot (nimi, talouden koko eli oletussyöjät, viikkobudjetti)
- Allergiat ja ruokavalio (terveystietosuostumus)
- Perusvarat
- Oletuskauppa
- Kaloritavoitteet (kcal, proteiini, hiilihydraatit, rasva)
- Tilaus (MVP:n käyttöliittymävaiheessa paikkamerkki)
- Tietosuoja, käyttöehdot, Fineli-lähdemaininta
- Tilin poisto (vahvistusdialogi, App Storen vaatimus)

## 5. Vaiheittainen toteutussuunnitelma

### Vaihe 0: Validointi (1–2 viikkoa)
- Kilpailija-analyysi (esim. Mealime, Eat This Much, Yazio, MyFitnessPal ja suomalaiset vaihtoehdot).
- Figma-prototyyppi ja 5–10 käyttäjähaastattelua kohderyhmälle.
- Promptin käsitestaus: tuottaako tekoäly järkeviä 1–6 hengen listoja annetulla budjetilla?
- Hinnoitteluhypoteesi, esim. 4,99 €/kk tai 34,99 €/v ja 7 päivän ilmainen kokeilu.

### Vaihe 1: MVP (9–11 viikkoa)
Päiväkirja ja reseptikirjasto lisäävät laajuutta, joten arvio nousi aiemmasta 6–8 viikosta.

1. Projektipohja: Expo, Supabase (EU), CI ja EAS Build.
2. **Käyttöliittymä testidatalla** (nykyinen työvaihe): navigaatio ja Koti → Reseptit → Suunnittele → Päiväkirja → Profiili. Ei Supabasea eikä tekoälyä; testidata noudattaa [DATA_MODEL.md](DATA_MODEL.md):n rakennetta, jotta vaihto oikeaan dataan on suoraviivainen.
3. Fineli-tuonti ja oma ainesosataulu: noin 300 ainesosaa ja ketjukohtaiset hintakertoimet (alussa 3–4 ketjua). Finelin annoskoot päiväkirjaa varten.
4. Kirjautuminen (Apple, Google, sähköposti) ja ensikäynnistyksen perusasetukset (allergiat, ruokavalio, kauppa, talouden koko).
5. `generate-plan`-funktio: Claude, allergiatarkistus, makrot, hinta ja budjettisilmukka. Ehdotus → hyväksyntä → ostoslista.
6. Reseptikirjaston esitäyttö ennen julkaisua (noin 200 tarkistettua reseptiä) ja `list-recipes`-funktio.
7. Kuvageneraatio asynkronisesti ja välimuistiin. Odotellessa näytetään paikkamerkki.
8. Päiväkirja: Fineli-haku, reseptin lisäys, `recognize-food-photo`-funktio ja kustannusraja.
9. RevenueCat: maksumuuri ja kokeilujakso.
10. Tietosuojaseloste, käyttöehdot, allergiavastuuvapaus ja tilin poisto (App Store vaatii).
11. Suljettu beta TestFlightissa ja Google Playn sisäisessä testauksessa 20–50 käyttäjällä.

**MVP:stä jätetään pois:** erikseen generoidut aamiaiset ja lounaat (lounas vain tuplauksen kautta), halal- ja kosher-ruokavaliot, sosiaaliset ominaisuudet, reaaliaikaiset hinnat, viivakoodinlukija, käyttäjän omat ruoat ja reseptit, kaloritavoitteen laskuri (paino, pituus, ikä), puettavien laitteiden integraatiot ja monikielisyys (vain suomi).

### Vaihe 2: Julkaisu ja oppiminen (4–6 viikkoa)
- Julkaisu kauppoihin ja kauppasivujen optimointi (ASO).
- Mittarit: aktivointi (ensimmäinen suunnitelma hyväksytty), viikkosuunnitelman ja kauppareissun käyttösuhde, päiväkirjan käyttö, kokeilusta maksavaksi, säilyvyys viikoilla 1 ja 4, tekoälykustannus per käyttäjä (generointi ja kuvantunnistus erikseen).
- Palaute resepteistä (peukku ylös/alas), joka ohjaa tulevia generointeja.
- Hintataulun päivitysprosessi (esim. kuukausittainen tarkistus).

### Vaihe 3: Laajennukset
- Ruokahävikin minimointi: "mitä jääkaapissa on" -syöte.
- Tarkemmat hinnat: kuittiskannaus (OCR) tai kumppanuudet kauppaketjujen kanssa.
- Viivakoodinlukija ja omat ruoat päiväkirjaan.
- Kotitalouden jakaminen kahden käyttäjän kesken.
- Ruotsin ja englannin kieli, myöhemmin muut Pohjoismaat.
- Ilmoitukset ("huomenna on kanapastaa, ota kana sulamaan").

## 6. Riskit ja kustannukset

| Riski | Toimenpide |
|---|---|
| Tekoäly- ja kuvakustannukset nousevat tilausmaksua suuremmiksi | Reseptien ja kuvien uudelleenkäyttö, valmiiksi lasketut vaihtoehdot ehdotusnäkymässä, rajat (vaihdot, suunnitelmat, kuvantunnistukset) ja käyttäjäkohtainen 30 päivän kustannuskatto. Kustannusseuranta per käyttäjä alusta asti. |
| Hinta-arviot ovat epätarkkoja | Rehellinen nimeäminen ("arvio"), käyttäjien korjausehdotukset, hintataulun säännöllinen päivitys |
| Allergiavirhe | Sääntöpohjainen tarkistus jokaiselle reseptille (myös kirjastossa), vastuuvapaus, allergeenien korostus reseptinäkymässä |
| Kuvantunnistus arvioi määrät väärin | Merkintä "arvio", käyttäjä vahvistaa ja korjaa ennen tallennusta, makrot aina Finelistä |
| Kalorilaskuri voi olla haitallinen syömishäiriöistä kärsiville | Neutraali sävy, ei varoitusvärejä ylityksestä, kaloritavoitteen alaraja 1 200 kcal, ei painotavoitteita MVP:ssä |
| Kaupan tarkastus hylkää sovelluksen | Sisäiset ostot oikein, tilin poisto mahdollinen, tietosuojaseloste kunnossa |
