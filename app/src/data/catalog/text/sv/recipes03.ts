import type { RecipeText } from '../types';

/** Swedish text for recipe batch 3 (structure: catalog/recipes3.ts). */
export const SV_RECIPES_03: Readonly<Record<string, RecipeText>> = {
  'oat-porridge-blueberries': {
    title: 'Havregrynsgröt med blåbär',
    description: 'Mjuk havregrynsgröt på mjölk med blåbär: en varm och mättande morgonklassiker.',
    steps: [
      'Koka upp mjölken och 1 dl vatten i en kastrull.',
      'Tillsätt havregryn och salt. Koka på låg värme under omrörning i 3–5 minuter.',
      'Låt gröten dra en stund under lock och toppa med blåbären.',
    ],
    tips: [
      'Frysta blåbär kan läggas direkt i den varma gröten.',
      'En nypa kanel ger sötma utan socker.',
    ],
  },
  'gf-oat-porridge-apple': {
    title: 'Glutenfri havregrynsgröt med äpple och kanel',
    description: 'Gröt kokt på vatten med varmt äpple, kanel och linfrö.',
    steps: [
      'Koka upp 3 dl vatten i en kastrull.',
      'Tillsätt de glutenfria havregrynen och salt. Koka under omrörning i 3–5 minuter.',
      'Riv eller tärna äpplet i gröten den sista minuten.',
      'Strö kanel och linfrö över.',
    ],
    tips: [
      'Kontrollera på förpackningen att havren är märkt glutenfri.',
      'Päron passar i stället för äpple.',
    ],
  },
  'oven-barley-porridge': {
    title: 'Ugnsbakad korngrynsgröt',
    description: 'En långsamt ugnsbakad, krämigt mjuk korngrynsgröt: en helgfrukost att njuta av.',
    steps: [
      'Sätt ugnen på 150 grader.',
      'Häll korngryn, mjölk och salt i en smord ugnsform och rör om.',
      'Låt stå i ugnen i cirka 3 timmar. Rör om i gröten en eller två gånger.',
      'Lägg en klick smör ovanpå och servera med bär eller kanelsocker.',
    ],
    tips: [
      'Gröten kan sättas in i ugnen på kvällen med timer.',
      'Överbliven gröt är god kall med bär.',
    ],
  },
  'rice-porridge': {
    title: 'Risgrynsgröt med kanelsocker',
    description: 'Traditionell risgrynsgröt kokt på mjölk, med en smörklick och kanelsocker.',
    steps: [
      'Koka grötriset i 1 dl vatten i cirka 10 minuter tills vattnet har sugits upp.',
      'Tillsätt mjölken och koka upp under omrörning.',
      'Låt sjuda på låg värme under lock i cirka 45 minuter. Rör om då och då så att gröten inte bränns fast.',
      'Smaka av med salt och servera med en smörklick och kanelsocker.',
    ],
    tips: [
      'En kastrull med tjock botten hindrar gröten från att brännas fast.',
      'Av resterna blir det en ugnsbakad risgrynspudding nästa dag.',
    ],
  },
  'semolina-berries': {
    title: 'Mannagrynsgröt med jordgubbar',
    description: 'Slät mannagrynsgröt på mjölk med söta jordgubbar: en barndomsfavorit.',
    steps: [
      'Värm mjölken i en kastrull tills den nästan kokar.',
      'Strö i mannagrynen under ständig vispning så att det inte blir klumpar.',
      'Koka på låg värme under omrörning i cirka 5 minuter. Smaka av med salt och socker.',
      'Servera med jordgubbarna.',
    ],
    tips: [
      'En visp är bästa redskapet för en klumpfri gröt.',
      'Vilka bär eller vilken sylt som helst passar i stället för jordgubbar.',
    ],
  },
  'whipped-lingonberry-porridge': {
    title: 'Vispgröt med havredryck',
    description: 'En luftigt vispad lingongröt som serveras med kall havredryck.',
    steps: [
      'Koka lingonen i 4 dl vatten och sila om du vill ha en slät gröt.',
      'Strö mannagrynen i det kokande spadet under vispning. Koka på låg värme i 10 minuter.',
      'Smaka av med socker och salt och låt svalna.',
      'Vispa den avsvalnade gröten ljus och luftig med elvisp.',
      'Servera med kall havredryck.',
    ],
    tips: [
      'Gröten blir ljus och luftig först när den har svalnat: vispa den inte varm.',
      'Den håller sig i kylskåpet och passar också som mellanmål.',
    ],
    storage: 'Förvara i en burk med lock i kylskåpet i 3 dagar.',
    reheating: 'Serveras kall. Vispa en stund före servering.',
  },
  'buckwheat-porridge-raspberry': {
    title: 'Laktosfri bovetegröt med hallon',
    description: 'Rostad bovetegröt på laktosfri mjölk med hallon och en skvätt honung.',
    steps: [
      'Skölj bovetegrynen i en sil.',
      'Koka bovetet i 2 dl vatten med salt i cirka 10 minuter.',
      'Tillsätt mjölken och koka under omrörning i ytterligare 5 minuter tills gröten är mjuk.',
      'Servera med hallon och honung.',
    ],
    tips: [
      'Bovete är naturligt glutenfritt.',
      'Rosta grynen först i en torr kastrull, så fördjupas smaken.',
    ],
  },
  'overnight-oats': {
    title: 'Overnight oats med blåbär',
    description: 'Yoghurthavre som blandas på kvällen och står klar i kylskåpet på morgonen.',
    steps: [
      'Blanda havregryn, chiafrön, yoghurt och mjölk i en burk.',
      'Lägg blåbär och honung ovanpå.',
      'Sätt på locket och låt stå i kylskåpet över natten.',
    ],
    tips: [
      'Gör tre dagars portioner på en gång.',
      'Ta med burken till jobbet eller skolan.',
    ],
    storage: 'Förvara i en stängd burk i kylskåpet i 2–3 dagar.',
    reheating: 'Äts kall. På vintern kan gröten värmas i mikron.',
  },
  'vegan-overnight-oats': {
    title: 'Veganska overnight oats med hallon',
    description: 'Havregryn och chia som fått dra i havreyoghurt, toppat med hallon och sirap.',
    steps: [
      'Blanda havregryn, chiafrön, havreyoghurt och havredryck i en burk.',
      'Lägg hallonen ovanpå och ringla över sirapen.',
      'Låt stå i kylskåpet i minst 4 timmar eller över natten.',
    ],
    tips: [
      'Tillsätt krossade frön på morgonen för krispighet.',
      'Frysta hallon tinar under natten till saftiga bär.',
    ],
    storage: 'Förvara i en stängd burk i kylskåpet i 2–3 dagar.',
    reheating: 'Äts kall.',
  },
  'chia-pudding-mango': {
    title: 'Chiapudding med mango',
    description: 'Chiapudding som svällt i kokosmjölk, fräsch mango och rivet limeskal.',
    steps: [
      'Blanda chiafrön, kokosmjölk, 0,5 dl vatten och sirap.',
      'Rör om igen efter 10 minuter så att fröna inte klumpar sig.',
      'Låt svälla i kylskåpet i minst 4 timmar.',
      'Toppa med tärnad mango och riv över limeskal.',
    ],
    tips: [
      'En lättare variant får du om du byter ut hälften av kokosmjölken mot vatten.',
      'Puddingen håller sig i kylskåpet i tre dagar.',
    ],
    storage: 'Förvara i en stängd burk i kylskåpet i 3 dagar.',
    reheating: 'Äts kall.',
  },
  'protein-porridge': {
    title: 'Kvarggröt med banan',
    description: 'Havregrynsgröt med kvarg inrörd: mer protein än vanligt och mättar länge.',
    steps: [
      'Koka havregrynen i mjölken och 1 dl vatten med salt i 3–5 minuter.',
      'Ta kastrullen från plattan och rör ner kvargen i gröten.',
      'Skiva banan ovanpå och strö över kanel.',
    ],
    tips: [
      'Tillsätt kvargen först när gröten har tagits från värmen, så skär den sig inte.',
      'Laktosfritt: använd laktosfri mjölk och kvarg.',
    ],
  },
  'spinach-feta-omelette': {
    title: 'Omelett med spenat och fetaost',
    description: 'En mjuk omelett med spenat och salt fetaost. Klar på tio minuter.',
    steps: [
      'Vispa äggen och krydda med salt och peppar.',
      'Smält smöret i en panna och fräs spenaten en minut.',
      'Häll äggsmeten i pannan och låt stelna på låg värme.',
      'Smula fetaosten över, vik omeletten på mitten och servera direkt.',
    ],
    tips: [
      'Ett lock på pannan gör att omelettens yta stelnar jämnt.',
      'Tillsätt gärna körsbärstomater.',
    ],
  },
  'scrambled-eggs-rye': {
    title: 'Äggröra på rågbröd',
    description: 'Krämigt mjuk äggröra med gräslök på rågbröd: en finsk frukostklassiker.',
    steps: [
      'Vispa lätt ihop ägg, mjölk och salt.',
      'Smält smöret i en panna på låg värme och häll i äggsmeten.',
      'Vänd försiktigt med en stekspade tills äggröran har stelnat men fortfarande är blank.',
      'Servera på rågbrödet och strö gräslök över.',
    ],
    tips: [
      'Ta äggröran från plattan lite innan den ser klar ut: eftervärmen gör resten.',
    ],
  },
  'avocado-egg-toast': {
    title: 'Avokadosmörgås med kokt ägg',
    description: 'Krispigt fullkornsrostbröd, avokado med citron, ägg och en nypa chili.',
    steps: [
      'Koka ägget i 8 minuter, kyl och skala det.',
      'Rosta brödskivorna.',
      'Mosa avokadon med en gaffel och smaka av med citronsaft och salt.',
      'Bred avokadon på bröden, skiva ägget ovanpå och strö över chiliflingor.',
    ],
    tips: [
      'En mogen avokado ger efter lite när man trycker lätt på den.',
    ],
  },
  'gf-avocado-toast': {
    title: 'Glutenfri avokadosmörgås med tomater',
    description: 'Glutenfritt fröbröd, avokado med lime och saftiga körsbärstomater.',
    steps: [
      'Rosta brödskivorna i en panna eller brödrost.',
      'Mosa avokadon och smaka av med lime, salt och peppar.',
      'Bred avokadon på bröden och lägg halverade körsbärstomater ovanpå.',
    ],
    tips: [
      'Rosta alltid glutenfritt bröd: det smakar bättre och håller pålägget bättre.',
    ],
  },
  'tofu-scramble': {
    title: 'Tofuröra med tomat och spenat',
    description: 'Smulad tofu som en kryddig röra med tomat och spenat. En vegansk frukost.',
    steps: [
      'Fräs finhackad lök i olja i en stekpanna.',
      'Smula tofun i pannan och krydda med curry, salt och peppar. Stek i 5 minuter.',
      'Tillsätt tärnad tomat och spenat och stek tills spenaten har sjunkit ihop.',
    ],
    tips: [
      'Curryn ger tofun en gyllene färg som påminner om äggröra.',
      'Servera med rostat bröd eller riskakor.',
    ],
  },
  'ham-cheese-toast': {
    title: 'Varm macka med skinka och ost',
    description: 'Ugnsmält ost, skinka och tomat på rostbröd.',
    steps: [
      'Sätt ugnen på 225 grader.',
      'Bred bröden och lägg på skinka, tomatskivor och riven ost.',
      'Grädda högt upp i ugnen i 5–7 minuter tills osten har smält och fått färg.',
    ],
    tips: [
      'En nypa oregano gör mackan pizzalik.',
    ],
  },
  'smoked-salmon-rye': {
    title: 'Rågbröd med kallrökt lax och gurka',
    description: 'Rågbröd, färskost, kallrökt lax, gurka och dill. Festligt men snabbt.',
    steps: [
      'Bred färskosten på rågbrödsskivorna.',
      'Lägg på tunna gurkskivor och den kallrökta laxen.',
      'Toppa med dill och några droppar citronsaft.',
    ],
    tips: [
      'Gravad strömming eller rökt regnbåge passar i stället för lax.',
    ],
  },
  'cottage-cheese-crispbread': {
    title: 'Knäckebröd med keso och tomat',
    description: 'Krispigt rågknäcke, keso, tomat och gräslök. Lätt och proteinrikt.',
    steps: [
      'Bred keson på knäckebröden.',
      'Lägg på tomatskivor och gräslök och mal över svartpeppar.',
    ],
    tips: [
      'Sätt ihop precis innan du äter, så förblir knäckebrödet krispigt.',
    ],
  },
  'hummus-veggie-bread': {
    title: 'Hummusmacka med krispiga grönsaker',
    description: 'Rågbröd, len hummus och krispiga skivor av gurka och paprika. Veganskt och mättande.',
    steps: [
      'Bred ett tjockt lager hummus på rågbrödsskivorna.',
      'Lägg på gurk- och paprikaskivor och mal över peppar.',
    ],
    tips: [
      'Strö över rostade frön eller chiliflingor.',
    ],
  },
  'oven-omelette-vegetables': {
    title: 'Ugnsomelett med grönsaker',
    description: 'En saftig ugnsomelett med paprika, spenat och ost. Räcker till hela veckans frukostar.',
    steps: [
      'Sätt ugnen på 200 grader och smörj en ugnsform med olja.',
      'Vispa ägg, mjölk och salt.',
      'Fördela paprika, lök och spenat i formen och häll äggsmeten över.',
      'Strö riven ost över och grädda i 20–25 minuter tills omeletten har stelnat.',
    ],
    tips: [
      'Skär den avsvalnade omeletten i bitar till matlådor.',
      'Grönsakerna kan bytas mot rester från kylskåpet.',
    ],
    storage: 'Förvara i bitar i kylskåpet i 3 dagar.',
    reheating: 'Ät kall eller värm i mikron i 30–60 sekunder.',
  },
  'yogurt-muesli-bowl': {
    title: 'Yoghurtskål med bär och müsli',
    description: 'Naturell yoghurt, müsli, blåbär och jordgubbar. En snabb och fräsch morgon.',
    steps: [
      'Lägg upp yoghurten i en skål.',
      'Toppa med bär och müsli precis innan du äter.',
    ],
    tips: [
      'Tillsätt müslin först när du äter, så förblir den krispig.',
    ],
    storage: 'Sätt ihop skålen när du äter. Öppnad yoghurt håller sig i kylskåpet i 3 dagar.',
    reheating: 'Äts kall.',
  },
  'lactose-free-quark-bowl': {
    title: 'Laktosfri kvargskål med hallon',
    description: 'Laktosfri kvarg och yoghurt, hallon och glutenfri müsli: protein till morgonen.',
    steps: [
      'Rör ihop kvarg och yoghurt till en jämn blandning i en skål.',
      'Toppa med hallon, müsli och honung.',
    ],
    tips: [
      'En blandning av kvarg och yoghurt är luftigare än bara kvarg.',
    ],
    storage: 'Sätt ihop skålen när du äter.',
    reheating: 'Äts kall.',
  },
  'soy-yogurt-mango-bowl': {
    title: 'Sojayoghurtskål med mango',
    description: 'En vegansk frukostskål: sojayoghurt, mango, glutenfri müsli och pumpafrön.',
    steps: [
      'Lägg upp sojayoghurten i en skål.',
      'Toppa med tinad mango, müsli och pumpafrön.',
    ],
    tips: [
      'Tina den frysta mangon i kylskåpet över natten.',
    ],
    storage: 'Sätt ihop skålen när du äter.',
    reheating: 'Äts kall.',
  },
  'banana-egg-pancakes': {
    title: 'Bananplättar av två ingredienser',
    description: 'Små plättar av bara banan och ägg, utan mjöl.',
    steps: [
      'Mosa bananen slät med en gaffel.',
      'Vispa ner äggen och kanelen.',
      'Stek små plättar i en oljad panna på medelvärme i cirka en minut per sida.',
    ],
    tips: [
      'Små plättar är lättare att vända än stora.',
      'Servera med bär.',
    ],
  },
  'eggs-bacon-tomato': {
    title: 'Stekt ägg, bacon och tomat',
    description: 'En varm helgfrukosttallrik: stekta ägg, krispigt bacon, svamp och tomat.',
    steps: [
      'Stek baconet krispigt och lägg det på hushållspapper.',
      'Stek de halverade tomaterna och svampen i baconfettet.',
      'Stek äggen i olja som du vill ha dem.',
      'Servera med rostat bröd.',
    ],
    tips: [
      'Äggen blir fina när pannan inte är för het.',
    ],
  },
};
