# Edistyminen

Lue tämä jokaisen keskustelun alussa ja päivitä ennen jokaista committia.

## Käynnissä oleva tehtävä

[Yksiköt, aktiivisuus, makrot ja widget](tasks/2026-11-17-yksikot-aktiivisuus-widget.md), osat 1–5.

| Osa | Tila |
| --- | --- |
| 1. Yksiköt | valmis |
| 2. Aktiivisuus | valmis |
| 3. Makrot ja ruokavaliotyylit | valmis |
| 4. Widget | koodi valmis, kotinäyttötesti odottaa käyttäjän vahvistusta |
| 5. Dokumentaatio | valmis (PLAN.md, DATA_MODEL.md, CLAUDE.md) |

### Mitä tehtiin (2026-11-17)

- Osa 1 (yksiköt): käyttäjä valitsee kuusi yksikköä erikseen: paino kg / lb / st+lb, pituus cm / ft+in, ruoan määrät g / oz, nesteet ml-dl-l / fl oz ja kupit, energia kcal / kJ, lämpötila °C / °F (`domain/units.ts`: muunnokset, pyöristykset, esiasetukset, alueen oletus, testattu). Muotoilu yhdessä paikassa `lib/amounts.ts` (formatEnergy, formatGrams, formatBodyWeight, formatTemperature, localizeTemperatures, kenttien muunnokset). Onboardingissa kielen jälkeen Yksiköt-näkymä (`features/settings/UnitsStep.tsx`): Metrinen / Imperiaalinen ja Mukauta, jokaisessa esimerkki; sama editori Profiili → Yksiköt (`UnitsEditor.tsx`). Painon ja pituuden syötössä kertakäyttöinen yksikkökytkin (`components/ui/UnitToggle.tsx`), energiakentät kcal/kJ (`features/shared/EnergyField.tsx`), määräkentät g/oz (oma ruoka, oma ateria, varasto, reseptituonti). Reseptien lämpötilat kirjoitettu muotoon "200 °C" (fi "°C:ssa", sv "°C"); ohjeiden lämpötilat ja määrät näytetään valituilla yksiköillä (`localizeRecipeText`: "2 dl" → "¾ kuppia", "200 °C" → "400 °F"). Puhekirjaus ymmärtää myös oz ja lb. Profiili v10: vanha metric/imperial (tai alueen automaattinen valinta) muuttuu käyttäjän omaksi asetukseksi (`withUnitPrefs`, testattu). Lint-sääntö `platepal/no-hardcoded-units` ja `i18n/units.test.ts` estävät kovakoodatut yksiköt koodissa ja käännöksissä.
- Osa 2 (aktiivisuus): kolme kysymystä laskurissa (`features/calculator/ActivitySteps.tsx`, laskenta `domain/activity.ts`, testattu). 1) Työ tai koulu: viisi tasoa arkiesimerkein (koululainen ja opiskelija ensimmäisessä), tilanteet (kotona lasten kanssa, eläkkeellä, työtön, vuorotyö) ja haku noin 107 ammatista ja tilanteesta kaikilla kielillä (`domain/occupations.ts`, nimet `i18n/<kieli>Activity.ts`, `features/calculator/occupationSearch.ts`). 2) Arkiliikunta: työ- ja koulumatka (tapa ja kesto), askeleet viitenä vaihtoehtona, vapaa-ajan liike (koira, piha, kotityöt, lapset, remontti). 3) Treenit: 10 lajia, kerrat, kesto ja teho (kevyt / kohtalainen / rankka esimerkein, MET lajin ja tehon mukaan). Jokaisessa kysymyksessä "En tiedä tai haluan ohittaa" ja käytetty oletus näkyy. Yhteenveto "Arvioitu kulutuksesi on noin X päivässä" ja napautuksella erittely (perusaineenvaihdunta + arkiaktiivisuus + treenit, ohitetut kohdat). Profiili v11 siirtää vanhat tiedot (työtaso, askeleet → askelväli, treenit ilman tehoa → kohtalainen, viikkokerrat → "muu laji" vain jos laskuria on käytetty).
- Osa 3 (makrot): `domain/macros.ts` (testattu): kymmenen ruokavaliotyyliä esiasetetuin makroin ja "kenelle sopii" -kuvauksin (tasapainoinen, korkea proteiini, lihasmassan kasvatus, kestävyysurheilija, Välimeren, vähähiilihydraattinen, ketogeeninen huomautuksella, kasvis, vegaani, oma), proteiinitaso perus / kohtalainen / korkea (1,0 / 1,4 / 1,8 g/kg viitepainosta, kasvistyyleissä +10 %, laihdutuksessa ja lihaskasvussa suositus korkea), käsisäätö prosentteina tai grammoina lukituksin (muut mukautuvat, kokonaisenergia pysyy), varoitukset (rasva alle 20 %, proteiini yli 2,2 g/kg, keto). Aterioiden jako (2–6 ateriaa, tasainen / isompi aamiainen / isompi päivällinen) laskurin omana vaiheena; päiväkirja näyttää aterioittaiset tavoitteet. Laskurin vaiheet `features/calculator/MacroSteps.tsx`. Profiili v12 (plant → kasvis, käsin säädetyt → oma).
- Osa 4 (widget): kolme kokoa omilla asetteluillaan (`features/widget/widgets.tsx`): pieni 2 × 2 (jäljellä oleva energia renkaana, hahmo renkaan sisällä, kamerapikanappi), keskikokoinen 4 × 2 (rengas syöty / tavoite, jäljellä, makrot palkkeina, hahmon ilme, pikanapit kamera, puhe, viivakoodi, vesi +1) ja iso 4 × 4 (lisäksi hahmon viesti, vesilasit, putki ja tehtävät, seuraava päivällinen). Tilannekuva v2 (`snapshot.ts`) sisältää raakaluvut, kielen, yksiköt ja teemavärit vaalealle ja tummalle; `model.ts` (testattu) muotoilee tekstit piirrettäessä, joten kellonajan tervehdys ja päivän vaihtuminen toimivat sovelluksen ollessa kiinni. Vesi +1 lisää lasillisen suoraan taustatehtävässä. `WidgetSync.tsx` päivittää widgetit muutoksista 0,8 s:n viiveellä. Hahmojen ilmeet (6 × 6) ja kuvakkeet generoidaan `scripts/widget/generate-widget-art.gen.tsx`:llä. Esikatselukuvat widget-valikkoon englanniksi, suomeksi ja ruotsiksi (`assets/widget/`, kieliversiot ja kuvaukset config pluginilla `plugins/withWidgetTranslations.js`). Profiilin widgettiohje näyttää jokaisen koon esikatseluna ja lisää valitun koon kotinäytölle.
- Osa 5 (dokumentaatio): PLAN.md 4.7 (aktiivisuus, makrot, aterioiden jako), 4.11 (yksiköt), 4.17 (widget); DATA_MODEL.md (yksikkökentät, aktiivisuus, makrokentät, päätökset 34–36); CLAUDE.md (yksikkö-, widget- ja aktiivisuus/makrosäännöt).

- README.md kirjoitettu uudelleen englanniksi High Up -arvioijille (yhden lauseen kuvaus, ongelma ja ratkaisu, tila, teknologiat, demo- ja APK-linkkien paikat, roadmap, yhteystieto). Salaisuustarkistus (git grep + historia): ei avaimia, salasanoja eikä .env-tiedostoja.

### Kesken

- README: täytä demovideon ja APK:n linkit ("LINK TO BE ADDED").
- Widgetin testaus kotinäytöllä: käyttäjä lisää widgetit, sitten kuvakaappaukset jokaisesta koosta (vaalea/tumma, tyhjä/täysi päivä) ja hionta, lopulliset kuvat `docs/widget/`.

## Edellinen tehtävä (valmis)

[PlatePal-laajennus](tasks/2026-11-16-platepal-laajennus.md), osat 1–11.

| Osa | Tila |
| --- | --- |
| 1. Nimenvaihto | valmis |
| 2. Tietoarkkitehtuuri ja ＋-paneeli | valmis (Varastosta, Puhu, Kirjoita ja Skannaa lisätään osissa 3 ja 5) |
| 3. Hahmot (tehtävän osa 4) | valmis |
| 4. Ruokavarasto ja skannaus (osa 3) | valmis |
| 5. Puhe- ja tekstikirjaus | valmis |
| 6. Hivenaineet | valmis |
| 7. Laatuarvio | valmis |
| 8. Raportit | valmis |
| 9. Reseptituonti (osa 10) | valmis |
| 10. Widget (osa 9) | valmis (Android; iOS-suunnitelma PLAN.md 4.17) |
| 11. Dokumentaatio | valmis |

## Mitä tehtiin

- Tehtäväohje tallennettu, PROGRESS.md luotu.
- Osa 1: nimi PlatePal kaikkialla (app.json, paketti com.sampanja.platepal, scheme platepal, tallennusavaimet platepal:, i18n, docs, README).
- Osa 2: alapalkki Koti · Reseptit · ＋ · Päiväkirja · Profiili. ＋ avaa pikatoimintopaneelin (features/quick/QuickActions.tsx). Suunnittele on nyt näkymä /plan (otsikko Ruokalista). Reseptit-välilehdellä segmentit Kirjasto | Suosikit | Omat, Päiväkirjassa Tänään | Raportit (features/reports/ReportsView.tsx). Uusi komponentti components/ui/Segmented.tsx, uudet tekstit i18n/<kieli>Kitchen.ts.
- Osa 4 (hahmot): kuusi hahmoa nuppu, avo, tomo, karo, lemo, blu (theme/characters.ts, i18n/<kieli>Characters.ts). Uusi piirrostyyli (CharacterSvg.tsx: liukuvärisävytys, kiilto, kulmakarvat, kädet joiden asento kertoo tilan). Mascot.tsx: pop tilan vaihtuessa, hengitys ja räpytys, pysähtyy kun näkymä ei ole fokuksessa tai sovellus taustalla. Siirto domain/characterMigration.ts (profiili v9, ilmoitus kerran Kodissa). MASCOT.md päivitetty kuvittajan tiedostolistalla.
- Osa 3 (Ruokavarasto): store data/stores/pantry.ts (yksi rivi per ainesosa, tehdyt reseptit), logiikka domain/pantry.ts (testattu: ehdotukset, vähennys, muistutusten ajoitus), sumea haku kaikilla kielillä domain/fuzzy.ts + data/catalog/search.ts. Näkymät /pantry, /pantry-scan (useita kuvia), /pantry-review (pakollinen tarkistus), Reseptit → Varastosta (features/pantry/PantrySuggestionsView.tsx), Kodin varastokortti, ＋-paneelin skannausrivi, ostoslistalta varastoon, reseptisivun Tein tämän -arkki (vähennys + kumoa), vanhenemisilmoitus services/pantryReminders.ts (napautus avaa Varastosta). Palvelut services/pantryRecognition.ts ja services/recipeGeneration.ts testidatalla.
- Osa 5 (puhe ja teksti): /log-text (Puhu: expo-speech-recognition laitteella sovelluksen kielellä, teksti näkyy reaaliajassa; Kirjoita: vapaa teksti). Tulkinta domain/foodText.ts (määrät, yksiköt, numerosanat ja koot fi/en/sv, adessiivi "juustolla" omana ruokana, with/med) + services/foodTextParser.ts (sumea haku ruokalistaan kaikilla kielillä, kokonainen fraasi ensin). Tulos samaan tarkistusnäkymään kuin kuva (photo.tsx source=text) aterian valinnalla.
- Osa 6 (hivenaineet): Fineli-tuonti laajennettu (tyydyttynyt rasva, D, C, B12, folaatti, rauta, kalsium, kalium, magnesium, sinkki; scripts/fineli). Päiväkirjan testiruoille lähin Fineli-ruoka scripts/fineli/match-foods.mjs + food-overrides.json → foodFineli.generated.ts. Suositukset NNR2023 domain/nutrients.ts (testattu), Päiväkirjan Ravintoaineet-kortti, reseptin laajennettava osio, lähde Lähteet-sivulla.
- Osa 7 (laatuarvio): domain/qualityScore.ts (Nutri-Scoren periaatteet, oma laskenta, testattu), data/catalog/quality.ts (reseptit, ruoat, kasvisosuuden lista), features/quality (merkki, Miksi tämä arvio? -arkki hahmon vinkillä tai paremmalla reseptillä, päivän arvio, kirjausten merkit). Open Food Factsin Nutri-Score tuotteille. docs/QUALITY_SCORE.md.
- Osa 8 (raportit): Päiväkirja → Raportit (Viikko | Kuukausi, selaus taaksepäin), domain/periodReport.ts (testattu), hahmon yhteenveto services/insights.ts (sääntöpohjainen, testi kieltää kalori-, paino- ja laihdutussanat), jako kuvana (react-native-view-shot + expo-sharing), viikkoraportti-ilmoitus maanantaisin klo 9.
- Osa 9 (widget): react-native-android-widget, index.js rekisteröi taustatehtävän, features/widget (tilannekuva, rengas-SVG, hahmojen SVG:t generoitu scripts/widget/generate-mascots.gen.tsx), pikanapit deep linkeillä, Profiilissa ohje ja Lisää kotinäytölle.
- Osa 10 (reseptituonti): /import-recipe (linkki tai käsin), /import-review (yhdistäminen ainesosatauluun), /imported/[id]; JSON-LD-jäsennys domain/recipeImport.ts (testattu), services/recipeImport.ts, varoitus käyttäjän allergeeneista kaikilla kielillä. Allergeenien avainsanoihin lisättiin taivutusvartalot (maido-, pähkinö-, rukii-, lohta, sinapi-).
- Osa 11 (dokumentaatio): PLAN.md (navigaatio ja 4.13–4.18, iOS-widgetin suunnitelma), DATA_MODEL.md (luku 7, app_config-avaimet, päätökset 27–33), GENERATION.md (kohdat 19–23), MASCOT.md, QUALITY_SCORE.md, CLAUDE.md.

## Kesken

- Ei mitään. Laajennustehtävä on tehty.

## Seuraava askel

- Puhelintestaus oikealla laitteella (puhe, kamera, widget, ilmoitukset), sitten backend-vaihe (GENERATION.md 19–22).

## Päätökset

- (2026-11-17) Ravintoaineet ja makrot ovat aina grammoina (myös imperiaalisilla yksiköillä), kuten ravintoarvomerkinnöissä; ravintoarvotaulukot ovat 100 g kohden. Ruoan *määrät* seuraavat valintaa (g / oz).
- (2026-11-17) Iso-Britannian oletus: grammat ja millilitrat, mutta paino stoneina ja pituus jalkoina. Yhdysvallat imperiaalinen, muut metrinen. Imperiaalinenkin pikavalinta käyttää kilokaloreita (myös USA:n merkinnöissä).
- (2026-11-17) °F-pyöristys: uunilämmöt (≥ 100 °C) lähimpään 25 °F (200 °C → 400 °F), ruoan sisälämmöt lähimpään 5 °F (75 °C → 165 °F), jotta ruokaturvallisuusrajat pysyvät oikeina.
- (2026-11-17) Yksikön vaihto profiilissa tallentuu heti ja päivittää koko sovelluksen samalla tavalla kuin kielen vaihto (näkymät renderöidään uudelleen).
- (2026-11-17) Kulutus = BMR × arkitaso + työmatka + vapaa-ajan liike + treenit (net MET), enintään 2,5 × BMR. Askeleet nostavat arkitasoa mutta eivät laske raskaan työn tasoa; kun askeleet tiedetään, kävelymatkoja ja koiralenkkejä ei lisätä erikseen (pyöräily lisätään). Työmatka 5 päivänä viikossa. Ohitettu työkysymys = "Istuen ja välillä liikkuen".
- (2026-11-17) Tilanteiden tasot: kotona lasten kanssa ja vuorotyö = paljon seisten ja kävellen, eläkkeellä ja työtön = istuen ja välillä liikkuen; käyttäjä näkee tason ja voi vaihtaa sen.
- (2026-11-17) Makrotyylit: proteiini ensin (g/kg viitepainosta, viitepaino enintään BMI 25:n paino), sitten tyylin rasva-osuus, hiilihydraatit loput; vähähiilihydraattinen 25 % (vähintään 100 g), keto enintään 30 g. Proteiinia leikataan, jos rasva painuisi alle 20 % tai hiilihydraatit alle tyylin rajan. Oma tyyli skaalautuu, jos kaloritavoite muuttuu (osuudet säilyvät).
- (2026-11-17) Aterioiden jako: 2 = aamiainen + päivällinen, 3 = + lounas, 4–6 = lisäksi 1–3 välipalaa (päiväkirjan Välipalat-ryhmään). Tasaisessa jaossa kaikki yhtä suuria; muissa välipalat puolikkaita ja iso ateria 1,6-kertainen.
- (2026-11-17) Widgetin esikatselukuvat tehdään sovelluksen omista WidgetPreview-kuvakaappauksista (englanti kcal, tasapainoinen päivä), jotta ne vastaavat oikeaa widgettiä.
- (2026-11-17) Widget muotoilee tekstit itse piirrettäessä tilannekuvan kielellä ja yksiköillä, joten taustapäivitys ei tarvitse sovellusta.
- (2026-11-17) Reseptituonnin tarkistusnäkymä näyttää nyt unssit oz-käyttäjille (edellisen tehtävän avoin kysymys).

- Osat 8 ja 9 commitoitiin yhdessä, koska ne jakavat natiivipaketit ja sovelluksen entry-tiedoston (index.js).
- Androidin share intent jätettiin pois (vaatisi lisänatiivilaajennuksen); linkin voi liittää leikepöydältä.
- Raportin jakokuva sisältää vain raportin osan, ei navigaatiota.
- Laatuarvion värit A vihreä → E harmaa, ei punaista. Kirjain aina päätekstivärillä kontrastin vuoksi. Piilota kalorit piilottaa myös kirjauskohtaiset merkit.
- Hivenaineiden suositukset NNR2023: tuntematon sukupuoli käyttää korkeampaa arvoa, alle 18-vuotiaille 18–24-vuotiaiden arvot. Sokereille ei näytetä tavoitetta (luku sisältää luontaiset sokerit). Ravintoainekortti on oletuksena suljettu, jotta Päiväkirja pysyy selkeänä.
- Puheentunnistus: expo-speech-recognition (Androidin ja iOS:n oma tunnistus, ei ääntä sovellukselle). expo-image-picker esti aiemmin RECORD_AUDIO-luvan (microphonePermission false), joten asetus vaihdettiin.
- Ruokavarastossa on yksi rivi per ainesosa (lisäys yhdistää). Karkea määrä on osuus pakkauksesta (vähän 20 %, puolet 50 %, paljon koko pakkaus), jotta sitä voi verrata reseptin grammoihin.
- Varastosta-ehdotus vaatii, että resepti käyttää vähintään yhtä varaston ainesta; "puuttuu 1–2" vaatii vähintään kaksi. Perusvarat (profiilin lista) ovat aina saatavilla.
- Vanhenemismuistutus tulee parasta ennen -päivää edeltävänä aamuna klo 9, yksi ilmoitus per päivä, enintään 5 päivää kerrallaan. Ilmoituslupaa pyydetään vasta, kun käyttäjä asettaa ensimmäisen päivämäärän.
- Viivakoodilla lisätty tuote yhdistetään ainesosaan nimen sumealla haulla; epävarma osuma avaa haun esitäytettynä.
- Hahmonimet: Nuppu säilyi (alkuperäinen oletushahmo, lempeä merkitys). Muut kaksitavuisia ja merkityksettömiä fi/en/sv: Avo, Tomo, Karo, Lemo, Blu. Kantarelli ja ruisleipä poistuivat, koska ne eivät ole kansainvälisesti tunnettuja.
- Emulaattori renderöi sovelluksen mustana oletus-GPU:lla; testaus -gpu swiftshader_indirect -tilassa.
- Puhelin ei näkynyt adb:ssä (2026-11-16), joten testaus tehdään emulaattorilla (Pixel_9a, x86_64-APK).
- Keskimmäinen ＋ ei ole välilehti vaan toimintonappi; sen paneelin ateria valitaan kellonajan mukaan (mealForHour).
- Suunnittele-näkymä säilyy omana näkymänään /plan (ehdotus kesken, nykyinen lista, uusi lista), koska Koti ja ＋ ohjaavat sinne.
- Suosikit siirtyivät Reseptien suodatinsirusta omaksi segmentikseen.
- Raportit-segmentti käyttää toistaiseksi vanhaa päivä/viikko-raporttia; osa 8 tekee Viikko | Kuukausi -raportit.
