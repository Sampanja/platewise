# Edistyminen

Lue tämä jokaisen keskustelun alussa ja päivitä ennen jokaista committia.

## Käynnissä oleva tehtävä

[PlatePal-laajennus](tasks/2026-11-16-platepal-laajennus.md), osat 1–11.

| Osa | Tila |
| --- | --- |
| 1. Nimenvaihto | valmis |
| 2. Tietoarkkitehtuuri ja ＋-paneeli | valmis (Varastosta, Puhu, Kirjoita ja Skannaa lisätään osissa 3 ja 5) |
| 3. Hahmot (tehtävän osa 4) | valmis |
| 4. Ruokavarasto ja skannaus (osa 3) | valmis |
| 5. Puhe- ja tekstikirjaus | valmis |
| 6. Hivenaineet | – |
| 7. Laatuarvio | – |
| 8. Raportit | – |
| 9. Reseptituonti (osa 10) | – |
| 10. Widget (osa 9) | – |
| 11. Dokumentaatio | – |

## Mitä tehtiin

- Tehtäväohje tallennettu, PROGRESS.md luotu.
- Osa 1: nimi PlatePal kaikkialla (app.json, paketti com.sampanja.platepal, scheme platepal, tallennusavaimet platepal:, i18n, docs, README).
- Osa 2: alapalkki Koti · Reseptit · ＋ · Päiväkirja · Profiili. ＋ avaa pikatoimintopaneelin (features/quick/QuickActions.tsx). Suunnittele on nyt näkymä /plan (otsikko Ruokalista). Reseptit-välilehdellä segmentit Kirjasto | Suosikit | Omat, Päiväkirjassa Tänään | Raportit (features/reports/ReportsView.tsx). Uusi komponentti components/ui/Segmented.tsx, uudet tekstit i18n/<kieli>Kitchen.ts.
- Osa 4 (hahmot): kuusi hahmoa nuppu, avo, tomo, karo, lemo, blu (theme/characters.ts, i18n/<kieli>Characters.ts). Uusi piirrostyyli (CharacterSvg.tsx: liukuvärisävytys, kiilto, kulmakarvat, kädet joiden asento kertoo tilan). Mascot.tsx: pop tilan vaihtuessa, hengitys ja räpytys, pysähtyy kun näkymä ei ole fokuksessa tai sovellus taustalla. Siirto domain/characterMigration.ts (profiili v9, ilmoitus kerran Kodissa). MASCOT.md päivitetty kuvittajan tiedostolistalla.
- Osa 3 (Ruokavarasto): store data/stores/pantry.ts (yksi rivi per ainesosa, tehdyt reseptit), logiikka domain/pantry.ts (testattu: ehdotukset, vähennys, muistutusten ajoitus), sumea haku kaikilla kielillä domain/fuzzy.ts + data/catalog/search.ts. Näkymät /pantry, /pantry-scan (useita kuvia), /pantry-review (pakollinen tarkistus), Reseptit → Varastosta (features/pantry/PantrySuggestionsView.tsx), Kodin varastokortti, ＋-paneelin skannausrivi, ostoslistalta varastoon, reseptisivun Tein tämän -arkki (vähennys + kumoa), vanhenemisilmoitus services/pantryReminders.ts (napautus avaa Varastosta). Palvelut services/pantryRecognition.ts ja services/recipeGeneration.ts testidatalla.
- Osa 5 (puhe ja teksti): /log-text (Puhu: expo-speech-recognition laitteella sovelluksen kielellä, teksti näkyy reaaliajassa; Kirjoita: vapaa teksti). Tulkinta domain/foodText.ts (määrät, yksiköt, numerosanat ja koot fi/en/sv, adessiivi "juustolla" omana ruokana, with/med) + services/foodTextParser.ts (sumea haku ruokalistaan kaikilla kielillä, kokonainen fraasi ensin). Tulos samaan tarkistusnäkymään kuin kuva (photo.tsx source=text) aterian valinnalla.

## Kesken

- Osa 6 (hivenaineet) on tehty koodiin, commit seuraavaksi; sitten osa 7 (laatuarvio).

## Seuraava askel

- Laatuarvio A–E (domain/qualityScore.ts, docs/QUALITY_SCORE.md), sitten raportit.

## Päätökset

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
