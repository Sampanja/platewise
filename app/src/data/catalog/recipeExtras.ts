import type { Difficulty } from '../types';

/**
 * Fields the first 51 test recipes (recipes1.ts, recipes2.ts) were written
 * without: hands-on time, difficulty, tips and, where the category default
 * does not fit, storage and reheating advice. Servings default to 4.
 */
export type LegacyExtra = {
  /** Hands-on minutes. */
  active: number;
  level?: Difficulty;
  serves?: number;
  tips: string[];
  keep?: string;
  heat?: string;
};

export const LEGACY_EXTRAS: Readonly<Record<string, LegacyExtra>> = {
  'chicken-tomato-pan': {
    active: 20,
    tips: ['Kerman voi korvata kaurakermalla tai jättää pois, jolloin pannu on kevyempi.', 'Riisin tilalle sopii täysjyväpasta.'],
  },
  'minced-penne': {
    active: 15,
    tips: ['Raasta joukkoon porkkana, niin kastike saa makeutta ja lisää kasviksia.', 'Tee tuplaerä: kastike pakastuu hyvin.'],
  },
  'salmon-coconut': {
    active: 20,
    tips: ['Lohen voi vaihtaa kirjolohen tai seitiin.', 'Lisää kastikkeeseen kourallinen pinaattia juuri ennen tarjoilua.'],
    keep: 'Säilytä jääkaapissa kannellisessa rasiassa 1–2 päivää.',
  },
  'bulgur-bowl': {
    active: 15,
    tips: ['Kulho on hyvä myös kylmänä eväänä.', 'Gluteenittomana: vaihda bulgur kvinoaan.'],
  },
  'chicken-curry': {
    active: 20,
    tips: ['Mausta curry ensin miedosti ja lisää chiliä lopuksi maun mukaan.', 'Kana pysyy mehevänä, kun sitä ei keitetä kastikkeessa liian kauan.'],
  },
  'veggie-noodles': {
    active: 15,
    tips: ['Paahda tofu kunnolla rapeaksi ennen kastiketta.', 'Pakastewokkivihannekset käyvät suoraan pannulle sulattamatta.'],
  },
  'pesto-pasta': {
    active: 10,
    tips: ['Lisää pastan keitinvettä tilkka, niin pesto tarttuu pastaan tasaisesti.', 'Ripottele päälle paahdettuja siemeniä rapeudeksi.'],
  },
  'shrimp-spaghetti': {
    active: 15,
    tips: ['Sulata katkaravut kylmän veden alla siivilässä muutamassa minuutissa.', 'Katkaravut kypsyvät hetkessä: lisää ne vasta lopuksi.'],
    keep: 'Paras heti. Säilytä tähteet jääkaapissa enintään 1 päivä.',
  },
  'grilled-chicken': {
    active: 15,
    tips: ['Leikkaa kasvikset samankokoisiksi, niin ne kypsyvät tasaisesti.', 'Kana on kypsää, kun lihan sisälämpö on 75 astetta.'],
  },
  'beef-ragu': {
    active: 25,
    level: 'medium',
    tips: ['Mitä pidempään ragu hautuu, sitä mureampaa liha on.', 'Ragu on vielä parempaa seuraavana päivänä.'],
  },
  'chicken-fried-rice': {
    active: 15,
    tips: ['Edellisen päivän kylmä riisi paistuu parhaiten.', 'Pidä pannu kuumana ja paista pienissä erissä.'],
  },
  'chicken-salad-bowl': {
    active: 15,
    tips: ['Paista kana etukäteen, niin kulho on koottu viidessä minuutissa.', 'Kastikkeen voi tehdä jogurtista, sitruunasta ja yrteistä.'],
  },
  'oven-lasagne': {
    active: 30,
    level: 'medium',
    tips: ['Anna lasagnen vetäytyä 10 minuuttia ennen leikkaamista, niin palat pysyvät koossa.', 'Lasagnen voi koota edellisenä päivänä ja paistaa vasta tarjoiluiltana.'],
  },
  carbonara: {
    active: 20,
    level: 'medium',
    tips: ['Sekoita munaseos pastaan pois liedeltä, niin muna ei juoksetu.', 'Tilkka keitinvettä tekee kastikkeesta kiiltävän.'],
    keep: 'Paras heti. Säilytä tähteet jääkaapissa enintään 1 päivä.',
    heat: 'Kuumenna miedolla lämmöllä pannulla tilkan vettä kanssa jatkuvasti sekoittaen.',
  },
  'meatballs-mash': {
    active: 30,
    tips: ['Kostuta kädet vedellä, niin pyörykät on helppo pyöritellä.', 'Pyörykät pakastuvat hyvin: tee kerralla tuplamäärä.'],
  },
  'beef-stroganoff': {
    active: 25,
    tips: ['Leikkaa liha ohuiksi suikaleiksi syitä vastaan, niin se pysyy mureana.', 'Maustekurkku tuo stroganoffiin klassisen kirpeyden.'],
  },
  'sweet-sour-chicken': {
    active: 20,
    tips: ['Ananaksen tilalle sopii appelsiinin lohkoja.', 'Maissitärkkelys sakeuttaa kastikkeen kiiltäväksi.'],
  },
  'katsu-curry': {
    active: 30,
    level: 'medium',
    tips: ['Paista leivitetty kana kunnolla kuumassa öljyssä, niin pinta pysyy rapeana.', 'Currykastikkeen voi tehdä valmiiksi edellisenä päivänä.'],
    heat: 'Kuumenna kastike kattilassa ja kana uunissa 200 asteessa noin 10 minuuttia, niin kuori pysyy rapeana.',
  },
  'pad-thai': {
    active: 20,
    level: 'medium',
    tips: ['Liota nuudelit vain taipuisiksi: ne kypsyvät loppuun pannulla.', 'Pidä kaikki ainekset valmiina ennen paistamista, sillä wokkaus on nopeaa.'],
  },
  'chicken-enchiladas': {
    active: 20,
    tips: ['Täytteen voi tehdä valmiiksi päivää aiemmin.', 'Tarjoa raikkaan salaatin ja kermaviilin kanssa.'],
  },
  'kofta-burgers': {
    active: 20,
    tips: ['Kostuta kädet, niin pihvit on helppo muotoilla.', 'Kofta-pihvit sopivat myös grilliin.'],
  },
  'chicken-mushroom-stew': {
    active: 20,
    tips: ['Reisifilee pysyy pitkässä haudutuksessa mehevämpänä kuin rintafilee.', 'Kantarelleilla tai suppilovahveroilla pata saa metsäisen maun.'],
  },
  'red-curry-soup': {
    active: 15,
    tips: ['Currytahnan määrällä säädät tulisuuden.', 'Purista lopuksi joukkoon limeä.'],
  },
  'feta-salad': {
    active: 10,
    tips: ['Paahda saksanpähkinät kuivalla pannulla, niin maku syvenee.', 'Salaatti on hyvä lounaseväs, kun kastike on erillisessä rasiassa.'],
  },
  'salmon-zucchini': {
    active: 20,
    tips: ['Paista lohi nahkapuoli alaspäin ja käännä vasta, kun nahka irtoaa pannusta.', 'Salsan voi tehdä tunnin etukäteen, jolloin maut ehtivät tasaantua.'],
    keep: 'Säilytä jääkaapissa 1–2 päivää.',
  },
  'chickpea-curry': {
    active: 15,
    tips: ['Kikherneen liemen voi käyttää kastikkeen sakeuttamiseen.', 'Curry pakastuu hyvin annoksina.'],
  },
  'chicken-noodle-soup': {
    active: 20,
    tips: ['Keitä nuudelit erikseen, jos keittoa jää tähteeksi: ne eivät pehmene liikaa.', 'Korianteri ja lime viimeistelevät keiton.'],
  },
  'beef-noodle-soup': {
    active: 20,
    tips: ['Leikkaa liha mahdollisimman ohuiksi siivuiksi, niin se kypsyy liemessä nopeasti.', 'Lisää lopuksi tuoretta chiliä ja kevätsipulia.'],
  },
  'shrimp-paella': {
    active: 25,
    level: 'medium',
    tips: ['Älä sekoita riisiä keittämisen aikana: pohjaan syntyy maukas rapea kerros.', 'Paellan voi tehdä myös kanalla.'],
    keep: 'Säilytä jääkaapissa enintään 1 päivä.',
  },
  'steak-potatoes': {
    active: 20,
    level: 'medium',
    tips: ['Ota pihvit huoneenlämpöön puoli tuntia ennen paistamista.', 'Anna pihvin levätä 5 minuuttia ennen leikkaamista.'],
  },
  'pea-soup': {
    active: 20,
    tips: ['Liota kuivatut herneet yön yli, niin ne kypsyvät nopeammin.', 'Hernekeitto pakastuu erinomaisesti.'],
  },
  'teriyaki-salmon': {
    active: 15,
    tips: ['Kastike karamellisoituu nopeasti: pidä lämpö keskitasolla.', 'Ripottele lopuksi seesaminsiemeniä ja kevätsipulia.'],
    keep: 'Säilytä jääkaapissa 1–2 päivää.',
  },
  'fish-tacos': {
    active: 20,
    tips: ['Kaalisalaatti on paras hetki ennen tarjoilua sekoitettuna.', 'Kalan voi myös paistaa uunissa 200 asteessa 12 minuuttia.'],
    keep: 'Säilytä kala ja kaalisalaatti erikseen jääkaapissa 1 päivä.',
  },
  'lentil-chili': {
    active: 15,
    tips: ['Chili maistuu vielä paremmalta seuraavana päivänä.', 'Tarjoa riisin, tortillan tai uuniperunan kanssa.'],
  },
  shakshuka: {
    active: 15,
    tips: ['Peitä pannu kannella, niin munat kypsyvät tasaisesti.', 'Jätä keltuaiset pehmeiksi ja dippaa leivällä.'],
    keep: 'Paras heti. Tomaattikastikkeen voi tehdä etukäteen ja säilyttää 3 päivää.',
  },
  falafel: {
    active: 25,
    level: 'medium',
    tips: ['Kuivaa kikherneet hyvin, niin pyörykät pysyvät koossa.', 'Falafelit voi paistaa myös uunissa öljyllä sivellen.'],
  },
  'fish-pie': {
    active: 25,
    tips: ['Pakastekala käy suoraan vuokaan: lisää paistoaikaa 10 minuuttia.', 'Ripottele pinnalle juustoraastetta rapeaksi kuoreksi.'],
  },
  'pumpkin-soup': {
    active: 15,
    tips: ['Paahda kurpitsa uunissa ennen keittämistä, niin maku syvenee.', 'Koristele paahdetuilla kurpitsansiemenillä.'],
  },
  'cabbage-soup': {
    active: 20,
    tips: ['Ruskista kaali kevyesti ennen keittämistä, niin maku makeutuu.', 'Kaalikeitto paranee seistessään.'],
  },
  'tomato-soup': {
    active: 15,
    tips: ['Soseuta keitto sauvasekoittimella sileäksi.', 'Juustoleivän voi paistaa uunissa tai pannulla.'],
  },
  dal: {
    active: 15,
    tips: ['Punaiset linssit eivät tarvitse liotusta.', 'Mausteöljy (tadka) lopuksi pinnalle tuo daaliin syvyyttä.'],
  },
  'tomato-egg-rice': {
    active: 15,
    tips: ['Kypsennä munat pehmeiksi ja yhdistä tomaattiin vasta lopuksi.', 'Helppo arkiruoka, joka valmistuu 15 minuutissa.'],
    keep: 'Paras heti. Säilytä tähteet jääkaapissa enintään 1 päivä.',
  },
  'shrimp-stir-fry': {
    active: 15,
    tips: ['Kuivaa katkaravut talouspaperilla, niin ne paistuvat eivätkä keity.', 'Wokin voi tarjota riisin tai nuudeleiden kanssa.'],
    keep: 'Paras heti. Säilytä tähteet jääkaapissa enintään 1 päivä.',
  },
  'mushroom-soup': {
    active: 15,
    tips: ['Paista sienet kuumalla pannulla ruskeiksi ennen nesteen lisäämistä.', 'Tilkka sitruunamehua lopuksi raikastaa keiton.'],
  },
  ramen: {
    active: 20,
    level: 'medium',
    tips: ['Keitä kananmunaa 6,5 minuuttia ja jäähdytä kylmässä vedessä, niin keltuainen jää pehmeäksi.', 'Liemen voi tehdä valmiiksi ja koota kulhot syödessä.'],
    keep: 'Säilytä liemi ja nuudelit erikseen jääkaapissa 2 päivää.',
  },
  'pork-goulash': {
    active: 20,
    tips: ['Ruskista liha pienissä erissä, niin se saa paahteisen pinnan.', 'Gulassi paranee seistessään ja pakastuu hyvin.'],
  },
  tonkatsu: {
    active: 25,
    level: 'medium',
    tips: ['Nuiji liha tasapaksuksi, niin se kypsyy tasaisesti.', 'Valuta paistetut palat ritilällä, niin pohja pysyy rapeana.'],
    heat: 'Kuumenna uunissa 200 asteessa noin 10 minuuttia, niin kuori pysyy rapeana.',
  },
  'spinach-cannelloni': {
    active: 30,
    level: 'medium',
    tips: ['Täytä cannellonit pursotinpussilla tai pakastepussilla, jonka kulma on leikattu.', 'Valmiiksi koottu vuoka säilyy jääkaapissa paistamattomana yön yli.'],
  },
  'tuna-salad': {
    active: 15,
    tips: ['Keitä perunat edellisenä päivänä, niin salaatti on hetkessä valmis.', 'Salaatti sopii hyvin lounaseväiksi.'],
    keep: 'Säilytä jääkaapissa kannellisessa rasiassa 1–2 päivää.',
  },
  'cabbage-rolls': {
    active: 40,
    level: 'hard',
    tips: ['Kiehauta kaalinpää kokonaisena, niin lehdet irtoavat ehjinä.', 'Valele kääryleitä siirappiliemellä paistamisen aikana.'],
  },
  borscht: {
    active: 20,
    tips: ['Punajuuri värjää: käytä kertakäyttökäsineitä kuoriessa.', 'Tarjoa smetanan tai kermaviilin ja tillin kanssa.'],
  },
};
