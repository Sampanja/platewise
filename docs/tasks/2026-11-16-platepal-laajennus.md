# PlatePal-laajennus (2026-11-16)

Tallenna tämä ohje ensin tiedostoon docs/tasks/2026-11-16-platepal-laajennus.md ja commitoi se. Jos docs/PROGRESS.md ei ole olemassa, luo se ja lisää CLAUDE.md:hen ohje: "Lue docs/PROGRESS.md jokaisen keskustelun alussa ja päivitä se ennen jokaista committia (mitä tehtiin, mikä on kesken, seuraava askel)." Päivitä PROGRESS.md jokaisen alla olevan osan jälkeen. Jos työ katkeaa, jatketaan siitä.

Lue sitten CLAUDE.md, docs/ ja nykyinen koodi. Olemme yhä käyttöliittymävaiheessa: testidata ja paikallinen tallennus. Kaikki tekoälyä vaativa (kuvatunnistus, vapaan tekstin tulkinta, reseptien generointi) rakennetaan services/-kerroksen taakse niin, että oikea toteutus (Supabase Edge Function + Claude API) kytketään seuraavassa vaiheessa muuttamatta näkymiä. Jos `adb devices` näyttää puhelimen, testaa jokainen osa release-APK:lla puhelimessa (`adb install -r`) ja kuvakaappauksin, ja korjaa ulkoasuvirheet ennen kuin jatkat.

Yleiset säännöt koko työlle:
- Kaikki uudet tekstit käännetään kaikille tuetuille kielille (fi, en, sv), myös hahmojen repliikit.
- Suorituskykyperiaatteet pysyvät: tarkat Zustand-selektorit, ei staattista dataa persistiin, virtualisoidut listat, memoisoidut laskennat, optimistiset käyttöliittymäpäivitykset.
- Allergia- ja ruokavaliosuodatus (isRecipeAllowed) koskee kaikkia uusia reseptiehdotuksia.
- Ei kuolleita nappeja. Kaikki säilyy uudelleenkäynnistyksen yli. Tyhjät tilat, latausnäkymät ja virheilmoitukset kaikkialla.
- Sovelluksen pitää pysyä selkeänä: jokaisella ominaisuudella on yksi looginen paikka, eikä mitään piiloteta syvälle valikoihin.

## 1. Nimenvaihto: Platewise → PlatePal
- Vaihda nimi kaikkialle: sovelluksen näkyvä nimi, app.json (name, slug, scheme), Android-paketti com.sampanja.platepal, käännöstiedostot, hahmojen repliikit, Tietoja-sivu, ilmoitukset, dokumentaatio (CLAUDE.md, docs/), README, package.json:n name ja koodin kommentit. Kirjoitusasu on aina "PlatePal".
- Tarkista koko repo hakemalla "platewise" (kirjainkoosta riippumatta) ja korjaa kaikki osumat. Jätä vain levyllä olevan kansion nimi ennalleen.
- Kerro raportissa, että käyttäjän pitää poistaa vanha sovellus puhelimesta ennen uuden asentamista.

## 2. Tietoarkkitehtuuri: kaikki selkeästi paikoilleen
Järjestä sovellus näin (saat hioa, jos löydät selvästi paremman ratkaisun, mutta perustele se raportissa):
- **Alapalkki:** Koti, Reseptit, keskellä ＋, Päiväkirja, Profiili.
- **Keskimmäinen ＋-nappi** avaa tyylikkään pikatoimintopaneelin (bottom sheet), jossa on selkeät isot valinnat:
  - Kirjaa ateria: Kuva / Puhu / Kirjoita / Viivakoodi / Hae
  - Skannaa jääkaappi tai kaappi
  - Tee ruokalista (nykyinen Suunnittele-kysely)
  - Lisää paino
- **Reseptit-välilehti:** yläreunassa segmentit Kirjasto | Varastosta (mitä voin tehdä nyt) | Suosikit | Omat (tuodut reseptit). Reseptin tuonti linkistä löytyy täältä.
- **Ruokavarasto:** oma näkymä, johon pääsee Kodista (kortti "Varastossa X tuotetta, Y vanhenee pian") ja Reseptit → Varastosta -segmentistä.
- **Päiväkirja-välilehti:** yläreunassa segmentit Tänään | Raportit. Hivenaineet ja laatuarvio näkyvät päivänäkymässä ja raporteissa.
- **Profiili:** asetukset, tavoitteet, hahmo ja teema, kieli, yksiköt, widget-ohje, tietosuoja.

## 3. Jääkaappi- ja kaappiskannaus + Ruokavarasto
- **Skannaus:** kameranäkymä, jossa ohje ("kuvaa hyllyt niin, että tuotteet näkyvät"). Voi ottaa useamman kuvan (esim. jääkaappi + kuivakaappi). Tunnistusanimaatio.
- **Tarkistusnäkymä (pakollinen):** tunnistetut raaka-aineet listana. Jokaisen voi poistaa, korjata (vaihda tuote ainesosataulusta) ja säätää määrää (arvio: vähän / puolet / paljon tai tarkka määrä), ja puuttuvia voi lisätä. Merkintä "arvio". Testidatalla nyt, services/pantryRecognition.ts:n taakse. Tunnistus palauttaa vain ainesosataulun tunnisteita.
- **Ruokavarasto:** pysyvä lista kotona olevista raaka-aineista. Lisäys kuvalla, viivakoodilla, haulla tai käsin. Valinnainen parasta ennen -päivä ja kategoria (jääkaappi, pakastin, kuivakaappi). Ostoslistalla rastitetut tuotteet voi siirtää varastoon yhdellä napautuksella. Kun resepti merkitään tehdyksi, sen ainekset vähennetään varastosta (käyttäjä voi korjata).
- **"Mitä voin tehdä" -ehdotukset:** etsi ensin reseptikirjastosta reseptit, joiden ainekset löytyvät varastosta. Ryhmittele: "Voit tehdä heti" ja "Puuttuu 1–2 ainesosaa" (puuttuvat näkyvät, ja ne voi lisätä ostoslistaan). Järjestys: ensin vanhenemassa olevia aineksia käyttävät reseptit. Jos sopivia on vähän, nappi "Luo resepti näistä aineksista" (services/recipeGeneration.ts, nyt testidatalla).
- **Muistutus:** paikallinen ilmoitus, kun tuote vanhenee pian, ja reseptiehdotus ("Kerma vanhenee huomenna, kokeile näitä"). Käyttäjä voi kytkeä sen pois.
- Perusvarat (öljy, suola jne.) huomioidaan aina saatavilla oleviksi.

## 4. Hahmot: 5–6 kansainvälistä, laadukasta hahmoa
- Korvaa nykyiset hahmot 5–6 uudella, jotka tunnetaan kaikkialla maailmassa. Ehdotus: avokado, tomaatti, porkkana, sitruuna, mustikka ja punajuuri Nuppu (pidä Nuppu, jos se sopii joukkoon). Saat ehdottaa parempia, kunhan ne ovat kansainvälisesti tunnettuja ruokia.
- Jokaisella hahmolla: nimi, joka toimii kaikilla kielillä (helppo lausua, ei kielikohtaisia merkityksiä), selvästi erottuva siluetti, oma persoona ja puhetyyli (esim. rauhallinen, energinen, hauska, napakka, lempeä) ja oma väripaletti vaalealle ja tummalle tilalle (AA-kontrastit automaattisella testillä).
- Paranna laatua selvästi: yhtenäinen, viimeistelty piirrostyyli, ilmeikkäät kasvot, sulavat tila-animaatiot (perus, iloinen, miettivä, juhliva, kokkaava, kannustava, uninen) ja pienet elävöittävät liikkeet (räpytys, hengitys). Animaatiot pysähtyvät, kun hahmo ei näy.
- Valintanäkymä onboardingissa ja Profiilissa: koko teema vaihtuu animoidusti selatessa.
- Siirto: jos tallennetussa tilassa on poistettu hahmo, valitse lähin vastaava ja näytä käyttäjälle kerran ilmoitus.
- Päivitä docs/MASCOT.md: hahmojen kuvaukset, persoonat, paletit ja tarkka lista tiedostoista (koot, tilat, formaatit), jotta lopulliset hahmot voi teettää kuvittajalla.

## 5. Puhe- ja tekstikirjaus
- **Puhu:** mikrofoni-nappi, puheentunnistus laitteella (esim. expo-speech-recognition tai vastaava, joka toimii Androidilla ja iOS:llä, kieli sovelluksen kielen mukaan). Tunnistettu teksti näkyy reaaliajassa.
- **Kirjoita:** vapaa tekstikenttä, esim. "kaksi ruisleipää juustolla ja kahvi maidolla".
- **Tulkinta:** services/foodTextParser.ts. Tee nyt paikallinen perustulkinta (määrät, yleiset yksiköt kuten kpl/viipale/dl/g, ainesosataulun sumea haku kaikilla kielillä) ja rakenna niin, että tekoäly korvaa tai täydentää sen backend-vaiheessa.
- **Tulos:** sama tarkistusnäkymä kuin kuvatunnistuksessa (ruoat, määrät, kcal ja makrot, muokattavissa) ja aterian valinta (aamiainen, lounas, päivällinen, välipala; oletus kellonajan mukaan).

## 6. Hivenaineet
- Laajenna ainesosataulu Finelin hivenaineilla: vähintään kuitu, sokeri, suola, tyydyttyneet rasvat, D-vitamiini, C-vitamiini, B12, folaatti, rauta, kalsium, kalium, magnesium ja sinkki.
- Saantisuositukset iän ja sukupuolen mukaan (pohjoismaiset ravitsemussuositukset), lähde mainittuna Tietoja-sivulla.
- Päiväkirjassa hivenaineet erillisessä "Ravintoaineet"-osiossa (palkit suhteessa suositukseen). Resepteissä hivenaineet laajennettavassa osiossa.
- Sävy on neutraali ja informatiivinen. Ei hälytyksiä, vaan esim. "D-vitamiinia saa erityisesti kalasta ja täydennetyistä maitotuotteista".

## 7. Ruoan laatuarvio
- Läpinäkyvä, dokumentoitu laatuarvio asteikolla A–E (esim. Nutri-Scoren periaatteisiin pohjautuva oma laskenta: kuitu, proteiini, kasvikset, sokeri, suola, tyydyttyneet rasvat). Kirjoita laskentatapa docs/QUALITY_SCORE.md:hen.
- Näkyy resepteissä, kirjatuissa ruoissa ja viivakoodituotteissa (Open Food Factsin Nutri-Score käytetään, jos se on saatavilla), sekä päivän kokonaisarvio Päiväkirjassa.
- "Miksi tämä arvio?" -selitys napautuksella. Arvio ei koskaan syyllistä. Hahmo voi ehdottaa ystävällisesti parempaa vaihtoehtoa.
- Yksikkötestit laskennalle.

## 8. Viikko- ja kuukausiraportit
- Päiväkirja → Raportit: valinta Viikko | Kuukausi ja selaus taaksepäin.
- Sisältö: kalorit ja makrot keskimäärin vs. tavoite (kaavio), painon trendi (liukuva keskiarvo), laatuarvion jakauma, hivenaineiden keskiarvot, kirjauspäivät ja putki, veden juonti, kokatut reseptit, ruokalistojen säästöt ja varastosta käytetyt ainekset (hävikin vähennys).
- **Hahmon yhteenveto:** 2–3 lyhyttä havaintoa ja yksi konkreettinen ehdotus hahmon omalla puhetyylillä (nyt sääntöpohjaisesti, myöhemmin tekoälyllä services/insights.ts:n kautta).
- Valinnainen ilmoitus, kun uusi viikkoraportti valmistuu (esim. maanantaiaamuna).
- Raportin voi jakaa kuvana.

## 9. Kotinäytön widget (Android ensin)
- Android-widget (esim. react-native-android-widget tai vastaava Expo-yhteensopiva ratkaisu, config pluginin kautta): päivän kalorit ja makrot rengasmittarina, valitun hahmon pieni kuva ja teemavärit, sekä pikanapit "Kirjaa kuvalla" ja "Puhu", jotka avaavat sovelluksen suoraan oikeaan näkymään (deep link).
- Widget päivittyy, kun päiväkirjaan lisätään merkintä.
- Kirjaa docs/PLAN.md:hen iOS-widgetin toteutussuunnitelma myöhempää varten.
- Profiiliin lyhyt ohje widgetin lisäämisestä kotinäytölle.

## 10. Reseptin tuonti linkistä
- Reseptit → Omat → "Tuo linkistä": liitä URL (myös jakovalikosta Androidin share intentillä, jos toteutettavissa järkevästi).
- Hae sivu ja lue resepti ensisijaisesti sivun schema.org/Recipe JSON-LD -datasta (nimi, annokset, ainesosat, vaiheet, ajat). Jos sitä ei ole, näytä selkeä viesti ja tarjoa käsin syöttö (tekoälytulkinta tulee backend-vaiheessa services/recipeImport.ts:n kautta).
- Yhdistä ainesosat ainesosatauluun sumealla haulla. Epävarmat osumat käyttäjä vahvistaa tarkistusnäkymässä. Laske makrot, hivenaineet, laatuarvio, allergeenit ja hinta-arvio kuten muissakin resepteissä.
- Tuodut reseptit ovat vain käyttäjän omia (ei jaeta muille), ja lähdelinkki näkyy reseptissä. Älä tallenna sivun kuvia, vaan käytä kategoriakuvitusta.
- Jos tuotu resepti sisältää käyttäjän allergeeneja, näytä selkeä varoitus.

## 11. Dokumentaatio
Päivitä PLAN.md, DATA_MODEL.md, GENERATION.md, MASCOT.md ja CLAUDE.md: uusi nimi, tietoarkkitehtuuri, Ruokavarasto, skannaus, puhe- ja tekstikirjaus, hivenaineet, laatuarvio, raportit, widget ja reseptituonti. Lisää GENERATION.md:hen backend-vaiheen suunnitelma uusille tekoälytoiminnoille (jääkaappitunnistus, tekstin tulkinta, reseptin tuonnin tulkinta, raporttien oivallukset): promptit, JSON-skeemat, mallivalinnat, kustannusrajat ja turvallisuus.

## Toimintatapa
1. Järjestys: nimenvaihto → tietoarkkitehtuuri ja ＋-paneeli → hahmot → Ruokavarasto ja skannaus → puhe- ja tekstikirjaus → hivenaineet → laatuarvio → raportit → reseptituonti → widget → dokumentaatio.
2. Jokaisen osan jälkeen: tyyppitarkistus, lint, testit, `npm run apk`, puhelintestaus (jos adb toimii), PROGRESS.md:n päivitys, commit ja push.
3. Tee itse järkevät päätökset äläkä pysähdy kysymään. Kirjaa päätökset loppuraporttiin.
4. Loppuraportti: mitä tehtiin, hahmojen lista, tietoarkkitehtuurin lopullinen muoto, uudet paketit, mitä testata puhelimella ja avoimet kysymykset.
