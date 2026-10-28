# Platewise – suunnitelma

Maksullinen mobiilisovellus (iOS + Android) yksin tai kaksin asuville. Käyttäjä syöttää viikkobudjetin, lähikauppansa, allergiat ja ruokavalion. Tekoäly generoi annoksia, joissa on ainesosat, makrot, hinta-arvio ja kuva ruoasta. Sovelluksen pitää olla todella selkeä ja helppokäyttöinen.

## 1. Kolme asiaa, jotka kannattaa ratkaista ennen koodia

1. **Kauppojen hinnat.** K-Ruoalla, S-kaupoilla tai Lidlillä ei ole avointa hinta-APIa. Hintojen raapiminen niiden sivuilta rikkoo käyttöehtoja ja hajoaa helposti. MVP:ssä hinta lasketaan omasta hintataulukosta, jossa on noin 300–500 yleisintä ainesosaa ja jokaiselle ketjukohtainen hintataso (esim. Lidl 0,85×, Prisma 1,0×, K-Market 1,15×). Sovelluksessa luvun nimi on "hinta-arvio", ei tarkka hinta. Myöhemmin voi neuvotella kumppanuuksista tai käyttää kuittien skannausta.
2. **Makroja ei anneta tekoälyn laskea.** Kielimallit arvioivat ravintoarvot epätarkasti. Tekoäly tuottaa ainesosat ja grammamäärät, ja backend laskee makrot **Fineli-tietokannasta** (THL:n avoin elintarvikkeiden koostumustietokanta). Silloin luvut ovat tarkkoja ja niiden lähde on uskottava.
3. **Allergiat ovat turvallisuuskysymys.** Tekoälyn tuottama resepti tarkistetaan aina erikseen säännöillä: jokainen ainesosa verrataan allergeenilistaan ja kielletyt sanat (esim. pähkinä, maapähkinä, cashew) estetään. Jos resepti ei läpäise tarkistusta, se generoidaan uudelleen. Sovellukseen tarvitaan lisäksi selkeä vastuuvapauslauseke. GDPR:n kannalta allergia- ja ruokavaliotiedot voivat olla terveystietoja, joten niiden tallennus ja suostumus on suunniteltava huolella.

## 2. Teknologiat

| Osa-alue | Valinta | Perustelu |
|---|---|---|
| Mobiili | **React Native + Expo** (TypeScript) | Sama koodi iOSille ja Androidille. EAS Build ja Submit hoitavat kauppajulkaisut, ja päivitykset voi viedä over-the-air. Sama kieli käy backendissä. |
| UI | Expo Router ja oma pieni komponenttikirjasto (esim. Tamagui tai NativeWind) | Kun komponentteja ja näkymiä on vähän, sovellus pysyy selkeänä. |
| Tila ja data | TanStack Query ja Zustand | Välimuisti, offline-luku ja yksinkertainen tilanhallinta. |
| Backend | **Supabase** (Postgres, Auth, Storage, Edge Functions) | Yksi palvelu kattaa tietokannan, kirjautumisen ja kuvat. Data EU-alueelle. Käyttäjäkohtaiset tietoturvasäännöt (RLS) valmiina. |
| Tekoäly, reseptit | **Claude API** (esim. Sonnet 5.5) rakenteisella JSON-tulosteella (tool use / JSON schema) | Luotettava rakenteinen tuloste ja hyvä suomen kieli. Kutsut aina backendistä, joten API-avain ei päädy sovellukseen. |
| Tekoäly, kuvat | Erillinen kuvageneraatiomalli (esim. Flux palvelun fal.ai tai Replicate kautta, tai OpenAI:n kuvamalli) | Claude ei tuota kuvia. Kuvat tallennetaan välimuistiin ja niitä käytetään uudelleen samankaltaisille annoksille. |
| Ravintoarvot | Fineli-data tuotuna omaan Postgres-tauluun | Ilmainen ja luotettava. |
| Maksut | **RevenueCat** sekä App Storen ja Google Playn sovelluksen sisäiset ostot | Kaupat vaativat sisäiset ostot digitaalisiin tilauksiin. |
| Taustatyöt | Supabase Edge Functions ja jono (pg-boss tai Supabasen Queues) | Kuvien generointi asynkronisesti. |
| Analytiikka ja virheet | PostHog (EU) ja Sentry | Käyttöpolkujen mittaus ja kaatumisraportit. |

## 3. Arkkitehtuuri

```
┌──────────────────────────┐
│  Mobiilisovellus (Expo)  │
│  - Onboarding            │
│  - Viikon ruokalista     │
│  - Resepti + ostoslista  │
└────────────┬─────────────┘
             │ HTTPS (Supabase Auth JWT)
┌────────────▼──────────────────────────────────────────┐
│  Supabase                                             │
│  ┌────────────────┐   ┌─────────────────────────────┐ │
│  │ Postgres       │   │ Edge Functions              │ │
│  │ - users/profiles│  │ generate-plan:              │ │
│  │ - meal_plans   │◄──┤  1. hae profiili + budjetti │ │
│  │ - recipes      │   │  2. Claude → JSON-resepti   │ │
│  │ - ingredients  │   │  3. allergiatarkistus       │ │
│  │ - fineli_foods │   │  4. makrot Finelistä        │ │
│  │ - store_prices │   │  5. hinta hintataulukosta   │ │
│  └────────────────┘   │  6. budjetin tarkistus      │ │
│  ┌────────────────┐   │  7. kuva jonoon             │ │
│  │ Storage (kuvat)│◄──┤ image-worker → kuvamalli    │ │
│  └────────────────┘   └─────────────────────────────┘ │
└───────────────────────────────────────────────────────┘
             │
   RevenueCat (webhook → tilaustila Postgresiin)
```

**Generoinnin periaatteet:**
- Tekoäly valitsee ainesosat **suljetusta ainesosalistasta**, eli omasta hinta- ja Fineli-taulusta. Jokaiselle ainesosalle löytyy siis sekä hinta että ravintoarvot. Tämä on arkkitehtuurin tärkein yksittäinen päätös.
- Jos budjetti ylittyy, backend pyytää tekoälyä vaihtamaan kalleimmat ainesosat.
- Reseptit tallennetaan ja niitä käytetään uudelleen muilla käyttäjillä, joilla on yhteensopiva profiili. Tekoälykustannukset laskevat ja vastaukset nopeutuvat.
- Annoskoot ovat 1 tai 2 henkeä. Ostoslista optimoi ainesosien käytön koko viikon ajalle (esim. puolikas kaalinpää kahteen ruokaan).

## 4. Käyttöliittymä

- **Onboarding enintään viidessä näytössä:** henkilömäärä (1/2), viikkobudjetti (liukusäädin), kauppa (logot), allergiat (valintasirut), ruokavalio (valintasirut). Ei vapaata tekstikenttää.
- **Päänäkymä:** "Tämän viikon ruoat" kuvakortteina. Yläreunassa budjettimittari, esim. "42 € / 50 €".
- **Reseptikortti:** kuva, hinta, aika ja makrot yhdellä rivillä. Ainesosat ja vaiheet numeroituina.
- **Ostoslista** kaupan osastojen mukaan ryhmiteltynä ja rastittavana.
- **Vaihda annos** -nappi jokaisessa kortissa.
- Iso fontti, vähän värejä ja yksi pääkehotus per näkymä. Saavutettavuus (dynaaminen tekstikoko, kontrastit) alusta asti.

## 5. Vaiheittainen toteutussuunnitelma

### Vaihe 0: Validointi (1–2 viikkoa)
- Kilpailija-analyysi (esim. Mealime, Eat This Much ja suomalaiset vaihtoehdot).
- Figma-prototyyppi ja 5–10 käyttäjähaastattelua kohderyhmälle.
- Promptin käsitestaus: tuottaako tekoäly järkeviä 1–2 hengen viikkolistoja annetulla budjetilla?
- Hinnoitteluhypoteesi, esim. 4,99 €/kk tai 34,99 €/v ja 7 päivän ilmainen kokeilu.

### Vaihe 1: MVP (6–8 viikkoa)
1. Projektipohja: Expo, Supabase (EU), CI ja EAS Build.
2. Fineli-tuonti ja oma ainesosataulu: noin 300 ainesosaa ja ketjukohtaiset hintakertoimet (alussa 3–4 ketjua).
3. Kirjautuminen (Apple, Google, sähköposti) ja onboarding.
4. `generate-plan`-funktio: Claude, allergiatarkistus, makrot, hinta ja budjettisilmukka.
5. Kuvageneraatio asynkronisesti ja välimuistiin. Odotellessa näytetään paikkamerkki.
6. Viikkonäkymä, reseptikortti, annoksen vaihto ja ostoslista.
7. RevenueCat: maksumuuri ja kokeilujakso.
8. Tietosuojaseloste, käyttöehdot, allergiavastuuvapaus ja tilin poisto (App Store vaatii).
9. Suljettu beta TestFlightissa ja Google Playn sisäisessä testauksessa 20–50 käyttäjällä.

**MVP:stä jätetään pois:** sosiaaliset ominaisuudet, reaaliaikaiset hinnat, ruokapäiväkirja, puettavien laitteiden integraatiot ja monikielisyys (vain suomi).

### Vaihe 2: Julkaisu ja oppiminen (4–6 viikkoa)
- Julkaisu kauppoihin ja kauppasivujen optimointi (ASO).
- Mittarit: aktivointi (ensimmäinen viikkolista valmis), kokeilusta maksavaksi, säilyvyys viikoilla 1 ja 4, generoinnin kustannus per käyttäjä.
- Palaute resepteistä (peukku ylös/alas), joka ohjaa tulevia generointeja.
- Hintataulun päivitysprosessi (esim. kuukausittainen tarkistus).

### Vaihe 3: Laajennukset
- Ruokahävikin minimointi: "mitä jääkaapissa on" -syöte.
- Tarkemmat hinnat: kuittiskannaus (OCR) tai kumppanuudet kauppaketjujen kanssa.
- Kotitalouden jakaminen kahden käyttäjän kesken.
- Ruotsin ja englannin kieli, myöhemmin muut Pohjoismaat.
- Ilmoitukset ("huomenna on kanapastaa, ota kana sulamaan").

## 6. Riskit ja kustannukset

| Riski | Toimenpide |
|---|---|
| Tekoäly- ja kuvakustannukset nousevat tilausmaksua suuremmiksi | Reseptien ja kuvien uudelleenkäyttö, generointien rajoitus (esim. X vaihtoa viikossa), kustannusseuranta per käyttäjä alusta asti |
| Hinta-arviot ovat epätarkkoja | Rehellinen nimeäminen ("arvio"), käyttäjien korjausehdotukset, hintataulun säännöllinen päivitys |
| Allergiavirhe | Sääntöpohjainen tarkistus jokaiselle reseptille, vastuuvapaus, allergeenien korostus reseptinäkymässä |
| Kaupan tarkastus hylkää sovelluksen | Sisäiset ostot oikein, tilin poisto mahdollinen, tietosuojaseloste kunnossa |
