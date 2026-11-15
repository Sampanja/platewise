import type { RecipeText } from '../types';

/** Finnish text for recipe batch 6 (structure: catalog/recipes6.ts). */
export const FI_RECIPES_06: Readonly<Record<string, RecipeText>> = {
  'salmon-soup': {
    title: 'Kermainen lohikeitto',
    description: 'Suomalainen lohikeitto: mehevää lohta, perunaa, purjoa, kermaa ja runsaasti tilliä.',
    steps: [
      'Kuori ja kuutioi perunat ja porkkanat. Leikkaa purjo renkaiksi.',
      'Keitä kasviksia 7 dl:ssa vettä liemikuution ja maustepippurien kanssa noin 12 minuuttia.',
      'Lisää kerma ja kuutioitu lohi. Hauduta miedolla lämmöllä 5 minuuttia, kunnes lohi on kypsää.',
      'Mausta suolalla ja lisää runsaasti hienonnettua tilliä.',
    ],
    tips: [
      'Älä keitä lohta voimakkaasti, niin palat pysyvät ehjinä ja mehevinä.',
      'Kerman voi korvata laktoosittomalla ruokakermalla.',
    ],
    storage: 'Jäähdytä nopeasti ja säilytä jääkaapissa 1–2 päivää.',
  },
  'karelian-stew': {
    title: 'Karjalanpaisti ja perunat',
    description: 'Uunissa tuntikausia haudutettu naudan ja porsaan liha, maustepippuri ja puolukka.',
    steps: [
      'Lämmitä uuni 175 asteeseen. Leikkaa lihat noin 3 cm:n kuutioiksi.',
      'Kerrosta liha, sipulilohkot ja porkkanat pataan. Lisää maustepippurit ja suola.',
      'Kaada joukkoon vettä niin, että liha juuri peittyy. Haudu kannen alla noin 3 tuntia.',
      'Keitä perunat kypsiksi ennen tarjoilua.',
      'Tarjoa paisti perunoiden ja puolukkasurvoksen kanssa.',
    ],
    tips: [
      'Paisti paranee seuraavana päivänä uudelleen lämmitettynä.',
      'Lihan ei tarvitse olla fileetä: sitkeät palat murenevat pitkässä haudutuksessa.',
    ],
  },
  'macaroni-casserole': {
    title: 'Makaronilaatikko',
    description: 'Lapsuuden suosikki: makaronia, jauhelihaa ja munamaitoa uunissa kullanruskeaksi.',
    steps: [
      'Lämmitä uuni 200 asteeseen. Keitä makaronit puolikypsiksi suolalla maustetussa vedessä.',
      'Ruskista jauheliha ja sipuli pannulla ja mausta suolalla ja pippurilla.',
      'Sekoita makaronit ja jauheliha voideltuun uunivuokaan.',
      'Vatkaa maito ja kananmunat ja kaada vuokaan.',
      'Paista noin 50 minuuttia, kunnes munamaito on hyytynyt ja pinta ruskistunut.',
    ],
    tips: [
      'Tarjoa ketsupin ja kurkkusalaatin kanssa.',
      'Laatikko on valmistettavissa illalla valmiiksi ja paistettavissa seuraavana päivänä.',
    ],
  },
  'minced-meat-sauce-potatoes': {
    title: 'Jauhelihakastike ja perunat',
    description: 'Arjen perusruoka: ruskea jauhelihakastike, keitetyt perunat ja suolakurkku.',
    steps: [
      'Keitä perunat kypsiksi.',
      'Ruskista jauheliha ja sipuli pannulla.',
      'Ripottele jauhot pinnalle ja sekoita. Lisää 2 dl vettä ja liemitiiviste.',
      'Hauduta 10 minuuttia ja mausta suolalla ja pippurilla.',
      'Tarjoa perunoiden ja suolakurkun kanssa.',
    ],
    tips: [
      'Tilkka kermaa tekee kastikkeesta pehmeämmän.',
      'Kastike pakastuu hyvin.',
    ],
  },
  'cabbage-casserole': {
    title: 'Kaalilaatikko ja puolukka',
    description: 'Makeahko kaalilaatikko jauhelihalla, riisillä ja siirapilla. Puolukka kuuluu kylkeen.',
    steps: [
      'Lämmitä uuni 175 asteeseen.',
      'Keitä puuroriisiä 1 dl:ssa vettä 10 minuuttia.',
      'Ruskista suikaloitu kaali pannulla erissä ja siirrä isoon kulhoon.',
      'Ruskista jauheliha ja sipuli ja sekoita kaalin, riisin, suolan ja pippurin kanssa. Lisää 2 dl vettä.',
      'Levitä vuokaan, valuta pinnalle siirappi ja paista noin 2 tuntia. Sekoita kerran välissä.',
      'Tarjoa puolukkasurvoksen kanssa.',
    ],
    tips: [
      'Kaalilaatikko maistuu parhaalta toisena päivänä.',
      'Kasvisversio syntyy soijarouheesta.',
    ],
  },
  'liver-casserole': {
    title: 'Maksalaatikko',
    description: 'Rusinoilla ja siirapilla makeutettu perinteinen maksalaatikko: rautaa ja vanhaa kunnon makua.',
    steps: [
      'Lämmitä uuni 175 asteeseen. Keitä puuroriisiä 1 dl:ssa vettä 10 minuuttia.',
      'Lisää maito ja keitä löysäksi puuroksi noin 10 minuuttia. Jäähdytä hieman.',
      'Jauha tai hienonna maksa ja kuullota sipuli voissa.',
      'Sekoita puuroon maksa, sipuli, kananmuna, rusinat, siirappi ja suola.',
      'Kaada voideltuun vuokaan ja paista noin tunti.',
      'Tarjoa puolukkasurvoksen kanssa.',
    ],
    tips: [
      'Raskaana olevien kannattaa välttää maksaruokia niiden korkean A-vitamiinipitoisuuden vuoksi.',
    ],
  },
  'summer-vegetable-soup': {
    title: 'Kesäkeitto',
    description: 'Maitoon keitetyt kesän kasvikset: uudet perunat, porkkana, kukkakaali, herneet ja tilli.',
    steps: [
      'Keitä perunat ja porkkanat 3 dl:ssa suolalla maustettua vettä 10 minuuttia.',
      'Lisää kukkakaalin kukinnot ja herneet ja keitä 5 minuuttia.',
      'Sekoita jauhot maitoon ja kaada keittoon koko ajan sekoittaen.',
      'Kiehauta, lisää voi ja tilli ja tarkista suola.',
    ],
    tips: [
      'Nuoret kasvikset tarvitsevat vain lyhyen keittoajan.',
      'Laktoosittomana: käytä laktoositonta maitoa ja rypsiöljyä.',
    ],
  },
  'meat-soup': {
    title: 'Lihakeitto juureksilla',
    description: 'Kirkas, ruokaisa lihakeitto naudanlihasta, perunasta, porkkanasta ja lantusta.',
    steps: [
      'Leikkaa liha kuutioiksi ja laita kattilaan 1 litran kanssa kylmää vettä. Kuumenna ja kuori vaahto.',
      'Lisää maustepippurit ja suola ja keitä hiljalleen noin tunti.',
      'Lisää kuutioidut juurekset ja sipuli ja keitä vielä 20–25 minuuttia.',
      'Viimeistele persiljalla.',
    ],
    tips: [
      'Liemi kirkastuu, kun vaahto kuoritaan huolellisesti alussa.',
    ],
  },
  'baltic-herring-patties': {
    title: 'Silakkapihvit ja perunamuusi',
    description: 'Ruisjauhoissa paistetut silakkapihvit, tilli ja pehmeä perunamuusi.',
    steps: [
      'Keitä perunat kypsiksi ja soseuta lämpimän maidon ja puolikkaan voin kanssa muusiksi.',
      'Mausta silakkafileet suolalla. Laita fileiden väliin tilliä ja paina pareiksi.',
      'Kääntele pihvit ruisjauhoissa.',
      'Paista loppu voissa pannulla kummaltakin puolelta kullanruskeiksi, noin 3 minuuttia per puoli.',
    ],
    tips: [
      'Silakka on edullinen ja kotimainen kala.',
      'Tarjoa puolukkasurvoksen tai etikkapunajuuren kanssa.',
    ],
  },
  'fried-vendace': {
    title: 'Paistetut muikut ja keitetyt perunat',
    description: 'Rapeiksi paistetut muikut ruisjauhoissa, keitetyt perunat ja sitruuna.',
    steps: [
      'Keitä perunat kypsiksi.',
      'Sekoita ruisjauhot ja suola ja kääntele muikut jauhoissa.',
      'Paista muikut voissa erissä rapeiksi, noin 3 minuuttia per puoli.',
      'Tarjoa perunoiden ja sitruunalohkojen kanssa.',
    ],
    tips: [
      'Paista muikut väljästi, niin ne rapeutuvat eivätkä hautu.',
    ],
    storage: 'Paras heti. Säilytä tähteet jääkaapissa 1 päivä.',
    reheating: 'Kuumenna uunissa 200 asteessa noin 8 minuuttia, niin muikut rapeutuvat uudelleen.',
  },
  'frankfurter-sauce': {
    title: 'Nakkikastike ja perunat',
    description: 'Tomaattinen kermainen nakkikastike ja keitetyt perunat: nopea perhesuosikki.',
    steps: [
      'Keitä perunat kypsiksi.',
      'Viipaloi nakit ja kuullota ne sipulin kanssa pannulla.',
      'Ripottele jauhot pinnalle, lisää tomaattipyree, 2 dl vettä ja kerma.',
      'Hauduta 5 minuuttia ja tarjoa perunoiden kanssa.',
    ],
    tips: [
      'Kastikkeen voi tehdä myös kasvisnakeista.',
    ],
  },
  'sauteed-reindeer': {
    title: 'Poronkäristys, perunamuusi ja puolukka',
    description: 'Lapin klassikko: voissa käristetty poro, sileä perunamuusi, puolukka ja suolakurkku.',
    steps: [
      'Sulata poronkäristys ja paloittele se erilleen.',
      'Käristä poro voissa isossa kattilassa, kunnes neste on haihtunut. Lisää sipuli.',
      'Lisää 2 dl vettä, maustepippurit ja suola ja hauduta kannen alla 30 minuuttia.',
      'Keitä perunat ja soseuta lämpimän maidon kanssa muusiksi.',
      'Tarjoa muusin, puolukan ja suolakurkun kanssa.',
    ],
    tips: [
      'Poronliha on vähärasvaista ja runsasproteiinista.',
    ],
  },
  'pork-belly-gravy': {
    title: 'Läskisoosi ja perunat',
    description: 'Savolainen klassikko: rapeaksi paistettu siankylki, ruskea kastike ja perunat.',
    steps: [
      'Leikkaa siankylki kuutioiksi ja paista rasvan sulaessa rapeaksi.',
      'Lisää sipuli ja paista, kunnes se ruskistuu.',
      'Ripottele jauhot pinnalle ja ruskista ne kevyesti.',
      'Lisää 4 dl vettä ja hauduta kannen alla 30–40 minuuttia. Mausta suolalla ja pippurilla.',
      'Keitä perunat ja tarjoa kastikkeen kanssa.',
    ],
    tips: [
      'Kaada osa sulaneesta rasvasta pois ennen jauhojen lisäämistä, niin kastike on kevyempi.',
    ],
  },
  'ham-potato-gratin': {
    title: 'Kinkkukiusaus',
    description: 'Perunaa, kinkkua ja sipulia kermaisessa maidossa uunissa kullanruskeaksi.',
    steps: [
      'Lämmitä uuni 200 asteeseen.',
      'Suikaloi perunat ja sipuli.',
      'Kerrosta perunat, sipuli ja kinkku voideltuun vuokaan.',
      'Sekoita kerma, maito, suola ja pippuri ja kaada vuokaan. Ripottele juustoraaste pinnalle.',
      'Paista noin tunti, kunnes perunat ovat pehmeitä.',
    ],
    tips: [
      'Valmis perunasuikale nopeuttaa valmistusta.',
    ],
  },
  'salmon-potato-casserole': {
    title: 'Lohilaatikko',
    description: 'Perunaa, lohta ja tilliä munamaidossa: pehmeä ja lohdullinen uuniruoka.',
    steps: [
      'Lämmitä uuni 200 asteeseen.',
      'Viipaloi perunat ohuiksi ja kuutioi lohi.',
      'Kerrosta perunat, lohi, sipuli ja tilli voideltuun vuokaan.',
      'Vatkaa kananmunat, maito, suola ja rouhittu maustepippuri ja kaada vuokaan.',
      'Nosta pinnalle voinokareita ja paista noin tunti.',
    ],
    tips: [
      'Tarjoa sulatetun voin ja raikkaan salaatin kanssa.',
    ],
  },
  'clear-fish-soup': {
    title: 'Kirkas kalakeitto',
    description: 'Kevyt kalakeitto seitistä, perunasta, porkkanasta ja tillistä, ilman maitoa.',
    steps: [
      'Keitä kuutioidut perunat, porkkanat ja sipuli 7 dl:ssa vettä liemikuution ja maustepippurien kanssa 12 minuuttia.',
      'Lisää paloiteltu kala ja hauduta 5 minuuttia.',
      'Lisää voi ja tilli ja tarkista suola.',
    ],
    tips: [
      'Pakastekalan voi lisätä keittoon jäisenä: pidennä haudutusta muutamalla minuutilla.',
    ],
    storage: 'Jäähdytä nopeasti ja säilytä jääkaapissa 1–2 päivää.',
  },
  'minced-meat-soup': {
    title: 'Jauhelihakeitto',
    description: 'Edullinen ja ruokaisa keitto jauhelihasta, perunasta ja porkkanasta.',
    steps: [
      'Ruskista jauheliha ja sipuli kattilassa.',
      'Lisää 7 dl vettä, liemitiiviste ja maustepippurit ja kiehauta.',
      'Lisää kuutioidut perunat ja porkkanat ja keitä 15–20 minuuttia.',
      'Tarkista suola ja viimeistele persiljalla.',
    ],
    tips: [
      'Keiton voi tehdä myös broilerin jauhelihasta.',
    ],
  },
  'forest-mushroom-sauce': {
    title: 'Metsäsienikastike ja perunat',
    description: 'Kermainen metsäsienikastike ja keitetyt perunat: syksyn makuja ilman lihaa.',
    steps: [
      'Keitä perunat kypsiksi.',
      'Paista sienet kuumalla pannulla, kunnes neste on haihtunut.',
      'Lisää voi ja sipuli ja kuullota.',
      'Lisää kerma ja hauduta 5 minuuttia. Mausta suolalla ja pippurilla.',
    ],
    tips: [
      'Suppilovahverot ja tatit sopivat yhtä hyvin.',
      'Laktoosittomana: laktoositon ruokakerma ja rypsiöljy.',
    ],
  },
  'chanterelle-sauce-new-potatoes': {
    title: 'Kantarellikastike ja uudet perunat',
    description: 'Voissa paistetut kantarellit kermassa ja uudet perunat: kesän herkku.',
    steps: [
      'Keitä uudet perunat kypsiksi suolalla maustetussa vedessä.',
      'Paista puhdistetut kantarellit kuivalla pannulla, kunnes neste haihtuu.',
      'Lisää voi ja sipuli ja paista vielä hetki.',
      'Lisää kerma, hauduta 5 minuuttia ja mausta suolalla. Viimeistele ruohosipulilla.',
    ],
    tips: [
      'Kantarelleja ei pestä vedessä: puhdista ne harjalla.',
    ],
  },
  'finnish-hash': {
    title: 'Pyttipannu ja paistettu kananmuna',
    description: 'Rapeat perunakuutiot, nakki ja sipuli pannulla, päällä paistettu muna ja punajuuri.',
    steps: [
      'Kuutioi perunat pieniksi ja keitä niitä 5 minuuttia. Valuta hyvin.',
      'Paista perunat öljyssä rapeiksi, noin 10 minuuttia.',
      'Lisää kuutioidut nakit ja sipuli ja paista vielä 5 minuuttia. Mausta suolalla.',
      'Paista kananmunat ja tarjoa pyttipannun päällä etikkapunajuuren kanssa.',
    ],
    tips: [
      'Pyttipannu on mainio tapa käyttää tähteeksi jääneet keitetyt perunat.',
    ],
  },
  'oven-sausage-mash': {
    title: 'Uunimakkara ja perunamuusi',
    description: 'Sinapilla ja sipulilla uunissa paistettu makkara ja sileä perunamuusi.',
    steps: [
      'Lämmitä uuni 225 asteeseen.',
      'Viillä makkaraan viiltoja, sivele sinapilla ja täytä viillot sipulisuikaleilla.',
      'Paista vuoassa noin 25 minuuttia.',
      'Keitä perunat ja soseuta lämpimän maidon ja voin kanssa muusiksi.',
    ],
    tips: [
      'Kasvismakkara sopii samaan ohjeeseen.',
    ],
  },
  'fish-sticks-mash': {
    title: 'Kalapuikot, perunamuusi ja porkkanaraaste',
    description: 'Rapeat uunikalapuikot, perunamuusi ja raikas porkkanaraaste: lapsiperheen arkiklassikko.',
    steps: [
      'Paista kalapuikot uunissa pakkauksen ohjeen mukaan.',
      'Keitä perunat ja soseuta lämpimän maidon ja voin kanssa muusiksi.',
      'Raasta porkkana ja purista päälle sitruunamehua.',
    ],
    tips: [
      'Uunissa paistetut kalapuikot ovat kevyempiä kuin pannulla paistetut.',
    ],
  },
  'rosolli-eggs': {
    title: 'Rosolli ja keitetyt kananmunat',
    description: 'Joulupöydän punajuurisalaatti arkeen: punajuuri, peruna, porkkana, omena ja kermaviilikastike.',
    steps: [
      'Keitä perunat, porkkanat ja kananmunat kypsiksi ja jäähdytä.',
      'Kuutioi perunat, porkkanat, punajuuret, omena, suolakurkku ja sipuli.',
      'Sekoita kasvikset kevyesti ja mausta suolalla.',
      'Sekoita kermaviiliin tilkka punajuuren lientä ja tarjoa kastikkeena.',
      'Tarjoa puolitettujen kananmunien kanssa.',
    ],
    tips: [
      'Salaatti on kauneimmillaan, kun ainekset sekoitetaan vasta tarjoillessa.',
    ],
    storage: 'Säilytä kannellisessa rasiassa jääkaapissa 2 päivää.',
  },
  'blueberry-pie': {
    title: 'Mustikkapiirakka',
    description: 'Murea pohja, mehevä mustikkatäyte ja kermaviilikuorrute: kesän ja syksyn herkku.',
    steps: [
      'Lämmitä uuni 200 asteeseen.',
      'Vatkaa pehmeä voi ja puolet sokerista. Lisää puolet kananmunasta ja sitten jauhot ja leivinjauhe.',
      'Painele taikina piirakkavuoan pohjalle ja reunoille.',
      'Levitä mustikat pohjan päälle.',
      'Sekoita kermaviili, loput sokerista ja kananmunasta ja kaada mustikoiden päälle.',
      'Paista noin 30 minuuttia, kunnes täyte on hyytynyt.',
    ],
    tips: [
      'Anna piirakan jäähtyä ennen leikkaamista, niin täyte asettuu.',
    ],
    storage: 'Säilytä jääkaapissa kelmulla peitettynä 3 päivää.',
    reheating: 'Tarjoa huoneenlämpöisenä tai lämmitä uunissa 150 asteessa 10 minuuttia.',
  },
  'spinach-soup-egg': {
    title: 'Pinaattikeitto ja kananmuna',
    description: 'Vihreä ja pehmeä pinaattikeitto, jonka päälle nostetaan puolitettu kananmuna.',
    steps: [
      'Keitä kananmunat kovaksi ja kuutioidut perunat kypsiksi pienessä määrässä vettä.',
      'Sekoita jauhot kylmään maitoon ja kaada perunoiden joukkoon sekoittaen. Kiehauta.',
      'Lisää hienonnettu pinaatti ja voi ja keitä 3 minuuttia.',
      'Mausta suolalla ja tarjoa puolitettujen kananmunien kanssa.',
    ],
    tips: [
      'Ripaus muskottipähkinää on perinteinen mauste.',
      'Pakastepinaatti käy hyvin.',
    ],
  },
};
