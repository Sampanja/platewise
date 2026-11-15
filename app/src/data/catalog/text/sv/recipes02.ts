import type { RecipeText } from '../types';

/** Swedish text for recipe batch 2 (structure: catalog/recipes2.ts). */
export const SV_RECIPES_02: Readonly<Record<string, RecipeText>> = {
  'red-curry-soup': {
    title: 'Röd currysoppa',
    description: 'En fyllig soppa på sötpotatis och linser med kokos och lime.',
    steps: [
      'Fräs lök, vitlök och ingefära i olja. Tillsätt currypastan.',
      'Tillsätt tärnad sötpotatis, sköljda linser, buljongtärning och 3 dl vatten per portion.',
      'Koka i 15 minuter tills sötpotatisen är mjuk. Tillsätt kokosmjölken.',
      'Mixa om du vill. Smaka av med lime och koriander.',
    ],
    tips: [
      'Mängden currypasta styr hettan.',
      'Pressa i lite lime på slutet.',
    ],
  },
  'feta-salad': {
    title: 'Fetasallad med valnötter',
    description: 'En tiominuterssallad med fetaost, valnötter och baguette.',
    steps: [
      'Rosta valnötterna i en torr panna.',
      'Skär gurka, tomater och rödlök.',
      'Lägg upp salladen, smula över fetaost och valnötter och ringla över olivolja.',
      'Servera med baguette.',
    ],
    tips: [
      'Rosta valnötterna i en torr panna, så fördjupas smaken.',
      'Salladen är en bra matlåda när dressingen ligger i en egen burk.',
    ],
  },
  'salmon-zucchini': {
    title: 'Stekt lax med zucchinisalsa',
    description: 'Lax med krispigt skinn, zucchinisalsa med dill och kokt potatis.',
    steps: [
      'Koka potatisen.',
      'Tärna zucchini och tomater. Blanda med citronsaft, dill och olivolja.',
      'Stek laxen med skinnsidan nedåt tills skinnet är krispigt. Vänd och stek en minut.',
      'Servera laxen med salsan och potatisen.',
    ],
    tips: [
      'Stek laxen med skinnsidan nedåt och vänd den först när skinnet släpper från pannan.',
      'Salsan kan göras en timme i förväg, så hinner smakerna sätta sig.',
    ],
    storage: 'Förvara i kylskåpet i 1–2 dagar.',
  },
  'chickpea-curry': {
    title: 'Kikärtscurry',
    description: 'En vegansk kikärtscurry med spenat och kokos.',
    steps: [
      'Koka riset.',
      'Fräs lök, vitlök och ingefära. Tillsätt garam masala.',
      'Tillsätt kikärter, krossade tomater och kokosmjölk. Låt puttra i 15 minuter.',
      'Rör ner spenaten och servera med riset.',
    ],
    tips: [
      'Spadet från kikärterna kan användas för att reda såsen.',
      'Curryn går bra att frysa i portioner.',
    ],
  },
  'chicken-noodle-soup': {
    title: 'Kycklingnudelsoppa med kokos',
    description: 'En thailändskt inspirerad soppa med kyckling, risnudlar och lime.',
    steps: [
      'Koka upp 3 dl vatten per portion, buljongtärningen och currypastan.',
      'Tillsätt tunna kycklingstrimlor och paprika. Koka i 8 minuter.',
      'Tillsätt kokosmjölk och nudlar. Koka tills nudlarna är mjuka.',
      'Smaka av med lime och toppa med koriander och salladslök.',
    ],
    tips: [
      'Koka nudlarna separat om det blir soppa över, så blir de inte för mjuka.',
      'Koriander och lime fulländar soppan.',
    ],
  },
  'beef-noodle-soup': {
    title: 'Nudelsoppa med nötkött',
    description: 'En ingefärsbuljong, strimlat nötkött och äggnudlar.',
    steps: [
      'Koka buljongen: 4 dl vatten per portion, buljongtärning, soja, ingefära och vitlök. Låt sjuda i 10 minuter.',
      'Tillsätt morotsstrimlor och nudlar.',
      'Tillsätt de tunna köttstrimlorna på slutet och låt dem bli klara på 1–2 minuter.',
      'Servera med salladslök och chili.',
    ],
    tips: [
      'Skär köttet så tunt som möjligt, så blir det snabbt klart i buljongen.',
      'Tillsätt färsk chili och salladslök på slutet.',
    ],
  },
  'shrimp-paella': {
    title: 'Paella med räkor',
    description: 'En spanskinspirerad rispanna med räkor, paprika och ärter.',
    steps: [
      'Fräs lök, vitlök och paprika i olivolja i en bred panna.',
      'Tillsätt ris, paprikapulver och krossade tomater. Fräs en stund.',
      'Häll i buljongen (2,5 dl per portion) och koka utan att röra i 18 minuter.',
      'Lägg räkor och ärter ovanpå, täck och låt dra i 5 minuter. Servera med citronklyftor.',
    ],
    tips: [
      'Rör inte i riset när det kokar: i botten bildas ett gott krispigt lager.',
      'Paellan kan också göras med kyckling.',
    ],
    storage: 'Förvara i kylskåpet i högst 1 dag.',
  },
  'steak-potatoes': {
    title: 'Biff och rostad potatis',
    description: 'Biff av ytterfilé, vitlökspotatis och grön sallad.',
    steps: [
      'Dela potatisen i klyftor och blanda med olivolja och salt. Rosta i 225 grader i 30 minuter.',
      'Låt biffarna bli rumstempererade och krydda med salt och peppar.',
      'Stek biffarna i en het panna i 3 minuter per sida. Tillsätt smör och vitlök på slutet.',
      'Låt vila i 5 minuter och servera med potatisen och salladen.',
    ],
    tips: [
      'Ta fram biffarna en halvtimme innan stekning.',
      'Låt biffen vila i 5 minuter innan du skär den.',
    ],
  },
  'pea-soup': {
    title: 'Ärtsoppa med senap',
    description: 'Torsdagsklassikern med skinka. De torkade ärterna blötläggs kvällen innan.',
    steps: [
      'Blötlägg ärterna i kallt vatten över natten.',
      'Häll av och koka ärterna i nytt vatten (4 dl per portion) med buljongtärningen. Skumma av.',
      'Tillsätt lök, morot och tärnad skinka. Låt sjuda på låg värme i cirka 1,5 timmar.',
      'Servera med senap och rågbröd.',
    ],
    tips: [
      'Blötlägg de torkade ärterna över natten, så kokar de snabbare.',
      'Ärtsoppa går utmärkt att frysa.',
    ],
  },
  'teriyaki-salmon': {
    title: 'Teriyakilax med ris',
    description: 'Blank lax, broccoli och sesamfrön.',
    steps: [
      'Koka riset.',
      'Stek laxbitarna i olja på båda sidor.',
      'Häll teriyakisåsen i pannan och låt bubbla tills laxen är blank.',
      'Ånga broccolin. Servera med sesamfrön och salladslök.',
    ],
    tips: [
      'Såsen karamelliseras snabbt: håll medelvärme.',
      'Strö över sesamfrön och salladslök på slutet.',
    ],
    storage: 'Förvara i kylskåpet i 1–2 dagar.',
  },
  'fish-tacos': {
    title: 'Fisktacos med kålsallad',
    description: 'Paprikakryddad sej, krispig kål och limeyoghurt i tortilla.',
    steps: [
      'Tina fisken. Vänd bitarna i mjöl, paprikapulver och salt.',
      'Stek fisken krispig i olja.',
      'Strimla kålen och blanda med limesaft. Rör ner rivet limeskal i yoghurten.',
      'Värm tortillorna och fyll dem med fisk, kål, yoghurt och koriander.',
    ],
    tips: [
      'Kålsalladen är godast blandad strax före servering.',
      'Fisken kan också tillagas i ugnen på 200 grader i 12 minuter.',
    ],
    storage: 'Förvara fisken och kålsalladen separat i kylskåpet i 1 dag.',
  },
  'lentil-chili': {
    title: 'Rökig linschili',
    description: 'En vegansk chili med pumpa, linser och kidneybönor.',
    steps: [
      'Fräs lök och vitlök i olja. Tillsätt kryddorna.',
      'Tillsätt tärnad pumpa, linser, krossade tomater och 1 dl vatten per portion.',
      'Låt puttra i 25 minuter. Tillsätt de sköljda kidneybönorna de sista fem minuterna.',
      'Servera med ris och koriander.',
    ],
    tips: [
      'Chilin smakar ännu bättre dagen efter.',
      'Servera med ris, tortilla eller bakad potatis.',
    ],
  },
  'shakshuka': {
    title: 'Shakshuka med baguette',
    description: 'Ägg som får sjuda i en kryddig tomat- och paprikasås.',
    steps: [
      'Fräs lök, paprika och vitlök i olivolja.',
      'Tillsätt kryddorna och krossade tomater. Låt puttra i 10 minuter.',
      'Gör gropar i såsen och knäck i äggen. Täck och låt bli klart i 6–8 minuter.',
      'Smula fetaost och persilja över. Servera med baguette.',
    ],
    tips: [
      'Lägg lock på pannan, så blir äggen klara jämnt.',
      'Låt gulorna vara krämiga och doppa med bröd.',
    ],
    storage: 'Bäst direkt. Tomatsåsen kan göras i förväg och förvaras i 3 dagar.',
  },
  'falafel': {
    title: 'Falafel med yoghurtsås',
    description: 'Hemgjorda kikärtsbullar i pitabröd med fräscha grönsaker.',
    steps: [
      'Låt kikärterna rinna av väl. Mixa dem med lök, vitlök, persilja, spiskummin och mjöl till en grov smet.',
      'Forma små bollar och stek dem krispiga i olja.',
      'Rör ner citronsaft och salt i yoghurten.',
      'Fyll pitabröden med falafel, grönsaker och sås.',
    ],
    tips: [
      'Torka kikärterna väl, så håller bollarna ihop.',
      'Falafeln kan också bakas i ugnen penslad med olja.',
    ],
  },
  'fish-pie': {
    title: 'Fiskgratäng med potatismos',
    description: 'Sej med dill och ärter under ett täcke av mos.',
    steps: [
      'Koka potatisen och mosa den med mjölk och smör.',
      'Dela fisken i bitar i en form och krydda med salt, citron och dill. Tillsätt ärterna.',
      'Bred moset över och strö över osten.',
      'Gratinera i 200 grader i 25 minuter.',
    ],
    tips: [
      'Fryst fisk kan läggas direkt i formen: öka tiden med 10 minuter.',
      'Strö riven ost över för en krispig yta.',
    ],
  },
  'pumpkin-soup': {
    title: 'Thailändsk pumpasoppa',
    description: 'En sammetslen soppa på butternutpumpa med curry och kokos.',
    steps: [
      'Fräs lök, vitlök och ingefära i olja. Tillsätt currypastan.',
      'Tillsätt tärnad pumpa, buljongtärning och 2,5 dl vatten per portion. Koka i 20 minuter.',
      'Tillsätt kokosmjölken och mixa slätt.',
      'Smaka av med lime, toppa med koriander och servera med baguette.',
    ],
    tips: [
      'Rosta pumpan i ugnen innan den kokas, så fördjupas smaken.',
      'Garnera med rostade pumpafrön.',
    ],
  },
  'cabbage-soup': {
    title: 'Kålsoppa',
    description: 'En hemtrevlig soppa på köttfärs och kål som blir godare till nästa dag.',
    steps: [
      'Bryn köttfärs och lök i en gryta.',
      'Tillsätt tärnad kål, morot och potatis samt 4 dl vatten per portion och buljongtärningen.',
      'Låt sjuda på låg värme i 35 minuter.',
      'Smaka av med peppar och salt. Servera med rågbröd.',
    ],
    tips: [
      'Bryn kålen lätt innan den kokas, så blir smaken sötare.',
      'Kålsoppan blir godare när den får stå.',
    ],
  },
  'tomato-soup': {
    title: 'Krämig tomatsoppa med ostsmörgås',
    description: 'Tomatsoppa med basilika och en baguette med smält ost från ugnen.',
    steps: [
      'Fräs lök och vitlök i olja.',
      'Tillsätt krossade tomater, buljongtärning, socker och 1 dl vatten per portion. Koka i 10 minuter.',
      'Tillsätt grädden och mixa. Smaka av med basilika.',
      'Strö osten över baguetteskivorna och grädda i ugnen på 225 grader i 5 minuter.',
    ],
    tips: [
      'Mixa soppan slät med en stavmixer.',
      'Ostsmörgåsen kan göras i ugnen eller i en panna.',
    ],
  },
  'dal': {
    title: 'Linsdal med ris',
    description: 'En värmande och prisvärd dal på röda linser med spenat.',
    steps: [
      'Koka riset.',
      'Fräs lök, vitlök och ingefära. Tillsätt kryddorna.',
      'Tillsätt linser, krossade tomater och 3 dl vatten per portion. Koka i 15 minuter.',
      'Rör ner kokosmjölk, spenat och citronsaft.',
    ],
    tips: [
      'Röda linser behöver inte blötläggas.',
      'En kryddolja (tadka) ovanpå på slutet ger dalen djup.',
    ],
  },
  'tomato-egg-rice': {
    title: 'Tomat- och äggröra med ris',
    description: 'Kinesisk husmanskost: mjukt ägg och söt tomat.',
    steps: [
      'Koka riset.',
      'Vispa äggen och stek dem i olja till mjuka klumpar. Lägg åt sidan.',
      'Stek tomatklyftorna tills de mjuknar. Tillsätt socker och soja.',
      'Lägg tillbaka äggen i pannan och toppa med salladslök.',
    ],
    tips: [
      'Låt äggen förbli mjuka och blanda dem med tomaten först på slutet.',
      'En enkel vardagsrätt som är klar på 15 minuter.',
    ],
    storage: 'Bäst direkt. Förvara rester i kylskåpet i högst 1 dag.',
  },
  'shrimp-stir-fry': {
    title: 'Räkwok med krispiga grönsaker',
    description: 'En kvartswok med räkor, grönsaker och söt chili.',
    steps: [
      'Koka riset.',
      'Fräs vitlök och ingefära i olja. Tillsätt wokgrönsakerna.',
      'Tillsätt räkorna och såserna. Värm i 3 minuter.',
      'Servera med riset.',
    ],
    tips: [
      'Torka räkorna med hushållspapper, så steks de i stället för att koka.',
      'Woken kan serveras med ris eller nudlar.',
    ],
    storage: 'Bäst direkt. Förvara rester i kylskåpet i högst 1 dag.',
  },
  'mushroom-soup': {
    title: 'Krämig svampsoppa',
    description: 'Champinjon- och potatissoppa med persilja och rågbröd.',
    steps: [
      'Stek den skivade svampen och löken i smör.',
      'Tillsätt tärnad potatis, buljongtärning och 3 dl vatten per portion. Koka i 15 minuter.',
      'Tillsätt grädden och värm. Mixa delvis.',
      'Toppa med persilja och servera med rågbröd.',
    ],
    tips: [
      'Stek svampen brun i en het panna innan du tillsätter vätska.',
      'En skvätt citronsaft på slutet friskar upp soppan.',
    ],
  },
  'ramen': {
    title: 'Ramen med ägg',
    description: 'Sojabuljong, nudlar, svamp och ett löskokt ägg.',
    steps: [
      'Koka äggen i 6,5 minuter och kyl dem i kallt vatten.',
      'Koka upp 4 dl vatten per portion, buljongtärning, soja, vitlök och ingefära.',
      'Tillsätt svamp och nudlar och koka enligt anvisningen på förpackningen. Tillsätt spenaten på slutet.',
      'Fördela i skålar och toppa med halverade ägg, salladslök och sesam.',
    ],
    tips: [
      'Koka äggen i 6,5 minuter och kyl dem i kallt vatten, så förblir gulan krämig.',
      'Buljongen kan göras i förväg och skålarna sättas ihop när ni äter.',
    ],
    storage: 'Förvara buljongen och nudlarna separat i kylskåpet i 2 dagar.',
  },
  'pork-goulash': {
    title: 'Fläskgulasch med surkål',
    description: 'En paprikagryta på fläsk med surkål och kokt potatis.',
    steps: [
      'Bryn köttbitarna i olja i omgångar.',
      'Tillsätt lök, paprikapulver och tomatpuré. Fräs en stund.',
      'Tillsätt surkål, buljongtärning och 2 dl vatten per portion. Låt puttra under lock i 1 timme.',
      'Koka potatisen. Servera gulaschen med gräddfil.',
    ],
    tips: [
      'Bryn köttet i små omgångar, så får det en rostad yta.',
      'Gulaschen blir godare när den får stå och går bra att frysa.',
    ],
  },
  'tonkatsu': {
    title: 'Tonkatsu på fläskfilé med kålsallad',
    description: 'Krispigt panerad fläskfilé, fräsch kål och ris.',
    steps: [
      'Koka riset.',
      'Skär filén i 1,5 cm tjocka skivor och bulta dem tunnare. Salta.',
      'Vänd dem i mjöl, ägg och ströbröd. Stek gyllenbruna i olja.',
      'Strimla kålen tunt och smaka av med soja och sesam. Servera med riset.',
    ],
    tips: [
      'Bulta köttet jämntjockt, så blir det jämnt tillagat.',
      'Låt de stekta bitarna rinna av på ett galler, så förblir undersidan krispig.',
    ],
    reheating: 'Värm i ugnen på 200 grader i cirka 10 minuter, så förblir panaden krispig.',
  },
  'spinach-cannelloni': {
    title: 'Cannelloni med spenat och keso',
    description: 'Spenat och keso rullat i lasagneplattor i tomatsås.',
    steps: [
      'Fräs lök och vitlök. Tillsätt spenaten och låt den sjunka ihop. Rör ner keson.',
      'Mjuka upp lasagneplattorna i varmt vatten, bred ut fyllningen och rulla ihop.',
      'Häll de krossade tomaterna i en form, lägg rullarna ovanpå och strö över osten.',
      'Gratinera i 200 grader i 30 minuter.',
    ],
    tips: [
      'Fyll cannellonin med en spritspåse eller en fryspåse med ett avklippt hörn.',
      'Den färdiga formen håller sig ogräddad i kylskåpet över natten.',
    ],
  },
  'tuna-salad': {
    title: 'Tonfisk- och potatissallad',
    description: 'En sallad i niçoise-stil: tonfisk, potatis, bönor och ägg.',
    steps: [
      'Koka potatis och ägg. Koka bönorna med potatisen de sista 3 minuterna.',
      'Blanda dressingen: olivolja, citronsaft, senap och salt.',
      'Lägg upp sallad, tonfisk, potatis, bönor, tomater och rödlök på tallrikar.',
      'Lägg på äggklyftorna och dressingen.',
    ],
    tips: [
      'Koka potatisen dagen innan, så är salladen klar på ett ögonblick.',
      'Salladen passar bra som matlåda.',
    ],
    storage: 'Förvara i en burk med lock i kylskåpet i 1–2 dagar.',
  },
  'cabbage-rolls': {
    title: 'Kåldolmar',
    description: 'Mormors kåldolmar i ugn med lingon och potatis.',
    steps: [
      'Förkoka riset. Lossa kålbladen och förväll dem mjuka i saltat vatten.',
      'Blanda köttfärs, ris, lök, mjölk och salt.',
      'Rulla in fyllningen i bladen, lägg dem i en form och lägg smörklickar ovanpå.',
      'Grädda i 200 grader i cirka en timme och ös dem då och då. Servera med kokt potatis och lingon.',
    ],
    tips: [
      'Förväll kålhuvudet helt, så lossnar bladen hela.',
      'Ös kåldolmarna med sirapsspad medan de gräddas.',
    ],
  },
  'borscht': {
    title: 'Rödbetssoppa (borsjtj)',
    description: 'En vegetarisk borsjtj på rödbetor, kål och potatis med gräddfil.',
    steps: [
      'Skala och riv rödbetor och morötter. Tärna potatisen och strimla kålen.',
      'Koka grönsakerna i 4 dl vatten per portion med buljongtärningen i cirka 40 minuter.',
      'Smaka av med salt.',
      'Servera med gräddfil, dill och rågbröd.',
    ],
    tips: [
      'Rödbetor färgar: använd engångshandskar när du skalar.',
      'Servera med smetana eller gräddfil och dill.',
    ],
  },
};
