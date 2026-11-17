import type { RecipeText } from '../types';

/** Finnish text for recipe batch 1 (structure: catalog/recipes1.ts). */
export const FI_RECIPES_01: Readonly<Record<string, RecipeText>> = {
  'chicken-tomato-pan': {
    title: 'Tomaattinen kanapannu basilikalla',
    description: 'Mehevää broileria, paahdettua tomaattia ja tuoretta basilikaa yhdessä pannussa.',
    steps: [
      'Keitä riisi pakkauksen ohjeen mukaan.',
      'Leikkaa broileri suikaleiksi ja sipuli kuutioiksi. Paista broileri öljyssä kypsäksi ja mausta suolalla ja pippurilla.',
      'Lisää sipuli, valkosipuli ja kirsikkatomaatit. Paista, kunnes tomaatit pehmenevät.',
      'Kaada joukkoon tomaattimurska ja kerma. Hauduta 5 minuuttia.',
      'Revi pinnalle basilikaa ja tarjoa riisin kanssa.',
    ],
    tips: [
      'Kerman voi korvata kaurakermalla tai jättää pois, jolloin pannu on kevyempi.',
      'Riisin tilalle sopii täysjyväpasta.',
    ],
  },
  'minced-penne': {
    title: 'Jauhelihapenne tomaattikastikkeessa',
    description: 'Arjen klassikko: jauhelihaa, tomaattia ja pennepastaa.',
    steps: [
      'Keitä penne suolalla maustetussa vedessä.',
      'Ruskista jauheliha öljyssä. Lisää sipuli ja valkosipuli ja kuullota.',
      'Lisää tomaattimurska, tomaattipyree ja oregano. Hauduta 10 minuuttia.',
      'Sekoita pasta kastikkeeseen ja ripottele pinnalle juustoraaste.',
    ],
    tips: [
      'Raasta joukkoon porkkana, niin kastike saa makeutta ja lisää kasviksia.',
      'Tee tuplaerä: kastike pakastuu hyvin.',
    ],
  },
  'salmon-coconut': {
    title: 'Lohi kookoskastikkeessa',
    description: 'Paistettua lohta mausteisessa kookos-tomaattikastikkeessa.',
    steps: [
      'Keitä riisi.',
      'Kuumenna currytahna öljyssä, lisää kookosmaito ja tomaattimurska. Kiehauta.',
      'Leikkaa lohi paloiksi ja lisää kastikkeeseen. Hauduta kannen alla 8 minuuttia.',
      'Lisää pinaatti ja limen mehu juuri ennen tarjoilua.',
    ],
    tips: [
      'Lohen voi vaihtaa kirjolohen tai seitiin.',
      'Lisää kastikkeeseen kourallinen pinaattia juuri ennen tarjoilua.',
    ],
    storage: 'Säilytä jääkaapissa kannellisessa rasiassa 1–2 päivää.',
  },
  'bulgur-bowl': {
    title: 'Kasvisbulgurkulho',
    description: 'Bulguria, paahdettuja tomaatteja ja vihreitä papuja sitruunaisella kastikkeella.',
    steps: [
      'Keitä bulgur kaksinkertaisessa määrässä suolalla maustettua vettä.',
      'Paahda kirsikkatomaatit ja huuhdotut kikherneet pannulla oliiviöljyssä.',
      'Kypsennä vihreät pavut kiehuvassa vedessä 3 minuuttia.',
      'Kokoa kulhot, murenna päälle feta ja purista sitruunaa. Viimeistele persiljalla.',
    ],
    tips: [
      'Kulho on hyvä myös kylmänä eväänä.',
      'Gluteenittomana: vaihda bulgur kvinoaan.',
    ],
  },
  'chicken-curry': {
    title: 'Kanacurry ja jasmiiniriisi',
    description: 'Lempeä kookoscurry broilerin reisifileestä. Maistuu myös seuraavana päivänä.',
    steps: [
      'Keitä riisi.',
      'Kuullota sipuli, valkosipuli ja inkivääri öljyssä. Lisää curryjauhe ja paista minuutti.',
      'Lisää paloiteltu broileri ja ruskista.',
      'Kaada joukkoon tomaattimurska ja kookosmaito. Hauduta 15 minuuttia.',
      'Tarjoa riisin kanssa ja ripottele pinnalle korianteria.',
    ],
    tips: [
      'Mausta curry ensin miedosti ja lisää chiliä lopuksi maun mukaan.',
      'Kana pysyy mehevänä, kun sitä ei keitetä kastikkeessa liian kauan.',
    ],
  },
  'veggie-noodles': {
    title: 'Kasvisnuudelit seesamilla',
    description: 'Nopea wokki: tofua, rapeita kasviksia ja soijaa.',
    steps: [
      'Keitä nuudelit ja valuta.',
      'Kuutioi tofu ja paista se öljyssä rapeaksi.',
      'Lisää wokkivihannekset, valkosipuli ja inkivääri. Paista kovalla lämmöllä 4 minuuttia.',
      'Sekoita joukkoon nuudelit ja soijakastike. Viimeistele seesaminsiemenillä ja kevätsipulilla.',
    ],
    tips: [
      'Paahda tofu kunnolla rapeaksi ennen kastiketta.',
      'Pakastewokkivihannekset käyvät suoraan pannulle sulattamatta.',
    ],
  },
  'pesto-pasta': {
    title: 'Pestopasta ja kirsikkatomaatit',
    description: 'Vartin pasta, jossa basilikapesto ja makeat kirsikkatomaatit.',
    steps: [
      'Keitä pasta suolalla maustetussa vedessä.',
      'Puolita kirsikkatomaatit.',
      'Sekoita kuuman pastan joukkoon pesto, tomaatit ja pinaatti.',
      'Raasta pinnalle parmesaania.',
    ],
    tips: [
      'Lisää pastan keitinvettä tilkka, niin pesto tarttuu pastaan tasaisesti.',
      'Ripottele päälle paahdettuja siemeniä rapeudeksi.',
    ],
  },
  'shrimp-spaghetti': {
    title: 'Valkosipulikatkarapuspagetti',
    description: 'Katkarapuja, valkosipulia, chiliä ja sitruunaa.',
    steps: [
      'Sulata katkaravut ja keitä spagetti.',
      'Kuumenna oliiviöljy ja voi. Lisää valkosipuli ja chili ja kuullota miedolla lämmöllä.',
      'Lisää katkaravut ja kuumenna 2–3 minuuttia.',
      'Sekoita joukkoon spagetti, sitruunan mehu ja persilja.',
    ],
    tips: [
      'Sulata katkaravut kylmän veden alla siivilässä muutamassa minuutissa.',
      'Katkaravut kypsyvät hetkessä: lisää ne vasta lopuksi.',
    ],
    storage: 'Paras heti. Säilytä tähteet jääkaapissa enintään 1 päivä.',
  },
  'grilled-chicken': {
    title: 'Uunibroileri ja paahdetut kasvikset',
    description: 'Paprikalla maustettua broileria, uuniperunat ja valkosipulijogurtti.',
    steps: [
      'Kuumenna uuni 225 °C:seen.',
      'Lohko perunat ja kasvikset pellille, valuta päälle oliiviöljyä ja mausta suolalla.',
      'Hiero broileriin paprikajauhe ja suola. Lisää pellille 15 minuutin kuluttua.',
      'Paista vielä 20 minuuttia, kunnes broileri on kypsää.',
      'Sekoita jogurttiin murskattu valkosipuli ja tarjoa kastikkeena.',
    ],
    tips: [
      'Leikkaa kasvikset samankokoisiksi, niin ne kypsyvät tasaisesti.',
      'Kana on kypsää, kun lihan sisälämpö on 75 °C.',
    ],
  },
  'beef-ragu': {
    title: 'Naudan ragu ja nauhapasta',
    description: 'Hitaasti haudutettu tomaattinen jauhelihakastike nauhapastalla.',
    steps: [
      'Hienonna sipuli, porkkana ja valkosipuli. Kuullota öljyssä.',
      'Lisää jauheliha ja ruskista.',
      'Lisää tomaattipyree ja tomaattimurska. Hauduta kannen alla miedolla lämmöllä tunti.',
      'Keitä nauhapasta ja sekoita kastikkeeseen. Tarjoa parmesaanin kanssa.',
    ],
    tips: [
      'Mitä pidempään ragu hautuu, sitä mureampaa liha on.',
      'Ragu on vielä parempaa seuraavana päivänä.',
    ],
  },
  'chicken-fried-rice': {
    title: 'Paistettu riisi kanalla ja kasviksilla',
    description: 'Paistettua riisiä, broileria, munaa ja kasviksia.',
    steps: [
      'Keitä riisi (tai käytä edellisen päivän riisiä).',
      'Paista kuutioitu broileri öljyssä ja nosta sivuun.',
      'Paista porkkana ja herneet. Riko joukkoon munat ja sekoita.',
      'Lisää riisi, broileri ja soijakastike. Paista kovalla lämmöllä ja viimeistele kevätsipulilla.',
    ],
    tips: [
      'Edellisen päivän kylmä riisi paistuu parhaiten.',
      'Pidä pannu kuumana ja paista pienissä erissä.',
    ],
  },
  'chicken-salad-bowl': {
    title: 'Broilerisalaattikulho',
    description: 'Raikas kulho broileria, avokadoa ja maissia jogurttikastikkeella.',
    steps: [
      'Paista broileri oliiviöljyssä ja mausta suolalla. Anna levätä ja viipaloi.',
      'Pilko kurkku, tomaatit ja avokado.',
      'Kokoa kulhoihin salaatti, kasvikset, maissi ja broileri.',
      'Sekoita jogurttiin sitruunan mehu ja tarjoa kastikkeena.',
    ],
    tips: [
      'Paista kana etukäteen, niin kulho on koottu viidessä minuutissa.',
      'Kastikkeen voi tehdä jogurtista, sitruunasta ja yrteistä.',
    ],
  },
  'oven-lasagne': {
    title: 'Uunilasagne',
    description: 'Jauhelihakastiketta, valkokastiketta ja juustoa kerroksittain.',
    steps: [
      'Ruskista jauheliha ja sipuli. Lisää tomaattimurska ja oregano, hauduta 10 minuuttia.',
      'Sulata voi, lisää jauhot ja vatkaa joukkoon maito. Keitä sakeaksi valkokastikkeeksi.',
      'Lado vuokaan kerroksittain lihakastiketta, levyjä ja valkokastiketta.',
      'Ripottele pinnalle juusto ja paista 200 °C:ssa 40 minuuttia.',
    ],
    tips: [
      'Anna lasagnen vetäytyä 10 minuuttia ennen leikkaamista, niin palat pysyvät koossa.',
      'Lasagnen voi koota edellisenä päivänä ja paistaa vasta tarjoiluiltana.',
    ],
  },
  'carbonara': {
    title: 'Pekonicarbonara',
    description: 'Kermaton carbonara: pekonia, munaa, parmesaania ja mustapippuria.',
    steps: [
      'Keitä spagetti suolalla maustetussa vedessä. Ota talteen desi keitinvettä.',
      'Paista pekoni rapeaksi ja lisää lopuksi valkosipuli.',
      'Vatkaa munat ja raastettu parmesaani.',
      'Nosta pannu liedeltä, sekoita joukkoon pasta ja munaseos. Lisää keitinvettä, kunnes kastike on kiiltävää.',
    ],
    tips: [
      'Sekoita munaseos pastaan pois liedeltä, niin muna ei juoksetu.',
      'Tilkka keitinvettä tekee kastikkeesta kiiltävän.',
    ],
    storage: 'Paras heti. Säilytä tähteet jääkaapissa enintään 1 päivä.',
    reheating: 'Kuumenna miedolla lämmöllä pannulla tilkan vettä kanssa jatkuvasti sekoittaen.',
  },
  'meatballs-mash': {
    title: 'Lihapullat, perunamuusi ja puolukka',
    description: 'Kotoisat uunilihapullat, voinen muusi ja puolukkasurvos.',
    steps: [
      'Turvota korppujauhot tilkassa maitoa. Sekoita joukkoon jauheliha, muna, hienonnettu sipuli ja mausteet.',
      'Pyörittele pullat pellille ja paista 225 °C:ssa 15–20 minuuttia.',
      'Keitä kuoritut perunat kypsiksi ja soseuta loppumaidon ja voin kanssa.',
      'Tarjoa puolukkasurvoksen kanssa.',
    ],
    tips: [
      'Kostuta kädet vedellä, niin pyörykät on helppo pyöritellä.',
      'Pyörykät pakastuvat hyvin: tee kerralla tuplamäärä.',
    ],
  },
  'beef-stroganoff': {
    title: 'Nautastroganoff ja perunamuusi',
    description: 'Naudan suikaleita ja herkkusieniä kermaisessa sinappikastikkeessa.',
    steps: [
      'Keitä perunat ja soseuta maidon ja voin kanssa.',
      'Ruskista naudan suikaleet kuumassa öljyssä erissä.',
      'Paista sipuli ja sienet. Lisää tomaattipyree, sinappi ja kerma.',
      'Palauta liha pannulle ja hauduta 10 minuuttia. Viimeistele persiljalla.',
    ],
    tips: [
      'Leikkaa liha ohuiksi suikaleiksi syitä vastaan, niin se pysyy mureana.',
      'Maustekurkku tuo stroganoffiin klassisen kirpeyden.',
    ],
  },
  'sweet-sour-chicken': {
    title: 'Hapanimelä kana',
    description: 'Rapeaksi paistettua broileria ja paprikaa hapanimeläkastikkeessa.',
    steps: [
      'Keitä riisi.',
      'Pyöritä broilerikuutiot jauhoissa ja paista öljyssä rapeiksi.',
      'Paista paprika ja sipuli. Lisää chilikastike, soija, tomaattipyree, sokeri ja tilkka vettä.',
      'Sekoita broileri kastikkeeseen ja tarjoa riisin kanssa.',
    ],
    tips: [
      'Ananaksen tilalle sopii appelsiinin lohkoja.',
      'Maissitärkkelys sakeuttaa kastikkeen kiiltäväksi.',
    ],
  },
  'katsu-curry': {
    title: 'Kanakatsu ja currykastike',
    description: 'Korppujauhopaneroitu broileri, japanilainen currykastike ja riisi.',
    steps: [
      'Keitä riisi.',
      'Kuullota sipuli ja porkkana. Lisää curryjauhe, liemikuutio ja 2 dl vettä. Hauduta 15 minuuttia ja soseuta.',
      'Litistä broilerifileet, kääntele jauhoissa, munassa ja korppujauhoissa.',
      'Paista fileet öljyssä kullanruskeiksi. Viipaloi ja tarjoa kastikkeen ja riisin kanssa.',
    ],
    tips: [
      'Paista leivitetty kana kunnolla kuumassa öljyssä, niin pinta pysyy rapeana.',
      'Currykastikkeen voi tehdä valmiiksi edellisenä päivänä.',
    ],
    reheating: 'Kuumenna kastike kattilassa ja kana uunissa 200 °C:ssa noin 10 minuuttia, niin kuori pysyy rapeana.',
  },
  'pad-thai': {
    title: 'Kana pad thai',
    description: 'Riisinuudeleita, broileria, munaa ja maapähkinää limellä.',
    steps: [
      'Liota riisinuudelit kuumassa vedessä pehmeiksi.',
      'Paista broileri ja porkkanasuikaleet öljyssä. Siirrä reunalle ja paista munat sekaisin.',
      'Lisää nuudelit, soija, sokeri ja limen mehu. Sekoita kovalla lämmöllä.',
      'Tarjoa rouhittujen maapähkinöiden, kevätsipulin ja chilin kanssa.',
    ],
    tips: [
      'Liota nuudelit vain taipuisiksi: ne kypsyvät loppuun pannulla.',
      'Pidä kaikki ainekset valmiina ennen paistamista, sillä wokkaus on nopeaa.',
    ],
  },
  'chicken-enchiladas': {
    title: 'Uunienchiladat kanalla',
    description: 'Tortilloja, broileria ja mustapapuja salsan ja juuston alla.',
    steps: [
      'Kuumenna uuni 200 °C:seen.',
      'Paista broileri ja sipuli öljyssä. Lisää tacomauste, mustapavut ja tilkka vettä.',
      'Täytä tortillat ja rullaa ne vuokaan.',
      'Kaada päälle salsa ja tomaattimurska, ripottele juusto. Paista 20 minuuttia ja tarjoa kermaviilin kanssa.',
    ],
    tips: [
      'Täytteen voi tehdä valmiiksi päivää aiemmin.',
      'Tarjoa raikkaan salaatin ja kermaviilin kanssa.',
    ],
  },
  'kofta-burgers': {
    title: 'Kofta-pihvit pitaleivässä',
    description: 'Juustokuminalla maustetut naudanlihapihvit, jogurtti ja raikkaat kasvikset.',
    steps: [
      'Sekoita jauhelihaan raastettu sipuli, valkosipuli, persilja, juustokumina ja suola.',
      'Muotoile litteiksi pihveiksi ja paista pannulla kypsiksi.',
      'Lämmitä pitaleivät.',
      'Täytä leivät pihveillä, jogurtilla, tomaatilla, kurkulla ja punasipulilla.',
    ],
    tips: [
      'Kostuta kädet, niin pihvit on helppo muotoilla.',
      'Kofta-pihvit sopivat myös grilliin.',
    ],
  },
  'chicken-mushroom-stew': {
    title: 'Kana-sienipata uunissa',
    description: 'Broilerin reisifileetä, sieniä ja juureksia kermaviilikastikkeessa.',
    steps: [
      'Kuumenna uuni 200 °C:seen.',
      'Ruskista broileri ja sienet öljyssä.',
      'Lohko perunat ja porkkanat vuokaan. Lisää broileri, sienet, sipuli ja liemikuutiosta tehty liemi (2 dl).',
      'Kypsennä kannen alla 35 minuuttia. Sekoita joukkoon kermaviili ja persilja.',
    ],
    tips: [
      'Reisifilee pysyy pitkässä haudutuksessa mehevämpänä kuin rintafilee.',
      'Kantarelleilla tai suppilovahveroilla pata saa metsäisen maun.',
    ],
  },
};
