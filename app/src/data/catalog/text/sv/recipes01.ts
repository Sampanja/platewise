import type { RecipeText } from '../types';

/** Swedish text for recipe batch 1 (structure: catalog/recipes1.ts). */
export const SV_RECIPES_01: Readonly<Record<string, RecipeText>> = {
  'chicken-tomato-pan': {
    title: 'Tomatig kycklingpanna med basilika',
    description: 'Saftig kyckling, rostade tomater och färsk basilika i en och samma panna.',
    steps: [
      'Koka riset enligt anvisningen på förpackningen.',
      'Skär kycklingen i strimlor och hacka löken. Stek kycklingen genom i olja och smaka av med salt och peppar.',
      'Tillsätt lök, vitlök och körsbärstomater. Stek tills tomaterna mjuknar.',
      'Häll i krossade tomater och grädde. Låt puttra i 5 minuter.',
      'Riv basilika över och servera med riset.',
    ],
    tips: [
      'Grädden kan bytas mot havregrädde eller utelämnas, då blir pannan lättare.',
      'Fullkornspasta passar i stället för ris.',
    ],
  },
  'minced-penne': {
    title: 'Köttfärspenne i tomatsås',
    description: 'En vardagsklassiker: köttfärs, tomat och pennepasta.',
    steps: [
      'Koka pennen i saltat vatten.',
      'Bryn köttfärsen i olja. Tillsätt lök och vitlök och fräs dem mjuka.',
      'Tillsätt krossade tomater, tomatpuré och oregano. Låt puttra i 10 minuter.',
      'Blanda pastan med såsen och strö riven ost över.',
    ],
    tips: [
      'Riv i en morot, så får såsen sötma och mer grönsaker.',
      'Gör dubbel sats: såsen går bra att frysa.',
    ],
  },
  'salmon-coconut': {
    title: 'Lax i kokossås',
    description: 'Stekt lax i en kryddig kokos- och tomatsås.',
    steps: [
      'Koka riset.',
      'Värm currypastan i olja och tillsätt kokosmjölk och krossade tomater. Låt koka upp.',
      'Skär laxen i bitar och lägg dem i såsen. Låt sjuda under lock i 8 minuter.',
      'Tillsätt spenat och limesaft precis innan servering.',
    ],
    tips: [
      'Laxen kan bytas mot regnbåge eller sej.',
      'Rör ner en näve spenat i såsen precis innan servering.',
    ],
    storage: 'Förvara i en burk med lock i kylskåpet i 1–2 dagar.',
  },
  'bulgur-bowl': {
    title: 'Vegetarisk bulgurbowl',
    description: 'Bulgur, rostade tomater och gröna bönor med en citronig dressing.',
    steps: [
      'Koka bulguren i dubbla mängden saltat vatten.',
      'Rosta körsbärstomaterna och de sköljda kikärterna i olivolja i en stekpanna.',
      'Koka de gröna bönorna i kokande vatten i 3 minuter.',
      'Lägg upp i skålar, smula fetaosten över och pressa över citron. Toppa med persilja.',
    ],
    tips: [
      'Bowlen är god kall som matlåda också.',
      'Glutenfritt: byt bulguren mot quinoa.',
    ],
  },
  'chicken-curry': {
    title: 'Kycklingcurry med jasminris',
    description: 'En mild kokoscurry på kycklinglårfilé. Smakar lika gott dagen efter.',
    steps: [
      'Koka riset.',
      'Fräs lök, vitlök och ingefära i olja. Tillsätt curryn och fräs en minut.',
      'Tillsätt kycklingbitarna och bryn dem.',
      'Häll i krossade tomater och kokosmjölk. Låt puttra i 15 minuter.',
      'Servera med riset och strö koriander över.',
    ],
    tips: [
      'Krydda curryn milt först och tillsätt chili på slutet efter smak.',
      'Kycklingen förblir saftig när den inte puttrar för länge i såsen.',
    ],
  },
  'veggie-noodles': {
    title: 'Grönsaksnudlar med sesam',
    description: 'En snabb wok: tofu, krispiga grönsaker och soja.',
    steps: [
      'Koka nudlarna och låt dem rinna av.',
      'Tärna tofun och stek den krispig i olja.',
      'Tillsätt wokgrönsaker, vitlök och ingefära. Stek på hög värme i 4 minuter.',
      'Blanda i nudlarna och sojasåsen. Toppa med sesamfrön och salladslök.',
    ],
    tips: [
      'Stek tofun ordentligt krispig innan du tillsätter såsen.',
      'Frysta wokgrönsaker kan läggas direkt i pannan utan att tinas.',
    ],
  },
  'pesto-pasta': {
    title: 'Pestopasta med körsbärstomater',
    description: 'En kvartspasta med basilikapesto och söta körsbärstomater.',
    steps: [
      'Koka pastan i saltat vatten.',
      'Halvera körsbärstomaterna.',
      'Blanda pesto, tomater och spenat med den varma pastan.',
      'Riv parmesan över.',
    ],
    tips: [
      'Tillsätt en skvätt pastavatten, så fäster peston jämnt på pastan.',
      'Strö över rostade frön för krispighet.',
    ],
  },
  'shrimp-spaghetti': {
    title: 'Spaghetti med vitlöksräkor',
    description: 'Räkor, vitlök, chili och citron.',
    steps: [
      'Tina räkorna och koka spaghettin.',
      'Värm olivolja och smör. Tillsätt vitlök och chili och fräs på låg värme.',
      'Tillsätt räkorna och värm dem i 2–3 minuter.',
      'Blanda i spaghetti, citronsaft och persilja.',
    ],
    tips: [
      'Tina räkorna i ett durkslag under kallt rinnande vatten på några minuter.',
      'Räkorna blir klara på ett ögonblick: tillsätt dem sist.',
    ],
    storage: 'Bäst direkt. Förvara rester i kylskåpet i högst 1 dag.',
  },
  'grilled-chicken': {
    title: 'Ugnskyckling med rostade grönsaker',
    description: 'Paprikakryddad kyckling, ugnspotatis och vitlöksyoghurt.',
    steps: [
      'Sätt ugnen på 225 °C.',
      'Dela potatis och grönsaker i klyftor på en plåt, ringla över olivolja och salta.',
      'Gnid in kycklingen med paprikapulver och salt. Lägg den på plåten efter 15 minuter.',
      'Stek ytterligare 20 minuter tills kycklingen är genomstekt.',
      'Rör ner pressad vitlök i yoghurten och servera som sås.',
    ],
    tips: [
      'Skär grönsakerna i lika stora bitar, så blir de klara samtidigt.',
      'Kycklingen är klar när innertemperaturen är 75 °C.',
    ],
  },
  'beef-ragu': {
    title: 'Ragù på nötkött med tagliatelle',
    description: 'En långkokt tomatig köttfärssås med bandpasta.',
    steps: [
      'Finhacka lök, morot och vitlök. Fräs dem mjuka i olja.',
      'Tillsätt köttfärsen och bryn den.',
      'Tillsätt tomatpuré och krossade tomater. Låt puttra under lock på låg värme i en timme.',
      'Koka tagliatellen och blanda med såsen. Servera med parmesan.',
    ],
    tips: [
      'Ju längre ragùn puttrar, desto mörare blir köttet.',
      'Ragù är ännu godare dagen efter.',
    ],
  },
  'chicken-fried-rice': {
    title: 'Stekt ris med kyckling och grönsaker',
    description: 'Stekt ris med kyckling, ägg och grönsaker.',
    steps: [
      'Koka riset (eller använd ris från dagen innan).',
      'Stek den tärnade kycklingen i olja och lägg den åt sidan.',
      'Stek morot och ärter. Knäck i äggen och rör om.',
      'Tillsätt ris, kyckling och sojasås. Stek på hög värme och toppa med salladslök.',
    ],
    tips: [
      'Kallt ris från dagen innan blir bäst att steka.',
      'Håll pannan het och stek i små omgångar.',
    ],
  },
  'chicken-salad-bowl': {
    title: 'Kycklingsalladsbowl',
    description: 'En fräsch bowl med kyckling, avokado och majs med yoghurtdressing.',
    steps: [
      'Stek kycklingen i olivolja och salta. Låt vila och skiva.',
      'Skär gurka, tomater och avokado.',
      'Lägg upp sallad, grönsaker, majs och kyckling i skålar.',
      'Rör ner citronsaft i yoghurten och servera som dressing.',
    ],
    tips: [
      'Stek kycklingen i förväg, så är bowlen klar på fem minuter.',
      'Dressingen kan göras på yoghurt, citron och örter.',
    ],
  },
  'oven-lasagne': {
    title: 'Ugnslasagne',
    description: 'Köttfärssås, vit sås och ost i lager.',
    steps: [
      'Bryn köttfärs och lök. Tillsätt krossade tomater och oregano och låt puttra i 10 minuter.',
      'Smält smöret, tillsätt mjölet och vispa ner mjölken. Koka till en tjock vit sås.',
      'Varva köttfärssås, plattor och vit sås i en form.',
      'Strö osten över och grädda i 200 °C i 40 minuter.',
    ],
    tips: [
      'Låt lasagnen vila i 10 minuter innan du skär den, så håller bitarna ihop.',
      'Lasagnen kan sättas ihop dagen innan och gräddas först på serveringskvällen.',
    ],
  },
  'carbonara': {
    title: 'Carbonara med bacon',
    description: 'Carbonara utan grädde: bacon, ägg, parmesan och svartpeppar.',
    steps: [
      'Koka spaghettin i saltat vatten. Spara en deciliter av kokvattnet.',
      'Stek baconet krispigt och tillsätt vitlöken på slutet.',
      'Vispa ihop äggen och den rivna parmesanen.',
      'Ta pannan från värmen och blanda i pastan och äggblandningen. Tillsätt kokvatten tills såsen är blank.',
    ],
    tips: [
      'Blanda äggblandningen med pastan utanför plattan, så stelnar inte ägget.',
      'En skvätt kokvatten gör såsen blank.',
    ],
    storage: 'Bäst direkt. Förvara rester i kylskåpet i högst 1 dag.',
    reheating: 'Värm försiktigt i en panna med en skvätt vatten under ständig omrörning.',
  },
  'meatballs-mash': {
    title: 'Köttbullar, potatismos och lingon',
    description: 'Hemlagade köttbullar i ugn, smörigt mos och rårörda lingon.',
    steps: [
      'Låt ströbrödet svälla i en skvätt mjölk. Blanda i köttfärs, ägg, finhackad lök och kryddor.',
      'Rulla bullar på en plåt och grädda i 225 °C i 15–20 minuter.',
      'Koka den skalade potatisen mjuk och mosa den med resten av mjölken och smöret.',
      'Servera med rårörda lingon.',
    ],
    tips: [
      'Fukta händerna med vatten, så är bullarna lätta att rulla.',
      'Köttbullarna går bra att frysa: gör dubbel sats på en gång.',
    ],
  },
  'beef-stroganoff': {
    title: 'Biffstroganoff med potatismos',
    description: 'Strimlat nötkött och champinjoner i en krämig senapssås.',
    steps: [
      'Koka potatisen och mosa den med mjölk och smör.',
      'Bryn köttstrimlorna i het olja i omgångar.',
      'Stek lök och svamp. Tillsätt tomatpuré, senap och grädde.',
      'Lägg tillbaka köttet i pannan och låt puttra i 10 minuter. Toppa med persilja.',
    ],
    tips: [
      'Skär köttet i tunna strimlor tvärs över fibrerna, så förblir det mört.',
      'Inlagd gurka ger stroganoffen dess klassiska syrlighet.',
    ],
  },
  'sweet-sour-chicken': {
    title: 'Sötsur kyckling',
    description: 'Krispigt stekt kyckling och paprika i sötsur sås.',
    steps: [
      'Koka riset.',
      'Vänd kycklingtärningarna i mjöl och stek dem krispiga i olja.',
      'Stek paprika och lök. Tillsätt chilisås, sojasås, tomatpuré, socker och en skvätt vatten.',
      'Blanda kycklingen med såsen och servera med riset.',
    ],
    tips: [
      'Apelsinklyftor passar i stället för ananas.',
      'Majsstärkelse redar såsen och gör den blank.',
    ],
  },
  'katsu-curry': {
    title: 'Kycklingkatsu med currysås',
    description: 'Panerad kyckling, japansk currysås och ris.',
    steps: [
      'Koka riset.',
      'Fräs lök och morot. Tillsätt curry, buljongtärning och 2 dl vatten. Låt puttra i 15 minuter och mixa slätt.',
      'Platta till kycklingfiléerna och vänd dem i mjöl, ägg och ströbröd.',
      'Stek filéerna gyllenbruna i olja. Skiva och servera med såsen och riset.',
    ],
    tips: [
      'Stek den panerade kycklingen i ordentligt het olja, så förblir ytan krispig.',
      'Currysåsen kan göras dagen innan.',
    ],
    reheating: 'Värm såsen i en kastrull och kycklingen i ugnen på 200 °C i cirka 10 minuter, så förblir panaden krispig.',
  },
  'pad-thai': {
    title: 'Pad thai med kyckling',
    description: 'Risnudlar, kyckling, ägg och jordnötter med lime.',
    steps: [
      'Blötlägg risnudlarna i varmt vatten tills de är mjuka.',
      'Stek kyckling och morotsstrimlor i olja. Skjut dem åt sidan och rör ihop äggen.',
      'Tillsätt nudlarna, sojasås, socker och limesaft. Blanda på hög värme.',
      'Servera med hackade jordnötter, salladslök och chili.',
    ],
    tips: [
      'Blötlägg nudlarna bara tills de är böjliga: de blir klara i pannan.',
      'Ha allt framme innan du börjar, eftersom woken går snabbt.',
    ],
  },
  'chicken-enchiladas': {
    title: 'Ugnsbakade enchiladas med kyckling',
    description: 'Tortillor, kyckling och svarta bönor under salsa och ost.',
    steps: [
      'Sätt ugnen på 200 °C.',
      'Stek kyckling och lök i olja. Tillsätt tacokrydda, svarta bönor och en skvätt vatten.',
      'Fyll tortillorna och rulla ihop dem i en form.',
      'Häll salsa och krossade tomater över och strö över osten. Grädda i 20 minuter och servera med gräddfil.',
    ],
    tips: [
      'Fyllningen kan göras dagen innan.',
      'Servera med en fräsch sallad och gräddfil.',
    ],
  },
  'kofta-burgers': {
    title: 'Koftabiffar i pitabröd',
    description: 'Spiskumminkryddade biffar av nötkött, yoghurt och fräscha grönsaker.',
    steps: [
      'Blanda riven lök, vitlök, persilja, spiskummin och salt med köttfärsen.',
      'Forma till platta biffar och stek dem genom i en panna.',
      'Värm pitabröden.',
      'Fyll bröden med biffar, yoghurt, tomat, gurka och rödlök.',
    ],
    tips: [
      'Fukta händerna, så är biffarna lätta att forma.',
      'Koftabiffarna passar även på grillen.',
    ],
  },
  'chicken-mushroom-stew': {
    title: 'Kyckling- och svampgryta i ugn',
    description: 'Kycklinglårfilé, svamp och rotfrukter i gräddfilssås.',
    steps: [
      'Sätt ugnen på 200 °C.',
      'Bryn kyckling och svamp i olja.',
      'Dela potatis och morötter i klyftor i en form. Tillsätt kyckling, svamp, lök och 2 dl buljong gjord på buljongtärningen.',
      'Låt bli klart under lock i 35 minuter. Rör ner gräddfil och persilja.',
    ],
    tips: [
      'Lårfilé förblir saftigare än bröstfilé vid lång tillagning.',
      'Med kantareller eller trattkantareller får grytan en smak av skog.',
    ],
  },
};
