# Edistyminen

Lue tämä jokaisen keskustelun alussa ja päivitä ennen jokaista committia.

## Käynnissä oleva tehtävä

[PlatePal-laajennus](tasks/2026-11-16-platepal-laajennus.md), osat 1–11.

| Osa | Tila |
| --- | --- |
| 1. Nimenvaihto | valmis |
| 2. Tietoarkkitehtuuri ja ＋-paneeli | valmis (Varastosta, Puhu, Kirjoita ja Skannaa lisätään osissa 3 ja 5) |
| 3. Hahmot (tehtävän osa 4) | valmis |
| 4. Ruokavarasto ja skannaus (osa 3) | – |
| 5. Puhe- ja tekstikirjaus | – |
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

## Kesken

- Osa 3 (Ruokavarasto ja skannaus) seuraavaksi.

## Seuraava askel

- Ruokavarasto: store, skannaus (services/pantryRecognition.ts), tarkistusnäkymä, Mitä voin tehdä -ehdotukset, ostoslistalta varastoon, tehdyn reseptin vähennys, vanhenemismuistutus.

## Päätökset

- Hahmonimet: Nuppu säilyi (alkuperäinen oletushahmo, lempeä merkitys). Muut kaksitavuisia ja merkityksettömiä fi/en/sv: Avo, Tomo, Karo, Lemo, Blu. Kantarelli ja ruisleipä poistuivat, koska ne eivät ole kansainvälisesti tunnettuja.
- Emulaattori renderöi sovelluksen mustana oletus-GPU:lla; testaus -gpu swiftshader_indirect -tilassa.
- Puhelin ei näkynyt adb:ssä (2026-11-16), joten testaus tehdään emulaattorilla (Pixel_9a, x86_64-APK).
- Keskimmäinen ＋ ei ole välilehti vaan toimintonappi; sen paneelin ateria valitaan kellonajan mukaan (mealForHour).
- Suunnittele-näkymä säilyy omana näkymänään /plan (ehdotus kesken, nykyinen lista, uusi lista), koska Koti ja ＋ ohjaavat sinne.
- Suosikit siirtyivät Reseptien suodatinsirusta omaksi segmentikseen.
- Raportit-segmentti käyttää toistaiseksi vanhaa päivä/viikko-raporttia; osa 8 tekee Viikko | Kuukausi -raportit.
