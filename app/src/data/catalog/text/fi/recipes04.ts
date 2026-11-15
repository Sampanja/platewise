import type { RecipeText } from '../types';

/** Finnish text for recipe batch 4 (structure: catalog/recipes4.ts). */
export const FI_RECIPES_04: Readonly<Record<string, RecipeText>> = {
  'blueberry-smoothie': {
    title: 'Mustikkasmoothie',
    description: 'Paksu ja kylmä smoothie mustikoista, banaanista, jogurtista ja kaurasta.',
    steps: [
      'Laita kaikki ainekset tehosekoittimeen.',
      'Sekoita tasaiseksi ja lisää tarvittaessa tilkka vettä.',
    ],
    tips: [
      'Pakastemustikat tekevät smoothiesta valmiiksi kylmän.',
      'Kaurahiutaleet tuovat kylläisyyttä.',
    ],
  },
  'vegan-mango-banana-smoothie': {
    title: 'Vegaaninen mango-banaanismoothie',
    description: 'Aurinkoinen smoothie mangosta, banaanista, kaurajuomasta ja pellavansiemenestä.',
    steps: [
      'Laita mango, banaani, pellavansiemenet ja kaurajuoma tehosekoittimeen.',
      'Sekoita sileäksi ja tarjoa heti.',
    ],
    tips: [
      'Kypsä, pilkullinen banaani makeuttaa smoothien luonnollisesti.',
    ],
  },
  'green-pear-smoothie': {
    title: 'Vihreä smoothie päärynällä',
    description: 'Raikas viherjuoma pinaatista, banaanista, päärynästä ja limestä.',
    steps: [
      'Laita pinaatti, banaani, paloiteltu päärynä, limen mehu ja pellavansiemenet tehosekoittimeen.',
      'Lisää 1,5 dl kylmää vettä ja sekoita tasaiseksi.',
    ],
    tips: [
      'Pinaatin maku ei juuri erotu, mutta väri on kirkkaan vihreä.',
    ],
  },
  'strawberry-quark-smoothie': {
    title: 'Mansikka-rahkasmoothie',
    description: 'Proteiinipitoinen smoothie mansikoista, rahkasta ja banaanista: hyvä treenin jälkeen.',
    steps: [
      'Laita mansikat, rahka, maito ja banaani tehosekoittimeen.',
      'Sekoita tasaiseksi ja kaada lasiin.',
    ],
    tips: [
      'Laktoosittomana: käytä laktoositonta rahkaa ja maitoa.',
    ],
  },
  'cocoa-banana-peanut-smoothie': {
    title: 'Kaakao-banaanismoothie maapähkinävoilla',
    description: 'Täyteläinen smoothie banaanista, kaakaosta ja maapähkinävoista.',
    steps: [
      'Laita banaani, kaakaojauhe, maapähkinävoi ja maito tehosekoittimeen.',
      'Sekoita tasaiseksi. Lisää jääpaloja, jos haluat smoothien kylmempänä.',
    ],
    tips: [
      'Pakasta banaani paloina, niin smoothiesta tulee kuin pirtelöä.',
    ],
  },
  'lactose-free-raspberry-smoothie': {
    title: 'Laktoositon vadelmasmoothie',
    description: 'Kirpeän makea smoothie vadelmista ja laktoosittomasta jogurtista.',
    steps: [
      'Laita kaikki ainekset tehosekoittimeen.',
      'Sekoita tasaiseksi ja siivilöi halutessasi siemenet pois.',
    ],
    tips: [
      'Siivilöity smoothie on samettisen sileä.',
    ],
  },
  'coconut-mango-smoothie': {
    title: 'Kookos-mangosmoothie',
    description: 'Trooppinen smoothie mangosta, kookosmaidosta ja banaanista limen raikkaudella.',
    steps: [
      'Laita mango, kookosmaito, banaani ja limen mehu tehosekoittimeen.',
      'Lisää 1 dl kylmää vettä ja sekoita sileäksi.',
    ],
    tips: [
      'Kevyempi kookosmaito vähentää energiaa selvästi.',
    ],
  },
  'finnish-crepes': {
    title: 'Ohukaiset ja hillo',
    description: 'Ohuet ja pitsireunaiset ohukaiset, joiden kanssa tarjotaan marjahilloa.',
    steps: [
      'Vatkaa jauhot ja puolet maidosta tasaiseksi. Lisää loppu maito, kananmunat, sokeri ja suola.',
      'Anna taikinan turvota 15 minuuttia.',
      'Sulata voi ja sekoita se taikinaan.',
      'Paista ohuita lettuja kuumalla pannulla noin minuutti per puoli.',
      'Tarjoa hillon kanssa.',
    ],
    tips: [
      'Ensimmäinen ohukainen on usein harjoituskappale: säädä lämpöä sen mukaan.',
    ],
  },
  'oven-pancake': {
    title: 'Uunipannukakku ja mansikat',
    description: 'Kohoava uunipannukakku, jonka kanssa tarjotaan mansikoita. Suomalainen viikonloppuherkku.',
    steps: [
      'Lämmitä uuni 225 asteeseen. Sulata voi uunipellillä leivinpaperin päällä.',
      'Vatkaa jauhot, sokeri, suola ja puolet maidosta tasaiseksi.',
      'Lisää loppu maito ja kananmunat ja kaada voi taikinaan.',
      'Kaada taikina pellille ja paista 25–30 minuuttia, kunnes pinta on kullanruskea.',
      'Leikkaa paloiksi ja tarjoa mansikoiden kanssa.',
    ],
    tips: [
      'Älä avaa uunin luukkua ensimmäisen 20 minuutin aikana, niin pannukakku kohoaa.',
    ],
  },
  'gf-oat-pancakes': {
    title: 'Gluteenittomat kauraletut mustikoilla',
    description: 'Kuohkeat pannuletut gluteenittomasta kaurasta ja laktoosittomasta maidosta.',
    steps: [
      'Jauha gluteenittomat kaurahiutaleet tehosekoittimessa jauhoksi.',
      'Sekoita joukkoon leivinjauhe, suola, maito ja kananmunat. Anna seistä 5 minuuttia.',
      'Paista pieniä lettuja öljytyllä pannulla keskilämmöllä kullanruskeiksi.',
      'Tarjoa mustikoiden kanssa.',
    ],
    tips: [
      'Taikina paksuuntuu seistessään: lisää tarvittaessa tilkka maitoa.',
    ],
  },
  'vegan-oat-pancakes': {
    title: 'Vegaaniset kauraletut ja vadelmat',
    description: 'Banaanilla makeutetut kauraletut täysin kasviperäisistä aineksista.',
    steps: [
      'Jauha kaurahiutaleet tehosekoittimessa.',
      'Lisää banaani, kaurajuoma, leivinjauhe ja suola ja sekoita tasaiseksi taikinaksi.',
      'Paista pieniä lettuja öljytyllä pannulla keskilämmöllä noin 2 minuuttia per puoli.',
      'Tarjoa vadelmien kanssa.',
    ],
    tips: [
      'Käännä letut vasta, kun pinnalle tulee kuplia ja reunat kiinteytyvät.',
    ],
  },
  'american-pancakes': {
    title: 'Amerikkalaiset pannukakut ja siirappi',
    description: 'Paksut ja pehmeät pannukakut mustikoilla ja siirapilla.',
    steps: [
      'Sekoita jauhot, leivinjauhe ja sokeri kulhossa.',
      'Vatkaa toisessa kulhossa maito, kananmunat ja sulatettu voi.',
      'Yhdistä seokset kevyesti: muutama paakku saa jäädä.',
      'Paista paksuja lettuja keskilämmöllä, kunnes pinnalle nousee kuplia, ja käännä.',
      'Tarjoa mustikoiden ja siirapin kanssa.',
    ],
    tips: [
      'Liika sekoittaminen tekee pannukakuista sitkeitä.',
    ],
  },
  'spinach-pancakes': {
    title: 'Pinaattiletut ja puolukkasurvos',
    description: 'Suomalainen klassikko: vihreät pinaattiletut, puolukkasurvos ja voisulan maku.',
    steps: [
      'Vatkaa jauhot ja puolet maidosta tasaiseksi. Lisää loppu maito, kananmunat ja suola.',
      'Hienonna pinaatti ja sekoita taikinaan. Anna turvota 15 minuuttia.',
      'Sulata voi ja sekoita puolet taikinaan.',
      'Paista lettuja voidellulla pannulla keskilämmöllä noin 2 minuuttia per puoli.',
      'Tarjoa puolukkasurvoksen kanssa.',
    ],
    tips: [
      'Pakastepinaatti käy hyvin: sulata ja purista ylimääräinen neste pois.',
      'Letut pakastuvat hyvin.',
    ],
  },
  'karelian-pies': {
    title: 'Karjalanpiirakat ja munavoi',
    description: 'Ohuet ruiskuoret, kermainen riisipuurotäyte ja klassinen munavoi.',
    steps: [
      'Keitä puuroriisi 1 dl:ssa vettä, lisää maito ja keitä miedolla lämmöllä paksuksi puuroksi noin 40 minuuttia. Suolaa ja jäähdytä.',
      'Sekoita ruis- ja vehnäjauhot, 0,5 dl vettä ja ripaus suolaa kiinteäksi taikinaksi.',
      'Kauli taikinasta ohuita, halkaisijaltaan noin 12 cm:n kuoria.',
      'Levitä puuro kuorille ja rypytä reunat sormilla.',
      'Paista 275 asteessa 12–15 minuuttia ja sivele kuumat piirakat sulatetulla voilla.',
      'Keitä kananmunat kovaksi ja sekoita hienonnettuina voin kanssa munavoiksi.',
    ],
    tips: [
      'Kääri valmiit piirakat leivinpaperiin ja pyyhkeeseen, niin kuoret pehmenevät.',
      'Piirakat pakastuvat erinomaisesti.',
    ],
    storage: 'Säilytä piirakat jääkaapissa 3 päivää tai pakasta. Munavoi säilyy jääkaapissa 2 päivää.',
    reheating: 'Lämmitä piirakat uunissa 200 asteessa noin 8 minuuttia.',
  },
  'oat-rolls': {
    title: 'Kaurasämpylät',
    description: 'Pehmeät kotitekoiset kaurasämpylät aamiaiselle ja eväisiin.',
    steps: [
      'Lämmitä maito kädenlämpöiseksi ja liuota hiiva siihen.',
      'Lisää kaurahiutaleet, suola ja jauhot vähitellen ja vaivaa tasaiseksi taikinaksi. Lisää öljy lopuksi.',
      'Anna kohota liinan alla noin 40 minuuttia.',
      'Leivo taikinasta 12 sämpylää pellille ja anna kohota vielä 20 minuuttia.',
      'Paista 225 asteessa noin 12 minuuttia.',
    ],
    tips: [
      'Pakasta jäähtyneet sämpylät pussissa ja ota aamulla tarvittava määrä.',
    ],
    storage: 'Säilytä pussissa huoneenlämmössä 2 päivää tai pakasta 3 kuukaudeksi.',
    reheating: 'Lämmitä pakastettu sämpylä uunissa 200 asteessa 5–8 minuuttia.',
  },
  'turkey-avocado-wrap': {
    title: 'Kalkkuna-avokadorulla',
    description: 'Tortilla, tuorejuusto, kalkkunaleike, avokado ja salaatti. Valmis eväs viidessä minuutissa.',
    steps: [
      'Levitä tuorejuusto tortillalle.',
      'Lisää salaatti, kalkkunaleike ja avokadoviipaleet ja kääri tiukaksi rullaksi.',
    ],
    tips: [
      'Kääri rulla leivinpaperiin, niin se pysyy eväänä koossa.',
    ],
  },
  'breakfast-burrito': {
    title: 'Aamiaistortilla munakokkelilla',
    description: 'Lämmin tortilla, munakokkeli, paprika, juusto ja salsa.',
    steps: [
      'Paista paprikasuikaleet öljyssä pehmeiksi.',
      'Lisää vatkatut kananmunat ja suola ja kääntele kokkeliksi.',
      'Lämmitä tortilla kuivalla pannulla, täytä kokkelilla, juustolla ja salsalla ja kääri.',
    ],
    tips: [
      'Rullat voi pakastaa yksitellen kelmuun käärittyinä.',
    ],
  },
  'egg-butter-rye': {
    title: 'Munavoi ja ruisleipä',
    description: 'Karjalainen munavoi lämpimän ruisleivän päällä: yksinkertainen ja ihana.',
    steps: [
      'Keitä kananmuna kovaksi 9 minuutissa ja jäähdytä kylmässä vedessä.',
      'Hienonna kuorittu muna ja sekoita pehmeän voin ja suolan kanssa.',
      'Levitä munavoi ruisleivän päälle.',
    ],
    tips: [
      'Ruohosipuli tuo munavoihin raikkautta.',
    ],
  },
  'egg-ham-lettuce-rolls': {
    title: 'Kananmuna-kinkkurullat salaatinlehdessä',
    description: 'Jäävuorisalaatin lehtiin käärityt kananmunat ja kinkku. Gluteenitonta ja maidotonta.',
    steps: [
      'Keitä kananmunat kovaksi, jäähdytä ja viipaloi.',
      'Levitä salaatinlehdille ohut kerros majoneesia.',
      'Lisää kinkku, munaviipaleet ja ruohosipuli ja kääri rulliksi.',
    ],
    tips: [
      'Majoneesin voi jättää pois tai vaihtaa sinappiin.',
    ],
  },
  'apple-walnut-porridge': {
    title: 'Omena-kaurapuuro saksanpähkinöillä',
    description: 'Kanelinen kaurapuuro, pehmeää omenaa ja rapeita saksanpähkinöitä.',
    steps: [
      'Keitä kaurahiutaleet maidossa ja 1 dl:ssa vettä suolan kanssa 3–5 minuuttia.',
      'Lisää kuutioitu omena ja kaneli ja keitä vielä minuutti.',
      'Rouhi saksanpähkinät ja ripottele puuron päälle.',
    ],
    tips: [
      'Paahda pähkinät kuivalla pannulla, niin ne ovat rapeampia.',
    ],
  },
  'granola-yogurt': {
    title: 'Kotitekoinen granola ja jogurtti',
    description: 'Uunissa paahdettu granola manteleista, siemenistä ja kookoksesta jogurtin kanssa.',
    steps: [
      'Lämmitä uuni 175 asteeseen.',
      'Sekoita kaurahiutaleet, rouhitut mantelit, siemenet, kookoshiutaleet ja kaneli.',
      'Lisää siirappi ja öljy ja sekoita, kunnes kaikki on kostunut.',
      'Levitä pellille ja paahda 20–25 minuuttia välillä sekoittaen. Anna jäähtyä.',
      'Tarjoa jogurtin päällä.',
    ],
    tips: [
      'Granola rapeutuu vasta jäähtyessään.',
      'Säilytä tiiviissä purkissa kaksi viikkoa.',
    ],
    storage: 'Säilytä jäähtynyt granola tiiviissä purkissa 2 viikkoa.',
    reheating: 'Syödään kylmänä.',
  },
  'warm-bread-cheese-jam': {
    title: 'Lämmin leipäjuusto ja hillo',
    description: 'Pannulla lämmitetty leipäjuusto ja marjahillo: perinteinen pohjalainen herkku.',
    steps: [
      'Lämmitä leipäjuustopalat kuivalla pannulla tai mikrossa, kunnes ne pehmenevät.',
      'Tarjoa lämpimänä hillon kanssa.',
    ],
    tips: [
      'Perinteisesti leipäjuusto tarjotaan lakkahillon kanssa.',
    ],
  },
  'peanut-butter-banana-toast': {
    title: 'Maapähkinävoi-banaanileipä',
    description: 'Paahtoleipä, maapähkinävoi ja banaaniviipaleet: nopea energia aamuun.',
    steps: [
      'Paahda leipäviipaleet.',
      'Levitä maapähkinävoi ja lisää päälle banaaniviipaleet ja ripaus kanelia.',
    ],
    tips: [
      'Ripottele päälle chiansiemeniä lisäkuidun vuoksi.',
    ],
  },
  'rice-cakes-hummus': {
    title: 'Riisikakut, hummus ja kurkku',
    description: 'Rapeat riisikakut, hummus ja kurkku: gluteeniton ja maidoton välipala tai aamupala.',
    steps: [
      'Levitä hummus riisikakuille.',
      'Lisää päälle kurkkuviipaleet ja rouhaise pippuria.',
    ],
    tips: [
      'Kokoa juuri ennen syömistä, niin riisikakut pysyvät rapeina.',
    ],
  },
  'quinoa-porridge-coconut': {
    title: 'Kvinoapuuro kookosmaidolla ja mansikoilla',
    description: 'Kookosmaitoon keitetty kvinoapuuro mansikoilla: gluteeniton ja vegaaninen.',
    steps: [
      'Huuhtele kvinoa siivilässä.',
      'Keitä kvinoaa 2 dl:ssa vettä noin 12 minuuttia.',
      'Lisää kookosmaito ja kaneli ja keitä vielä 3 minuuttia.',
      'Tarjoa mansikoiden ja siirapin kanssa.',
    ],
    tips: [
      'Kvinoan voi keittää illalla valmiiksi ja lämmittää aamulla.',
    ],
  },
};
