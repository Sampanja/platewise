import type { RecipeText } from '../types';

/** Finnish text for recipe batch 12 (structure: catalog/recipes12.ts). */
export const FI_RECIPES_12: Readonly<Record<string, RecipeText>> = {
  'quick-tomato-spaghetti': {
    title: 'Nopea tomaatti-valkosipulispagetti',
    description: 'Kaapin perusaineista 15 minuutissa: spagetti, tomaatti, valkosipuli, chili ja basilika.',
    steps: [
      'Keitä spagetti suolalla maustetussa vedessä.',
      'Kuullota valkosipuli ja chili öljyssä minuutti.',
      'Lisää tomaattimurska ja hauduta pastan kypsymisen ajan.',
      'Sekoita pasta kastikkeeseen ja revi päälle basilika.',
    ],
    tips: [
      'Ripaus sokeria pehmentää tomaatin happamuutta.',
    ],
  },
  'egg-fried-rice': {
    title: 'Paistettu riisi ja kananmuna',
    description: 'Tähderiisistä 15 minuutissa: kananmuna, herneet, porkkana ja kevätsipuli.',
    steps: [
      'Keitä riisi, jos sinulla ei ole valmiiksi keitettyä tähderiisiä.',
      'Paista porkkanakuutiot ja herneet öljyssä 3 minuuttia.',
      'Työnnä kasvikset reunalle ja kypsennä vatkatut kananmunat kokkeliksi.',
      'Lisää riisi ja soijakastike ja paista kuumalla pannulla sekoitellen. Viimeistele kevätsipulilla.',
    ],
    tips: [
      'Edellisen päivän kylmä riisi paistuu parhaiten.',
    ],
  },
  'tuna-corn-macaroni': {
    title: 'Tonnikala-maissimakaronit',
    description: 'Edullinen pikaruoka: makaronit, tonnikala, maissi ja tillinen kermaviilikastike.',
    steps: [
      'Keitä makaronit suolalla maustetussa vedessä.',
      'Valuta tonnikala ja maissi.',
      'Sekoita kaikki ainekset lämpimien makaronien kanssa ja mausta pippurilla ja tillillä.',
    ],
    tips: [
      'Toimii myös kylmänä pastasalaattina.',
    ],
  },
  'potato-leek-soup': {
    title: 'Peruna-purjokeitto',
    description: 'Pehmeä ja edullinen sosekeitto perunasta ja purjosta.',
    steps: [
      'Kuullota purjorenkaat voissa.',
      'Lisää kuutioidut perunat, liemikuutio ja 5 dl vettä. Keitä 15 minuuttia.',
      'Lisää maito ja soseuta sileäksi.',
      'Tarkista suola ja ripottele päälle ruohosipulia.',
    ],
    tips: [
      'Laktoosittomana: käytä laktoositonta maitoa ja öljyä.',
    ],
  },
  'cabbage-mince-pan': {
    title: 'Kaali-jauhelihapannu ja riisi',
    description: 'Nopea ja edullinen pannu kaalista ja jauhelihasta, mustapippuria ja riisiä.',
    steps: [
      'Keitä riisi.',
      'Ruskista jauheliha ja sipuli öljyssä.',
      'Lisää suikaloitu kaali ja paista sekoitellen, kunnes se pehmenee ja saa väriä.',
      'Mausta suolalla ja pippurilla ja tarjoa riisin kanssa.',
    ],
    tips: [
      'Kaali on yksi edullisimmista kasviksista.',
    ],
  },
  'black-bean-quesadillas': {
    title: 'Mustapapuquesadillat',
    description: 'Rapeiksi paistetut tortillat, joiden välissä on papuja, maissia ja sulaa juustoa.',
    steps: [
      'Muussaa pavut kevyesti haarukalla.',
      'Levitä pavut, maissi ja juusto tortillan puolikkaalle ja taita.',
      'Paista kuivalla tai kevyesti öljytyllä pannulla molemmin puolin rapeaksi.',
      'Leikkaa kolmioiksi ja tarjoa salsan kanssa.',
    ],
    tips: [
      'Paina quesadillaa lastalla, niin juusto sulaa nopeammin.',
    ],
  },
  'fish-stick-tortillas': {
    title: 'Kalapuikkotortillat',
    description: 'Rapeat kalapuikot, kaalisalaatti ja limeinen kermaviili tortillassa.',
    steps: [
      'Paista kalapuikot uunissa pakkauksen ohjeen mukaan.',
      'Suikaloi kaali ja sekoita limen mehun kanssa.',
      'Lämmitä tortillat ja täytä kalapuikoilla, kaalilla ja kermaviilillä.',
    ],
    tips: [
      'Lasten suosikki, jonka voi koota itse.',
    ],
  },
  'curry-cream-chicken': {
    title: 'Currykermakana ja riisi',
    description: 'Arjen pelastaja: broileri mietossa currykermakastikkeessa.',
    steps: [
      'Keitä riisi.',
      'Ruskista broilerisuikaleet ja sipuli öljyssä.',
      'Lisää curryjauhe ja paista hetki.',
      'Lisää kerma ja 0,5 dl vettä ja hauduta 5 minuuttia. Mausta suolalla.',
    ],
    tips: [
      'Lisää pakastevihanneksia, niin ateria on täydellinen.',
    ],
  },
  'garlic-shrimp-rice': {
    title: 'Valkosipulikatkaravut ja riisi',
    description: 'Voissa ja valkosipulissa paistetut katkaravut, sitruuna ja persilja.',
    steps: [
      'Keitä riisi.',
      'Sulata voi pannulla ja kuullota valkosipuli ja chili.',
      'Lisää katkaravut ja kuumenna minuutti.',
      'Purista päälle sitruunaa, ripottele persilja ja tarjoa riisin kanssa.',
    ],
    tips: [
      'Katkaravut ovat valmiiksi kypsiä: ne vain kuumennetaan.',
    ],
    storage: 'Säilytä jääkaapissa enintään 1 päivä.',
  },
  'peanut-veggie-noodles': {
    title: 'Kasvisnuudelit ja maapähkinäkastike',
    description: 'Munanuudelit, wokkivihannekset ja täyteläinen maapähkinä-limekastike.',
    steps: [
      'Keitä nuudelit.',
      'Paista vihanneksia öljyssä 4 minuuttia.',
      'Sekoita maapähkinävoi, soijakastike, limen mehu ja 0,5 dl kuumaa vettä.',
      'Lisää nuudelit ja kastike pannulle ja kääntele.',
    ],
    tips: [
      'Ripottele päälle rouhittuja maapähkinöitä rapeudeksi.',
    ],
  },
  'lentil-tomato-penne': {
    title: 'Linssi-tomaattipenne',
    description: 'Edullinen ja proteiinipitoinen pasta: punaiset linssit hautuvat tomaattikastikkeessa.',
    steps: [
      'Kuullota sipuli öljyssä.',
      'Lisää linssit, tomaattimurska, oregano ja 2 dl vettä. Hauduta 15 minuuttia.',
      'Keitä penne ja sekoita kastikkeeseen.',
    ],
    tips: [
      'Kastike sopii hyvin pakastettavaksi.',
    ],
  },
  'chickpea-tomato-eggs': {
    title: 'Kikherne-tomaattipannu ja munat',
    description: 'Kuminalla maustettu tomaatti-kikhernepannu, jossa kypsyy kaksi kananmunaa.',
    steps: [
      'Kuullota sipuli öljyssä ja lisää kumina.',
      'Lisää tomaattimurska ja kikherneet ja hauduta 5 minuuttia.',
      'Tee kastikkeeseen kuopat ja riko niihin kananmunat.',
      'Kypsennä kannen alla 6–8 minuuttia ja viimeistele persiljalla.',
    ],
    tips: [
      'Tarjoa leivän tai riisin kanssa.',
    ],
  },
  'smoked-salmon-tagliatelle': {
    title: 'Kylmäsavulohipasta',
    description: 'Nauhapasta, kylmäsavulohi, herneet, kermaviili, sitruuna ja tilli.',
    steps: [
      'Keitä pasta ja lisää herneet viimeiseksi minuutiksi.',
      'Valuta ja sekoita joukkoon kermaviili, sitruunan kuori ja mehu.',
      'Revi joukkoon lohi ja tilli ja rouhaise pippuria.',
    ],
    tips: [
      'Lohi lisätään lopuksi, ettei se kypsy liikaa.',
    ],
  },
  'mince-rice-pan': {
    title: 'Jauheliha-riisipannu',
    description: 'Paprikainen jauheliha-riisipannu yhdessä pannussa: maidoton ja gluteeniton.',
    steps: [
      'Ruskista jauheliha, sipuli ja paprika öljyssä syvässä pannussa.',
      'Lisää riisi, paprikajauhe, tomaattimurska, suola ja 2 dl vettä.',
      'Hauduta kannen alla miedolla lämmöllä 15–18 minuuttia, kunnes riisi on kypsää.',
    ],
    tips: [
      'Lisää loppuvaiheessa pakasteherneitä.',
    ],
  },
  'spinach-feta-puff-pie': {
    title: 'Pinaatti-fetapiirakka',
    description: 'Voitaikinapiiras, jossa on pinaattia, fetaa ja kananmunaa.',
    steps: [
      'Lämmitä uuni 200 °C:seen ja sulata voitaikinalevyt.',
      'Kuullota sipuli ja pinaatti ja anna jäähtyä.',
      'Sekoita pinaatti, murennettu feta, kananmunat ja pippuri.',
      'Vuoraa vuoka taikinalla, lisää täyte ja paista noin 30 minuuttia.',
    ],
    tips: [
      'Piiras on hyvä myös kylmänä eväänä.',
    ],
  },
  'cottage-cheese-pasta-salad': {
    title: 'Raejuusto-pastasalaatti',
    description: 'Edullinen ja proteiinipitoinen eväs: makaroni, raejuusto, kurkku, paprika ja herneet.',
    steps: [
      'Keitä makaronit ja huuhtele kylmällä vedellä.',
      'Kuutioi kurkku ja paprika.',
      'Sekoita kaikki ainekset ja mausta suolalla ja ruohosipulilla.',
    ],
    tips: [
      'Salaatti säilyy eväänä hyvin kaksi päivää.',
    ],
    storage: 'Säilytä kannellisessa rasiassa jääkaapissa 2 päivää.',
  },
  'lactose-free-chicken-mushroom-sauce': {
    title: 'Laktoositon kana-sienikastike ja riisi',
    description: 'Kermainen broileri-herkkusienikastike laktoosittomalla ruokakermalla.',
    steps: [
      'Keitä riisi.',
      'Ruskista broilerisuikaleet öljyssä ja nosta sivuun.',
      'Paista sienet ja sipuli samalla pannulla.',
      'Lisää laktoositon kerma ja kana ja hauduta 5 minuuttia.',
    ],
    tips: [
      'Kastike sopii myös perunoiden tai pastan kanssa.',
    ],
  },
  'lactose-free-salmon-soup': {
    title: 'Laktoositon lohikeitto',
    description: 'Kermainen lohikeitto laktoosittomalla ruokakermalla, perunalla ja tillillä.',
    steps: [
      'Keitä kuutioidut perunat, porkkanat ja purjo 7 dl:ssa vettä liemikuution ja maustepippurien kanssa 12 minuuttia.',
      'Lisää laktoositon kerma ja kuutioitu lohi.',
      'Hauduta miedolla lämmöllä 5 minuuttia ja lisää tilli.',
    ],
    tips: [
      'Keitto on myös gluteeniton.',
    ],
    storage: 'Jäähdytä nopeasti ja säilytä jääkaapissa 1–2 päivää.',
  },
  'lactose-free-macaroni-casserole': {
    title: 'Laktoositon makaronilaatikko',
    description: 'Tuttu makaronilaatikko laktoosittomalla maidolla.',
    steps: [
      'Lämmitä uuni 200 °C:seen. Keitä makaronit puolikypsiksi.',
      'Ruskista jauheliha ja sipuli ja mausta.',
      'Sekoita makaronit ja jauheliha vuokaan.',
      'Vatkaa maito ja kananmunat ja kaada vuokaan. Paista noin 50 minuuttia.',
    ],
    tips: [
      'Laatikko pakastuu hyvin annospaloina.',
    ],
  },
  'gf-mince-sauce-potatoes': {
    title: 'Gluteeniton jauhelihakastike ja perunat',
    description: 'Perunajauholla suurustettu ruskea jauhelihakastike ja keitetyt perunat.',
    steps: [
      'Keitä perunat.',
      'Ruskista jauheliha ja sipuli pannulla.',
      'Lisää liemitiiviste ja 2 dl vettä ja hauduta 10 minuuttia.',
      'Suurusta perunajauho-vesiseoksella, kiehauta ja tarjoa perunoiden ja puolukan kanssa.',
    ],
    tips: [
      'Perunajauho suurustaa kirkkaaksi ja on luontaisesti gluteenitonta.',
    ],
  },
  'vegetable-pea-soup': {
    title: 'Kasvishernekeitto',
    description: 'Perinteinen hernekeitto ilman lihaa: kuivatut herneet, porkkana ja sipuli.',
    steps: [
      'Liota herneitä kylmässä vedessä yön yli ja huuhtele.',
      'Keitä herneet 1 litrassa vettä liemikuution kanssa. Kuori vaahto.',
      'Lisää sipuli, porkkana, kuutioitu peruna ja maustepippurit ja keitä noin 1,5 tuntia.',
      'Tarkista suola ja tarjoa sinapin kanssa.',
    ],
    tips: [
      'Torstain klassikko. Pannukakku sopii jälkiruoaksi.',
    ],
  },
  'spanish-potato-omelette': {
    title: 'Espanjalainen perunamunakas',
    description: 'Paksu tortilla de patatas: öljyssä haudutettua perunaa ja sipulia kananmunassa.',
    steps: [
      'Viipaloi perunat ja sipuli ohuiksi.',
      'Hauduta niitä öljyssä miedolla lämmöllä kannen alla noin 15 minuuttia, kunnes perunat ovat pehmeitä.',
      'Vatkaa kananmunat ja suola ja sekoita perunat joukkoon.',
      'Kaada seos pannulle ja kypsennä miedolla lämmöllä. Käännä munakas lautasen avulla ja paista toinen puoli.',
    ],
    tips: [
      'Munakas on hyvä myös kylmänä eväänä.',
    ],
    storage: 'Säilytä jääkaapissa 2 päivää.',
    reheating: 'Syö huoneenlämpöisenä tai lämmitä mikrossa.',
  },
  'halloumi-tomato-pasta': {
    title: 'Halloumi-tomaattipasta',
    description: 'Paistettu halloumi, kirsikkatomaatit ja pinaatti pennen kanssa 15 minuutissa.',
    steps: [
      'Keitä penne.',
      'Paista halloumikuutiot pannulla kullanruskeiksi ja nosta sivuun.',
      'Paista tomaatit ja valkosipuli öljyssä, kunnes tomaatit pehmenevät.',
      'Lisää pinaatti, pasta ja halloumi ja kääntele.',
    ],
    tips: [
      'Halloumi tuo suolan: lisäsuolaa ei tarvita.',
    ],
  },
  'pollock-tomato-salsa': {
    title: 'Paistettu seiti ja tomaattisalsa',
    description: 'Pannulla paistettu seiti, raikas tomaatti-limesalsa ja riisi.',
    steps: [
      'Keitä riisi.',
      'Kuutioi tomaatti ja hienonna punasipuli ja korianteri. Sekoita limen mehun ja suolan kanssa.',
      'Paista kala öljyssä noin 3 minuuttia per puoli ja mausta suolalla.',
      'Tarjoa kala salsan ja riisin kanssa.',
    ],
    tips: [
      'Salsa sopii myös kanan tai tacojen kanssa.',
    ],
  },
  'leek-potato-bake': {
    title: 'Purjo-perunagratiini',
    description: 'Edullinen ja lämmin uunivuoka perunasta, purjosta ja juustosta.',
    steps: [
      'Lämmitä uuni 200 °C:seen.',
      'Viipaloi perunat ohuiksi ja purjo renkaiksi.',
      'Kerrosta vuokaan ja kaada päälle maito, kerma, valkosipuli ja suola.',
      'Ripottele juusto ja paista noin 45 minuuttia.',
    ],
    tips: [
      'Gratiini on hyvä sellaisenaan tai lisäkkeenä kalalle.',
    ],
  },
};
