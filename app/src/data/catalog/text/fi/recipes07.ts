import type { RecipeText } from '../types';

/** Finnish text for recipe batch 7 (structure: catalog/recipes7.ts). */
export const FI_RECIPES_07: Readonly<Record<string, RecipeText>> = {
  'oven-salmon-lemon-potatoes': {
    title: 'Uunilohi ja sitruunaperunat',
    description: 'Samalla pellillä paistettu lohi ja sitruunaiset perunalohkot tillin kera.',
    steps: [
      'Lämmitä uuni 220 asteeseen.',
      'Lohko perunat ja sekoita öljyn, suolan ja sitruunan kuoriraasteen kanssa. Paahda pellillä 20 minuuttia.',
      'Nosta lohi perunoiden joukkoon, mausta suolalla ja pippurilla ja paista vielä 12–15 minuuttia.',
      'Purista päälle sitruunamehu ja ripottele tilli.',
    ],
    tips: [
      'Lohi on kypsää, kun se irtoaa lohkoiksi haarukalla painettaessa.',
    ],
    storage: 'Säilytä jääkaapissa kannellisessa rasiassa 1–2 päivää.',
  },
  'salmon-spinach-pasta': {
    title: 'Lohi-pinaattipasta',
    description: 'Kermainen spagetti, mehevät lohipalat, pinaatti ja sitruuna.',
    steps: [
      'Keitä spagetti suolalla maustetussa vedessä.',
      'Kuullota valkosipuli pannulla ja lisää kerma. Kiehauta.',
      'Lisää kuutioitu lohi ja hauduta 4 minuuttia.',
      'Lisää pinaatti, sitruunan mehu ja kuori, suola ja pippuri. Sekoita pasta kastikkeeseen.',
    ],
    tips: [
      'Kylmäsavulohi sopii myös: lisää se vasta lopuksi.',
    ],
    storage: 'Säilytä jääkaapissa 1–2 päivää.',
  },
  'pollock-tomato-oven': {
    title: 'Seiti tomaattikastikkeessa ja riisi',
    description: 'Uunissa kypsennetty seiti tomaatti-oliivikastikkeessa ja jasmiiniriisi.',
    steps: [
      'Lämmitä uuni 200 asteeseen ja keitä riisi.',
      'Kuullota sipuli öljyssä ja lisää tomaattimurska, oliivit ja oregano. Hauduta 5 minuuttia.',
      'Nosta kalapalat vuokaan, mausta suolalla ja kaada kastike päälle.',
      'Paista 15–20 minuuttia ja tarjoa riisin kanssa.',
    ],
    tips: [
      'Pakasteseiti on edullinen ja helppo: sulata se jääkaapissa yön yli.',
    ],
  },
  'trout-quinoa-salad': {
    title: 'Kirjolohi ja kvinoasalaatti',
    description: 'Pannulla paistettu kirjolohi, kvinoa, kurkku, tomaatti ja feta sitruunakastikkeella.',
    steps: [
      'Huuhtele kvinoa ja keitä se 12 minuuttia. Jäähdytä.',
      'Paista kirjolohi pannulla puolessa öljystä nahkapuoli alaspäin, kunnes se on kypsää.',
      'Sekoita kvinoa, kuutioitu kurkku, puolitetut tomaatit ja murennettu feta.',
      'Kastikkeeksi sekoita loppu öljy, sitruunamehu ja suola. Tarjoa lohen kanssa.',
    ],
    tips: [
      'Salaatti on hyvä lounaseväs, kun lohen paistaa edellisenä iltana.',
    ],
    storage: 'Säilytä lohi ja salaatti erikseen jääkaapissa 1–2 päivää.',
  },
  'shrimp-coconut-curry': {
    title: 'Katkarapucurry kookosmaidossa',
    description: 'Punaisella currytahnalla maustettu kookoskastike, katkaravut, paprika ja jasmiiniriisi.',
    steps: [
      'Keitä riisi.',
      'Paista currytahnaa öljyssä minuutti ja lisää kookosmaito.',
      'Lisää paprikasuikaleet ja hauduta 5 minuuttia.',
      'Lisää katkaravut ja kuumenna vain, kunnes ne ovat kuumia. Purista päälle limeä ja ripottele korianteri.',
    ],
    tips: [
      'Ylikypsät katkaravut muuttuvat kumimaisiksi: lisää ne viimeisenä.',
    ],
    storage: 'Säilytä jääkaapissa enintään 1 päivä.',
  },
  'tuna-tomato-penne': {
    title: 'Tonnikalapasta tomaattikastikkeessa',
    description: 'Kaappiruoka parhaimmillaan: penne, tonnikala, tomaatti ja oliivit.',
    steps: [
      'Keitä penne suolalla maustetussa vedessä.',
      'Kuullota sipuli ja valkosipuli öljyssä.',
      'Lisää tomaattimurska ja oliivit ja hauduta 8 minuuttia.',
      'Lisää valutettu tonnikala ja sekoita pasta kastikkeeseen.',
    ],
    tips: [
      'Ripaus chilihiutaleita ja persiljaa viimeistelee annoksen.',
    ],
  },
  'mussel-tomato-spaghetti': {
    title: 'Simpukkapasta tomaatilla ja chilillä',
    description: 'Spagetti, sinisimpukat, valkosipuli, chili ja tomaatti.',
    steps: [
      'Keitä spagetti suolalla maustetussa vedessä.',
      'Kuullota valkosipuli ja chili öljyssä.',
      'Lisää tomaattimurska ja hauduta 5 minuuttia.',
      'Lisää valutetut simpukat ja kuumenna. Sekoita pasta ja persilja joukkoon.',
    ],
    tips: [
      'Lisää pastan keitinvettä, jos kastike on liian paksua.',
    ],
    storage: 'Säilytä jääkaapissa enintään 1 päivä.',
  },
  'salmon-patties-dill-sauce': {
    title: 'Lohipihvit ja tillijogurttikastike',
    description: 'Mehevät lohipihvit, tillinen jogurttikastike ja keitetyt perunat.',
    steps: [
      'Keitä perunat.',
      'Hienonna lohi veitsellä tai monitoimikoneessa karkeaksi.',
      'Sekoita joukkoon kananmuna, korppujauho, puolet tillistä ja suola. Muotoile pihveiksi.',
      'Paista pihvit öljyssä keskilämmöllä noin 4 minuuttia per puoli.',
      'Sekoita jogurtti ja loppu tilli kastikkeeksi.',
    ],
    tips: [
      'Kostuta kädet, niin taikina ei tartu.',
    ],
  },
  'gf-salmon-balls-rice': {
    title: 'Gluteenittomat lohipyörykät ja riisi',
    description: 'Limellä ja tillillä maustetut lohipyörykät, jasmiiniriisi ja kurkku.',
    steps: [
      'Keitä riisi.',
      'Hienonna lohi ja sekoita joukkoon kananmuna, gluteenittomat korppujauhot, tilli, limen kuori ja suola.',
      'Pyörittele pieniksi pyöryköiksi ja paista öljyssä kauttaaltaan kypsiksi.',
      'Tarjoa riisin ja kurkkuviipaleiden kanssa.',
    ],
    tips: [
      'Pyörykät voi paistaa myös uunissa 200 asteessa 15 minuuttia.',
    ],
  },
  'mediterranean-fish-soup': {
    title: 'Välimerellinen kalakeitto',
    description: 'Tomaattinen kalakeitto seitistä ja katkaravuista, paprikalla ja valkosipulilla.',
    steps: [
      'Kuullota sipuli, valkosipuli ja paprika öljyssä kattilassa.',
      'Lisää tomaattimurska, 5 dl vettä, liemikuutio ja kuutioidut perunat. Keitä 15 minuuttia.',
      'Lisää kalapalat ja hauduta 5 minuuttia.',
      'Lisää katkaravut ja kuumenna. Tarkista suola.',
    ],
    tips: [
      'Tarjoa patongin kanssa, jos gluteeni ei ole ongelma.',
    ],
    storage: 'Säilytä jääkaapissa 1–2 päivää.',
  },
  'salmon-poke-bowl': {
    title: 'Lohi-pokekulho',
    description: 'Riisiä, marinoitua lohta, avokadoa, kurkkua ja herneitä soija-seesamikastikkeella.',
    steps: [
      'Keitä riisi ja anna jäähtyä haaleaksi.',
      'Kuutioi lohi ja marinoi soijakastikkeessa 10 minuuttia. Voit myös paistaa lohen kypsäksi.',
      'Kuumenna herneet ja viipaloi kurkku, avokado ja kevätsipuli.',
      'Kokoa kulhoon riisi, lohi ja kasvikset ja ripottele seesaminsiemenet.',
    ],
    tips: [
      'Raakana syötävän lohen pitää olla pakastettua tai sushilaatuista.',
    ],
    storage: 'Säilytä osat erikseen jääkaapissa ja syö samana tai seuraavana päivänä.',
  },
  'salmon-sweet-potato-tray': {
    title: 'Lohi, bataatti ja parsakaali pellillä',
    description: 'Yhden pellin illallinen: paprikainen bataatti, parsakaali ja lohi.',
    steps: [
      'Lämmitä uuni 220 asteeseen.',
      'Kuutioi bataatti, sekoita puolen öljyn, paprikajauheen ja suolan kanssa ja paahda 15 minuuttia.',
      'Lisää pellille parsakaali ja lohi, valuta päälle loppu öljy ja mausta.',
      'Paista vielä 12–15 minuuttia ja purista päälle sitruunaa.',
    ],
    tips: [
      'Leikkaa bataatti pieniksi kuutioiksi, niin se kypsyy samassa ajassa lohen kanssa.',
    ],
    storage: 'Säilytä jääkaapissa 1–2 päivää.',
  },
  'smoked-salmon-potato-salad': {
    title: 'Savulohi-perunasalaatti',
    description: 'Uudet perunat, kylmäsavulohi, kurkku ja tillinen kermaviilikastike.',
    steps: [
      'Keitä perunat kypsiksi ja anna jäähtyä. Puolita ne.',
      'Sekoita kermaviili, tilli, sitruunamehu ja suola.',
      'Sekoita perunat, kurkku ja punasipuli kastikkeeseen.',
      'Nosta päälle revitty kylmäsavulohi.',
    ],
    tips: [
      'Salaatti on parhaimmillaan haaleista perunoista tehtynä.',
    ],
    storage: 'Säilytä jääkaapissa 1 päivä.',
  },
  'shrimp-avocado-salad': {
    title: 'Katkarapu-avokadosalaatti',
    description: 'Raikas salaatti katkaravuista, avokadosta, maissista ja tomaatista limekastikkeella.',
    steps: [
      'Sulata ja valuta katkaravut.',
      'Sekoita limen mehu, öljy ja suola kastikkeeksi.',
      'Kokoa salaatti, tomaatit, maissi ja avokado lautaselle.',
      'Nosta päälle katkaravut ja valuta kastike.',
    ],
    tips: [
      'Paista katkaravut halutessasi nopeasti valkosipulin kanssa.',
    ],
    storage: 'Paras heti. Säilytä kastike erikseen ja syö salaatti samana päivänä.',
  },
  'shrimp-pea-risotto': {
    title: 'Katkarapu-hernerisotto',
    description: 'Kermainen risotto, makeat herneet, katkaravut, sitruuna ja parmesaani.',
    steps: [
      'Liuota liemikuutio 7 dl:aan kuumaa vettä.',
      'Kuullota sipuli puolessa voista ja lisää riisi. Paahda hetki.',
      'Lisää lientä kauhallinen kerrallaan sekoittaen, kunnes riisi on kypsää, noin 18 minuuttia.',
      'Lisää herneet ja katkaravut ja kuumenna.',
      'Sekoita joukkoon loppu voi, parmesaani ja sitruunan kuori.',
    ],
    tips: [
      'Risoton kuuluu olla löysää: se jähmettyy lautasella.',
    ],
    storage: 'Säilytä jääkaapissa enintään 1 päivä.',
  },
  'oven-herring-rolls': {
    title: 'Silakkarullat uunissa',
    description: 'Tillillä täytetyt silakkarullat kermaisessa liemessä ja perunamuusi.',
    steps: [
      'Lämmitä uuni 200 asteeseen.',
      'Mausta silakkafileet suolalla, ripottele tilliä ja kääri rulliksi nahkapuoli ulospäin.',
      'Nosta rullat vuokaan, kaada päälle kerma ja sitruunamehu.',
      'Paista 20–25 minuuttia.',
      'Keitä perunat ja soseuta lämpimän maidon ja voin kanssa muusiksi.',
    ],
    tips: [
      'Kiinnitä rullat cocktailtikulla, jos ne aukeavat.',
    ],
  },
  'tuna-chickpea-salad': {
    title: 'Tonnikala-kikhernesalaatti',
    description: 'Proteiinipitoinen lounassalaatti tonnikalasta, kikherneistä, tomaatista ja persiljasta.',
    steps: [
      'Huuhtele ja valuta kikherneet ja tonnikala.',
      'Puolita tomaatit, kuutioi kurkku ja hienonna punasipuli ja persilja.',
      'Sekoita kaikki ainekset sitruunamehun, öljyn ja suolan kanssa.',
    ],
    tips: [
      'Salaatti kestää eväänä hyvin, koska siinä ei ole lehtisalaattia.',
    ],
    storage: 'Säilytä kannellisessa rasiassa jääkaapissa 2 päivää.',
  },
  'thai-fish-soup': {
    title: 'Thaimaalainen kalakeitto',
    description: 'Kookosmaidolla ja currylla maustettu kalakeitto, riisinuudelit, lime ja korianteri.',
    steps: [
      'Kuumenna currytahna kattilassa ja lisää kookosmaito, 4 dl vettä ja liemikuutio.',
      'Lisää paprikasuikaleet ja keitä 5 minuuttia.',
      'Lisää kalapalat ja hauduta 5 minuuttia.',
      'Liota riisinuudelit kuumassa vedessä ja jaa kulhoihin. Kaada keitto päälle ja viimeistele limellä ja korianterilla.',
    ],
    tips: [
      'Säilytä nuudelit ja keitto erikseen, jos teet keittoa varastoon.',
    ],
    storage: 'Säilytä keitto ja nuudelit erikseen jääkaapissa 1–2 päivää.',
  },
  'trout-foil-new-potatoes': {
    title: 'Foliokirjolohi ja uudet perunat',
    description: 'Folionyytissä voin, tillin ja sitruunan kanssa kypsennetty kirjolohi ja vihreät pavut.',
    steps: [
      'Lämmitä uuni 200 asteeseen ja keitä perunat.',
      'Nosta kala foliolle, mausta suolalla ja lisää voi, tilli ja sitruunaviipaleet.',
      'Sulje nyytti tiiviisti ja paista 15–20 minuuttia.',
      'Keitä pavut 4 minuuttia ja tarjoa kalan ja perunoiden kanssa.',
    ],
    tips: [
      'Folionyytin voi kypsentää myös grillissä.',
    ],
    storage: 'Säilytä jääkaapissa 1–2 päivää.',
  },
  'breaded-pollock': {
    title: 'Korppukuorrutettu seiti ja perunat',
    description: 'Rapeaksi paistettu seiti, keitetyt perunat ja sitruuna.',
    steps: [
      'Keitä perunat.',
      'Mausta kala suolalla, kastele vatkatussa kananmunassa ja kääntele korppujauhoissa.',
      'Paista öljyssä keskilämmöllä noin 4 minuuttia per puoli.',
      'Tarjoa perunoiden ja sitruunalohkojen kanssa.',
    ],
    tips: [
      'Kuivaa sulanut kala talouspaperilla, niin leivitys tarttuu.',
    ],
    reheating: 'Kuumenna uunissa 200 asteessa noin 10 minuuttia, niin kuori rapeutuu.',
  },
  'salmon-sesame-noodles': {
    title: 'Lohinuudelit ja parsakaali',
    description: 'Inkiväärinen soijakastike, munanuudelit, paistettu lohi ja parsakaali.',
    steps: [
      'Keitä nuudelit pakkauksen ohjeen mukaan.',
      'Paista kuutioitu lohi öljyssä ja nosta sivuun.',
      'Paista parsakaali ja raastettu inkivääri pannulla 3 minuuttia.',
      'Lisää nuudelit, soijakastike ja lohi ja kääntele. Ripottele seesaminsiemenet.',
    ],
    tips: [
      'Riisinuudeleilla ja gluteenittomalla soijakastikkeella ruoka sopii keliaakikolle.',
    ],
  },
  'shrimp-tortillas': {
    title: 'Katkarapu-tortillat ja salsa',
    description: 'Valkosipulilla paistetut katkaravut, avokado, rapea salaatti ja salsa tortillassa.',
    steps: [
      'Paista katkaravut ja valkosipuli öljyssä minuutti.',
      'Lämmitä tortillat kuivalla pannulla.',
      'Täytä tortillat salaatilla, katkaravuilla, avokadolla ja salsalla ja purista päälle limeä.',
    ],
    tips: [
      'Maissitortilloilla annos on gluteeniton.',
    ],
    storage: 'Paras heti. Säilytä täyte erikseen jääkaapissa 1 päivä.',
  },
  'salmon-avocado-quinoa-bowl': {
    title: 'Lohi-avokadokulho kvinoalla',
    description: 'Paistettu lohi, kvinoa, pinaatti, kurkku ja avokado sitruunaöljyllä.',
    steps: [
      'Huuhtele ja keitä kvinoa 12 minuuttia.',
      'Paista lohi pannulla kypsäksi ja mausta suolalla.',
      'Kokoa kulhoon kvinoa, pinaatti, kurkku, avokado ja lohi.',
      'Valuta päälle sitruunamehu ja oliiviöljy.',
    ],
    tips: [
      'Tee kvinoaa kerralla useampaan päivään.',
    ],
  },
  'tuna-pizza': {
    title: 'Tonnikalapizza',
    description: 'Kotitekoinen ohut pizzapohja, tomaatti, tonnikala, punasipuli ja mozzarella.',
    steps: [
      'Liuota hiiva 0,5 dl:aan kädenlämpöistä vettä. Lisää suola, öljy ja jauhot ja vaivaa tasaiseksi.',
      'Anna taikinan kohota 30 minuuttia.',
      'Lämmitä uuni 250 asteeseen. Kauli taikina ohueksi pohjaksi pellille.',
      'Levitä pohjalle tomaattimurska ja oregano. Lisää tonnikala, punasipuli ja mozzarella.',
      'Paista 10–12 minuuttia, kunnes pohja on rapea.',
    ],
    tips: [
      'Kuuma pelti uunissa valmiiksi tekee pohjasta rapeamman.',
    ],
  },
  'fish-broccoli-gratin': {
    title: 'Kalagratiini ja parsakaali',
    description: 'Seitiä ja parsakaalia kermaisessa kastikkeessa juustokuoren alla, perunoiden kanssa.',
    steps: [
      'Lämmitä uuni 200 asteeseen ja keitä perunat.',
      'Nosta kalapalat ja parsakaalin kukinnot voideltuun vuokaan. Mausta suolalla ja pippurilla.',
      'Kaada päälle kerma ja ripottele juustoraaste.',
      'Paista 25–30 minuuttia ja tarjoa perunoiden kanssa.',
    ],
    tips: [
      'Pakasteparsakaali käy suoraan vuokaan.',
    ],
  },
};
