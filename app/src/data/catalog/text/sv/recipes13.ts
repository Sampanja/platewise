import type { RecipeText } from '../types';

/** Swedish text for recipe batch 13 (structure: catalog/recipes13.ts). */
export const SV_RECIPES_13: Readonly<Record<string, RecipeText>> = {
  'bibimbap': {
    title: 'Bibimbap',
    description: 'En koreansk risskål: köttfärs, spenat, morot, gurka och ett stekt ägg.',
    steps: [
      'Koka riset.',
      'Bryn köttfärsen i hälften av oljan och smaka av med hälften av sojasåsen.',
      'Fräs spenat och morotsstrimlor var för sig och smaka av med resten av sojan.',
      'Stek ägget.',
      'Lägg upp ris, kött, grönsaker och ägg i en skål och strö över sesamfrön och chili.',
    ],
    tips: [
      'Blanda skålen ordentligt innan du äter, så blir gulan en sås.',
    ],
  },
  'beef-bulgogi': {
    title: 'Bulgogi på nötkött med ris',
    description: 'Nötköttsstrimlor stekta i en söt marinad på soja och vitlök, ris och salladslök.',
    steps: [
      'Blanda sojasås, socker, pressad vitlök och riven ingefära. Marinera köttet i 30 minuter.',
      'Koka riset.',
      'Stek köttet i olja i en mycket het panna i små omgångar.',
      'Servera med riset och strö över sesamfrön och salladslök.',
    ],
    tips: [
      'Rivet päron i marinaden gör köttet mört på traditionellt vis.',
    ],
  },
  'oyakodon': {
    title: 'Oyakodon – risskål med kyckling och ägg',
    description: 'Japansk husmanskost: kyckling och lök som puttrat i sojabuljong, ägg och ris.',
    steps: [
      'Koka riset.',
      'Koka upp 1 dl vatten, sojasås och socker i en liten panna.',
      'Tillsätt tunna lökstrimlor och kycklingbitar och låt puttra i 6 minuter.',
      'Häll de lätt uppvispade äggen över och låt stelna under lock en minut.',
      'Låt glida ner på riset och strö över salladslök.',
    ],
    tips: [
      'Ägget ska vara mjukt.',
    ],
    storage: 'Bäst direkt. Förvara rester i kylskåpet i högst 1 dag.',
  },
  'yakisoba': {
    title: 'Yakisobanudlar med fläsk',
    description: 'Japanska stekta nudlar med fläsk, kål och morot.',
    steps: [
      'Koka nudlarna och låt rinna av.',
      'Stek de tunna fläskstrimlorna i olja.',
      'Tillsätt strimlad kål och morot och stek i 3 minuter.',
      'Tillsätt nudlar, sojasås och ketchup och stek under omrörning.',
    ],
    tips: [
      'Ketchup är en smidig ersättning för japansk yakisobasås.',
    ],
  },
  'kung-pao-chicken': {
    title: 'Kung pao-kyckling',
    description: 'Kyckling från Sichuan, paprika, jordnötter och en het sötsur sås.',
    steps: [
      'Koka riset.',
      'Stek den tärnade kycklingen i olja och lägg den åt sidan.',
      'Fräs paprika, vitlök och chili en minut.',
      'Tillsätt kyckling, sojasås, socker, vinäger och jordnötter och vänd runt tills såsen är blank.',
    ],
    tips: [
      'Justera hettan med mängden chili.',
    ],
  },
  'mapo-tofu': {
    title: 'Mapo tofu',
    description: 'Mjuk tofu i en het köttfärssås med ris.',
    steps: [
      'Koka riset.',
      'Bryn köttfärsen i olja och tillsätt vitlök, ingefära och chili.',
      'Tillsätt 2 dl vatten, sojasås och tärnad tofu och låt puttra i 5 minuter.',
      'Red med majsstärkelse och strö salladslök över.',
    ],
    tips: [
      'Vänd tofun försiktigt så att den inte går sönder.',
    ],
  },
  'french-onion-soup': {
    title: 'Fransk löksoppa',
    description: 'Lök som långsamt fått bli gyllenbrun, en fyllig buljong och bröd gratinerat med ost.',
    steps: [
      'Skiva löken och fräs den i smör på låg värme i cirka 35 minuter tills den karamelliseras.',
      'Tillsätt 7 dl vatten och fond och koka i 10 minuter.',
      'Häll soppan i ugnssäkra skålar och lägg på en baguetteskiva och osten.',
      'Gratinera högt upp i ugnen på 250 grader tills osten får färg.',
    ],
    tips: [
      'Att låta löken fräsa med tålamod är soppans hemlighet.',
    ],
  },
  'quiche-lorraine': {
    title: 'Quiche Lorraine',
    description: 'En fransk paj med mör botten, bacon och en krämig ostfyllning.',
    steps: [
      'Nyp ihop mjöl och kallt smör till smulor, tillsätt en matsked kallt vatten och tryck ut i en pajform. Ställ kallt i 15 minuter.',
      'Sätt ugnen på 200 grader och förgrädda bottnen i 10 minuter.',
      'Stek bacon och lök och fördela över bottnen.',
      'Vispa ägg, grädde, ost och salt och häll i formen.',
      'Grädda i cirka 30 minuter tills fyllningen har stelnat.',
    ],
    tips: [
      'Servera med en grön sallad.',
    ],
  },
  'spinach-chickpea-stew': {
    title: 'Spansk kikärts- och spenatgryta',
    description: 'En andalusisk gryta på kikärter och spenat med rökt paprika och spiskummin.',
    steps: [
      'Koka riset.',
      'Fräs vitlöken i olja och tillsätt kryddorna.',
      'Tillsätt krossade tomater och kikärter och låt puttra i 10 minuter.',
      'Tillsätt spenaten och låt den sjunka ihop. Smaka av med salt.',
    ],
    tips: [
      'Grytan är traditionellt en tapas, men med ris blir den en måltid.',
    ],
  },
  'fasolada': {
    title: 'Fasolada – grekisk bönsoppa',
    description: 'Greklands nationalrätt: vita bönor, morot, rotselleri och tomat med olivolja.',
    steps: [
      'Fräs lök, morot och rotselleri i olja.',
      'Tillsätt krossade tomater, bönor, oregano och 5 dl vatten.',
      'Koka på låg värme i 25 minuter och smaka av med salt.',
    ],
    tips: [
      'Ringla ytterligare lite olivolja över varje tallrik.',
    ],
  },
  'berry-smoothie-bowl': {
    title: 'Smoothiebowl med bär',
    description: 'En tjock bärsmoothie i en skål, toppad med glutenfri müsli och banan.',
    steps: [
      'Mixa frysta blåbär, hälften av bananen och yoghurten till en tjock smoothie.',
      'Häll upp i en skål och toppa med skivad banan och müsli.',
    ],
    tips: [
      'Ju mindre vätska, desto tjockare skål.',
    ],
  },
  'ham-egg-muffins': {
    title: 'Äggmuffins med skinka',
    description: 'Ugnsbakade äggmuffins med skinka, paprika och spenat. Färdig frukost för veckan.',
    steps: [
      'Sätt ugnen på 180 grader och smörj en muffinsplåt.',
      'Fördela hackad skinka, paprika och spenat i formarna.',
      'Vispa ägg och salt och häll i formarna. Strö osten över.',
      'Grädda i cirka 20 minuter tills äggen har stelnat.',
    ],
    tips: [
      'Värm i mikron i 30 sekunder på morgonen.',
    ],
    storage: 'Förvara i en burk med lock i kylskåpet i 4 dagar.',
  },
  'baked-oatmeal-apple': {
    title: 'Ugnsbakad havregrynsgröt med äpple och kanel',
    description: 'Ugnsbakad havregrynsgröt med äpple, russin och kanel.',
    steps: [
      'Sätt ugnen på 200 grader.',
      'Blanda havregryn, tärnat äpple, russin, kanel och salt i en form.',
      'Häll mjölken över och rör om.',
      'Grädda i cirka 30 minuter tills ytan är gyllenbrun.',
    ],
    tips: [
      'Skär den avsvalnade gröten i bitar och värm dem på morgonen.',
    ],
  },
  'chicken-shawarma-bowl': {
    title: 'Kycklingshawarmabowl',
    description: 'Kryddig kyckling, ris, tomat, gurka och vitlöksyoghurt i en skål.',
    steps: [
      'Krydda kycklingen med spiskummin, paprikapulver, hälften av vitlöken, citron och salt.',
      'Koka riset.',
      'Stek kycklingen genom i olja och skiva den.',
      'Blanda yoghurten med resten av vitlöken och sätt ihop skålarna.',
    ],
    tips: [
      'Skålen är glutenfri, och kycklingen passar också i pitabröd.',
    ],
  },
  'fava-patties-oven-potatoes': {
    title: 'Bondbönsbiffar med ugnspotatis',
    description: 'Veganska bondbönsbiffar kryddade med spiskummin och krispig ugnspotatis.',
    steps: [
      'Sätt ugnen på 225 grader. Dela potatisen i klyftor, blanda med hälften av oljan och salt och rosta i 30 minuter.',
      'Koka bondbönorna i 3 minuter och låt rinna av.',
      'Mixa bönor, lök, potatismjöl, spiskummin och salt till en grov smet.',
      'Forma till biffar och stek dem gyllene på båda sidor i resten av oljan.',
    ],
    tips: [
      'Fukta händerna, så är smeten lätt att forma.',
    ],
  },
  'chicken-potato-bake': {
    title: 'Kycklingfrestelse',
    description: 'Potatis, kyckling och lök i krämigt spad under ett osttäcke.',
    steps: [
      'Sätt ugnen på 200 grader.',
      'Skär potatis och lök i strimlor.',
      'Varva potatis, lök och kyckling i en form.',
      'Häll över grädde, mjölk och kryddor. Strö över osten och grädda i cirka en timme.',
    ],
    tips: [
      'Lägg gärna spenat mellan lagren.',
    ],
  },
  'sauerkraut-sausage-stew': {
    title: 'Surkåls- och korvgryta',
    description: 'En gryta i polsk stil på surkål, korv och potatis.',
    steps: [
      'Bryn den skivade korven och löken i olja.',
      'Tillsätt surkål, tärnad potatis, kryddor och 3 dl vatten.',
      'Låt puttra under lock i 35 minuter.',
    ],
    tips: [
      'Grytan är godast dagen efter.',
    ],
  },
};
