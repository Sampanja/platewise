import type { RecipeText } from '../types';

/** Swedish text for recipe batch 5 (structure: catalog/recipes5.ts). */
export const SV_RECIPES_05: Readonly<Record<string, RecipeText>> = {
  'roasted-chickpeas': {
    title: 'Krispiga rostade kikärter',
    description: 'Ugnsrostade kikärter kryddade med paprika: ett krispigt och mättande mellanmål.',
    steps: [
      'Sätt ugnen på 200 °C.',
      'Skölj och låt kikärterna rinna av och torka dem noga med hushållspapper.',
      'Blanda med olja, paprikapulver och salt och bred ut på en plåt.',
      'Rosta i 25–30 minuter och skaka plåten då och då tills kikärterna är krispiga.',
    ],
    tips: [
      'Ju torrare kikärterna är, desto krispigare blir de.',
    ],
    storage: 'Förvara i en öppen skål i rumstemperatur i 1–2 dagar; under lock mjuknar de.',
    reheating: 'Gör dem krispiga igen i ugnen på 200 °C i 5 minuter vid behov.',
  },
  'oat-peanut-energy-balls': {
    title: 'Havrebollar med jordnötssmör',
    description: 'Ogräddade energibollar av havre, jordnötssmör, kakao och russin.',
    steps: [
      'Blanda alla ingredienser i en skål till en jämn smet.',
      'Rulla 12 bollar av smeten med fuktiga händer.',
      'Låt dem stelna i kylskåpet i minst 30 minuter.',
    ],
    tips: [
      'Rulla bollarna i kokosflingor om du vill att de ska se finare ut.',
    ],
    storage: 'Förvara i en burk med lock i kylskåpet i en vecka eller frys.',
    reheating: 'Äts kalla.',
  },
  'gf-almond-energy-balls': {
    title: 'Glutenfria mandel- och kakaobollar',
    description: 'Veganska kakaobollar gjorda på mandel, glutenfri havre och russin.',
    steps: [
      'Mixa mandel och havregryn till ett grovt smul i en mixer.',
      'Tillsätt russin, kakao och en matsked vatten och blanda till en kladdig smet.',
      'Rulla till bollar och rulla dem i kokosflingor.',
      'Låt stelna i kylskåpet i 30 minuter.',
    ],
    tips: [
      'Om smeten är för torr, tillsätt en skvätt vatten.',
    ],
    storage: 'Förvara i en burk med lock i kylskåpet i en vecka.',
    reheating: 'Äts kalla.',
  },
  'fruit-salad': {
    title: 'Fräsch fruktsallad',
    description: 'Äpple, apelsin, banan och jordgubbar med limesaft.',
    steps: [
      'Skala och dela apelsinen och bananen. Tärna äpplet.',
      'Blanda frukten och jordgubbarna i en skål.',
      'Pressa över limesaften, som hindrar äpplet från att mörkna.',
    ],
    tips: [
      'Tillsätt mynta eller en skvätt honung om du vill.',
    ],
    storage: 'Bäst samma dag. Förvara under lock i kylskåpet i högst 1 dag.',
    reheating: 'Äts kall.',
  },
  'veggie-sticks-hummus': {
    title: 'Grönsaksstavar med hummus',
    description: 'Krispiga morots- och gurkstavar med hummus: ett enkelt och näringsrikt mellanmål.',
    steps: [
      'Skala moroten och skär morot och gurka i stavar.',
      'Servera med hummusen.',
    ],
    tips: [
      'Skurna stavar förblir krispiga i ett glas vatten i kylskåpet.',
    ],
  },
  'tzatziki-veggies': {
    title: 'Tzatziki med grönsaksstavar',
    description: 'En grekisk yoghurtdipp med gurka, vitlök och dill, med grönsaker.',
    steps: [
      'Riv gurkan och krama ur vätskan.',
      'Blanda yoghurt, gurka, pressad vitlök, dill, olivolja och salt.',
      'Skär morot och paprika i stavar och servera med dippen.',
    ],
    tips: [
      'Tzatzikin blir godare om den får dra i kylskåpet en halvtimme.',
    ],
  },
  'guacamole-corn-chips': {
    title: 'Guacamole med ugnsrostade majschips',
    description: 'Guacamole smaksatt med lime och koriander och hemrostade majstortillachips.',
    steps: [
      'Sätt ugnen på 200 °C. Skär tortillorna i trianglar, pensla med olja och strö över salt.',
      'Rosta på en plåt i 8–10 minuter tills chipsen är krispiga.',
      'Mosa avokadon och blanda i tomat, finhackad rödlök, limesaft och koriander.',
    ],
    tips: [
      'Låt avokadokärnan ligga kvar i guacamolen under förvaringen, så mörknar den långsammare.',
    ],
  },
  'quark-berries': {
    title: 'Kvarg med blåbär',
    description: 'Kvarg, blåbär och en skvätt honung: mycket protein i en liten skål.',
    steps: [
      'Vispa kvargen luftig med en skvätt vatten.',
      'Toppa med blåbär och honung.',
    ],
    tips: [
      'Vispad kvarg är luftigare än direkt ur burken.',
    ],
  },
  'cottage-cheese-pear': {
    title: 'Keso med kanelpäron',
    description: 'Keso och saftigt päron med kanel: ett lätt och proteinrikt mellanmål.',
    steps: [
      'Tärna päronet.',
      'Lägg upp keson i en skål och tillsätt päron och kanel.',
    ],
    tips: [
      'Äpple, persika eller bär passar i stället för päron.',
    ],
  },
  'tortilla-pizza': {
    title: 'Tortillapizza med skinka',
    description: 'Krispig tortillabotten, tomatsås, mozzarella och skinka: pizza på tio minuter.',
    steps: [
      'Sätt ugnen på 225 °C.',
      'Bred krossade tomater på tortillan och krydda med oregano.',
      'Lägg på skinka och riven mozzarella.',
      'Grädda mitt i ugnen i 6–8 minuter tills kanterna är krispiga.',
    ],
    tips: [
      'En vegetarisk variant gör du med paprika, svamp och oliver.',
    ],
  },
  'blueberry-muffins': {
    title: 'Blåbärsmuffins',
    description: 'Saftiga blåbärsmuffins till kaffet eller i matlådan.',
    steps: [
      'Sätt ugnen på 200 °C och ställ pappersformar i en muffinsplåt.',
      'Vispa ägg och socker pösigt. Tillsätt smält smör och mjölk.',
      'Blanda mjöl och bakpulver och vänd försiktigt ner det i smeten.',
      'Tillsätt blåbären och fördela smeten i formarna.',
      'Grädda i cirka 18 minuter tills ingen smet fastnar på en provsticka.',
    ],
    tips: [
      'Vänd frysta blåbär i mjöl, så sjunker de inte till botten.',
    ],
    storage: 'Förvara i en burk med lock i 2 dagar eller frys.',
    reheating: 'Värm en fryst muffin i mikron i 20 sekunder.',
  },
  'banana-bread': {
    title: 'Bananbröd',
    description: 'Ett kanelkryddat bananbröd som blir till av övermogna bananer.',
    steps: [
      'Sätt ugnen på 175 °C och smörj en brödform.',
      'Mosa bananerna och vispa ner ägg, socker och olja.',
      'Blanda mjöl, bakpulver och kanel och rör ner i smeten.',
      'Häll i formen och grädda i cirka 50 minuter.',
    ],
    tips: [
      'Ju mörkare bananer, desto sötare bröd.',
    ],
    storage: 'Förvara inslaget i plastfolie i rumstemperatur i 3 dagar eller frys i skivor.',
    reheating: 'Rosta en skiva i brödrosten eller i en panna.',
  },
  'apple-peanut-butter': {
    title: 'Äppelklyftor med jordnötssmör',
    description: 'Krispiga äppelklyftor och jordnötssmör: ett sött och mättande mellanmål på ett ögonblick.',
    steps: [
      'Skär äpplet i klyftor och ta bort kärnhuset.',
      'Servera med jordnötssmör att doppa i.',
    ],
    tips: [
      'En nypa kanel på jordnötssmöret passar bra.',
    ],
  },
  'tuna-dip-rice-cakes': {
    title: 'Tonfiskröra på riskakor',
    description: 'En tonfiskröra med yoghurt, dill och gurka på krispiga riskakor.',
    steps: [
      'Låt tonfisken rinna av och blanda den med yoghurt, dill och peppar.',
      'Bred röran på riskakorna och lägg på gurkskivor.',
    ],
    tips: [
      'Röran håller sig i kylskåpet i två dagar.',
    ],
  },
  'eggs-cherry-tomatoes': {
    title: 'Ägg och körsbärstomater',
    description: 'Två kokta ägg och söta körsbärstomater: ett enkelt proteinmellanmål.',
    steps: [
      'Koka äggen i 8–9 minuter och kyl dem i kallt vatten.',
      'Skala och halvera äggen, krydda med salt och peppar och servera med tomaterna.',
    ],
    tips: [
      'Koka veckans ägg på en gång och förvara dem i kylskåpet.',
    ],
    storage: 'Förvara kokta ägg med skalet kvar i kylskåpet i en vecka.',
    reheating: 'Äts kalla.',
  },
  'vegan-banana-strawberry-ice': {
    title: 'Vegansk glass på banan och jordgubbar',
    description: 'Mjuk glass mixad av frysta bananer och jordgubbar.',
    steps: [
      'Dela bananen i bitar och frys i minst 4 timmar.',
      'Mixa de frysta bananerna och jordgubbarna till mjuk glass i en mixer och servera direkt.',
    ],
    tips: [
      'Ha alltid en påse med bananbitar i frysen för det här.',
    ],
    storage: 'Bäst direkt. Fryst blir glassen hård: låt den mjukna i 10 minuter.',
    reheating: 'Värms inte.',
  },
  'spiced-nut-seed-mix': {
    title: 'Kryddig blandning av nötter och frön',
    description: 'Rostad mandel, cashewnötter och frön med paprika och salt.',
    steps: [
      'Sätt ugnen på 175 °C.',
      'Blanda mandel, cashewnötter, frön, olja och kryddor.',
      'Rosta på en plåt i 10–12 minuter under omrörning då och då och låt svalna.',
    ],
    tips: [
      'Portionera i små burkar, så blir portionerna lagom stora.',
    ],
    storage: 'Förvara i en tät burk i rumstemperatur i 2 veckor.',
    reheating: 'Äts som den är.',
  },
  'beetroot-hummus': {
    title: 'Rödbetshummus med morötter',
    description: 'En klarröd hummus av kikärter, rödbeta och tahini med morotsstavar.',
    steps: [
      'Mixa kikärter, kokt rödbeta, tahini, citronsaft, vitlök och olivolja i en mixer.',
      'Tillsätt vatten tills hummusen är slät och smaka av med salt.',
      'Servera med morotsstavar.',
    ],
    tips: [
      'Färdigkokta vakuumförpackade rödbetor går snabbare.',
    ],
    storage: 'Förvara i en burk med lock i kylskåpet i 4 dagar.',
    reheating: 'Servera kall.',
  },
  'blueberry-kissel': {
    title: 'Blåbärskräm',
    description: 'En traditionell blåbärskräm som kan ätas varm eller kall.',
    steps: [
      'Koka upp blåbär, socker och 2 dl vatten.',
      'Rör ut potatismjölet i lite kallt vatten.',
      'Ta kastrullen från plattan och häll i mjölblandningen i en tunn stråle under ständig omrörning.',
      'Värm tills den första bubblan stiger till ytan, men låt inte koka.',
    ],
    tips: [
      'Om krämen kokar efter att potatismjölet tillsatts blir den tunn.',
      'Strö socker över, så bildas ingen hinna.',
    ],
    storage: 'Förvara i en skål med lock i kylskåpet i 3 dagar.',
    reheating: 'Servera kall eller värm försiktigt under omrörning, utan att koka upp.',
  },
  'oat-cookies': {
    title: 'Havrekakor',
    description: 'Krispiga och smöriga havrekakor som är lätta att baka en hel plåt av.',
    steps: [
      'Sätt ugnen på 200 °C.',
      'Smält smöret och rör ner socker, havregryn, mjöl och bakpulver.',
      'Tillsätt ägget och rör till en jämn smet.',
      'Klicka ut små klickar med en tesked på bakplåtspapper med gott om mellanrum.',
      'Grädda i 6–8 minuter tills kanterna är gyllenbruna.',
    ],
    tips: [
      'Kakorna flyter ut mycket: lämna gott om plats.',
    ],
    storage: 'Förvara i en tät burk i rumstemperatur i en vecka.',
    reheating: 'Äts som de är.',
  },
  'roasted-cauliflower-dip': {
    title: 'Ugnsrostad blomkål med yoghurtdipp',
    description: 'Blomkål rostad med curry och en sval yoghurtdipp.',
    steps: [
      'Sätt ugnen på 220 °C.',
      'Dela blomkålen i buketter och blanda med olja, curry och salt.',
      'Rosta på en plåt i 20–25 minuter tills kanterna får färg.',
      'Blanda yoghurt och citronsaft till en dipp.',
    ],
    tips: [
      'Strö över färsk koriander på slutet.',
    ],
  },
  'salmon-cucumber-rolls': {
    title: 'Gurk- och laxrullar',
    description: 'Tunna gurkskivor, färskost och kallrökt lax med dill och citron.',
    steps: [
      'Skiva gurkan på längden i tunna band med en osthyvel.',
      'Bred färskost på banden och lägg på lax och dill.',
      'Rulla ihop och pressa över citronsaft.',
    ],
    tips: [
      'Fäst rullarna med cocktailpinnar om du serverar dem på fest.',
    ],
    storage: 'Bäst samma dag. Förvara i kylskåpet under plastfolie.',
    reheating: 'Servera kall.',
  },
  'lactose-free-cocoa-quark': {
    title: 'Laktosfri kakaokvarg med banan',
    description: 'Laktosfri kvarg smaksatt med kakao och banan: söt men proteinrik.',
    steps: [
      'Rör ut kakaon i kvargen med en skvätt vatten tills den är jämn.',
      'Skiva bananen ovanpå.',
    ],
    tips: [
      'En mogen banan sötar så att inget socker behövs.',
    ],
  },
  'oat-yogurt-berries': {
    title: 'Havreyoghurt med blåbär och frön',
    description: 'En vegansk mellanmålsskål med havreyoghurt, blåbär och pumpafrön.',
    steps: [
      'Lägg upp havreyoghurten i en skål.',
      'Toppa med blåbär och pumpafrön.',
    ],
    tips: [
      'Rosta fröna i en torr panna, så smakar de nötigt.',
    ],
  },
  'soy-yogurt-chia-raspberry': {
    title: 'Sojayoghurt med chia och hallon',
    description: 'Sojayoghurt fylligare med chiafrön, och hallon: glutenfritt och veganskt.',
    steps: [
      'Rör ner chiafröna i sojayoghurten och låt svälla i 10 minuter.',
      'Toppa med hallon och sirap.',
    ],
    tips: [
      'Låt chian svälla över natten, så har du en färdig pudding på morgonen.',
    ],
  },
};
