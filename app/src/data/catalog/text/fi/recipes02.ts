import type { RecipeText } from '../types';

/** Finnish text for recipe batch 2 (structure: catalog/recipes2.ts). */
export const FI_RECIPES_02: Readonly<Record<string, RecipeText>> = {
  'red-curry-soup': {
    title: 'Punainen currykeitto',
    description: 'Täyteläinen bataatti-linssikeitto kookoksella ja limellä.',
    steps: [
      'Kuullota sipuli, valkosipuli ja inkivääri öljyssä. Lisää currytahna.',
      'Lisää kuutioitu bataatti, huuhdotut linssit, liemikuutio ja 3 dl vettä per annos.',
      'Keitä 15 minuuttia, kunnes bataatti on pehmeää. Lisää kookosmaito.',
      'Soseuta halutessasi. Mausta limellä ja korianterilla.',
    ],
    tips: [
      'Currytahnan määrällä säädät tulisuuden.',
      'Purista lopuksi joukkoon limeä.',
    ],
  },
  'feta-salad': {
    title: 'Fetasalaatti ja saksanpähkinät',
    description: 'Kymmenen minuutin salaatti fetalla, pähkinöillä ja patongilla.',
    steps: [
      'Paahda saksanpähkinät kuivalla pannulla.',
      'Pilko kurkku, tomaatit ja punasipuli.',
      'Kokoa salaatti, murenna päälle feta ja pähkinät ja valuta oliiviöljyä.',
      'Tarjoa patongin kanssa.',
    ],
    tips: [
      'Paahda saksanpähkinät kuivalla pannulla, niin maku syvenee.',
      'Salaatti on hyvä lounaseväs, kun kastike on erillisessä rasiassa.',
    ],
  },
  'salmon-zucchini': {
    title: 'Paistettu lohi ja kesäkurpitsasalsa',
    description: 'Rapeapintainen lohi, tillinen kesäkurpitsasalsa ja keitetyt perunat.',
    steps: [
      'Keitä perunat.',
      'Kuutioi kesäkurpitsa ja tomaatit. Sekoita sitruunan mehun, tillin ja oliiviöljyn kanssa.',
      'Paista lohi nahkapuoli alaspäin, kunnes nahka on rapea. Käännä ja paista minuutti.',
      'Tarjoa lohi salsan ja perunoiden kanssa.',
    ],
    tips: [
      'Paista lohi nahkapuoli alaspäin ja käännä vasta, kun nahka irtoaa pannusta.',
      'Salsan voi tehdä tunnin etukäteen, jolloin maut ehtivät tasaantua.',
    ],
    storage: 'Säilytä jääkaapissa 1–2 päivää.',
  },
  'chickpea-curry': {
    title: 'Kikhernecurry',
    description: 'Vegaaninen kikhernecurry pinaatilla ja kookoksella.',
    steps: [
      'Keitä riisi.',
      'Kuullota sipuli, valkosipuli ja inkivääri. Lisää garam masala.',
      'Lisää kikherneet, tomaattimurska ja kookosmaito. Hauduta 15 minuuttia.',
      'Sekoita joukkoon pinaatti ja tarjoa riisin kanssa.',
    ],
    tips: [
      'Kikherneen liemen voi käyttää kastikkeen sakeuttamiseen.',
      'Curry pakastuu hyvin annoksina.',
    ],
  },
  'chicken-noodle-soup': {
    title: 'Kookoksinen kananuudelikeitto',
    description: 'Thaimaalaishenkinen keitto broilerilla, riisinuudeleilla ja limellä.',
    steps: [
      'Kiehauta 3 dl vettä per annos, liemikuutio ja currytahna.',
      'Lisää ohuet broilerisuikaleet ja paprika. Keitä 8 minuuttia.',
      'Lisää kookosmaito ja nuudelit. Keitä, kunnes nuudelit ovat pehmeitä.',
      'Mausta limellä ja viimeistele korianterilla ja kevätsipulilla.',
    ],
    tips: [
      'Keitä nuudelit erikseen, jos keittoa jää tähteeksi: ne eivät pehmene liikaa.',
      'Korianteri ja lime viimeistelevät keiton.',
    ],
  },
  'beef-noodle-soup': {
    title: 'Nautanuudelikeitto',
    description: 'Inkiväärinen liemi, naudan suikaleet ja munanuudelit.',
    steps: [
      'Keitä liemi: 4 dl vettä per annos, liemikuutio, soija, inkivääri ja valkosipuli. Hauduta 10 minuuttia.',
      'Lisää porkkanasuikaleet ja nuudelit.',
      'Lisää ohuet naudan suikaleet lopuksi ja kypsennä 1–2 minuuttia.',
      'Tarjoa kevätsipulin ja chilin kanssa.',
    ],
    tips: [
      'Leikkaa liha mahdollisimman ohuiksi siivuiksi, niin se kypsyy liemessä nopeasti.',
      'Lisää lopuksi tuoretta chiliä ja kevätsipulia.',
    ],
  },
  'shrimp-paella': {
    title: 'Katkarapupaella',
    description: 'Espanjalaistyylinen riisipannu katkaravuilla, paprikalla ja herneillä.',
    steps: [
      'Kuullota sipuli, valkosipuli ja paprika oliiviöljyssä leveässä pannussa.',
      'Lisää riisi, paprikajauhe ja tomaattimurska. Paista hetki.',
      'Kaada joukkoon liemi (2,5 dl per annos) ja keitä sekoittamatta 18 minuuttia.',
      'Lisää katkaravut ja herneet pinnalle, peitä ja anna hautua 5 minuuttia. Tarjoa sitruunalohkojen kanssa.',
    ],
    tips: [
      'Älä sekoita riisiä keittämisen aikana: pohjaan syntyy maukas rapea kerros.',
      'Paellan voi tehdä myös kanalla.',
    ],
    storage: 'Säilytä jääkaapissa enintään 1 päivä.',
  },
  'steak-potatoes': {
    title: 'Pihvi ja paahdetut perunat',
    description: 'Naudan ulkofileepihvi, valkosipuliperunat ja vihreä salaatti.',
    steps: [
      'Lohko perunat, sekoita oliiviöljyyn ja suolaan. Paahda 225 °C:ssa 30 minuuttia.',
      'Ota pihvit huoneenlämpöön ja mausta suolalla ja pippurilla.',
      'Paista pihvit kuumalla pannulla 3 minuuttia per puoli. Lisää lopuksi voi ja valkosipuli.',
      'Anna levätä 5 minuuttia ja tarjoa perunoiden ja salaatin kanssa.',
    ],
    tips: [
      'Ota pihvit huoneenlämpöön puoli tuntia ennen paistamista.',
      'Anna pihvin levätä 5 minuuttia ennen leikkaamista.',
    ],
  },
  'pea-soup': {
    title: 'Hernekeitto ja sinappi',
    description: 'Torstain klassikko kinkulla. Kuivatut herneet liotetaan edellisenä iltana.',
    steps: [
      'Liota herneitä kylmässä vedessä yön yli.',
      'Valuta ja keitä herneet uudessa vedessä (4 dl per annos) liemikuution kanssa. Kuori vaahto.',
      'Lisää sipuli, porkkana ja kinkkukuutiot. Keitä miedolla lämmöllä noin 1,5 tuntia.',
      'Tarjoa sinapin ja ruisleivän kanssa.',
    ],
    tips: [
      'Liota kuivatut herneet yön yli, niin ne kypsyvät nopeammin.',
      'Hernekeitto pakastuu erinomaisesti.',
    ],
  },
  'teriyaki-salmon': {
    title: 'Teriyakilohi ja riisi',
    description: 'Kiiltäväpintainen lohi, parsakaali ja seesaminsiemenet.',
    steps: [
      'Keitä riisi.',
      'Paista lohipalat öljyssä molemmin puolin.',
      'Kaada pannulle teriyakikastike ja anna kuplia, kunnes lohi on kiiltävää.',
      'Höyrytä parsakaali. Tarjoa seesaminsiementen ja kevätsipulin kanssa.',
    ],
    tips: [
      'Kastike karamellisoituu nopeasti: pidä lämpö keskitasolla.',
      'Ripottele lopuksi seesaminsiemeniä ja kevätsipulia.',
    ],
    storage: 'Säilytä jääkaapissa 1–2 päivää.',
  },
  'fish-tacos': {
    title: 'Kalatacot ja kaalisalaatti',
    description: 'Paprikalla maustettu seiti, rapea kaali ja limejogurtti tortillassa.',
    steps: [
      'Sulata kala. Kääntele paloja jauhoissa, paprikajauheessa ja suolassa.',
      'Paista kala öljyssä rapeaksi.',
      'Suikaloi kaali ja sekoita limen mehuun. Sekoita jogurttiin limen kuorta.',
      'Lämmitä tortillat ja täytä kalalla, kaalilla, jogurtilla ja korianterilla.',
    ],
    tips: [
      'Kaalisalaatti on paras hetki ennen tarjoilua sekoitettuna.',
      'Kalan voi myös paistaa uunissa 200 °C:ssa 12 minuuttia.',
    ],
    storage: 'Säilytä kala ja kaalisalaatti erikseen jääkaapissa 1 päivä.',
  },
  'lentil-chili': {
    title: 'Savuinen linssichili',
    description: 'Vegaaninen chili kurpitsalla, linsseillä ja kidneypavuilla.',
    steps: [
      'Kuullota sipuli ja valkosipuli öljyssä. Lisää mausteet.',
      'Lisää kuutioitu kurpitsa, linssit, tomaattimurska ja 1 dl vettä per annos.',
      'Hauduta 25 minuuttia. Lisää huuhdotut kidneypavut viimeiseksi viideksi minuutiksi.',
      'Tarjoa riisin ja korianterin kanssa.',
    ],
    tips: [
      'Chili maistuu vielä paremmalta seuraavana päivänä.',
      'Tarjoa riisin, tortillan tai uuniperunan kanssa.',
    ],
  },
  'shakshuka': {
    title: 'Shakshuka ja patonki',
    description: 'Munat haudutettuna mausteisessa tomaatti-paprikakastikkeessa.',
    steps: [
      'Kuullota sipuli, paprika ja valkosipuli oliiviöljyssä.',
      'Lisää mausteet ja tomaattimurska. Hauduta 10 minuuttia.',
      'Tee kastikkeeseen kuopat ja riko niihin munat. Peitä ja kypsennä 6–8 minuuttia.',
      'Murenna päälle feta ja persilja. Tarjoa patongin kanssa.',
    ],
    tips: [
      'Peitä pannu kannella, niin munat kypsyvät tasaisesti.',
      'Jätä keltuaiset pehmeiksi ja dippaa leivällä.',
    ],
    storage: 'Paras heti. Tomaattikastikkeen voi tehdä etukäteen ja säilyttää 3 päivää.',
  },
  'falafel': {
    title: 'Falafelit ja jogurttikastike',
    description: 'Kotitekoiset kikhernepyörykät pitassa raikkaiden kasvisten kanssa.',
    steps: [
      'Valuta kikherneet hyvin. Aja ne sipulin, valkosipulin, persiljan, juustokuminan ja jauhojen kanssa karkeaksi tahnaksi.',
      'Muotoile pieniksi pyöryköiksi ja paista öljyssä rapeiksi.',
      'Sekoita jogurttiin sitruunan mehu ja suola.',
      'Täytä pitat falafeleilla, kasviksilla ja kastikkeella.',
    ],
    tips: [
      'Kuivaa kikherneet hyvin, niin pyörykät pysyvät koossa.',
      'Falafelit voi paistaa myös uunissa öljyllä sivellen.',
    ],
  },
  'fish-pie': {
    title: 'Kalapaistos perunamuusilla',
    description: 'Tillistä seitiä ja herneitä muusikuoren alla.',
    steps: [
      'Keitä perunat ja soseuta maidon ja voin kanssa.',
      'Paloittele kala vuokaan, mausta suolalla, sitruunalla ja tillillä. Lisää herneet.',
      'Levitä muusi päälle ja ripottele juusto.',
      'Paista 200 °C:ssa 25 minuuttia.',
    ],
    tips: [
      'Pakastekala käy suoraan vuokaan: lisää paistoaikaa 10 minuuttia.',
      'Ripottele pinnalle juustoraastetta rapeaksi kuoreksi.',
    ],
  },
  'pumpkin-soup': {
    title: 'Thaimaalainen kurpitsakeitto',
    description: 'Samettinen myskikurpitsakeitto currylla ja kookoksella.',
    steps: [
      'Kuullota sipuli, valkosipuli ja inkivääri öljyssä. Lisää currytahna.',
      'Lisää kuutioitu kurpitsa, liemikuutio ja 2,5 dl vettä per annos. Keitä 20 minuuttia.',
      'Lisää kookosmaito ja soseuta sileäksi.',
      'Mausta limellä, viimeistele korianterilla ja tarjoa patongin kanssa.',
    ],
    tips: [
      'Paahda kurpitsa uunissa ennen keittämistä, niin maku syvenee.',
      'Koristele paahdetuilla kurpitsansiemenillä.',
    ],
  },
  'cabbage-soup': {
    title: 'Kaalikeitto',
    description: 'Kotoisa jauheliha-kaalikeitto, joka paranee seuraavaan päivään.',
    steps: [
      'Ruskista jauheliha ja sipuli kattilassa.',
      'Lisää kuutioitu kaali, porkkana ja peruna sekä 4 dl vettä per annos ja liemikuutio.',
      'Keitä miedolla lämmöllä 35 minuuttia.',
      'Mausta pippurilla ja suolalla. Tarjoa ruisleivän kanssa.',
    ],
    tips: [
      'Ruskista kaali kevyesti ennen keittämistä, niin maku makeutuu.',
      'Kaalikeitto paranee seistessään.',
    ],
  },
  'tomato-soup': {
    title: 'Kermainen tomaattikeitto ja juustoleipä',
    description: 'Basilikainen tomaattikeitto ja uunissa sulatettu juustopatonki.',
    steps: [
      'Kuullota sipuli ja valkosipuli öljyssä.',
      'Lisää tomaattimurska, liemikuutio, sokeri ja 1 dl vettä per annos. Keitä 10 minuuttia.',
      'Lisää kerma ja soseuta. Mausta basilikalla.',
      'Ripottele juusto patonkiviipaleille ja paista uunissa 225 °C:ssa 5 minuuttia.',
    ],
    tips: [
      'Soseuta keitto sauvasekoittimella sileäksi.',
      'Juustoleivän voi paistaa uunissa tai pannulla.',
    ],
  },
  'dal': {
    title: 'Linssidaal ja riisi',
    description: 'Lämmin ja edullinen punaisten linssien daal pinaatilla.',
    steps: [
      'Keitä riisi.',
      'Kuullota sipuli, valkosipuli ja inkivääri. Lisää mausteet.',
      'Lisää linssit, tomaattimurska ja 3 dl vettä per annos. Keitä 15 minuuttia.',
      'Sekoita joukkoon kookosmaito, pinaatti ja sitruunan mehu.',
    ],
    tips: [
      'Punaiset linssit eivät tarvitse liotusta.',
      'Mausteöljy (tadka) lopuksi pinnalle tuo daaliin syvyyttä.',
    ],
  },
  'tomato-egg-rice': {
    title: 'Tomaatti-munapaistos ja riisi',
    description: 'Kiinalainen kotiruoka: pehmeää munaa ja makeaa tomaattia.',
    steps: [
      'Keitä riisi.',
      'Vatkaa munat ja paista ne öljyssä pehmeiksi kokkareiksi. Nosta sivuun.',
      'Paista lohkotut tomaatit, kunnes ne pehmenevät. Lisää sokeri ja soija.',
      'Palauta munat pannulle ja viimeistele kevätsipulilla.',
    ],
    tips: [
      'Kypsennä munat pehmeiksi ja yhdistä tomaattiin vasta lopuksi.',
      'Helppo arkiruoka, joka valmistuu 15 minuutissa.',
    ],
    storage: 'Paras heti. Säilytä tähteet jääkaapissa enintään 1 päivä.',
  },
  'shrimp-stir-fry': {
    title: 'Katkarapuwokki ja rapeat kasvikset',
    description: 'Vartin wokki katkaravuista, kasviksista ja makeasta chilistä.',
    steps: [
      'Keitä riisi.',
      'Paista valkosipuli ja inkivääri öljyssä. Lisää wokkivihannekset.',
      'Lisää katkaravut ja kastikkeet. Kuumenna 3 minuuttia.',
      'Tarjoa riisin kanssa.',
    ],
    tips: [
      'Kuivaa katkaravut talouspaperilla, niin ne paistuvat eivätkä keity.',
      'Wokin voi tarjota riisin tai nuudeleiden kanssa.',
    ],
    storage: 'Paras heti. Säilytä tähteet jääkaapissa enintään 1 päivä.',
  },
  'mushroom-soup': {
    title: 'Kermainen sienikeitto',
    description: 'Herkkusieni-perunakeitto persiljalla ja ruisleivällä.',
    steps: [
      'Paista viipaloidut sienet ja sipuli voissa.',
      'Lisää kuutioidut perunat, liemikuutio ja 3 dl vettä per annos. Keitä 15 minuuttia.',
      'Lisää kerma ja kuumenna. Soseuta osittain.',
      'Viimeistele persiljalla ja tarjoa ruisleivän kanssa.',
    ],
    tips: [
      'Paista sienet kuumalla pannulla ruskeiksi ennen nesteen lisäämistä.',
      'Tilkka sitruunamehua lopuksi raikastaa keiton.',
    ],
  },
  'ramen': {
    title: 'Ramen kananmunalla',
    description: 'Soijaliemi, nuudelit, sienet ja puolikypsä kananmuna.',
    steps: [
      'Keitä kananmunia 6,5 minuuttia ja jäähdytä kylmässä vedessä.',
      'Kiehauta 4 dl vettä per annos, liemikuutio, soija, valkosipuli ja inkivääri.',
      'Lisää sienet ja nuudelit ja keitä pakkauksen ohjeen mukaan. Lisää pinaatti lopuksi.',
      'Annostele kulhoihin ja lisää puolitetut munat, kevätsipuli ja seesami.',
    ],
    tips: [
      'Keitä kananmunaa 6,5 minuuttia ja jäähdytä kylmässä vedessä, niin keltuainen jää pehmeäksi.',
      'Liemen voi tehdä valmiiksi ja koota kulhot syödessä.',
    ],
    storage: 'Säilytä liemi ja nuudelit erikseen jääkaapissa 2 päivää.',
  },
  'pork-goulash': {
    title: 'Porsaan hapankaaligulassi',
    description: 'Paprikainen porsaspata hapankaalilla ja keitetyillä perunoilla.',
    steps: [
      'Ruskista lihapalat öljyssä erissä.',
      'Lisää sipuli, paprikajauhe ja tomaattipyree. Paista hetki.',
      'Lisää hapankaali, liemikuutio ja 2 dl vettä per annos. Hauduta kannen alla 1 tunti.',
      'Keitä perunat. Tarjoa gulassi kermaviilin kanssa.',
    ],
    tips: [
      'Ruskista liha pienissä erissä, niin se saa paahteisen pinnan.',
      'Gulassi paranee seistessään ja pakastuu hyvin.',
    ],
  },
  'tonkatsu': {
    title: 'Porsaan tonkatsu ja kaalisalaatti',
    description: 'Rapeaksi paneroitu porsaanfilee, raikas kaali ja riisi.',
    steps: [
      'Keitä riisi.',
      'Leikkaa filee 1,5 cm paksuiksi pihveiksi ja nuija ohuemmiksi. Mausta suolalla.',
      'Kääntele jauhoissa, munassa ja korppujauhoissa. Paista öljyssä kullanruskeiksi.',
      'Suikaloi kaali ohueksi ja mausta soijalla ja seesamilla. Tarjoa riisin kanssa.',
    ],
    tips: [
      'Nuiji liha tasapaksuksi, niin se kypsyy tasaisesti.',
      'Valuta paistetut palat ritilällä, niin pohja pysyy rapeana.',
    ],
    reheating: 'Kuumenna uunissa 200 °C:ssa noin 10 minuuttia, niin kuori pysyy rapeana.',
  },
  'spinach-cannelloni': {
    title: 'Pinaatti-raejuustocannellonit',
    description: 'Lasagnelevyihin rullattua pinaattia ja raejuustoa tomaattikastikkeessa.',
    steps: [
      'Kuullota sipuli ja valkosipuli. Lisää pinaatti ja anna sen pehmetä. Sekoita joukkoon raejuusto.',
      'Pehmennä lasagnelevyt kuumassa vedessä, levitä täyte ja rullaa.',
      'Kaada vuokaan tomaattimurska, lado rullat päälle ja ripottele juusto.',
      'Paista 200 °C:ssa 30 minuuttia.',
    ],
    tips: [
      'Täytä cannellonit pursotinpussilla tai pakastepussilla, jonka kulma on leikattu.',
      'Valmiiksi koottu vuoka säilyy jääkaapissa paistamattomana yön yli.',
    ],
  },
  'tuna-salad': {
    title: 'Tonnikala-perunasalaatti',
    description: 'Niçoise-henkinen salaatti: tonnikalaa, perunaa, papuja ja munaa.',
    steps: [
      'Keitä perunat ja kananmunat. Kypsennä pavut viimeiset 3 minuuttia perunoiden kanssa.',
      'Sekoita kastike: oliiviöljy, sitruunan mehu, sinappi ja suola.',
      'Kokoa salaatti, tonnikala, perunat, pavut, tomaatit ja punasipuli lautasille.',
      'Lisää lohkotut munat ja kastike.',
    ],
    tips: [
      'Keitä perunat edellisenä päivänä, niin salaatti on hetkessä valmis.',
      'Salaatti sopii hyvin lounaseväiksi.',
    ],
    storage: 'Säilytä jääkaapissa kannellisessa rasiassa 1–2 päivää.',
  },
  'cabbage-rolls': {
    title: 'Kaalikääryleet',
    description: 'Mummolan uunikääryleet puolukkasurvoksella ja perunoilla.',
    steps: [
      'Keitä riisi puolikypsäksi. Irrota kaalinlehdet ja kiehauta niitä suolavedessä pehmeiksi.',
      'Sekoita jauheliha, riisi, sipuli, maito ja suola.',
      'Kääri täyte lehtiin, lado vuokaan ja nostele päälle voinokareita.',
      'Paista 200 °C:ssa noin tunti, valele välillä. Tarjoa keitettyjen perunoiden ja puolukan kanssa.',
    ],
    tips: [
      'Kiehauta kaalinpää kokonaisena, niin lehdet irtoavat ehjinä.',
      'Valele kääryleitä siirappiliemellä paistamisen aikana.',
    ],
  },
  'borscht': {
    title: 'Punajuurikeitto (borssi)',
    description: 'Kasvisborssi punajuuresta, kaalista ja perunasta kermaviilillä.',
    steps: [
      'Kuori ja raasta punajuuret ja porkkanat. Kuutioi peruna ja suikaloi kaali.',
      'Keitä kasvikset 4 dl:ssa vettä per annos liemikuution kanssa noin 40 minuuttia.',
      'Mausta suolalla.',
      'Tarjoa kermaviilin, tillin ja ruisleivän kanssa.',
    ],
    tips: [
      'Punajuuri värjää: käytä kertakäyttökäsineitä kuoriessa.',
      'Tarjoa smetanan tai kermaviilin ja tillin kanssa.',
    ],
  },
};
