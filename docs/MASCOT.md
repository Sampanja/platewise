# Platewise – päähahmo

Hahmo tuo sovellukseen lämpöä ja huumoria. Se tervehtii Kodissa, juhlii saavutuksia, piristää tyhjissä näkymissä, auttaa onboardingissa ja vastaa chatissa ("Kysy Nupulta"). Hahmo kannustaa aina tapoihin: kirjaamiseen, kokkaamiseen, veteen ja uusien reseptien kokeiluun. Se ei koskaan kommentoi painoa, kehoa tai sitä, että käyttäjä söisi vähemmän.

## 1. Konseptit

Kolme alkuperäistä ehdotusta. Mikään niistä ei perustu olemassa olevaan hahmoon.

### A. Nuppu, nauris (valittu, tilapäinen versio sovelluksessa)

- **Ulkonäkö:** pyöreä, pullea nauris. Yläosa on violetti ja alaosa kermanvalkoinen, päälaella kaksi vihreää lehteä ja alla pieni juurihäntä. Isot, ystävälliset silmät, punaiset posket ja paksu tummanruskea ääriviiva, joka erottuu sekä vaalealta että tummalta taustalta.
- **Persoonallisuus:** utelias, lämmin ja vähän hassu. Iloitsee pienistä asioista, kuten lasillisesta vettä tai uudesta reseptistä. Rauhallinen eikä hösötä.
- **Puhetyyli:** lyhyet, ystävälliset lauseet ja arkinen kieli. Sinuttelee ja käyttää kevyesti emojeja (enintään yksi viestissä). Ei saarnaa eikä syyllistä. Esim. "Vesitavoite täynnä – kulaus kunniaksi!"
- **Miksi:** nauris on suomalainen, edullinen ja arkinen kasvis, joten se sopii sovellukseen, joka auttaa syömään hyvin pienellä budjetilla. Muoto on yksinkertainen ja tunnistettava pienessäkin koossa (36 px).

### B. Kauha, keittiökauha

- **Ulkonäkö:** puinen kauha, jonka kupissa on kasvot. Varressa on pieni esiliina ja kädet, jotka ovat sekoitusliikkeessä.
- **Persoonallisuus:** innokas keittiöapulainen, käytännöllinen ja reipas. Rakastaa ohjeita ja järjestystä.
- **Puhetyyli:** tehokas ja vinkkaava ("Pilko sipulit valmiiksi, niin ilta helpottuu!"). Sopii erityisesti reseptien ja ostoslistan ohjaukseen.
- **Riski:** kova esine on vaikeampi tehdä pehmeäksi ja lämpimäksi. Ilmeiden kirjo jää kapeammaksi.

### C. Muru, ruisleipäpala

- **Ulkonäkö:** pieni, pyöreäkulmainen ruisleipäpala, jolla on tummanruskea kuori ja vaalea sisus sekä pienet jalat. Sillä on usein villasukat.
- **Persoonallisuus:** kiireetön ja vähän uninen, mummolamainen viisaus ja kuiva huumori.
- **Puhetyyli:** lempeä ja hidas ("Ei hätää, huomenna on uusi päivä ja uusi aamupala."). Sopii erityisesti kannustukseen ja paluuviesteihin.
- **Riski:** ruskea hahmo katoaa helposti tummaan teemaan, joten se tarvitsee vahvan ääriviivan tai vaalean taustakuvion.

**Valinta:** Nuppu. Se on ilmeikkäin, värikkäin (violetti, vihreä ja kerma sopivat Paprika-paletin oranssin rinnalle) ja toimii pienessä koossa. Lopullinen hahmo voi olla mikä tahansa näistä tai uusi. Sovellus ei riipu hahmon muodosta, vain tiloista (kohta 3).

## 2. Missä hahmo näkyy

| Paikka | Tila | Koko (dp) |
|---|---|---|
| Kodin tervehdyskortti | vaihtelee tilanteen mukaan (`domain/mascotMood.ts`) | 76 |
| Onboardingin ensimmäinen vaihe | happy | 96 |
| Tyhjät näkymät (haku, omat, raportit, paino) | thinking / cooking / encouraging / idle / happy | 112 |
| Juhlistus (saavutus, uusi taso) | celebrating | 120 |
| Chat: esittely, vastaukset ja "miettii…" | happy / idle / thinking | 72 / 36 |
| Edistyminen-näkymän kannustus | encouraging | 64 |

## 3. Tilat

| Tila | Ilme ja asento | Sovelluksen oma liike |
|---|---|---|
| `idle` (perus) | Avoimet silmät, pieni hymy | Hengittää: kevyt pomppu ja skaalaus |
| `happy` (iloinen) | Silmät ^ ^, iso hymy | Pomppaa |
| `thinking` (miettivä) | Katse ylös, kulma koholla, pieni "o"-suu, kysymysmerkki | Kallistelee hitaasti |
| `celebrating` (juhliva) | Iso hymy, tähdet ympärillä | Hyppää ja kääntyy |
| `cooking` (kokkaava) | Kokinhattu, tyytyväinen hymy | Heiluu kuin sekoittaisi |
| `sleepy` (uninen) | Silmät kiinni, "z z" | Keinuu hitaasti |
| `encouraging` (kannustava) | Silmänisku, lehti/käsi heilauttaa | Heilauttaa nopeasti |

Liike tulee sovelluksesta (`src/features/mascot/Mascot.tsx`): muutama kierros, sitten lepo. Kun järjestelmän "vähennä liikettä" -asetus on päällä, liike jätetään pois. Siksi **pysäytyskuvat riittävät**, eikä animaatioita tarvitse teettää.

## 4. Mitä tiedostoja tarvitaan

### Pakolliset: pysäytyskuva jokaisesta tilasta

- **Tiedostot:** 7 kpl, yksi per tila: `nuppu-idle.png`, `nuppu-happy.png`, `nuppu-thinking.png`, `nuppu-celebrating.png`, `nuppu-cooking.png`, `nuppu-sleepy.png`, `nuppu-encouraging.png`. Jos hahmon nimi muuttuu, nimeä tiedostot sen mukaan.
- **Muoto:** PNG (tai häviötön WebP), läpinäkyvä tausta, sRGB.
- **Koot:** neliö, kolme tarkkuutta samaan kansioon:
  - `nuppu-idle.png` 256 × 256 px (1x)
  - `nuppu-idle@2x.png` 512 × 512 px
  - `nuppu-idle@3x.png` 768 × 768 px
- **Lähdetiedosto:** vektori (SVG, AI tai Figma), vähintään 1024 × 1024, jotta kokoja voi viedä myöhemmin lisää.
- **Sommittelu:**
  - Hahmo keskellä, noin 8 % tyhjää reunoilla.
  - Kaikissa tiloissa sama koko ja sama "maa" eli alareuna samalla korkeudella, jotta tilanvaihto ei hypi.
  - Juhlistuksen tähdet ja muut lisäelementit mahtuvat samaan neliöön.
- **Luettavuus:**
  - Toimittava 36 px:n koossa (chatin avatar). Ei alle 2 px:n yksityiskohtia 72 px:n koossa.
  - Selkeä ääriviiva, joka erottuu sekä vaaleasta (#FFF8F1) että tummasta (#14110E) taustasta.
  - Ei tekstiä kuvassa.
- **Värit:** saa vapaasti valita. Suositus on yhteensopivuus Paprika-paletin kanssa: korostus #C9461A / #FF8A4C, yrtti #286E40 / #7FCB8E ja marja #B0306A / #F28DB2.

### Valinnaiset

- **Animaatiot:** jos myöhemmin halutaan oikeat animaatiot (esim. silmien räpytys), tilakohtaiset Lottie-JSON- tai Rive-tiedostot (`.riv`), joissa sama nimeäminen ja 1:1-kuvasuhde. Niiden käyttö vaatii paketin (`lottie-react-native` tai `rive-react-native`) ja pienen muutoksen `Mascot.tsx`:ään. Pysäytyskuvat jäävät varalle (vähennä liikettä -tila).
- **Kauppakuvat ja ilmoitukset:** sovelluskuvake hahmolla, 1024 × 1024, ilman läpinäkyvyyttä.

## 5. Asennus sovellukseen

1. Kopioi tiedostot kansioon `app/assets/mascot/`.
2. Lisää kartoitus tiedostoon `app/assets/mascot/index.ts`:
   ```ts
   export const MASCOT_IMAGES = {
     idle: require('./nuppu-idle.png'),
     happy: require('./nuppu-happy.png'),
     // …
   };
   ```
3. Valmis. Tilat, joille on kuva, käyttävät sitä. Puuttuvat tilat käyttävät `idle`-kuvaa, ja ilman yhtään kuvaa sovellus piirtää tilapäisen vektori-Nupun. Koodia ei tarvitse muuttaa.

## 6. Säännöt hahmolle

- Ei vaakoja, mittanauhoja, "laihdutus"-symboliikkaa eikä kehoon liittyviä ilmeitä.
- Ei pettymyksen tai moitteen ilmeitä. Pahimmillaan hahmo on uninen tai miettivä.
- Hahmo ei saa muistuttaa tunnettua hahmoa (piirros-, peli- tai mainoshahmoa). Teettäjältä pyydetään vakuutus alkuperäisyydestä ja käyttöoikeuksien siirrosta.
