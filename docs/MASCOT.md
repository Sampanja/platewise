# PlatePal – hahmot ja teemat

Käyttäjä valitsee onboardingin alussa kaverin kuudesta hahmosta. Jokainen hahmo on kaikkialla maailmassa tunnettu ruoka-aine. Valinta määrää kolme asiaa:

1. **Koko sovelluksen väriteeman** vaaleana ja tummana.
2. **Äänen:** tervehdykset, juhlistukset, tyhjät näkymät, ilmoitukset, raporttien yhteenvedot ja chat.
3. **Ulkonäön:** hahmo näkyy Kodissa, tyhjissä näkymissä, juhlistuksissa, raporteissa ja chatissa.

Hahmon voi vaihtaa milloin tahansa kohdasta **Profiili → Hahmo ja teema**. Vaihto päivittää koko sovelluksen heti ilman uudelleenkäynnistystä.

Hahmot kannustavat aina tapoihin: kirjaamiseen, kokkaamiseen, veteen ja uusien reseptien kokeiluun. Ne eivät koskaan kommentoi painoa, kehoa, kaloreita tai sitä, että käyttäjä söisi vähemmän. Testi `src/i18n/characterVoices.test.ts` tarkistaa tämän jokaisesta repliikistä.

## 1. Hahmot

Nimet ovat samat kaikilla kielillä. Ne ovat lyhyitä (2 tavua), helppoja lausua suomeksi, englanniksi ja ruotsiksi, eikä niillä ole näillä kielillä omaa merkitystä. Poikkeus on Nuppu: se on sovelluksen alkuperäinen hahmo ja oletus, ja sen suomenkielinen merkitys ("kukan nuppu") on lempeä ja sopii hahmoon.

| Id | Nimi | Mikä | Persoona ja puhetyyli | Siluetti | Väriteema (korostus vaalea / tumma, toinen väri) |
|---|---|---|---|---|---|
| `nuppu` | Nuppu | punajuuri | **Lempeä.** Lämmin, huolehtiva, vähän runollinen. Oletushahmo. | Pyöreä juuri, kolme lehteä varsineen, kiehkura häntä | magenta #A3195B / #F27AB0, lehdenvihreä #2C6E3F / #84CF95 |
| `avo` | Avo | avokado | **Rauhallinen.** Läsnä oleva, "otetaan rauhassa", lyhyitä lauseita. | Päärynän muoto, kiva vatsana, pieni varsi | lehdenvihreä #3D6B1E / #A3D46F, voinruskea #7A5426 / #D9B07A |
| `tomo` | Tomo | tomaatti | **Intohimoinen kotikokki.** Lämmin ja napakka, "bravo!", rakastaa makuja. | Leveä ja pullea, vihreä tähtiverholehti ja varsi | tomaatinpunainen #BF2A1F / #FF7D6E, basilika #2B6B33 / #86CC8C |
| `karo` | Karo | porkkana | **Energinen tsemppari.** Huutomerkkejä, "mennään!", lyhyet iskevät lauseet. | Korkea ja suippeneva, naattitupsu | oranssi #C2410C / #FF9149, naatinvihreä #2F6E2A / #8FD07F |
| `lemo` | Lemo | sitruuna | **Hauska ja nokkela.** Sanaleikkejä, raikas ja pirteä. | Vaakasuuntainen soikio, nypyt molemmissa päissä, yksi lehti | keltainen #E0A800 / #FFD84D (tumma teksti napeissa), raikas vihreä #2F6B2C / #93D37E |
| `blu` | Blu | mustikka | **Utelias.** Pieniä faktoja ja hyviä kysymyksiä. | Pyöreä marja, viisikärkinen kruunu, oksa ja lehti | indigo #3B4CC0 / #93A1FF, laventeli #7B3FA0 / #CFA2EE |

Kaikki paletit tarkistetaan automaattisesti (luku 2, Kontrastit).

### Siirto vanhoista hahmoista

Ennen marraskuuta 2026 hahmoja oli kahdeksan. Profiilin tallennettu hahmo siirretään lähimpään uuteen (`domain/characterMigration.ts`, testattu):

| Vanha | Uusi | Peruste |
|---|---|---|
| `nuppu` | `nuppu` | sama hahmo |
| `porkkis` | `karo` | sama porkkana ja energinen ääni |
| `aava` | `avo` | sama avokado ja rauhallinen ääni |
| `tomppa` | `tomo` | sama tomaatti ja kotikokki |
| `mustis` | `blu` | sama mustikka ja utelias ääni |
| `sitru` | `lemo` | sama sitruuna ja hauska ääni |
| `kanttu` (kantarelli) | `karo` | lähin väriteema (kulta → oranssi) |
| `ruis` (ruisleipä) | `lemo` | lähin puhetyyli (kuiva huumori → nokkela) |

Jos hahmo vaihtui, Koti näyttää kerran ilmoituksen "Hahmot uudistuivat! Kaverisi on nyt …", ja hahmon voi vaihtaa Profiilissa.

### Repliikit

Repliikit ovat tiedostoissa `app/src/i18n/fiCharacters.ts`, `enCharacters.ts` ja `svCharacters.ts`: jokaisella kielellä sama puhetyyli. Jokaisella hahmolla on samat avaimet:

- `intro` (esittely valitsimessa), `hello` ja `tagline` sekä kolme `traits`-piirrettä.
- `greetings` (Kodin tervehdys tilanteen mukaan, `domain/mascotMood.ts`).
- `empty` (tyhjät näkymät), `celebrate` (saavutus, taso, vesi).
- `pantry` (vanhenevat tuotteet ja "Mitä voin tehdä" -ehdotukset).
- `report` (viikko- ja kuukausiraportin yhteenvedon aloitus ja ehdotuksen kehys).
- `quality` (ystävällinen vaihtoehdon ehdotus laatuarvion yhteydessä).
- `chat` (esittely ja "miettii…"). Chatin esittelyssä sanotaan aina "En ole lääkäri".
- `notify` (ateria-, vesi- ja varastomuistutukset, enintään 80 merkkiä, neutraalit).

Chatin turvallisuussäännöt (`domain/assistantRules.ts`) ovat samat kaikille hahmoille: vain sävy vaihtuu. Backend saa hahmon id:n (`character`) persoonan valintaan.

## 2. Teemajärjestelmä

- `app/src/theme/characters.ts` sisältää hahmojen värisiemenet: sävyn (`hue`) ja sävytyksen voimakkuuden neutraaleille sekä käsin viritetyt korostusvärit (`accent`, `accentPressed`, `accentText`, `textOnAccent`) ja toisen brändivärin (`second`).
- `app/src/theme/palette.ts` (`makePalette`) rakentaa jokaisesta hahmosta kokonaisen paletin vaaleana ja tummana. Taustat, pinnat, reunat ja tekstit sävytetään hahmon sävyllä. Yhteiset semanttiset värit (vesi, kulta, onnistuminen, vaara) ovat samat kaikilla.
- `colors` lukee aina aktiivisen paletin. Tyylit tehdään `themedStyles(() => StyleSheet.create(…))`, joka välimuistittaa ne teeman (`hahmo-tila`) mukaan.
- Juurinäkymä (`app/_layout.tsx`) asettaa teeman ennen renderöintiä. Teeman vaihtuessa navigaattori puretaan ja kootaan uudelleen samaan navigaatiotilaan, joten käyttäjä pysyy samalla sivulla.
- **Kontrastit:** `theme/contrast.test.ts` tarkistaa jokaisen hahmon kummankin tilan:
  - Kaikki tekstitokenit taustalla, pinnalla ja korotetulla pinnalla ≥ 4,5:1 (WCAG AA).
  - `textOnAccent` korostusvärillä ja painetulla korostusvärillä ≥ 4,5:1.
  - Korostus taustaa vasten ≥ 3:1 (keltainen Lemo vaaleassa tilassa ≥ 2:1, koska sen napeissa on tumma teksti ja reunat).
- **Kovakoodatut värit:** `theme/noHardcodedColors.test.ts` estää hex- ja rgba-arvot `src/theme`-kansion ulkopuolella. Teemasta riippumattomat värit ovat tiedostossa `theme/fixed.ts`. Ainoa poikkeus on hahmojen piirrokset.

### Teeman värit muualla

- **Reseptien kuvituskortit** (`components/FoodIllustration.tsx`): kategoriakohtainen kortti hahmon kahdella teemavärillä (`accent`, `herb`). Samoja kortteja käytetään tuoduissa resepteissä, koska sivujen kuvia ei tallenneta.
- **Kotinäytön widget** käyttää hahmon korostusväriä ja pientä kuvaa (luku 7).
- **Juoma- ja varastomuistutukset** käyttävät hahmon `notify`-repliikkejä; hahmon vaihto ajastaa muistutukset uudelleen.

## 3. Hahmovalitsin

`app/src/features/characters/CharacterPicker.tsx` on onboardingin ensimmäinen näkymä kielen valinnan jälkeen ja reitti `/choose-character` Profiilista.

- Vaakasuunnassa pyyhkäistävät kortit. Selatessa koko näkymän tausta, kortit, tekstit ja pääpainike liukuvat animoidusti seuraavan hahmon väreihin, joten käyttäjä näkee koko teeman ennen valintaa.
- Kortissa: hahmo iloisena (`happy`) ja nimi, kuvaus ja kolme piirrettä, puhekupla omalla äänellä ja pienoisesikatselu sovelluksesta hahmon teemalla (`ThemePreview.tsx`).
- Nuolipainikkeet ja sivuilmaisin toimivat ilman pyyhkäisyä ja ruudunlukijalla.
- Valinta tallennetaan vasta "Valitse …" -painikkeesta.

## 4. Missä hahmo näkyy

| Paikka | Tila | Koko (dp) |
|---|---|---|
| Hahmovalitsin | happy (valittu) / idle | 148 |
| Kodin tervehdyskortti | vaihtelee tilanteen mukaan (`domain/mascotMood.ts`) | 76 |
| Onboardingin tervetulovaihe | happy | 96 |
| Kodin "Ei ruokalistaa" -kortti | cooking | 60 |
| Päiväkirja, tyhjä päivä | encouraging | 60 |
| Raportin yhteenveto | thinking / happy | 64 |
| Ruokavaraston ehdotukset, skannauksen tunnistus | cooking / thinking | 64–112 |
| Tyhjät näkymät | thinking / happy / cooking / idle / encouraging, ja hahmon oma repliikki | 112 |
| Juhlistus (saavutus, uusi taso) | celebrating ja hahmon repliikki | 120 |
| Chat: esittely, vastaukset ja "miettii…" | happy / idle / thinking | 72 / 36 |
| Kotinäytön widget | idle | 48 (widgetin oma kuva) |
| Ilmoitukset | – (otsikkona hahmon nimi, tekstinä hahmon repliikki) | – |

## 5. Tilat ja liike

| Tila | Ilme | Kädet | Sovelluksen oma liike |
|---|---|---|---|
| `idle` (perus) | Avoimet silmät, pieni hymy | alhaalla | Hengitys ja räpytys |
| `happy` (iloinen) | Silmät ^ ^, iso avoin hymy | vilkuttaa | Pomppaa |
| `thinking` (miettivä) | Katse ylös, toinen kulma koholla, pieni "o", kysymysmerkki | käsi leualla | Kallistelee hitaasti |
| `celebrating` (juhliva) | Silmät ^ ^, kulmat ylhäällä, iso hymy, tähdet ja konfetti | molemmat ylhäällä | Hyppää ja kääntyy |
| `cooking` (kokkaava) | Kokinhattu, maistelee (kielen kärki) | puulusikka kädessä | Heiluu kuin sekoittaisi |
| `sleepy` (uninen) | Silmät kiinni, pieni suu, "z z" | roikkuvat | Hidas keinunta ja syvä hengitys |
| `encouraging` (kannustava) | Silmänisku, kulma koholla, virne, tähti | peukku ylös | Heilauttaa nopeasti |

Liike tulee sovelluksesta (`src/features/mascot/Mascot.tsx`):

- **Tilan vaihto:** pehmeä "pop" (pieni skaalaus jousella), sitten tilan oma ele muutaman kierroksen ajan.
- **Elävöitys koko ajan, kun hahmo näkyy:** hengitys (hidas venytys alareunasta, uninen hitaammin) ja räpytys 2,6–5,8 s välein (vain tiloissa, joissa silmät ovat auki).
- **Pysähtyminen:** kaikki silmukat pysähtyvät, kun näkymä ei ole fokuksessa (toinen välilehti tai näkymä päällä) tai sovellus on taustalla. Kun järjestelmän "vähennä liikettä" on päällä, liikettä ei ole lainkaan.

Siksi **pysäytyskuvat riittävät** lopullisiksi kuviksi; räpytystä varten pyydetään lisäksi kiinnisilmäinen versio (luku 7).

## 6. Vektorihahmot (nykyiset)

`app/src/features/mascot/CharacterSvg.tsx` piirtää kaikki kuusi hahmoa yhtenäisellä tyylillä. Tämä on myös kuvittajan tyylipohja.

- 200 × 200 -piirtoalue, lämmin tummanruskea ääriviiva (#2B1D15, 3,5 px) ja pehmeä varjo hahmon alla.
- Vartalo sävytetään säteittäisellä liukuvärillä (valo ylhäältä vasemmalta: vaalea → perusväri → varjo) ja kiiltoviivalla.
- Isot silmät kahdella valkoisella heijastuksella, vaaleanpunaiset posket, kulmakarvat ilmeen mukaan. Tummilla vartaloilla (punajuuri, mustikka) valkoiset silmänvalkuaiset.
- Pienet ääriviivalliset kädet, joiden asento kertoo tilan (taulukko yllä), joten tilat erottuvat myös siluetista.
- Kasvot, kädet ja lisäosat (kokinhattu, lusikka, tähdet, kysymysmerkki, z z) ovat yhteiset; vain vartalo vaihtuu hahmon mukaan.
- Hahmon värit eivät vaihdu vaalean ja tumman teeman välillä.

## 7. Lopullisten kuvien tilaus kuvittajalta

Kuvat voi vaihtaa ilman koodimuutoksia näkymiin: `app/assets/mascot/index.ts` kartoittaa tiedostot, ja puuttuvat tilat käyttävät vektoriversiota.

### Tiedostolista (per hahmo)

Kansio `app/assets/mascot/<id>/`, esim. `app/assets/mascot/avo/`. Jokaisesta tilasta kolme tarkkuutta:

| Tiedosto | Koko (px) | Sisältö |
|---|---|---|
| `idle.png`, `idle@2x.png`, `idle@3x.png` | 256 / 512 / 768 | perus |
| `idle-blink.png` (+ @2x, @3x) | 256 / 512 / 768 | perus silmät kiinni (räpytys) |
| `happy.png` (+ @2x, @3x) | 256 / 512 / 768 | iloinen, vilkuttaa |
| `thinking.png` (+ @2x, @3x) | 256 / 512 / 768 | miettivä, käsi leualla, kysymysmerkki |
| `celebrating.png` (+ @2x, @3x) | 256 / 512 / 768 | juhliva, kädet ylhäällä, tähdet |
| `cooking.png` (+ @2x, @3x) | 256 / 512 / 768 | kokinhattu ja puulusikka |
| `sleepy.png` (+ @2x, @3x) | 256 / 512 / 768 | uninen, z z |
| `encouraging.png` (+ @2x, @3x) | 256 / 512 / 768 | silmänisku ja peukku |
| `widget.png` | 192 × 192 | perus ilman varjoa, Android-widgetiin |
| `avatar.png` | 96 × 96 | pelkät kasvot ja yläosa, chatin avatar (36 dp) |
| `source.svg` (tai .ai / Figma) | vektori, ≥ 1024 × 1024 | lähdetiedosto kaikille tiloille |

Kuusi hahmoa × (8 tilaa × 3 tarkkuutta + widget + avatar) = 156 PNG-tiedostoa ja 6 lähdetiedostoa.

**Valinnaiset animaatiot:** animoitu WebP (≤ 300 kt, 24 fps, 2–3 s silmukka) toimii suoraan samassa kartoituksessa (`expo-image`). Lottie- tai Rive-animaatiot vaativat paketin (`lottie-react-native` tai `rive-react-native`) ja pienen muutoksen `Mascot.tsx`:ään. Pysäytyskuvat jäävät "vähennä liikettä" -tilaa varten.

### Kartoitus

```ts
export const CHARACTER_IMAGES = {
  avo: {
    idle: require('./avo/idle.png'),
    happy: require('./avo/happy.png'),
    // …
  },
};
```

### Vaatimukset

- **Muoto:** PNG (tai häviötön WebP), läpinäkyvä tausta, sRGB.
- **Sommittelu:** hahmo keskellä, noin 8 % tyhjää reunoilla. Kaikissa tiloissa sama koko ja sama alareuna (jalat/pohja samalla korkeudella), jotta tilanvaihto ja hengitys eivät hypi. Lisäelementit mahtuvat samaan neliöön.
- **Luettavuus:** toimittava 36 px:n koossa (chatin avatar) ja widgetissä. Selkeä ääriviiva, joka erottuu jokaisen teeman vaaleasta ja tummasta taustasta. Ei tekstiä kuvassa.
- **Yhtenäisyys:** kaikki kuusi hahmoa samalla tyylillä, viivanpaksuudella, valon suunnalla (ylhäältä vasemmalta) ja samoilla ilmeillä ja käsien asennoilla. Vektoriversio (luku 6) on tyylin pohja.
- **Siluetti:** jokainen hahmo tunnistettava pelkästä mustasta siluetista (taulukko luvussa 1).

## 8. Uuden hahmon lisääminen

1. Lisää id `CHARACTER_IDS`-listaan ja värisiemenet tiedostoon `theme/characters.ts`. Aja `contrast.test.ts` ja viritä korostusvärejä, kunnes testi menee läpi.
2. Lisää repliikit jokaisen kielen tiedostoon (`i18n/fiCharacters.ts`, `enCharacters.ts`, `svCharacters.ts`). TypeScript vaatii kaikki avaimet, ja `characterVoices.test.ts` tarkistaa sisällön jokaisella kielellä.
3. Lisää vartalo `BODIES`-tauluun tiedostossa `CharacterSvg.tsx` (värit, olkapäät, kasvojen paikka), ja lisää kuvat kun ne ovat valmiit.

## 9. Säännöt hahmoille

- Ei vaakoja, mittanauhoja, "laihdutus"-symboliikkaa eikä kehoon liittyviä ilmeitä.
- Ei pettymyksen tai moitteen ilmeitä. Pahimmillaan hahmo on uninen tai miettivä.
- Hahmot eivät saa muistuttaa tunnettuja hahmoja (piirros-, peli- tai mainoshahmoja). Teettäjältä pyydetään vakuutus alkuperäisyydestä ja käyttöoikeuksien siirrosta.
