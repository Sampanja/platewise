import type { RecipeText } from '../types';

/** Swedish text for recipe batch 4 (structure: catalog/recipes4.ts). */
export const SV_RECIPES_04: Readonly<Record<string, RecipeText>> = {
  'blueberry-smoothie': {
    title: 'Blåbärssmoothie',
    description: 'En tjock och kall smoothie på blåbär, banan, yoghurt och havre.',
    steps: [
      'Lägg alla ingredienser i en mixer.',
      'Mixa slätt och tillsätt en skvätt vatten vid behov.',
    ],
    tips: [
      'Frysta blåbär gör smoothien kall direkt.',
      'Havregrynen gör den mer mättande.',
    ],
  },
  'vegan-mango-banana-smoothie': {
    title: 'Vegansk mango- och banansmoothie',
    description: 'En solig smoothie på mango, banan, havredryck och linfrö.',
    steps: [
      'Lägg mango, banan, linfrö och havredryck i en mixer.',
      'Mixa slätt och servera direkt.',
    ],
    tips: [
      'En mogen, prickig banan sötar smoothien naturligt.',
    ],
  },
  'green-pear-smoothie': {
    title: 'Grön smoothie med päron',
    description: 'En fräsch grön dryck på spenat, banan, päron och lime.',
    steps: [
      'Lägg spenat, banan, päronbitar, limesaft och linfrö i en mixer.',
      'Tillsätt 1,5 dl kallt vatten och mixa slätt.',
    ],
    tips: [
      'Spenaten känns knappt i smaken, men färgen blir klargrön.',
    ],
  },
  'strawberry-quark-smoothie': {
    title: 'Jordgubbs- och kvargsmoothie',
    description: 'En proteinrik smoothie på jordgubbar, kvarg och banan: bra efter träningen.',
    steps: [
      'Lägg jordgubbar, kvarg, mjölk och banan i en mixer.',
      'Mixa slätt och häll upp i ett glas.',
    ],
    tips: [
      'Laktosfritt: använd laktosfri kvarg och mjölk.',
    ],
  },
  'cocoa-banana-peanut-smoothie': {
    title: 'Kakao- och banansmoothie med jordnötssmör',
    description: 'En fyllig smoothie på banan, kakao och jordnötssmör.',
    steps: [
      'Lägg banan, kakao, jordnötssmör och mjölk i en mixer.',
      'Mixa slätt. Tillsätt isbitar om du vill ha smoothien kallare.',
    ],
    tips: [
      'Frys bananen i bitar, så blir smoothien som en milkshake.',
    ],
  },
  'lactose-free-raspberry-smoothie': {
    title: 'Laktosfri hallonsmoothie',
    description: 'En syrligt söt smoothie på hallon och laktosfri yoghurt.',
    steps: [
      'Lägg alla ingredienser i en mixer.',
      'Mixa slätt och sila bort kärnorna om du vill.',
    ],
    tips: [
      'En silad smoothie blir sammetslen.',
    ],
  },
  'coconut-mango-smoothie': {
    title: 'Kokos- och mangosmoothie',
    description: 'En tropisk smoothie på mango, kokosmjölk och banan med fräsch lime.',
    steps: [
      'Lägg mango, kokosmjölk, banan och limesaft i en mixer.',
      'Tillsätt 1 dl kallt vatten och mixa slätt.',
    ],
    tips: [
      'Lättare kokosmjölk minskar energin tydligt.',
    ],
  },
  'finnish-crepes': {
    title: 'Tunna pannkakor med sylt',
    description: 'Tunna pannkakor med spetskanter som serveras med bärsylt.',
    steps: [
      'Vispa mjölet och hälften av mjölken slätt. Tillsätt resten av mjölken, äggen, sockret och saltet.',
      'Låt smeten svälla i 15 minuter.',
      'Smält smöret och rör ner det i smeten.',
      'Stek tunna pannkakor i en het panna i cirka en minut per sida.',
      'Servera med sylten.',
    ],
    tips: [
      'Den första pannkakan blir ofta en provbit: justera värmen efter den.',
    ],
  },
  'oven-pancake': {
    title: 'Ugnspannkaka med jordgubbar',
    description: 'En ugnspannkaka som jäser upp och serveras med jordgubbar. En finsk helgfavorit.',
    steps: [
      'Sätt ugnen på 225 °C. Smält smöret på en plåt med bakplåtspapper.',
      'Vispa mjöl, socker, salt och hälften av mjölken slätt.',
      'Tillsätt resten av mjölken och äggen och häll smöret i smeten.',
      'Häll smeten på plåten och grädda i 25–30 minuter tills ytan är gyllenbrun.',
      'Skär i bitar och servera med jordgubbarna.',
    ],
    tips: [
      'Öppna inte ugnsluckan under de första 20 minuterna, så reser sig pannkakan.',
    ],
  },
  'gf-oat-pancakes': {
    title: 'Glutenfria havreplättar med blåbär',
    description: 'Luftiga plättar på glutenfri havre och laktosfri mjölk.',
    steps: [
      'Mixa de glutenfria havregrynen till mjöl i en mixer.',
      'Blanda i bakpulver, salt, mjölk och ägg. Låt stå i 5 minuter.',
      'Stek små plättar i en oljad panna på medelvärme tills de är gyllene.',
      'Servera med blåbären.',
    ],
    tips: [
      'Smeten tjocknar när den står: tillsätt en skvätt mjölk vid behov.',
    ],
  },
  'vegan-oat-pancakes': {
    title: 'Veganska havreplättar med hallon',
    description: 'Havreplättar sötade med banan, helt på växtbaserade ingredienser.',
    steps: [
      'Mixa havregrynen i en mixer.',
      'Tillsätt banan, havredryck, bakpulver och salt och mixa till en slät smet.',
      'Stek små plättar i en oljad panna på medelvärme i cirka 2 minuter per sida.',
      'Servera med hallonen.',
    ],
    tips: [
      'Vänd plättarna först när det bildas bubblor på ytan och kanterna stelnar.',
    ],
  },
  'american-pancakes': {
    title: 'Amerikanska pannkakor med sirap',
    description: 'Tjocka och mjuka pannkakor med blåbär och sirap.',
    steps: [
      'Blanda mjöl, bakpulver och socker i en skål.',
      'Vispa mjölk, ägg och smält smör i en annan skål.',
      'Blanda ihop lätt: några klumpar får finnas kvar.',
      'Stek tjocka pannkakor på medelvärme tills bubblor stiger till ytan och vänd.',
      'Servera med blåbär och sirap.',
    ],
    tips: [
      'För mycket omrörning gör pannkakorna sega.',
    ],
  },
  'spinach-pancakes': {
    title: 'Spenatplättar med lingon',
    description: 'En finsk klassiker: gröna spenatplättar, rårörda lingon och smak av smält smör.',
    steps: [
      'Vispa mjölet och hälften av mjölken slätt. Tillsätt resten av mjölken, äggen och saltet.',
      'Finhacka spenaten och rör ner den i smeten. Låt svälla i 15 minuter.',
      'Smält smöret och rör ner hälften i smeten.',
      'Stek plättarna i en smord panna på medelvärme i cirka 2 minuter per sida.',
      'Servera med rårörda lingon.',
    ],
    tips: [
      'Fryst spenat går bra: tina den och krama ur överflödig vätska.',
      'Plättarna går bra att frysa.',
    ],
  },
  'karelian-pies': {
    title: 'Karelska piroger med äggsmör',
    description: 'Tunna rågskal, en krämig risgrynsgrötfyllning och klassiskt äggsmör.',
    steps: [
      'Koka grötriset i 1 dl vatten, tillsätt mjölken och koka på låg värme till en tjock gröt i cirka 40 minuter. Salta och låt svalna.',
      'Blanda råg- och vetemjöl, 0,5 dl vatten och en nypa salt till en fast deg.',
      'Kavla ut degen till tunna runda skal, cirka 12 cm i diameter.',
      'Bred gröten på skalen och nyp ihop kanterna med fingrarna.',
      'Grädda i 275 °C i 12–15 minuter och pensla de varma pirogerna med smält smör.',
      'Hårdkoka äggen, hacka dem och blanda med smöret till äggsmör.',
    ],
    tips: [
      'Linda in de färdiga pirogerna i bakplåtspapper och en handduk, så mjuknar skalen.',
      'Pirogerna går utmärkt att frysa.',
    ],
    storage: 'Förvara pirogerna i kylskåpet i 3 dagar eller frys dem. Äggsmöret håller sig i kylskåpet i 2 dagar.',
    reheating: 'Värm pirogerna i ugnen på 200 °C i cirka 8 minuter.',
  },
  'oat-rolls': {
    title: 'Havrefrallor',
    description: 'Mjuka hembakade havrefrallor till frukost och matsäck.',
    steps: [
      'Värm mjölken till fingervarm och lös upp jästen i den.',
      'Tillsätt havregryn, salt och mjöl lite i taget och knåda till en slät deg. Tillsätt oljan sist.',
      'Låt jäsa under bakduk i cirka 40 minuter.',
      'Forma 12 frallor av degen på en plåt och låt dem jäsa ytterligare 20 minuter.',
      'Grädda i 225 °C i cirka 12 minuter.',
    ],
    tips: [
      'Frys de avsvalnade frallorna i en påse och ta fram så många du behöver på morgonen.',
    ],
    storage: 'Förvara i en påse i rumstemperatur i 2 dagar eller frys i 3 månader.',
    reheating: 'Värm en fryst fralla i ugnen på 200 °C i 5–8 minuter.',
  },
  'turkey-avocado-wrap': {
    title: 'Wrap med kalkon och avokado',
    description: 'Tortilla, färskost, kalkonpålägg, avokado och sallad. En matsäck på fem minuter.',
    steps: [
      'Bred färskosten på tortillan.',
      'Lägg på sallad, kalkon och avokadoskivor och rulla ihop hårt.',
    ],
    tips: [
      'Slå in rullen i bakplåtspapper, så håller den ihop som matsäck.',
    ],
  },
  'breakfast-burrito': {
    title: 'Frukostburrito med äggröra',
    description: 'En varm tortilla med äggröra, paprika, ost och salsa.',
    steps: [
      'Stek paprikastrimlorna mjuka i olja.',
      'Tillsätt de vispade äggen och saltet och rör till äggröra.',
      'Värm tortillan i en torr panna, fyll den med äggröra, ost och salsa och rulla ihop.',
    ],
    tips: [
      'Burritorna kan frysas styckvis inslagna i plastfolie.',
    ],
  },
  'egg-butter-rye': {
    title: 'Äggsmör på rågbröd',
    description: 'Karelskt äggsmör på varmt rågbröd: enkelt och ljuvligt.',
    steps: [
      'Hårdkoka ägget på 9 minuter och kyl det i kallt vatten.',
      'Hacka det skalade ägget och blanda med mjukt smör och salt.',
      'Bred äggsmöret på rågbrödet.',
    ],
    tips: [
      'Gräslök ger äggsmöret fräschör.',
    ],
  },
  'egg-ham-lettuce-rolls': {
    title: 'Salladsrullar med ägg och skinka',
    description: 'Ägg och skinka inrullade i isbergssalladsblad. Glutenfritt och mjölkfritt.',
    steps: [
      'Hårdkoka äggen, kyl och skiva dem.',
      'Bred ett tunt lager majonnäs på salladsbladen.',
      'Lägg på skinka, äggskivor och gräslök och rulla ihop.',
    ],
    tips: [
      'Majonnäsen kan uteslutas eller bytas mot senap.',
    ],
  },
  'apple-walnut-porridge': {
    title: 'Havregrynsgröt med äpple och valnötter',
    description: 'Kanelkryddad havregrynsgröt med mjukt äpple och krispiga valnötter.',
    steps: [
      'Koka havregrynen i mjölken och 1 dl vatten med salt i 3–5 minuter.',
      'Tillsätt tärnat äpple och kanel och koka ytterligare en minut.',
      'Hacka valnötterna och strö dem över gröten.',
    ],
    tips: [
      'Rosta nötterna i en torr panna, så blir de krispigare.',
    ],
  },
  'granola-yogurt': {
    title: 'Hemgjord granola med yoghurt',
    description: 'Ugnsrostad granola på mandel, frön och kokos, med yoghurt.',
    steps: [
      'Sätt ugnen på 175 °C.',
      'Blanda havregryn, hackad mandel, frön, kokosflingor och kanel.',
      'Tillsätt sirap och olja och blanda tills allt är fuktat.',
      'Bred ut på en plåt och rosta i 20–25 minuter under omrörning då och då. Låt svalna.',
      'Servera ovanpå yoghurten.',
    ],
    tips: [
      'Granolan blir krispig först när den svalnar.',
      'Förvara den i en tät burk i två veckor.',
    ],
    storage: 'Förvara den avsvalnade granolan i en tät burk i 2 veckor.',
    reheating: 'Äts kall.',
  },
  'warm-bread-cheese-jam': {
    title: 'Varm kaffeost med sylt',
    description: 'Kaffeost (leipäjuusto) värmd i panna med bärsylt: en traditionell österbottnisk delikatess.',
    steps: [
      'Värm ostbitarna i en torr panna eller i mikron tills de mjuknar.',
      'Servera varm med sylten.',
    ],
    tips: [
      'Traditionellt serveras kaffeosten med hjortronsylt.',
    ],
  },
  'peanut-butter-banana-toast': {
    title: 'Rostbröd med jordnötssmör och banan',
    description: 'Rostbröd, jordnötssmör och bananskivor: snabb energi till morgonen.',
    steps: [
      'Rosta brödskivorna.',
      'Bred på jordnötssmöret och lägg på bananskivor och en nypa kanel.',
    ],
    tips: [
      'Strö över chiafrön för extra fiber.',
    ],
  },
  'rice-cakes-hummus': {
    title: 'Riskakor med hummus och gurka',
    description: 'Krispiga riskakor, hummus och gurka: ett glutenfritt och mjölkfritt mellanmål eller frukost.',
    steps: [
      'Bred hummusen på riskakorna.',
      'Lägg på gurkskivor och mal över peppar.',
    ],
    tips: [
      'Sätt ihop precis innan du äter, så förblir riskakorna krispiga.',
    ],
  },
  'quinoa-porridge-coconut': {
    title: 'Quinoagröt med kokosmjölk och jordgubbar',
    description: 'Quinoagröt kokt i kokosmjölk med jordgubbar: glutenfri och vegansk.',
    steps: [
      'Skölj quinoan i en sil.',
      'Koka quinoan i 2 dl vatten i cirka 12 minuter.',
      'Tillsätt kokosmjölk och kanel och koka ytterligare 3 minuter.',
      'Servera med jordgubbar och sirap.',
    ],
    tips: [
      'Quinoan kan kokas på kvällen och värmas på morgonen.',
    ],
  },
};
