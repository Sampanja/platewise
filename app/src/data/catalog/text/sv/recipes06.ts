import type { RecipeText } from '../types';

/** Swedish text for recipe batch 6 (structure: catalog/recipes6.ts). */
export const SV_RECIPES_06: Readonly<Record<string, RecipeText>> = {
  'salmon-soup': {
    title: 'Krämig laxsoppa',
    description: 'Finsk laxsoppa: saftig lax, potatis, purjolök, grädde och rikligt med dill.',
    steps: [
      'Skala och tärna potatis och morötter. Skär purjolöken i ringar.',
      'Koka grönsakerna i 7 dl vatten med buljongtärning och kryddpeppar i cirka 12 minuter.',
      'Tillsätt grädden och den tärnade laxen. Låt sjuda på låg värme i 5 minuter tills laxen är klar.',
      'Smaka av med salt och tillsätt rikligt med hackad dill.',
    ],
    tips: [
      'Låt inte laxen koka häftigt, så förblir bitarna hela och saftiga.',
      'Grädden kan bytas mot laktosfri matlagningsgrädde.',
    ],
    storage: 'Kyl snabbt och förvara i kylskåpet i 1–2 dagar.',
  },
  'karelian-stew': {
    title: 'Karelsk stek med potatis',
    description: 'Nötkött och fläskkött som fått stå i ugnen i timmar, med kryddpeppar och lingon.',
    steps: [
      'Sätt ugnen på 175 °C. Skär köttet i cirka 3 cm stora tärningar.',
      'Varva kött, lökklyftor och morötter i en gryta. Tillsätt kryddpeppar och salt.',
      'Häll i vatten så att köttet precis täcks. Låt stå i ugnen under lock i cirka 3 timmar.',
      'Koka potatisen före serveringen.',
      'Servera steken med potatis och rårörda lingon.',
    ],
    tips: [
      'Steken blir ännu godare uppvärmd dagen efter.',
      'Köttet behöver inte vara filé: sega bitar blir möra av lång tillagning.',
    ],
  },
  'macaroni-casserole': {
    title: 'Makaronilåda',
    description: 'En barndomsfavorit: makaroner, köttfärs och äggstanning gräddade gyllenbruna.',
    steps: [
      'Sätt ugnen på 200 °C. Förkoka makaronerna i saltat vatten.',
      'Bryn köttfärs och lök i en panna och krydda med salt och peppar.',
      'Blanda makaroner och köttfärs i en smord ugnsform.',
      'Vispa mjölk och ägg och häll i formen.',
      'Grädda i cirka 50 minuter tills äggstanningen har stelnat och ytan har fått färg.',
    ],
    tips: [
      'Servera med ketchup och gurksallad.',
      'Lådan kan förberedas på kvällen och gräddas dagen efter.',
    ],
  },
  'minced-meat-sauce-potatoes': {
    title: 'Köttfärssås med potatis',
    description: 'Vardagsmat: brun köttfärssås, kokt potatis och saltgurka.',
    steps: [
      'Koka potatisen mjuk.',
      'Bryn köttfärs och lök i en panna.',
      'Strö mjölet över och rör om. Tillsätt 2 dl vatten och fonden.',
      'Låt puttra i 10 minuter och smaka av med salt och peppar.',
      'Servera med potatis och saltgurka.',
    ],
    tips: [
      'En skvätt grädde gör såsen mjukare.',
      'Såsen går bra att frysa.',
    ],
  },
  'cabbage-casserole': {
    title: 'Kållåda med lingon',
    description: 'En lätt söt kållåda med köttfärs, ris och sirap. Lingon till.',
    steps: [
      'Sätt ugnen på 175 °C.',
      'Koka grötriset i 1 dl vatten i 10 minuter.',
      'Bryn den strimlade kålen i en panna i omgångar och lägg den i en stor skål.',
      'Bryn köttfärs och lök och blanda med kål, ris, salt och peppar. Tillsätt 2 dl vatten.',
      'Bred ut i en form, ringla sirapen över och grädda i cirka 2 timmar. Rör om en gång under tiden.',
      'Servera med rårörda lingon.',
    ],
    tips: [
      'Kållådan smakar bäst andra dagen.',
      'En vegetarisk variant gör du med sojafärs.',
    ],
  },
  'liver-casserole': {
    title: 'Leverlåda',
    description: 'En traditionell leverlåda sötad med russin och sirap: järn och god gammaldags smak.',
    steps: [
      'Sätt ugnen på 175 °C. Koka grötriset i 1 dl vatten i 10 minuter.',
      'Tillsätt mjölken och koka till en lös gröt i cirka 10 minuter. Låt svalna något.',
      'Mal eller finhacka levern och fräs löken i smör.',
      'Blanda lever, lök, ägg, russin, sirap och salt med gröten.',
      'Häll i en smord form och grädda i cirka en timme.',
      'Servera med rårörda lingon.',
    ],
    tips: [
      'Gravida bör undvika leverrätter på grund av deras höga halt av A-vitamin.',
    ],
  },
  'summer-vegetable-soup': {
    title: 'Sommarsoppa',
    description: 'Sommarens grönsaker kokta i mjölk: färskpotatis, morot, blomkål, ärter och dill.',
    steps: [
      'Koka potatis och morötter i 3 dl saltat vatten i 10 minuter.',
      'Tillsätt blomkålsbuketter och ärter och koka i 5 minuter.',
      'Rör ut mjölet i mjölken och häll i soppan under ständig omrörning.',
      'Låt koka upp, tillsätt smör och dill och smaka av med salt.',
    ],
    tips: [
      'Unga grönsaker behöver bara kort koktid.',
      'Laktosfritt: använd laktosfri mjölk och rapsolja.',
    ],
  },
  'meat-soup': {
    title: 'Köttsoppa med rotfrukter',
    description: 'En klar och matig soppa på nötkött, potatis, morot och kålrot.',
    steps: [
      'Skär köttet i tärningar och lägg det i en kastrull med 1 liter kallt vatten. Värm upp och skumma av.',
      'Tillsätt kryddpeppar och salt och låt sjuda långsamt i cirka en timme.',
      'Tillsätt de tärnade rotfrukterna och löken och koka ytterligare 20–25 minuter.',
      'Toppa med persilja.',
    ],
    tips: [
      'Buljongen blir klar när du skummar noga i början.',
    ],
  },
  'baltic-herring-patties': {
    title: 'Strömmingsbiffar med potatismos',
    description: 'Strömmingsbiffar stekta i rågmjöl, dill och mjukt potatismos.',
    steps: [
      'Koka potatisen och mosa den med varm mjölk och hälften av smöret.',
      'Salta strömmingsfiléerna. Lägg dill mellan två filéer och tryck ihop dem parvis.',
      'Vänd biffarna i rågmjöl.',
      'Stek dem i resten av smöret gyllenbruna på båda sidor, cirka 3 minuter per sida.',
    ],
    tips: [
      'Strömming är en prisvärd och inhemsk fisk.',
      'Servera med rårörda lingon eller inlagda rödbetor.',
    ],
  },
  'fried-vendace': {
    title: 'Stekt siklöja med kokt potatis',
    description: 'Siklöja stekt krispig i rågmjöl, kokt potatis och citron.',
    steps: [
      'Koka potatisen mjuk.',
      'Blanda rågmjöl och salt och vänd siklöjorna i mjölet.',
      'Stek siklöjorna i smör i omgångar tills de är krispiga, cirka 3 minuter per sida.',
      'Servera med potatisen och citronklyftor.',
    ],
    tips: [
      'Stek siklöjorna med gott om utrymme, så blir de krispiga i stället för att ångkokas.',
    ],
    storage: 'Bäst direkt. Förvara rester i kylskåpet i 1 dag.',
    reheating: 'Värm i ugnen på 200 °C i cirka 8 minuter, så blir fiskarna krispiga igen.',
  },
  'frankfurter-sauce': {
    title: 'Korvsås med potatis',
    description: 'En tomatig och krämig korvsås med kokt potatis: en snabb familjefavorit.',
    steps: [
      'Koka potatisen mjuk.',
      'Skiva korvarna och fräs dem med löken i en panna.',
      'Strö mjölet över och tillsätt tomatpuré, 2 dl vatten och grädde.',
      'Låt puttra i 5 minuter och servera med potatisen.',
    ],
    tips: [
      'Såsen kan också göras på vegetarisk korv.',
    ],
  },
  'sauteed-reindeer': {
    title: 'Renskav med potatismos och lingon',
    description: 'En lappländsk klassiker: renskav i smör, slätt potatismos, lingon och saltgurka.',
    steps: [
      'Tina renskavet och dela isär skivorna.',
      'Fräs renköttet i smör i en stor kastrull tills vätskan har kokat bort. Tillsätt löken.',
      'Tillsätt 2 dl vatten, kryddpeppar och salt och låt puttra under lock i 30 minuter.',
      'Koka potatisen och mosa den med varm mjölk.',
      'Servera med mos, lingon och saltgurka.',
    ],
    tips: [
      'Renkött är magert och proteinrikt.',
    ],
  },
  'pork-belly-gravy': {
    title: 'Fläsksås med potatis',
    description: 'En klassiker från Savolax: krispigt stekt sidfläsk, brun sås och potatis.',
    steps: [
      'Skär sidfläsket i tärningar och stek tills fettet smält och fläsket är krispigt.',
      'Tillsätt löken och stek tills den får färg.',
      'Strö mjölet över och låt det få lite färg.',
      'Tillsätt 4 dl vatten och låt puttra under lock i 30–40 minuter. Smaka av med salt och peppar.',
      'Koka potatisen och servera med såsen.',
    ],
    tips: [
      'Häll bort en del av det smälta fettet innan du tillsätter mjölet, så blir såsen lättare.',
    ],
  },
  'ham-potato-gratin': {
    title: 'Skinkfrestelse',
    description: 'Potatis, skinka och lök gräddade gyllenbruna i krämig mjölk.',
    steps: [
      'Sätt ugnen på 200 °C.',
      'Skär potatis och lök i strimlor.',
      'Varva potatis, lök och skinka i en smord ugnsform.',
      'Blanda grädde, mjölk, salt och peppar och häll i formen. Strö riven ost över.',
      'Grädda i cirka en timme tills potatisen är mjuk.',
    ],
    tips: [
      'Färdigstrimlad potatis går snabbare.',
    ],
  },
  'salmon-potato-casserole': {
    title: 'Laxlåda',
    description: 'Potatis, lax och dill i äggstanning: en mjuk och tröstande ugnsrätt.',
    steps: [
      'Sätt ugnen på 200 °C.',
      'Skiva potatisen tunt och tärna laxen.',
      'Varva potatis, lax, lök och dill i en smord ugnsform.',
      'Vispa ägg, mjölk, salt och krossad kryddpeppar och häll i formen.',
      'Lägg smörklickar ovanpå och grädda i cirka en timme.',
    ],
    tips: [
      'Servera med smält smör och en fräsch sallad.',
    ],
  },
  'clear-fish-soup': {
    title: 'Klar fisksoppa',
    description: 'En lätt fisksoppa på sej, potatis, morot och dill, utan mjölk.',
    steps: [
      'Koka tärnad potatis, morötter och lök i 7 dl vatten med buljongtärning och kryddpeppar i 12 minuter.',
      'Tillsätt fiskbitarna och låt sjuda i 5 minuter.',
      'Tillsätt smör och dill och smaka av med salt.',
    ],
    tips: [
      'Fryst fisk kan läggas i soppan fryst: låt sjuda några minuter längre.',
    ],
    storage: 'Kyl snabbt och förvara i kylskåpet i 1–2 dagar.',
  },
  'minced-meat-soup': {
    title: 'Köttfärssoppa',
    description: 'En prisvärd och matig soppa på köttfärs, potatis och morot.',
    steps: [
      'Bryn köttfärs och lök i en kastrull.',
      'Tillsätt 7 dl vatten, fond och kryddpeppar och koka upp.',
      'Tillsätt tärnad potatis och morötter och koka i 15–20 minuter.',
      'Smaka av med salt och toppa med persilja.',
    ],
    tips: [
      'Soppan kan också göras på kycklingfärs.',
    ],
  },
  'forest-mushroom-sauce': {
    title: 'Skogssvampsås med potatis',
    description: 'En krämig skogssvampsås med kokt potatis: höstens smaker utan kött.',
    steps: [
      'Koka potatisen mjuk.',
      'Stek svampen i en het panna tills vätskan har kokat bort.',
      'Tillsätt smör och lök och fräs.',
      'Tillsätt grädden och låt puttra i 5 minuter. Smaka av med salt och peppar.',
    ],
    tips: [
      'Trattkantareller och karljohansvamp passar lika bra.',
      'Laktosfritt: laktosfri matlagningsgrädde och rapsolja.',
    ],
  },
  'chanterelle-sauce-new-potatoes': {
    title: 'Kantarellsås med färskpotatis',
    description: 'Kantareller stekta i smör, i grädde, med färskpotatis: en sommardelikatess.',
    steps: [
      'Koka färskpotatisen mjuk i saltat vatten.',
      'Stek de rensade kantarellerna i en torr panna tills vätskan kokat bort.',
      'Tillsätt smör och lök och stek en stund till.',
      'Tillsätt grädden, låt puttra i 5 minuter och smaka av med salt. Toppa med gräslök.',
    ],
    tips: [
      'Kantareller ska inte sköljas i vatten: rensa dem med en borste.',
    ],
  },
  'finnish-hash': {
    title: 'Pytt i panna med stekt ägg',
    description: 'Krispiga potatistärningar, korv och lök i panna, toppat med stekt ägg och rödbeta.',
    steps: [
      'Tärna potatisen smått och koka den i 5 minuter. Låt rinna av väl.',
      'Stek potatisen krispig i olja, cirka 10 minuter.',
      'Tillsätt tärnad korv och lök och stek ytterligare 5 minuter. Salta.',
      'Stek äggen och servera dem ovanpå pyttipannan med inlagda rödbetor.',
    ],
    tips: [
      'Pytt i panna är ett utmärkt sätt att ta vara på överbliven kokt potatis.',
    ],
  },
  'oven-sausage-mash': {
    title: 'Ugnskorv med potatismos',
    description: 'Korv gräddad i ugnen med senap och lök, och slätt potatismos.',
    steps: [
      'Sätt ugnen på 225 °C.',
      'Skär snitt i korven, pensla med senap och fyll snitten med lökstrimlor.',
      'Grädda i en form i cirka 25 minuter.',
      'Koka potatisen och mosa den med varm mjölk och smör.',
    ],
    tips: [
      'Vegetarisk korv passar med samma recept.',
    ],
  },
  'fish-sticks-mash': {
    title: 'Fiskpinnar, potatismos och riven morot',
    description: 'Krispiga ugnsbakade fiskpinnar, potatismos och fräsch riven morot: en vardagsklassiker för barnfamiljer.',
    steps: [
      'Grädda fiskpinnarna i ugnen enligt anvisningen på förpackningen.',
      'Koka potatisen och mosa den med varm mjölk och smör.',
      'Riv moroten och pressa över citronsaft.',
    ],
    tips: [
      'Ugnsbakade fiskpinnar är lättare än stekta.',
    ],
  },
  'rosolli-eggs': {
    title: 'Rödbetssallad (rosolli) med kokta ägg',
    description: 'Julbordets rödbetssallad till vardags: rödbeta, potatis, morot, äpple och gräddfilssås.',
    steps: [
      'Koka potatis, morötter och ägg och låt svalna.',
      'Tärna potatis, morötter, rödbetor, äpple, saltgurka och lök.',
      'Blanda grönsakerna försiktigt och smaka av med salt.',
      'Rör ner en skvätt rödbetsspad i gräddfilen och servera som sås.',
      'Servera med halverade ägg.',
    ],
    tips: [
      'Salladen är vackrast när ingredienserna blandas först vid serveringen.',
    ],
    storage: 'Förvara i en burk med lock i kylskåpet i 2 dagar.',
  },
  'blueberry-pie': {
    title: 'Blåbärspaj',
    description: 'En mör botten, saftig blåbärsfyllning och gräddfilstäcke: en sommar- och höstdelikatess.',
    steps: [
      'Sätt ugnen på 200 °C.',
      'Vispa det mjuka smöret med hälften av sockret. Tillsätt hälften av ägget och sedan mjöl och bakpulver.',
      'Tryck ut degen i botten och längs kanterna på en pajform.',
      'Bred ut blåbären över botten.',
      'Blanda gräddfil, resten av sockret och ägget och häll över blåbären.',
      'Grädda i cirka 30 minuter tills fyllningen har stelnat.',
    ],
    tips: [
      'Låt pajen svalna innan du skär den, så sätter sig fyllningen.',
    ],
    storage: 'Förvara i kylskåpet täckt med plastfolie i 3 dagar.',
    reheating: 'Servera rumstempererad eller värm i ugnen på 150 °C i 10 minuter.',
  },
  'spinach-soup-egg': {
    title: 'Spenatsoppa med ägg',
    description: 'En grön och len spenatsoppa med ett halverat ägg ovanpå.',
    steps: [
      'Hårdkoka äggen och koka den tärnade potatisen mjuk i lite vatten.',
      'Rör ut mjölet i den kalla mjölken och häll över potatisen under omrörning. Låt koka upp.',
      'Tillsätt hackad spenat och smör och koka i 3 minuter.',
      'Smaka av med salt och servera med halverade ägg.',
    ],
    tips: [
      'En nypa muskot är den traditionella kryddan.',
      'Fryst spenat går bra.',
    ],
  },
};
