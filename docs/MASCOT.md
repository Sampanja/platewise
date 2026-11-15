# Platewise – hahmot ja teemat

Käyttäjä valitsee onboardingin alussa kaverin kahdeksasta alkuperäisestä ruoka- tai kasvihahmosta. Valinta määrää kolme asiaa:

1. **Koko sovelluksen väriteeman** vaaleana ja tummana.
2. **Äänen:** tervehdykset, juhlistukset, tyhjät näkymät, ilmoitukset ja chat.
3. **Ulkonäön:** hahmo näkyy Kodissa, tyhjissä näkymissä, juhlistuksissa ja chatissa.

Hahmon voi vaihtaa milloin tahansa kohdasta **Profiili → Hahmo ja teema**. Vaihto päivittää koko sovelluksen heti ilman uudelleenkäynnistystä.

Hahmot kannustavat aina tapoihin: kirjaamiseen, kokkaamiseen, veteen ja uusien reseptien kokeiluun. Ne eivät koskaan kommentoi painoa, kehoa, kaloreita tai sitä, että käyttäjä söisi vähemmän. Testi `src/i18n/characterVoices.test.ts` tarkistaa tämän jokaisesta repliikistä.

## 1. Hahmot

| Id | Nimi | Mikä | Persoonallisuus | Väriteema (korostus vaalea / tumma) |
|---|---|---|---|---|
| `nuppu` | Nuppu | punajuuri | Lämmin, huolehtiva, vähän runollinen. Oletushahmo. | magenta #A3195B / #F27AB0, lehdenvihreä |
| `porkkis` | Porkkis | porkkana | Energinen tsemppari, huutomerkkejä, "mennään!" | oranssi #C2410C / #FF9149, naatinvihreä |
| `aava` | Aava | avokado | Rauhallinen ja läsnä oleva, "otetaan rauhassa" | lehdenvihreä #3D6B1E / #A3D46F, kermanruskea |
| `tomppa` | Tomppa | tomaatti | Intohimoinen kotikokki, "bravo!" | tomaatinpunainen #BF2A1F / #FF7D6E, basilika |
| `mustis` | Mustis | mustikka | Utelias metsän viisas, pieniä faktoja | indigo #3B4CC0 / #93A1FF, laventeli |
| `sitru` | Sitru | sitruuna | Pirteä ja nokkela, sanaleikkejä | keltainen #E0A800 / #FFD84D (tumma teksti), raikas vihreä |
| `kanttu` | Kanttu | kantarelli | Kiireetön metsäretkeilijä, sesonkivinkit | kulta #965500 / #F5B24A, sammal |
| `ruis` | Ruis | ruisleipä | Sisukas, lakoninen, kuiva huumori | ruskea #6F4325 / #D9A47A, kumina |

Repliikit ovat tiedostoissa `app/src/i18n/fiCharacters.ts`, `enCharacters.ts` ja `svCharacters.ts`: jokaisella kielellä sama puhetyyli (Nupun runollisuus, Porkkiksen tsemppi, Ruksen lakonisuus…), nimet samat kaikilla kielillä. Jokaisella hahmolla on samat avaimet:

- `intro` (esittely valitsimessa), `hello` ja `tagline` sekä kolme `traits`-piirrettä.
- `greetings` (Kodin tervehdys tilanteen mukaan, `domain/mascotMood.ts`).
- `empty` (tyhjät näkymät), `celebrate` (saavutus, taso, vesi).
- `chat` (esittely ja "miettii…"). Chatin esittelyssä sanotaan aina "En ole lääkäri".
- `notify` (ateria- ja vesimuistutukset, enintään 80 merkkiä, neutraalit).

Chatin turvallisuussäännöt (`domain/assistantRules.ts`) ovat samat kaikille hahmoille: vain sävy vaihtuu. Backend saa hahmon id:n (`character`) persoonan valintaan.

## 2. Teemajärjestelmä

- `app/src/theme/characters.ts` sisältää hahmojen värisiemenet: sävyn (`hue`) ja sävytyksen voimakkuuden neutraaleille sekä käsin viritetyt korostusvärit (`accent`, `accentPressed`, `accentText`, `textOnAccent`) ja toisen brändivärin (`second`).
- `app/src/theme/palette.ts` (`makePalette`) rakentaa jokaisesta hahmosta kokonaisen paletin vaaleana ja tummana. Taustat, pinnat, reunat ja tekstit sävytetään hahmon sävyllä. Yhteiset semanttiset värit (vesi, kulta, onnistuminen, vaara) ovat samat kaikilla.
- `colors` lukee aina aktiivisen paletin. Tyylit tehdään `themedStyles(() => StyleSheet.create(…))`, joka välimuistittaa ne teeman (`hahmo-tila`) mukaan.
- Juurinäkymä (`app/_layout.tsx`) asettaa teeman ennen renderöintiä. Teeman vaihtuessa navigaattori puretaan ja kootaan uudelleen samaan navigaatiotilaan, joten käyttäjä pysyy samalla sivulla.
- **Kontrastit:** `theme/contrast.test.ts` tarkistaa jokaisen hahmon kummankin tilan:
  - Kaikki tekstitokenit taustalla, pinnalla ja korotetulla pinnalla ≥ 4,5:1 (WCAG AA).
  - `textOnAccent` korostusvärillä ja painetulla korostusvärillä ≥ 4,5:1.
  - Korostus taustaa vasten ≥ 3:1 (keltainen Sitru vaaleassa tilassa ≥ 2:1, koska sen napeissa on tumma teksti ja reunat).
- **Kovakoodatut värit:** `theme/noHardcodedColors.test.ts` estää hex- ja rgba-arvot `src/theme`-kansion ulkopuolella. Teemasta riippumattomat värit (kameran päällä olevat paneelit, tuotekuvien valkoinen tausta, mitalien metallit) ovat tiedostossa `theme/fixed.ts`. Ainoa poikkeus on hahmojen piirrokset.

### Teeman värit muualla

- **Reseptien kuvituskortit** (`components/FoodIllustration.tsx`): kunnes backend tuottaa annoskuvat, jokainen resepti saa kategoriakohtaisen kortin, jonka pääaihe on kategorian viivaikoni (keitto, pata, salaatti, puuro, smoothie…) ja pikkuaiheet pääproteiinin mukaan (kala, koipi, papu, porkkana…). Kortti piirretään hahmon kahdella teemavärillä (`accent`, `herb`), ja kumpi väri johtaa vaihtelee reseptin id:n mukaan, joten ruudukko on yhtenäinen mutta ei yksitoikkoinen. Yläreuna jätetään tyhjäksi kortin päällä oleville painikkeille. Kotinäkymän ja maksumuurin hero-kuvat ovat neutraaleja kasviskulho- ja salaattikortteja, eivät koskaan tiettyä ruokaa.
- **Juomamuistutukset** käyttävät hahmon `notify.water`-repliikkiä; hahmon vaihto ajastaa ateria- ja juomamuistutukset uudelleen.

## 3. Hahmovalitsin

`app/src/features/characters/CharacterPicker.tsx` on onboardingin ensimmäinen näkymä ja reitti `/choose-character`.

- Vaakasuunnassa pyyhkäistävät kortit. Selatessa koko näkymän tausta ja pääpainike liukuvat animoidusti seuraavan hahmon väreihin.
- Kortissa:
  - hahmo iloisena (`happy`) ja nimi
  - kuvaus ja kolme piirrettä
  - puhekupla, jossa hahmo esittelee itsensä omalla äänellään
  - pienoisesikatselu sovelluksesta hahmon teemalla (`ThemePreview.tsx`).
- Nuolipainikkeet ja sivuilmaisin toimivat ilman pyyhkäisyä ja ruudunlukijalla.
- Valinta tallennetaan vasta "Valitse …" -painikkeesta. Onboardingissa asetukset jatkuvat sen jälkeen. Profiilista avattuna painike muuttuu muotoon "… on kaverisi", ja muistutukset ajastetaan uudelleen uuden hahmon äänellä.

## 4. Missä hahmo näkyy

| Paikka | Tila | Koko (dp) |
|---|---|---|
| Hahmovalitsin | happy (valittu) / idle | 148 |
| Kodin tervehdyskortti | vaihtelee tilanteen mukaan (`domain/mascotMood.ts`) | 76 |
| Onboardingin tervetulovaihe | happy | 96 |
| Kodin "Ei ruokalistaa" -kortti | cooking | 60 |
| Päiväkirja, tyhjä päivä | encouraging | 60 |
| Tyhjät näkymät (haku, suosikit, omat, ostoslista, raportit, paino) | thinking / happy / cooking / idle / encouraging, ja hahmon oma repliikki | 112 |
| Juhlistus (saavutus, uusi taso) | celebrating ja hahmon repliikki | 120 |
| Chat: esittely, vastaukset ja "miettii…" | happy / idle / thinking | 72 / 36 |
| Edistyminen-näkymän kannustus | encouraging | 64 |
| Ilmoitukset | – (otsikkona hahmon nimi, tekstinä hahmon repliikki) | – |

## 5. Tilat

| Tila | Ilme ja asento | Sovelluksen oma liike |
|---|---|---|
| `idle` (perus) | Avoimet silmät, pieni hymy | Hengittää: kevyt pomppu ja skaalaus |
| `happy` (iloinen) | Silmät ^ ^, iso hymy | Pomppaa |
| `thinking` (miettivä) | Katse ylös, kulma koholla, pieni "o"-suu, kysymysmerkki | Kallistelee hitaasti |
| `celebrating` (juhliva) | Iso hymy, tähdet ympärillä | Hyppää ja kääntyy |
| `cooking` (kokkaava) | Kokinhattu, tyytyväinen hymy | Heiluu kuin sekoittaisi |
| `sleepy` (uninen) | Silmät kiinni, "z z" | Keinuu hitaasti |
| `encouraging` (kannustava) | Silmänisku, tähti | Heilauttaa nopeasti |

Liike tulee sovelluksesta (`src/features/mascot/Mascot.tsx`): muutama kierros, sitten lepo. Kun järjestelmän "vähennä liikettä" -asetus on päällä, liike jätetään pois. Siksi **pysäytyskuvat riittävät**, eikä animaatioita tarvitse teettää.

## 6. Tilapäiset vektorihahmot

`app/src/features/mascot/CharacterSvg.tsx` piirtää kaikki kahdeksan hahmoa yhtenäisellä tyylillä:

- 200 × 200 -piirtoalue ja lämmin tummanruskea ääriviiva (#2B1D15, 3,5 px).
- Isot silmät valkoisilla heijastuksilla ja vaaleanpunaiset posket.
- Jokaisella hahmolla on oma vartalonsa. Kasvot ja tilojen lisäosat (kokinhattu, tähdet, kysymysmerkki, z z) ovat yhteiset, joten tilat näyttävät samalta kaikilla hahmoilla.
- Hahmon värit eivät vaihdu vaalean ja tumman teeman välillä.
- Tummilla vartaloilla (punajuuri, mustikka, ruisleipä) on valkoiset silmänvalkuaiset, jotta ilme erottuu.

## 7. Lopullisten kuvien vaihto

Kuvat voi vaihtaa ilman koodimuutoksia näkymiin.

1. Tee jokaiselle hahmolle oma kansio: `app/assets/mascot/<id>/` (esim. `app/assets/mascot/nuppu/`).
2. Tiedostot ovat tilan mukaan: `idle.png`, `happy.png`, `thinking.png`, `celebrating.png`, `cooking.png`, `sleepy.png`, `encouraging.png`.
   - Tarkkuudet samaan kansioon: `idle.png` 256 × 256 px (1x), `idle@2x.png` 512 × 512 px ja `idle@3x.png` 768 × 768 px.
3. Lisää kartoitus tiedostoon `app/assets/mascot/index.ts`:
   ```ts
   export const CHARACTER_IMAGES = {
     nuppu: {
       idle: require('./nuppu/idle.png'),
       happy: require('./nuppu/happy.png'),
       // …
     },
   };
   ```
4. Valmis. Puuttuvat tilat käyttävät hahmon `idle`-kuvaa. Ilman yhtään kuvaa sovellus piirtää vektoriversion. Kuvia voi lisätä hahmo ja tila kerrallaan.

**Animaatiot:** animoitu WebP tai GIF toimii suoraan samassa kartoituksessa, koska `expo-image` toistaa ne. Lottie- tai Rive-animaatiot vaativat paketin (`lottie-react-native` tai `rive-react-native`) ja pienen muutoksen `Mascot.tsx`:ään. Pysäytyskuvat jäävät varalle "vähennä liikettä" -tilaa varten.

### Kuvien vaatimukset

- **Muoto:** PNG (tai häviötön WebP), läpinäkyvä tausta, sRGB. Lähdetiedosto vektorina (SVG, AI tai Figma), vähintään 1024 × 1024.
- **Sommittelu:**
  - Hahmo keskellä, noin 8 % tyhjää reunoilla.
  - Kaikissa tiloissa sama koko ja sama alareuna, jotta tilanvaihto ei hypi.
  - Lisäelementit, kuten tähdet, mahtuvat samaan neliöön.
- **Luettavuus:**
  - Toimittava 36 px:n koossa (chatin avatar).
  - Selkeä ääriviiva, joka erottuu jokaisen hahmon vaaleasta ja tummasta taustasta.
  - Ei tekstiä kuvassa.
- **Yhtenäisyys:** kaikki kahdeksan hahmoa samalla tyylillä, samalla viivanpaksuudella ja samoilla ilmeillä. Vektoriversio on tyylin pohja.

## 8. Uuden hahmon lisääminen

1. Lisää id `CHARACTER_IDS`-listaan ja värisiemenet tiedostoon `theme/characters.ts`. Aja `contrast.test.ts` ja viritä korostusvärejä, kunnes testi menee läpi.
2. Lisää repliikit jokaisen kielen tiedostoon (`i18n/fiCharacters.ts`, `enCharacters.ts`, `svCharacters.ts`). TypeScript vaatii kaikki avaimet, ja `characterVoices.test.ts` tarkistaa sisällön jokaisella kielellä (ei kaloreita, painoa tai vähemmän syömistä; chatin esittely kertoo, ettei hahmo ole lääkäri).
3. Lisää vartalo `BODIES`-tauluun tiedostossa `CharacterSvg.tsx`, ja lisää kuvat kun ne ovat valmiit.

## 9. Säännöt hahmoille

- Ei vaakoja, mittanauhoja, "laihdutus"-symboliikkaa eikä kehoon liittyviä ilmeitä.
- Ei pettymyksen tai moitteen ilmeitä. Pahimmillaan hahmo on uninen tai miettivä.
- Hahmot eivät saa muistuttaa tunnettuja hahmoja (piirros-, peli- tai mainoshahmoja). Teettäjältä pyydetään vakuutus alkuperäisyydestä ja käyttöoikeuksien siirrosta.
