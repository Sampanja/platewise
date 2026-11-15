import type { RecipeText } from '../types';

/** Finnish text for recipe batch 5 (structure: catalog/recipes5.ts). */
export const FI_RECIPES_05: Readonly<Record<string, RecipeText>> = {
  'roasted-chickpeas': {
    title: 'Rapeat paahdetut kikherneet',
    description: 'Uunissa paahdetut, paprikalla maustetut kikherneet: rouskuva ja täyttävä välipala.',
    steps: [
      'Lämmitä uuni 200 asteeseen.',
      'Huuhtele ja valuta kikherneet ja kuivaa ne huolellisesti talouspaperilla.',
      'Sekoita öljy, paprikajauhe ja suola joukkoon ja levitä pellille.',
      'Paahda 25–30 minuuttia välillä ravistellen, kunnes kikherneet ovat rapeita.',
    ],
    tips: [
      'Mitä kuivempia kikherneet ovat, sitä rapeampia niistä tulee.',
    ],
    storage: 'Säilytä avoimessa kulhossa huoneenlämmössä 1–2 päivää; kannen alla ne pehmenevät.',
    reheating: 'Rapeuta tarvittaessa uunissa 200 asteessa 5 minuuttia.',
  },
  'oat-peanut-energy-balls': {
    title: 'Kaura-maapähkinävoipallot',
    description: 'Paistamattomat energiapallot kaurasta, maapähkinävoista, kaakaosta ja rusinoista.',
    steps: [
      'Sekoita kaikki ainekset kulhossa tasaiseksi massaksi.',
      'Pyörittele massasta 12 palloa kostein käsin.',
      'Anna kovettua jääkaapissa vähintään 30 minuuttia.',
    ],
    tips: [
      'Pyörittele pallot kookoshiutaleissa, jos haluat koristeellisemmat.',
    ],
    storage: 'Säilytä kannellisessa rasiassa jääkaapissa viikon tai pakasta.',
    reheating: 'Syödään kylmänä.',
  },
  'gf-almond-energy-balls': {
    title: 'Gluteenittomat manteli-kaakaopallot',
    description: 'Mantelista, gluteenittomasta kaurasta ja rusinoista tehdyt vegaaniset kaakaopallot.',
    steps: [
      'Jauha mantelit ja kaurahiutaleet tehosekoittimessa karkeaksi rouheeksi.',
      'Lisää rusinat, kaakao ja ruokalusikallinen vettä ja sekoita tahmeaksi massaksi.',
      'Pyörittele palloiksi ja kierittele kookoshiutaleissa.',
      'Anna kovettua jääkaapissa 30 minuuttia.',
    ],
    tips: [
      'Jos massa on liian kuivaa, lisää tilkka vettä.',
    ],
    storage: 'Säilytä kannellisessa rasiassa jääkaapissa viikon.',
    reheating: 'Syödään kylmänä.',
  },
  'fruit-salad': {
    title: 'Raikas hedelmäsalaatti',
    description: 'Omenaa, appelsiinia, banaania ja mansikoita limen mehulla.',
    steps: [
      'Kuori ja paloittele appelsiini ja banaani. Kuutioi omena.',
      'Sekoita hedelmät ja mansikat kulhossa.',
      'Purista päälle limen mehu, joka estää omenaa tummumasta.',
    ],
    tips: [
      'Lisää minttua tai tilkka hunajaa, jos haluat.',
    ],
    storage: 'Paras samana päivänä. Säilytä kannen alla jääkaapissa enintään 1 päivä.',
    reheating: 'Syödään kylmänä.',
  },
  'veggie-sticks-hummus': {
    title: 'Kasvistikut ja hummus',
    description: 'Rapeat porkkana- ja kurkkutikut hummuksen kanssa: helppo ja ravitseva välipala.',
    steps: [
      'Kuori porkkana ja leikkaa porkkana ja kurkku tikuiksi.',
      'Tarjoa hummuksen kanssa.',
    ],
    tips: [
      'Leikatut tikut säilyvät rapeina vesilasissa jääkaapissa.',
    ],
  },
  'tzatziki-veggies': {
    title: 'Tzatziki ja kasvistikut',
    description: 'Kreikkalainen jogurttidippi kurkusta, valkosipulista ja tillistä kasvisten kanssa.',
    steps: [
      'Raasta kurkku ja purista siitä neste pois.',
      'Sekoita jogurtti, kurkku, murskattu valkosipuli, tilli, oliiviöljy ja suola.',
      'Leikkaa porkkana ja paprika tikuiksi ja tarjoa dipin kanssa.',
    ],
    tips: [
      'Tzatziki paranee, kun se saa maustua jääkaapissa puoli tuntia.',
    ],
  },
  'guacamole-corn-chips': {
    title: 'Guacamole ja uunipaahdetut maissisipsit',
    description: 'Limellä ja korianterilla maustettu guacamole ja itse paahdetut maissitortillasipsit.',
    steps: [
      'Lämmitä uuni 200 asteeseen. Leikkaa tortillat kolmioiksi, sivele öljyllä ja ripottele suolaa.',
      'Paahda pellillä 8–10 minuuttia, kunnes sipsit ovat rapeita.',
      'Muussaa avokado ja sekoita joukkoon tomaatti, hienonnettu punasipuli, limen mehu ja korianteri.',
    ],
    tips: [
      'Jätä avokadon kivi guacamoleen säilytyksen ajaksi hidastamaan tummumista.',
    ],
  },
  'quark-berries': {
    title: 'Rahka ja mustikat',
    description: 'Maitorahka, mustikat ja tilkka hunajaa: paljon proteiinia pienessä kulhossa.',
    steps: [
      'Sekoita rahka tilkan vettä kanssa kuohkeaksi.',
      'Lisää päälle mustikat ja hunaja.',
    ],
    tips: [
      'Vatkattu rahka on kuohkeampaa kuin suoraan purkista.',
    ],
  },
  'cottage-cheese-pear': {
    title: 'Raejuusto ja kanelipäärynä',
    description: 'Raejuusto ja mehukas päärynä kanelilla: kevyt ja proteiinipitoinen välipala.',
    steps: [
      'Kuutioi päärynä.',
      'Annostele raejuusto kulhoon ja lisää päärynä ja kaneli.',
    ],
    tips: [
      'Päärynän tilalle sopii omena, persikka tai marjat.',
    ],
  },
  'tortilla-pizza': {
    title: 'Tortillapizza kinkulla',
    description: 'Rapea tortillapohja, tomaattikastike, mozzarella ja kinkku: pizzaa kymmenessä minuutissa.',
    steps: [
      'Lämmitä uuni 225 asteeseen.',
      'Levitä tomaattimurska tortillalle ja mausta oreganolla.',
      'Lisää kinkku ja revitty mozzarella.',
      'Paista uunin keskitasolla 6–8 minuuttia, kunnes reunat ovat rapeat.',
    ],
    tips: [
      'Kasvisversio syntyy paprikasta, sienistä ja oliiveista.',
    ],
  },
  'blueberry-muffins': {
    title: 'Mustikkamuffinit',
    description: 'Mehevät mustikkamuffinit kahvin kanssa tai eväsrasiaan.',
    steps: [
      'Lämmitä uuni 200 asteeseen ja asettele muffinssivuokaan paperivuoat.',
      'Vatkaa kananmunat ja sokeri vaahdoksi. Lisää sulatettu voi ja maito.',
      'Sekoita jauhot ja leivinjauhe ja nostele ne taikinaan kevyesti.',
      'Lisää mustikat ja jaa taikina vuokiin.',
      'Paista noin 18 minuuttia, kunnes tikkuun ei tartu taikinaa.',
    ],
    tips: [
      'Pyörittele pakastemustikat jauhoissa, niin ne eivät painu pohjaan.',
    ],
    storage: 'Säilytä kannellisessa rasiassa 2 päivää tai pakasta.',
    reheating: 'Lämmitä pakastettu muffinssi mikrossa 20 sekuntia.',
  },
  'banana-bread': {
    title: 'Banaanileipä',
    description: 'Kanelinen banaanileipä, joka syntyy ylikypsistä banaaneista.',
    steps: [
      'Lämmitä uuni 175 asteeseen ja voitele leipävuoka.',
      'Muussaa banaanit ja vatkaa joukkoon kananmunat, sokeri ja öljy.',
      'Sekoita jauhot, leivinjauhe ja kaneli ja yhdistä taikinaan.',
      'Kaada vuokaan ja paista noin 50 minuuttia.',
    ],
    tips: [
      'Mitä tummemmat banaanit, sitä makeampi leipä.',
    ],
    storage: 'Säilytä kelmuun käärittynä huoneenlämmössä 3 päivää tai pakasta viipaleina.',
    reheating: 'Paahda viipale leivänpaahtimessa tai pannulla.',
  },
  'apple-peanut-butter': {
    title: 'Omenalohkot ja maapähkinävoi',
    description: 'Rapeat omenalohkot ja maapähkinävoi: makea ja täyttävä välipala hetkessä.',
    steps: [
      'Leikkaa omena lohkoiksi ja poista siemenkota.',
      'Tarjoa maapähkinävoin kanssa dipattavaksi.',
    ],
    tips: [
      'Ripaus kanelia maapähkinävoin päällä sopii hyvin.',
    ],
  },
  'tuna-dip-rice-cakes': {
    title: 'Tonnikalatahna riisikakuilla',
    description: 'Jogurttinen tonnikalatahna, tilli ja kurkku rapeiden riisikakkujen päällä.',
    steps: [
      'Valuta tonnikala ja sekoita se jogurtin, tillin ja pippurin kanssa.',
      'Levitä tahna riisikakuille ja lisää päälle kurkkuviipaleet.',
    ],
    tips: [
      'Tahna säilyy jääkaapissa kaksi päivää.',
    ],
  },
  'eggs-cherry-tomatoes': {
    title: 'Kananmunat ja kirsikkatomaatit',
    description: 'Kaksi keitettyä kananmunaa ja makeat kirsikkatomaatit: yksinkertainen proteiinivälipala.',
    steps: [
      'Keitä kananmunia 8–9 minuuttia ja jäähdytä kylmässä vedessä.',
      'Kuori ja puolita munat, mausta suolalla ja pippurilla ja tarjoa tomaattien kanssa.',
    ],
    tips: [
      'Keitä kerralla viikon munat valmiiksi jääkaappiin.',
    ],
    storage: 'Säilytä keitetyt munat kuorineen jääkaapissa viikon.',
    reheating: 'Syödään kylmänä.',
  },
  'vegan-banana-strawberry-ice': {
    title: 'Vegaaninen banaani-mansikkajäätelö',
    description: 'Pakastetuista banaaneista ja mansikoista surautettu pehmeä jäätelö.',
    steps: [
      'Paloittele banaani ja pakasta vähintään 4 tunnin ajan.',
      'Surauta pakastetut banaanit ja mansikat tehosekoittimessa pehmeäksi jäätelöksi ja tarjoa heti.',
    ],
    tips: [
      'Pidä pakastimessa aina pussillinen banaaninpaloja tätä varten.',
    ],
    storage: 'Paras heti. Pakastettuna jäätelö kovettuu: anna sen pehmetä 10 minuuttia.',
    reheating: 'Ei lämmitetä.',
  },
  'spiced-nut-seed-mix': {
    title: 'Mausteinen pähkinä-siemensekoitus',
    description: 'Paahdetut mantelit, cashewpähkinät ja siemenet paprikalla ja suolalla.',
    steps: [
      'Lämmitä uuni 175 asteeseen.',
      'Sekoita mantelit, cashewpähkinät, siemenet, öljy ja mausteet.',
      'Paahda pellillä 10–12 minuuttia välillä sekoittaen ja anna jäähtyä.',
    ],
    tips: [
      'Annostele valmiiksi pieniin rasioihin, niin annoskoko pysyy kohtuullisena.',
    ],
    storage: 'Säilytä tiiviissä purkissa huoneenlämmössä 2 viikkoa.',
    reheating: 'Syödään sellaisenaan.',
  },
  'beetroot-hummus': {
    title: 'Punajuurihummus ja porkkanat',
    description: 'Kirkkaanpunainen hummus kikherneistä, punajuuresta ja tahinista porkkanatikkujen kanssa.',
    steps: [
      'Soseuta kikherneet, kypsä punajuuri, tahini, sitruunamehu, valkosipuli ja oliiviöljy tehosekoittimessa.',
      'Lisää vettä, kunnes hummus on sileää, ja mausta suolalla.',
      'Tarjoa porkkanatikkujen kanssa.',
    ],
    tips: [
      'Valmiiksi kypsennetyt tyhjiöpakatut punajuuret nopeuttavat valmistusta.',
    ],
    storage: 'Säilytä kannellisessa rasiassa jääkaapissa 4 päivää.',
    reheating: 'Tarjoa kylmänä.',
  },
  'blueberry-kissel': {
    title: 'Mustikkakeitto',
    description: 'Perinteinen mustikkakeitto, jonka voi nauttia lämpimänä tai kylmänä.',
    steps: [
      'Kuumenna mustikat, sokeri ja 2 dl vettä kiehuvaksi.',
      'Sekoita perunajauho pieneen määrään kylmää vettä.',
      'Nosta kattila liedeltä ja kaada jauhoseos ohuena nauhana koko ajan sekoittaen.',
      'Kuumenna, kunnes ensimmäinen kupla nousee pintaan, mutta älä keitä.',
    ],
    tips: [
      'Keittäminen perunajauhon lisäämisen jälkeen ohentaa keiton.',
      'Ripottele pinnalle sokeria, ettei kalvoa muodostu.',
    ],
    storage: 'Säilytä kannellisessa kulhossa jääkaapissa 3 päivää.',
    reheating: 'Tarjoa kylmänä tai lämmitä varovasti sekoittaen, kiehauttamatta.',
  },
  'oat-cookies': {
    title: 'Kaurakeksit',
    description: 'Rapeat ja voiset kaurakeksit, joita on helppo leipoa kerralla iso pelti.',
    steps: [
      'Lämmitä uuni 200 asteeseen.',
      'Sulata voi ja sekoita joukkoon sokeri, kaurahiutaleet, jauhot ja leivinjauhe.',
      'Lisää kananmuna ja sekoita tasaiseksi.',
      'Nostele teelusikalla pieniä nokareita leivinpaperille väljästi.',
      'Paista 6–8 minuuttia, kunnes reunat ovat kullanruskeat.',
    ],
    tips: [
      'Keksit leviävät paljon: jätä niille reilusti tilaa.',
    ],
    storage: 'Säilytä tiiviissä rasiassa huoneenlämmössä viikon.',
    reheating: 'Syödään sellaisenaan.',
  },
  'roasted-cauliflower-dip': {
    title: 'Uunikukkakaali ja jogurttidippi',
    description: 'Curryllä paahdettu kukkakaali ja viileä jogurttidippi.',
    steps: [
      'Lämmitä uuni 220 asteeseen.',
      'Paloittele kukkakaali ja sekoita öljyn, curryjauheen ja suolan kanssa.',
      'Paahda pellillä 20–25 minuuttia, kunnes reunat ruskistuvat.',
      'Sekoita jogurtti ja sitruunamehu dipiksi.',
    ],
    tips: [
      'Ripottele lopuksi tuoretta korianteria.',
    ],
  },
  'salmon-cucumber-rolls': {
    title: 'Kurkku-lohirullat',
    description: 'Ohuet kurkkusuikaleet, tuorejuusto ja kylmäsavulohi tilli-sitruunalla.',
    steps: [
      'Viipaloi kurkku pitkittäin ohuiksi suikaleiksi juustohöylällä.',
      'Levitä suikaleille tuorejuusto ja lisää päälle lohi ja tilli.',
      'Kierrä rulliksi ja purista päälle sitruunamehua.',
    ],
    tips: [
      'Kiinnitä rullat cocktailtikuilla, jos tarjoat ne juhlissa.',
    ],
    storage: 'Paras samana päivänä. Säilytä jääkaapissa kelmun alla.',
    reheating: 'Tarjoa kylmänä.',
  },
  'lactose-free-cocoa-quark': {
    title: 'Laktoositon kaakaorahka banaanilla',
    description: 'Kaakaolla maustettu laktoositon rahka ja banaani: makea mutta proteiinipitoinen.',
    steps: [
      'Sekoita kaakaojauhe rahkaan tilkan vettä kanssa tasaiseksi.',
      'Viipaloi päälle banaani.',
    ],
    tips: [
      'Kypsä banaani makeuttaa niin, ettei sokeria tarvita.',
    ],
  },
  'oat-yogurt-berries': {
    title: 'Kaurajogurtti, mustikat ja siemenet',
    description: 'Vegaaninen välipalakulho kaurajogurtista, mustikoista ja kurpitsansiemenistä.',
    steps: [
      'Annostele kaurajogurtti kulhoon.',
      'Lisää päälle mustikat ja kurpitsansiemenet.',
    ],
    tips: [
      'Paahda siemenet kuivalla pannulla, niin ne maistuvat pähkinäisiltä.',
    ],
  },
  'soy-yogurt-chia-raspberry': {
    title: 'Soijajogurtti, chia ja vadelmat',
    description: 'Chiansiemenillä täyteläistetty soijajogurtti ja vadelmat: gluteeniton ja vegaaninen.',
    steps: [
      'Sekoita chiansiemenet soijajogurttiin ja anna turvota 10 minuuttia.',
      'Lisää päälle vadelmat ja siirappi.',
    ],
    tips: [
      'Turvota chia yön yli, niin aamulla on valmis vanukas.',
    ],
  },
};
