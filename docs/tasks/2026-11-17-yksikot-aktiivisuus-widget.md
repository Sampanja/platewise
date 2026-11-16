Tallenna tämä ohje ensin tiedostoon docs/tasks/2026-11-17-yksikot-aktiivisuus-widget.md ja commitoi se. Lue docs/PROGRESS.md. Jos edellinen tehtävä (docs/tasks/2026-11-16-platepal-laajennus.md) on vielä kesken, viimeistele se ensin ja aloita tämä vasta sen jälkeen. Päivitä PROGRESS.md jokaisen osan jälkeen.

Lue CLAUDE.md, docs/ ja nykyinen koodi. Jos `adb devices` näyttää puhelimen, testaa jokainen osa release-APK:lla puhelimessa (`adb install -r`) ja kuvakaappauksin, ja korjaa ulkoasuvirheet ennen kuin jatkat. Kaikki uudet tekstit käännetään kaikille tuetuille kielille (fi, en, sv). Suorituskykyperiaatteet pysyvät voimassa.

## 1. Yksiköt: käyttäjä valitsee itse
Nyt yksiköt valitaan automaattisesti, ja käyttäjä voi päätyä esim. paunoihin osaamatta niitä. Korjaa niin, että käyttäjä valitsee jokaisen yksikön itse.

- **Valittavat yksiköt, jokainen erikseen:**
  - Paino: kg / lb / st+lb
  - Pituus: cm / ft+in
  - Ruoan määrät: grammat (g, kg) / unssit (oz, lb)
  - Nesteet: ml, dl, l / fl oz, cups
  - Energia: kcal / kJ
  - Lämpötila resepteissä: °C / °F
- **Onboarding:** heti kielen valinnan jälkeen oma selkeä näkymä "Yksiköt". Ensin kaksi isoa pikavalintaa: "Metrinen (kg, cm, g, ml, °C)" ja "Imperiaalinen (lb, ft, oz, cups, °F)". Lisäksi "Mukauta" avaa jokaisen yksikön erikseen. Oletuksena on alueen mukainen valinta (Suomi ja suurin osa maailmasta metrinen, Yhdysvallat imperiaalinen), mutta käyttäjä näkee ja vahvistaa sen aina itse. Jokaisessa vaihtoehdossa on esimerkki (esim. "70 kg" / "154 lb").
- **Profiili → Yksiköt:** samat valinnat, ja muutos päivittyy koko sovellukseen heti.
- **Syöttökentät:** jokaisessa paino-, pituus- ja määräkentässä yksikkö näkyy selkeästi. Painon ja pituuden syötössä on pieni yksikön vaihtokytkin (esim. kg | lb), jolla voi syöttää kerran eri yksikössä ilman, että asetus muuttuu.
- **Tekninen toteutus:** kaikki tallennetaan sisäisesti metrisinä (g, ml, kg, cm, kcal, °C), ja muunnos tehdään vain näytettäessä ja syötettäessä yhdessä keskitetyssä moduulissa (esim. domain/units.ts). Järkevä pyöristys (paino 0,1, kalorit kokonaisina, reseptimäärät käytännöllisiksi esim. ½ cup). Kattavat yksikkötestit muunnoksille ja pyöristyksille.
- Käy koko koodi läpi ja korvaa kaikki kovakoodatut yksiköt (esim. "g", "kg", "kcal" teksteissä ja muotoiluissa) keskitetyllä muotoilulla. Lisää lint-sääntö tai skripti, joka estää kovakoodatut yksiköt.
- Siirto: tallennettu tila säilyy, ja vanha automaattinen valinta muuttuu käyttäjän asetukseksi.

## 2. Aktiivisuus, työ ja koulu: paremmat vaihtoehdot ja esimerkit
Tavoite on, että jokainen löytää itseään kuvaavan vaihtoehdon helposti, myös koululaiset ja opiskelijat.

- Jaa aktiivisuus kolmeen selkeään kysymykseen, joista lasketaan kulutus yhdessä:
  1. **Päivän pääasiallinen tekeminen (työ tai koulu):** 5 tasoa. Jokaisen alla 4–6 konkreettista arkista esimerkkiä, esim.
     - Pääosin istuen: koululainen tai opiskelija (istut tunneilla), toimistotyö, etätyö, IT, asiakaspalvelu puhelimessa, kuljettaja
     - Istuen ja välillä liikkuen: opettaja, laboratoriotyö, kampaaja, apteekki, vastaanotto
     - Paljon seisten ja kävellen: myyjä tai kassa, tarjoilija, sairaanhoitaja, lähihoitaja, varastotyö, kokki
     - Fyysisesti raskas: rakennustyö, siivous, maanviljelys, muutto- tai kuljetustyö, hierojat
     - Erittäin raskas: raskas ruumiillinen työ koko päivän, metsätyö, ammattiurheilija
     Lisäksi erilliset vaihtoehdot: kotona lasten kanssa, eläkkeellä, työtön tai työnhakija, vuorotyö
     Lisää hakukenttä ("Kirjoita ammattisi tai tilanteesi"), joka ehdottaa oikeaa tasoa noin 100 yleisimmän ammatin ja tilanteen listasta kaikilla kielillä.
  2. **Arkiliikunta:** koulu- ja työmatkat (kävellen, pyörällä, autolla tai julkisilla, kesto), päivittäiset askeleet (en tiedä / alle 5 000 / 5 000–8 000 / 8 000–12 000 / yli 12 000) ja vapaa-ajan aktiivisuus (koiran ulkoilutus, pihatyöt jne.).
  3. **Treenit:** laji (kuntosali, juoksu, pyöräily, uinti, joukkuelajit, tanssi, jooga, kävelylenkit, kamppailulajit, muu), kerrat viikossa, kesto ja teho (kevyt / kohtalainen / rankka), selkein esimerkein (esim. "kohtalainen: hengästyt mutta pystyt puhumaan").
- Jokaisessa kysymyksessä on "En tiedä tai haluan ohittaa" -vaihtoehto, jolle käytetään järkevää oletusta ja kerrotaan, mikä se on.
- Näytä valintojen jälkeen yhteenveto: "Arvioitu kulutuksesi on noin X kcal/päivä", ja napautuksella selitys, mistä luku koostuu (perusaineenvaihdunta + arkiaktiivisuus + treenit).
- Turvarajat säilyvät ennallaan, myös alle 18-vuotiaiden sääntö (ei laihdutusvajetta).

## 3. Makrot ja ruokavaliotyylit: enemmän vaihtoehtoja
- **Ruokavaliotyylit**, jokaiseen lyhyt kuvaus "kenelle sopii" ja esiasetetut makrot: tasapainoinen, korkea proteiini, lihasmassan kasvatus, kestävyysurheilija, Välimeren ruokavalio, vähähiilihydraattinen, ketogeeninen (selkeä huomautus, että sopii vain osalle ja kannattaa keskustella ammattilaisen kanssa), kasvis, vegaani ja oma (täysin käsin).
- **Proteiinitaso:** valinta perustason, kohtalaisen ja korkean välillä (g/kg-pohjaisesti), selitykset mukana. Laihdutuksessa ja lihaskasvussa ehdotetaan automaattisesti korkeampaa.
- **Käsin säätö:** joko prosentteina tai grammoina (käyttäjä valitsee). Kun yhtä muuttaa, muut mukautuvat niin, että kokonaisenergia pysyy (paitsi jos käyttäjä lukitsee arvon). Rasvan alaraja (noin 20 % energiasta) ja proteiinin järkevä yläraja varoituksin.
- **Aterioiden jako (valinnainen):** montako ateriaa päivässä (2–6) ja jakauma (tasainen / isompi aamiainen / isompi päivällinen). Päiväkirja näyttää aterioittaiset tavoitteet, jos käytössä.
- Jokainen valinta selitetään lyhyesti selkokielellä, ja vaikutus kaloreihin ja makroihin näkyy heti esikatselussa.
- Yksikkötestit laskennalle.

## 4. Kotinäytön widget: täysin uusi, viimeistelty ulkoasu
Nykyinen widget näyttää tyhjältä ja keskeneräiseltä. Suunnittele se uudelleen niin, että se on yksi sovelluksen näyttävimmistä osista: täysi, hyvin järjestetty ja ammattimainen, Android 12+ Material You -widgettien tasoa.

- **Kolme kokoa**, jokaiselle oma suunniteltu asettelu (ei vain skaalattu):
  - **Pieni (2×2):** jäljellä olevat kalorit isona rengasmittarina keskellä, hahmo pienenä renkaan vieressä tai sisällä ja yksi pikanappi (kamera).
  - **Keskikokoinen (4×2):** vasemmalla kalorirengas (syöty / tavoite / jäljellä), oikealla proteiinin, hiilihydraattien ja rasvan palkit grammoineen, alhaalla rivi pikanappeja (kamera, puhu, viivakoodi, vesi +1) ja hahmo, jonka ilme vaihtuu päivän tilanteen mukaan.
  - **Iso (4×4):** edellisten lisäksi veden seuranta (lasit), putki ja päivän tehtävät, seuraava suunniteltu ateria kuvalla ja nimellä, sekä hahmon lyhyt päivän viesti omalla puhetyylillään.
- **Ulkoasu:** valitun hahmon teemavärit, vaalea ja tumma tila puhelimen asetuksen mukaan, pyöristetyt kulmat Androidin widget-standardin mukaan, tasapainoiset marginaalit, selkeä typografiahierarkia ja ei tyhjää turhaa tilaa. Sisältö skaalautuu siististi eri näytöillä ja launchereilla (testaa vähintään kaksi eri ruudukkokokoa).
- **Tyhjä tila:** jos päivälle ei ole vielä kirjauksia, widget ei näytä tyhjältä. Hahmo tervehtii ("Hyvää huomenta! Aloitetaanko aamiaisesta?") ja pikanapit ovat korostettuina.
- **Pikanapit** avaavat sovelluksen suoraan oikeaan näkymään (deep link): kamera, puhekirjaus, viivakoodi, vesi +1 (päivittyy suoraan widgetistä ilman sovelluksen avaamista, jos toteutettavissa luotettavasti).
- **Päivitys:** heti kun päiväkirjaan, veteen tai tavoitteisiin tulee muutos, keskiyöllä uuden päivän alkaessa ja kun teema tai kieli vaihtuu. Ei turhaa akun kulutusta.
- **Esikatselukuva** Androidin widget-valikkoon jokaiselle koolle, jotta widget näyttää houkuttelevalta jo valittaessa.
- Kaikki tekstit käännetty, ja yksiköt seuraavat käyttäjän valintoja (kcal / kJ, ml / fl oz).
- **Testaus:** pyydä minua lisäämään widget kotinäytölle, kun se on asennettu, ja odota vahvistustani. Ota sitten kuvakaappaukset jokaisesta koosta vaaleassa ja tummassa tilassa, sekä tyhjänä että täytenä päivänä, ja hio asettelu, kunnes se on viimeistelty. Tallenna lopulliset kuvakaappaukset docs/widget/-kansioon.

## 5. Dokumentaatio
Päivitä PLAN.md, DATA_MODEL.md ja CLAUDE.md: yksikköjärjestelmä (sisäisesti metrinen, keskitetty muunnos, ei kovakoodattuja yksiköitä), aktiivisuuden kolme osaa ja ammattilista, ruokavaliotyylit ja makroasetukset, aterioiden jako ja widgetin koot ja sisältö.

## Toimintatapa
1. Järjestys: yksiköt → aktiivisuus → makrot ja ruokavaliotyylit → widget → dokumentaatio.
2. Jokaisen osan jälkeen: tyyppitarkistus, lint, testit, `npm run apk`, puhelintestaus (jos adb toimii), PROGRESS.md:n päivitys, commit ja push.
3. Tee itse järkevät päätökset äläkä pysähdy kysymään (paitsi widgetin lisäämisessä kotinäytölle, jossa tarvitset minua). Kirjaa päätökset loppuraporttiin.
4. Loppuraportti: mitä tehtiin, mitä testata puhelimella, uudet paketit ja avoimet kysymykset.
