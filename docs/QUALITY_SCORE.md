# PlatePal – ruoan laatuarvio A–E

Laatuarvio kertoo yhdellä kirjaimella, millainen ruoka on koostumukseltaan. Se on PlatePalin oma, läpinäkyvä laskenta, joka perustuu Nutri-Scoren periaatteisiin. Se **ei ole virallinen Nutri-Score**, eikä sitä esitetä sellaisena. Pakatuille tuotteille näytetään Open Food Factsin virallinen Nutri-Score silloin, kun tuotteella on se.

Koodi: `app/src/domain/qualityScore.ts` (laskenta), `app/src/data/catalog/quality.ts` (reseptit ja päiväkirjan ruoat), `app/src/features/quality/entryQuality.ts` (kirjaukset ja koko päivä). Yksikkötestit: `qualityScore.test.ts` ja `entryQuality.test.ts`.

## 1. Periaatteet

- **Kuvaa ruokaa, ei ihmistä.** Arvio lasketaan 100 grammaa kohden. Se ei riipu annoksen koosta, kaloritavoitteesta tai siitä, paljonko käyttäjä on syönyt.
- **Ei syyllistä.** Ei punaista väriä, ei sanoja "huono" tai "epäterveellinen". D ja E näytetään rauhallisilla väreillä (luumu ja harmaa), ja selitys kertoo vain, mikä nostaa ja mikä laskee arviota.
- **Läpinäkyvä.** "Miksi tämä arvio?" näyttää jokaisen osatekijän pisteet. Kaikki rajat ovat tässä dokumentissa.
- **Ystävällinen vaihtoehto.** Hahmo voi ehdottaa samantyylistä reseptiä, jonka arvio on parempi (vain käyttäjälle sallituista resepteistä, `isRecipeAllowed`), tai antaa yhden konkreettisen vinkin.
- **Pelillistäminen ei käytä arviota.** Arviosta ei saa pisteitä eikä menetä niitä.

## 2. Laskenta

Arvio lasketaan ravintoarvoista 100 g kohden (juomilla 100 ml). Puuttuva arvo lasketaan nollaksi.

### Laskevat tekijät (0–10 pistettä kukin)

Piste tulee jokaisesta ylitetystä rajasta.

| Tekijä | Rajat (100 g) |
|---|---|
| Energia (kJ) | 335, 670, 1 005, 1 340, 1 675, 2 010, 2 345, 2 680, 3 015, 3 350 |
| Sokerit (g) | 4,5, 9, 13,5, 18, 22,5, 27, 31, 36, 40, 45 |
| Tyydyttynyt rasva (g) | 1, 2, 3, 4, 5, 6, 7, 8, 9, 10 |
| Suola (g) | 0,225, 0,45, 0,675, 0,9, 1,125, 1,35, 1,575, 1,8, 2,025, 2,25 |

### Nostavat tekijät

| Tekijä | Pisteet |
|---|---|
| Kuitu (g / 100 g) | 0–5: rajat 0,9, 1,9, 2,8, 3,7, 4,7 |
| Proteiini (g / 100 g) | 0–5: rajat 1,6, 3,2, 4,8, 6,4, 8,0 |
| Kasvikset, hedelmät, marjat, palkokasvit ja pähkinät (% painosta) | yli 40 % → 1, yli 60 % → 2, yli 80 % → 5 |

Kuten Nutri-Scoressa, **proteiinia ei lasketa**, jos laskevia pisteitä on 11 tai enemmän eikä kasvisten osuus ole yli 80 %. Muuten esimerkiksi rasvainen juusto saisi proteiinista liian hyvän arvion.

### Pisteet → kirjain

Pisteet = laskevat − nostavat.

| Pisteet | Arvio |
|---|---|
| −1 tai vähemmän | A |
| 0–2 | B |
| 3–10 | C |
| 11–18 | D |
| 19 tai enemmän | E |

### Juomat

Juomilla on tiukemmat energia- ja sokeriasteikot (100 ml): energia (kJ) 0, 30, 60, 90, 120, 150, 180, 210, 240, 270 ja sokerit (g) 0, 1,5, 3, 4,5, 6, 7,5, 9, 10,5, 12, 13,5. Kasvisosuus antaa juomille 0, 2, 4 tai 10 pistettä. Arvio: vesi, makeuttamaton tee ja kahvi (alle 5 kcal, ei sokeria) A; muuten enintään 1 piste B, 2–5 C, 6–9 D, 10 tai enemmän E.

## 3. Mistä arvio lasketaan

| Kohde | Tapa |
|---|---|
| Kirjaston resepti | Ainesosien yhdistelmä grammojen mukaan (yksi annos). Kasvisosuus tarkistetusta listasta `FRUIT_VEG_IDS` (perunat, tärkkelykset, hillot ja kastikkeet eivät kuulu). Tulos välimuistissa reseptiolion mukaan. |
| Päiväkirjan ruoka | Ruoan ravintoarvot 100 g kohden; kasvikset ja hedelmät -kategoria on 100 % kasvisosuutta. |
| Viivakoodituote | Open Food Factsin Nutri-Score, jos tuotteella on se (`nutriscore_grade`); merkitty "Nutri-Score Open Food Factsista". Muuten oma laskenta tuotteen ravintoarvoista. |
| Kirjattu resepti | Reseptin arvio. |
| Pikalisäys | Ei arviota (ei koostumusta). |
| Päivä | Kaikki punnitut kirjaukset yhdistettynä grammojen mukaan; pikalisäykset jätetään pois. |
| Tuotu resepti | Kuten kirjaston resepti, kun ainesosat on yhdistetty ainesosatauluun. |

## 4. Missä arvio näkyy

- Reseptikortin vasen yläkulma ja reseptisivun sirurivi (napautus avaa selityksen ja tarvittaessa paremman vaihtoehdon).
- Päiväkirjan jokainen kirjaus (pieni merkki) ja "Päivän laatuarvio" -rivi.
- Ruoan ja kirjauksen muokkausnäkymä.
- Raporteissa arvioiden jakauma (osa 8).
- "Piilota kalorit" -asetus piilottaa myös kirjauskohtaiset merkit Päiväkirjasta.

## 5. Rajoitukset

- Oma laskenta on yksinkertaistettu (esimerkiksi juustoille ja rasvoille ei ole Nutri-Scoren erityissääntöjä), ja kotiruoat saavat tyypillisesti hyvän arvion, koska ne tehdään perusraaka-aineista.
- Päiväkirjan testiruokien ravintoarvot ovat pyöristettyjä esimerkkiarvoja, ja niiden vitamiinit tulevat lähimmästä Fineli-ruoasta.
- Backend-vaiheessa sama laskenta ajetaan palvelimella reseptejä tallennettaessa, jotta arvio on sama kaikilla laitteilla.
