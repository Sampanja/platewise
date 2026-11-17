import type { RecipeText } from '../types';

/** Finnish text for recipe batch 13 (structure: catalog/recipes13.ts). */
export const FI_RECIPES_13: Readonly<Record<string, RecipeText>> = {
  'bibimbap': {
    title: 'Bibimbap',
    description: 'Korealainen riisikulho: jauheliha, pinaatti, porkkana, kurkku ja paistettu kananmuna.',
    steps: [
      'Keitä riisi.',
      'Ruskista jauheliha puolessa öljystä ja mausta puolella soijakastikkeesta.',
      'Kuullota pinaatti ja porkkanasuikaleet erikseen ja mausta loppusoijalla.',
      'Paista kananmuna.',
      'Kokoa kulhoon riisi, liha, kasvikset ja muna ja ripottele seesaminsiemenet ja chili.',
    ],
    tips: [
      'Sekoita kulho kunnolla ennen syömistä, niin keltuainen toimii kastikkeena.',
    ],
  },
  'beef-bulgogi': {
    title: 'Nauta bulgogi ja riisi',
    description: 'Makeassa soija-valkosipulimarinadissa paistetut naudansuikaleet, riisi ja kevätsipuli.',
    steps: [
      'Sekoita soijakastike, sokeri, murskattu valkosipuli ja raastettu inkivääri. Marinoi lihaa 30 minuuttia.',
      'Keitä riisi.',
      'Paista liha erittäin kuumalla pannulla öljyssä pienissä erissä.',
      'Tarjoa riisin kanssa ja ripottele päälle seesaminsiemenet ja kevätsipuli.',
    ],
    tips: [
      'Raastettu päärynä marinadissa mureuttaa lihaa perinteiseen tapaan.',
    ],
  },
  'oyakodon': {
    title: 'Oyakodon – kana-munariisi',
    description: 'Japanilainen kotiruoka: soijaliemessä haudutettu kana ja sipuli, kananmuna ja riisi.',
    steps: [
      'Keitä riisi.',
      'Kiehauta pienessä pannussa 1 dl vettä, soijakastike ja sokeri.',
      'Lisää ohuet sipulisuikaleet ja kanapalat ja hauduta 6 minuuttia.',
      'Kaada kevyesti vatkatut kananmunat päälle ja hyydytä kannen alla minuutti.',
      'Liu’uta riisin päälle ja ripottele kevätsipuli.',
    ],
    tips: [
      'Munan kuuluu jäädä pehmeäksi.',
    ],
    storage: 'Paras heti. Säilytä tähteet jääkaapissa enintään 1 päivä.',
  },
  'yakisoba': {
    title: 'Yakisoba-nuudelit porsaalla',
    description: 'Japanilaiset paistetut nuudelit porsaalla, kaalilla ja porkkanalla.',
    steps: [
      'Keitä nuudelit ja valuta.',
      'Paista ohuet porsaansuikaleet öljyssä.',
      'Lisää suikaloitu kaali ja porkkana ja paista 3 minuuttia.',
      'Lisää nuudelit, soijakastike ja ketsuppi ja paista sekoitellen.',
    ],
    tips: [
      'Ketsuppi korvaa kätevästi japanilaisen yakisobakastikkeen.',
    ],
  },
  'kung-pao-chicken': {
    title: 'Kung pao -kana',
    description: 'Sichuanilainen kana, paprika, maapähkinät ja tulinen hapanimelä kastike.',
    steps: [
      'Keitä riisi.',
      'Paista kuutioitu kana öljyssä ja nosta sivuun.',
      'Paista paprika, valkosipuli ja chili minuutti.',
      'Lisää kana, soijakastike, sokeri, etikka ja maapähkinät ja kääntele, kunnes kastike kiiltää.',
    ],
    tips: [
      'Säädä tulisuutta chilin määrällä.',
    ],
  },
  'mapo-tofu': {
    title: 'Mapo-tofu',
    description: 'Pehmeä tofu tulisessa jauhelihakastikkeessa riisin kanssa.',
    steps: [
      'Keitä riisi.',
      'Ruskista jauheliha öljyssä ja lisää valkosipuli, inkivääri ja chili.',
      'Lisää 2 dl vettä, soijakastike ja kuutioitu tofu ja hauduta 5 minuuttia.',
      'Suurusta maissitärkkelyksellä ja ripottele päälle kevätsipuli.',
    ],
    tips: [
      'Kääntele tofua varovasti, ettei se hajoa.',
    ],
  },
  'french-onion-soup': {
    title: 'Ranskalainen sipulikeitto',
    description: 'Pitkään kullanruskeaksi kuullotetut sipulit, täyteläinen liemi ja juustogratinoitu leipä.',
    steps: [
      'Viipaloi sipulit ja kuullota voissa miedolla lämmöllä noin 35 minuuttia, kunnes ne karamellisoituvat.',
      'Lisää 7 dl vettä ja liemitiiviste ja keitä 10 minuuttia.',
      'Kaada keitto uuninkestäviin kulhoihin ja nosta päälle patonkiviipale ja juusto.',
      'Gratinoi uunin ylätasolla 250 °C:ssa, kunnes juusto ruskistuu.',
    ],
    tips: [
      'Sipulien kärsivällinen kuullottaminen on keiton salaisuus.',
    ],
  },
  'quiche-lorraine': {
    title: 'Quiche Lorraine',
    description: 'Ranskalainen piiras murealla pohjalla, pekonilla ja kermaisella juustotäytteellä.',
    steps: [
      'Nypi jauhot ja kylmä voi muruksi, lisää ruokalusikallinen kylmää vettä ja painele piirasvuokaan. Jäähdytä 15 minuuttia.',
      'Lämmitä uuni 200 °C:seen ja esipaista pohjaa 10 minuuttia.',
      'Paista pekoni ja sipuli ja levitä pohjalle.',
      'Vatkaa kananmunat, kerma, juusto ja suola ja kaada pohjalle.',
      'Paista noin 30 minuuttia, kunnes täyte on hyytynyt.',
    ],
    tips: [
      'Tarjoa vihreän salaatin kanssa.',
    ],
  },
  'spinach-chickpea-stew': {
    title: 'Espanjalainen kikherne-pinaattipata',
    description: 'Andalusialainen pata kikherneistä ja pinaatista savupaprikalla ja kuminalla.',
    steps: [
      'Keitä riisi.',
      'Kuullota valkosipuli öljyssä ja lisää mausteet.',
      'Lisää tomaattimurska ja kikherneet ja hauduta 10 minuuttia.',
      'Lisää pinaatti ja anna pehmetä. Mausta suolalla.',
    ],
    tips: [
      'Pata on perinteisesti tapas, mutta riisin kanssa siitä tulee ateria.',
    ],
  },
  'fasolada': {
    title: 'Fasolada – kreikkalainen papukeitto',
    description: 'Kreikan kansallisruoka: valkoiset pavut, porkkana, juuriselleri ja tomaatti oliiviöljyllä.',
    steps: [
      'Kuullota sipuli, porkkana ja juuriselleri öljyssä.',
      'Lisää tomaattimurska, pavut, oregano ja 5 dl vettä.',
      'Keitä miedolla lämmöllä 25 minuuttia ja mausta suolalla.',
    ],
    tips: [
      'Valuta lautaselle vielä tilkka oliiviöljyä.',
    ],
  },
  'berry-smoothie-bowl': {
    title: 'Marjainen smoothie-kulho',
    description: 'Paksu marjasmoothie kulhossa, päällä gluteeniton mysli ja banaania.',
    steps: [
      'Surauta pakastemustikat, puolet banaanista ja jogurtti paksuksi smoothieksi.',
      'Kaada kulhoon ja lisää päälle viipaloitu banaani ja mysli.',
    ],
    tips: [
      'Mitä vähemmän nestettä, sitä paksumpi kulho.',
    ],
  },
  'ham-egg-muffins': {
    title: 'Kinkku-munamuffinit',
    description: 'Uunissa paistetut munamuffinit kinkulla, paprikalla ja pinaatilla. Valmis aamiainen viikoksi.',
    steps: [
      'Lämmitä uuni 180 °C:seen ja voitele muffinssivuoka.',
      'Jaa pilkottu kinkku, paprika ja pinaatti vuokiin.',
      'Vatkaa kananmunat ja suola ja kaada vuokiin. Ripottele juusto pinnalle.',
      'Paista noin 20 minuuttia, kunnes munat ovat hyytyneet.',
    ],
    tips: [
      'Lämmitä aamulla mikrossa 30 sekuntia.',
    ],
    storage: 'Säilytä kannellisessa rasiassa jääkaapissa 4 päivää.',
  },
  'baked-oatmeal-apple': {
    title: 'Uunipuuro omenalla ja kanelilla',
    description: 'Uunissa paistettu kaurapuuro, jossa on omenaa, rusinoita ja kanelia.',
    steps: [
      'Lämmitä uuni 200 °C:seen.',
      'Sekoita vuoassa kaurahiutaleet, kuutioitu omena, rusinat, kaneli ja suola.',
      'Kaada maito päälle ja sekoita.',
      'Paista noin 30 minuuttia, kunnes pinta on kullanruskea.',
    ],
    tips: [
      'Leikkaa jäähtynyt uunipuuro paloiksi ja lämmitä aamulla.',
    ],
  },
  'chicken-shawarma-bowl': {
    title: 'Kanashawarma-kulho',
    description: 'Mausteinen kana, riisi, tomaatti, kurkku ja valkosipulijogurtti kulhossa.',
    steps: [
      'Mausta kana kuminalla, paprikalla, puolella valkosipulista, sitruunalla ja suolalla.',
      'Keitä riisi.',
      'Paista kana öljyssä kypsäksi ja viipaloi.',
      'Sekoita jogurtti ja loppu valkosipuli ja kokoa kulhot.',
    ],
    tips: [
      'Kulho on gluteeniton, ja kana sopii myös pitaleipään.',
    ],
  },
  'fava-patties-oven-potatoes': {
    title: 'Härkäpapupihvit ja uuniperunat',
    description: 'Kuminalla maustetut vegaaniset härkäpapupihvit ja rapeat uuniperunat.',
    steps: [
      'Lämmitä uuni 225 °C:seen. Lohko perunat, sekoita puoleen öljystä ja suolaan ja paahda 30 minuuttia.',
      'Keitä härkäpavut 3 minuuttia ja valuta.',
      'Soseuta pavut, sipuli, perunajauho, kumina ja suola karkeaksi massaksi.',
      'Muotoile pihveiksi ja paista loppu öljyssä molemmin puolin kullanruskeiksi.',
    ],
    tips: [
      'Kostuta kädet, niin massa on helppo muotoilla.',
    ],
  },
  'chicken-potato-bake': {
    title: 'Broilerikiusaus',
    description: 'Perunaa, broileria ja sipulia kermaisessa liemessä juustokuoren alla.',
    steps: [
      'Lämmitä uuni 200 °C:seen.',
      'Suikaloi perunat ja sipuli.',
      'Kerrosta perunat, sipuli ja broileri vuokaan.',
      'Kaada päälle kerma, maito ja mausteet. Ripottele juusto ja paista noin tunti.',
    ],
    tips: [
      'Lisää halutessasi pinaattia kerrosten väliin.',
    ],
  },
  'sauerkraut-sausage-stew': {
    title: 'Hapankaali-makkarapata',
    description: 'Puolalaistyylinen pata hapankaalista, makkarasta ja perunasta.',
    steps: [
      'Ruskista viipaloitu makkara ja sipuli öljyssä.',
      'Lisää hapankaali, kuutioidut perunat, mausteet ja 3 dl vettä.',
      'Hauduta kannen alla 35 minuuttia.',
    ],
    tips: [
      'Pata on paras seuraavana päivänä.',
    ],
  },
};
