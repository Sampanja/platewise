import type { RecipeText } from '../types';

/** Finnish text for recipe batch 3 (structure: catalog/recipes3.ts). */
export const FI_RECIPES_03: Readonly<Record<string, RecipeText>> = {
  'oat-porridge-blueberries': {
    title: 'Kaurapuuro ja mustikat',
    description: 'Pehmeä kaurapuuro maidolla ja mustikoilla: lämmin ja täyttävä aamun klassikko.',
    steps: [
      'Kuumenna maito ja 1 dl vettä kattilassa kiehuvaksi.',
      'Lisää kaurahiutaleet ja suola. Keitä miedolla lämmöllä sekoitellen 3–5 minuuttia.',
      'Anna puuron vetäytyä kannen alla hetki ja nosta päälle mustikat.',
    ],
    tips: [
      'Pakastemustikat voi lisätä suoraan kuumaan puuroon.',
      'Ripaus kanelia tuo makeutta ilman sokeria.',
    ],
  },
  'gf-oat-porridge-apple': {
    title: 'Gluteeniton kaurapuuro omenalla ja kanelilla',
    description: 'Vedellä keitetty puuro, jossa on lämmintä omenaa, kanelia ja pellavansiementä.',
    steps: [
      'Kuumenna 3 dl vettä kattilassa kiehuvaksi.',
      'Lisää gluteenittomat kaurahiutaleet ja suola. Keitä sekoitellen 3–5 minuuttia.',
      'Raasta tai kuutioi omena puuron joukkoon viimeisen minuutin ajaksi.',
      'Ripottele pinnalle kaneli ja pellavansiemenet.',
    ],
    tips: [
      'Tarkista pakkauksesta, että kaura on merkitty gluteenittomaksi.',
      'Päärynä sopii omenan tilalle.',
    ],
  },
  'oven-barley-porridge': {
    title: 'Uuniohrapuuro',
    description: 'Hitaasti uunissa haudutettu, kermaisen pehmeä ohrapuuro: viikonlopun aamiaisherkku.',
    steps: [
      'Lämmitä uuni 150 asteeseen.',
      'Kaada ohrasuurimot, maito ja suola voideltuun uunivuokaan ja sekoita.',
      'Haudu uunissa noin 3 tuntia. Sekoita puuroa kerran tai kahdesti.',
      'Nosta pinnalle nokare voita ja tarjoa marjojen tai kanelisokerin kanssa.',
    ],
    tips: [
      'Puuron voi laittaa uuniin illalla ajastimen kanssa.',
      'Ylimääräinen puuro on hyvä kylmänä marjojen kanssa.',
    ],
  },
  'rice-porridge': {
    title: 'Riisipuuro ja kanelisokeri',
    description: 'Perinteinen maitoon keitetty riisipuuro, jota maustaa voisilmä ja kanelisokeri.',
    steps: [
      'Keitä puuroriisiä 1 dl vedessä noin 10 minuuttia, kunnes vesi on imeytynyt.',
      'Lisää maito ja kuumenna kiehuvaksi sekoittaen.',
      'Keitä miedolla lämmöllä kannen alla noin 45 minuuttia. Sekoita välillä, ettei puuro pala pohjaan.',
      'Mausta suolalla ja tarjoa voisilmän ja kanelisokerin kanssa.',
    ],
    tips: [
      'Paksupohjainen kattila estää pohjaan palamisen.',
      'Tähteestä saa seuraavana päivänä uunissa paistettua riisipuuropaistosta.',
    ],
  },
  'semolina-berries': {
    title: 'Mannapuuro ja mansikat',
    description: 'Sileä mannapuuro maidolla ja makeat mansikat: lapsuuden lempiaamiainen.',
    steps: [
      'Kuumenna maito kattilassa melkein kiehuvaksi.',
      'Ripottele mannasuurimot joukkoon koko ajan vatkaten, ettei puuroon tule paakkuja.',
      'Keitä miedolla lämmöllä sekoitellen noin 5 minuuttia. Mausta suolalla ja sokerilla.',
      'Tarjoa mansikoiden kanssa.',
    ],
    tips: [
      'Vatkain on paras väline paakuttomaan puuroon.',
      'Mansikoiden tilalle sopii mikä tahansa marja tai hillo.',
    ],
  },
  'whipped-lingonberry-porridge': {
    title: 'Vispipuuro kaurajuomalla',
    description: 'Kuohkeaksi vatkattu puolukkapuuro, joka tarjotaan kylmän kaurajuoman kanssa.',
    steps: [
      'Keitä puolukat 4 dl:ssa vettä ja siivilöi, jos haluat sileän puuron.',
      'Ripottele mannasuurimot kiehuvaan liemeen vatkaten. Keitä miedolla lämmöllä 10 minuuttia.',
      'Mausta sokerilla ja suolalla ja anna jäähtyä.',
      'Vatkaa jäähtynyt puuro sähkövatkaimella vaaleaksi ja kuohkeaksi.',
      'Tarjoa kylmän kaurajuoman kanssa.',
    ],
    tips: [
      'Puuro vaalenee ja kuohkeutuu vasta jäähtyneenä: älä vatkaa kuumana.',
      'Säilyy jääkaapissa ja sopii myös välipalaksi.',
    ],
    storage: 'Säilytä kannellisessa rasiassa jääkaapissa 3 päivää.',
    reheating: 'Tarjoillaan kylmänä. Vatkaa hetki ennen tarjoilua.',
  },
  'buckwheat-porridge-raspberry': {
    title: 'Laktoositon tattaripuuro ja vadelmat',
    description: 'Paahteinen tattaripuuro laktoosittomalla maidolla, vadelmilla ja ripauksella hunajaa.',
    steps: [
      'Huuhtele tattarisuurimot siivilässä.',
      'Keitä tattaria 2 dl:ssa vettä suolan kanssa noin 10 minuuttia.',
      'Lisää maito ja keitä sekoitellen vielä 5 minuuttia, kunnes puuro on pehmeää.',
      'Tarjoa vadelmien ja hunajan kanssa.',
    ],
    tips: [
      'Tattari on luontaisesti gluteenitonta.',
      'Paahda suurimot ensin kuivalla kattilalla, niin maku syvenee.',
    ],
  },
  'overnight-oats': {
    title: 'Yön yli -kaurat ja mustikat',
    description: 'Illalla valmiiksi sekoitettu jogurttikaura, joka odottaa aamulla jääkaapissa valmiina.',
    steps: [
      'Sekoita purkissa kaurahiutaleet, chiansiemenet, jogurtti ja maito.',
      'Lisää päälle mustikat ja hunaja.',
      'Sulje kansi ja anna tekeytyä jääkaapissa yön yli.',
    ],
    tips: [
      'Tee kerralla kolmen päivän annokset valmiiksi.',
      'Kuljeta purkissa töihin tai kouluun.',
    ],
    storage: 'Säilytä suljetussa purkissa jääkaapissa 2–3 päivää.',
    reheating: 'Syödään kylmänä. Talvella puuron voi lämmittää mikrossa.',
  },
  'vegan-overnight-oats': {
    title: 'Vegaaniset yön yli -kaurat vadelmilla',
    description: 'Kaurajogurttiin tekeytetyt hiutaleet ja chia, päällä vadelmat ja siirappi.',
    steps: [
      'Sekoita purkissa kaurahiutaleet, chiansiemenet, kaurajogurtti ja kaurajuoma.',
      'Nosta päälle vadelmat ja valuta siirappi.',
      'Anna tekeytyä jääkaapissa vähintään 4 tuntia tai yön yli.',
    ],
    tips: [
      'Lisää aamulla rouhittuja siemeniä rapeudeksi.',
      'Pakastevadelmat sulavat yön aikana mehukkaiksi.',
    ],
    storage: 'Säilytä suljetussa purkissa jääkaapissa 2–3 päivää.',
    reheating: 'Syödään kylmänä.',
  },
  'chia-pudding-mango': {
    title: 'Chiavanukas mangolla',
    description: 'Kookosmaitoon turvotettu chiavanukas, raikas mango ja limen kuori.',
    steps: [
      'Sekoita chiansiemenet, kookosmaito, 0,5 dl vettä ja siirappi.',
      'Sekoita uudelleen 10 minuutin päästä, ettei siemenistä tule paakkuja.',
      'Anna turvota jääkaapissa vähintään 4 tuntia.',
      'Nosta päälle mangokuutiot ja raasta limen kuorta.',
    ],
    tips: [
      'Kevyempi versio syntyy, kun puolet kookosmaidosta korvaa vedellä.',
      'Vanukas säilyy jääkaapissa kolme päivää.',
    ],
    storage: 'Säilytä suljetussa purkissa jääkaapissa 3 päivää.',
    reheating: 'Syödään kylmänä.',
  },
  'protein-porridge': {
    title: 'Rahkapuuro ja banaani',
    description: 'Kaurapuuro, johon sekoitetaan rahkaa: tavallista enemmän proteiinia ja pitkä kylläisyys.',
    steps: [
      'Keitä kaurahiutaleet maidossa ja 1 dl:ssa vettä suolan kanssa 3–5 minuuttia.',
      'Nosta kattila liedeltä ja sekoita rahka puuron joukkoon.',
      'Viipaloi päälle banaani ja ripottele kaneli.',
    ],
    tips: [
      'Rahka lisätään vasta liedeltä nostettuun puuroon, ettei se juoksetu.',
      'Laktoosittomana: käytä laktoositonta maitoa ja rahkaa.',
    ],
  },
  'spinach-feta-omelette': {
    title: 'Munakas pinaatilla ja fetalla',
    description: 'Pehmeä munakas, jossa on pinaattia ja suolaista fetaa. Valmis kymmenessä minuutissa.',
    steps: [
      'Vatkaa kananmunat ja mausta suolalla ja pippurilla.',
      'Sulata voi pannulla ja kuullota pinaattia minuutti.',
      'Kaada munaseos pannulle ja anna hyytyä miedolla lämmöllä.',
      'Murenna feta pinnalle, taita munakas kahtia ja tarjoa heti.',
    ],
    tips: [
      'Kansi pannun päällä kypsentää munakkaan pinnan tasaisesti.',
      'Lisää halutessasi kirsikkatomaatteja.',
    ],
  },
  'scrambled-eggs-rye': {
    title: 'Munakokkeli ruisleivällä',
    description: 'Kermaisen pehmeä munakokkeli ruohosipulilla ja ruisleipä: suomalainen aamiaisklassikko.',
    steps: [
      'Vatkaa kananmunat, maito ja suola kevyesti sekaisin.',
      'Sulata voi pannulla miedolla lämmöllä ja kaada munaseos pannulle.',
      'Kääntele lastalla rauhallisesti, kunnes kokkeli on hyytynyt mutta vielä kiiltävää.',
      'Tarjoa ruisleivän päällä ja ripottele pinnalle ruohosipulia.',
    ],
    tips: [
      'Nosta kokkeli liedeltä hieman ennen kuin se näyttää valmiilta: jälkilämpö kypsentää loput.',
    ],
  },
  'avocado-egg-toast': {
    title: 'Avokadoleipä ja keitetty kananmuna',
    description: 'Rapea täysjyväpaahtoleipä, sitruunainen avokado, kananmuna ja ripaus chiliä.',
    steps: [
      'Keitä kananmunaa 8 minuuttia, jäähdytä ja kuori.',
      'Paahda leipäviipaleet.',
      'Muussaa avokado haarukalla ja mausta sitruunamehulla ja suolalla.',
      'Levitä avokado leiville, viipaloi päälle kananmuna ja ripottele chilihiutaleet.',
    ],
    tips: [
      'Kypsä avokado antaa hieman periksi, kun sitä painaa kevyesti.',
    ],
  },
  'gf-avocado-toast': {
    title: 'Gluteeniton avokadoleipä ja tomaatit',
    description: 'Gluteeniton siemenleipä, limellä maustettu avokado ja mehevät kirsikkatomaatit.',
    steps: [
      'Paahda leipäviipaleet pannulla tai leivänpaahtimessa.',
      'Muussaa avokado ja mausta limellä, suolalla ja pippurilla.',
      'Levitä avokado leiville ja lisää päälle puolitetut kirsikkatomaatit.',
    ],
    tips: [
      'Paahda gluteeniton leipä aina: se maistuu ja kestää täytettä paremmin.',
    ],
  },
  'tofu-scramble': {
    title: 'Tofukokkeli tomaatilla ja pinaatilla',
    description: 'Murustettu tofu mausteisena kokkelina, tomaattia ja pinaattia. Vegaaninen aamiainen.',
    steps: [
      'Kuullota hienonnettu sipuli öljyssä pannulla.',
      'Murenna tofu pannulle ja mausta curryjauheella, suolalla ja pippurilla. Paista 5 minuuttia.',
      'Lisää tomaattikuutiot ja pinaatti ja paista, kunnes pinaatti on pehmennyt.',
    ],
    tips: [
      'Curryjauhe antaa tofulle munakokkelin keltaisen värin.',
      'Tarjoa paahtoleivän tai riisikakkujen kanssa.',
    ],
  },
  'ham-cheese-toast': {
    title: 'Lämmin kinkku-juustoleipä',
    description: 'Uunissa sulatettu juusto, kinkku ja tomaatti paahtoleivän päällä.',
    steps: [
      'Lämmitä uuni 225 asteeseen.',
      'Voitele leivät ja lisää päälle kinkku, tomaattiviipaleet ja juustoraaste.',
      'Paista uunin ylätasolla 5–7 minuuttia, kunnes juusto on sulanut ja saanut väriä.',
    ],
    tips: [
      'Ripaus oreganoa tekee leivästä pizzamaisen.',
    ],
  },
  'smoked-salmon-rye': {
    title: 'Kylmäsavulohileipä ja kurkku',
    description: 'Ruisleipä, tuorejuusto, kylmäsavulohi, kurkku ja tilli. Juhlava mutta nopea.',
    steps: [
      'Levitä tuorejuusto ruisleipäviipaleille.',
      'Lisää päälle ohuet kurkkuviipaleet ja kylmäsavulohi.',
      'Viimeistele tillillä ja muutamalla sitruunamehun tipalla.',
    ],
    tips: [
      'Graavisilakka tai savukirjolohi sopii lohen tilalle.',
    ],
  },
  'cottage-cheese-crispbread': {
    title: 'Raejuusto-tomaattinäkkileipä',
    description: 'Rapea ruisnäkkileipä, raejuusto, tomaatti ja ruohosipuli. Kevyt ja proteiinipitoinen.',
    steps: [
      'Levitä raejuusto näkkileipien päälle.',
      'Lisää päälle tomaattiviipaleet, ruohosipuli ja rouhaise mustapippuria.',
    ],
    tips: [
      'Kokoa juuri ennen syömistä, niin näkkileipä pysyy rapeana.',
    ],
  },
  'hummus-veggie-bread': {
    title: 'Hummusleipä ja rapeat kasvikset',
    description: 'Ruisleipä, samettinen hummus ja rapeat kurkku- ja paprikaviipaleet. Vegaaninen ja täyttävä.',
    steps: [
      'Levitä hummus paksulti ruisleipäviipaleille.',
      'Lisää päälle kurkku- ja paprikaviipaleet ja rouhaise pippuria.',
    ],
    tips: [
      'Ripottele päälle paahdettuja siemeniä tai chilihiutaleita.',
    ],
  },
  'oven-omelette-vegetables': {
    title: 'Uunimunakas kasviksilla',
    description: 'Mehevä uunimunakas paprikalla, pinaatilla ja juustolla. Riittää koko viikon aamuihin.',
    steps: [
      'Lämmitä uuni 200 asteeseen ja voitele uunivuoka öljyllä.',
      'Vatkaa kananmunat, maito ja suola.',
      'Levitä paprika, sipuli ja pinaatti vuokaan ja kaada munaseos päälle.',
      'Ripottele pinnalle juustoraaste ja paista 20–25 minuuttia, kunnes munakas on hyytynyt.',
    ],
    tips: [
      'Leikkaa jäähtynyt munakas paloiksi eväsrasioihin.',
      'Kasvikset voi vaihtaa jääkaapin tähteisiin.',
    ],
    storage: 'Säilytä paloina jääkaapissa 3 päivää.',
    reheating: 'Syö kylmänä tai lämmitä mikrossa 30–60 sekuntia.',
  },
  'yogurt-muesli-bowl': {
    title: 'Jogurttikulho marjoilla ja myslillä',
    description: 'Maustamaton jogurtti, mysli, mustikat ja mansikat. Nopea ja raikas aamu.',
    steps: [
      'Annostele jogurtti kulhoon.',
      'Lisää päälle marjat ja mysli juuri ennen syömistä.',
    ],
    tips: [
      'Lisää mysli vasta syödessä, niin se pysyy rapeana.',
    ],
    storage: 'Kokoa kulho syödessä. Avattu jogurtti säilyy jääkaapissa 3 päivää.',
    reheating: 'Syödään kylmänä.',
  },
  'lactose-free-quark-bowl': {
    title: 'Laktoositon rahkakulho vadelmilla',
    description: 'Laktoositon rahka ja jogurtti, vadelmat ja gluteeniton mysli: proteiinia aamuun.',
    steps: [
      'Sekoita rahka ja jogurtti kulhossa tasaiseksi.',
      'Lisää päälle vadelmat, mysli ja hunaja.',
    ],
    tips: [
      'Rahkan ja jogurtin seos on kuohkeampi kuin pelkkä rahka.',
    ],
    storage: 'Kokoa kulho syödessä.',
    reheating: 'Syödään kylmänä.',
  },
  'soy-yogurt-mango-bowl': {
    title: 'Soijajogurttikulho mangolla',
    description: 'Vegaaninen aamiaiskulho: soijajogurtti, mango, gluteeniton mysli ja kurpitsansiemenet.',
    steps: [
      'Annostele soijajogurtti kulhoon.',
      'Lisää päälle sulanut mango, mysli ja kurpitsansiemenet.',
    ],
    tips: [
      'Sulata pakastemango jääkaapissa yön yli.',
    ],
    storage: 'Kokoa kulho syödessä.',
    reheating: 'Syödään kylmänä.',
  },
  'banana-egg-pancakes': {
    title: 'Banaaniletut kahdesta aineesta',
    description: 'Pienet pannuletut vain banaanista ja kananmunasta, ilman jauhoja.',
    steps: [
      'Muussaa banaani haarukalla sileäksi.',
      'Vatkaa joukkoon kananmunat ja kaneli.',
      'Paista pieniä lettuja öljytyllä pannulla keskilämmöllä noin minuutti per puoli.',
    ],
    tips: [
      'Pienet letut on helpompi kääntää kuin isot.',
      'Tarjoa marjojen kanssa.',
    ],
  },
  'eggs-bacon-tomato': {
    title: 'Paistetut munat, pekoni ja tomaatti',
    description: 'Viikonlopun lämmin aamiaislautanen: paistetut munat, rapea pekoni, sienet ja tomaatti.',
    steps: [
      'Paista pekoni rapeaksi pannulla ja nosta talouspaperille.',
      'Paista puolitetut tomaatit ja sienet pekonin rasvassa.',
      'Paista kananmunat öljyssä haluamaasi kypsyyteen.',
      'Tarjoa paahtoleivän kanssa.',
    ],
    tips: [
      'Kananmunat paistuvat kauniisti, kun pannu ei ole liian kuuma.',
    ],
  },
};
