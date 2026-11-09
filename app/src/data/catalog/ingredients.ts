import type { AisleCode, AllergenCode, AmountDisplay, Ingredient, IngredientTag } from '../types';

import { FINELI } from './fineli.generated';

/**
 * The closed ingredient list (stand-in for the `ingredients` table). Every
 * ingredient links to one Fineli food (THL, CC BY 4.0) by its FOODID, and
 * its nutrients per 100 g come only from that food (fineli.generated.ts,
 * built by scripts/fineli/build-ingredients.mjs). A few products Fineli does
 * not have (lime, spice mixes, bulgur…) link to the closest Fineli food;
 * `proxy` says which and why. Allergens and diet tags are set here by hand
 * and cross-checked against Fineli's special-diet flags in tests.
 * Prices are plausible Finnish base prices (Prisma level), euros per kg.
 */

type Options = {
  a?: AllergenCode[];
  t?: IngredientTag[];
  pantry?: 'default' | 'eligible';
  /** [grams per piece, singular, plural] */
  piece?: [number, string, string];
  liquid?: boolean;
  packageLabel?: string;
  /** The Fineli food is the closest match, not the product itself. */
  proxy?: string;
};

function i(
  id: string,
  name: string,
  aisle: AisleCode,
  fineliId: number,
  eurPerKg: number,
  packageG: number,
  options: Options = {},
): Ingredient {
  const food = FINELI[fineliId];
  if (!food) throw new Error(`Ingredient ${id}: Fineli food ${fineliId} missing from fineli.generated.ts`);
  const display: AmountDisplay = options.piece
    ? { kind: 'piece', grams: options.piece[0], one: options.piece[1], many: options.piece[2] }
    : options.liquid
      ? { kind: 'liquid' }
      : { kind: 'weight' };
  return {
    id,
    name,
    aisle,
    fineli: { id: fineliId, name: food.name, diets: food.diets, proxy: options.proxy },
    per100g: {
      kcal: food.kcal,
      proteinG: food.proteinG,
      carbsG: food.carbsG,
      fatG: food.fatG,
      fiberG: food.fiberG,
      sugarG: food.sugarG,
      saltG: food.saltG,
    },
    pricePerKgCents: Math.round(eurPerKg * 100),
    packageG,
    packageLabel: options.packageLabel,
    allergens: options.a ?? [],
    tags: options.t ?? [],
    pantry: options.pantry ?? 'no',
    display,
  };
}

const MILK: Options = { a: ['milk'], t: ['dairy'] };
const MILK_LACTOSE: Options = { a: ['milk'], t: ['dairy', 'lactose'] };
const HERB: Options = { packageLabel: '1 ruukku' };
const FISH: Options = { a: ['fish'], t: ['fish'] };
const SPICE: Options = { pantry: 'default' };

export const INGREDIENTS: readonly Ingredient[] = [
  // Hedelmät, vihannekset ja yrtit
  i('onion', 'Sipuli', 'produce', 335, 1.5, 1000, { piece: [80, 'sipuli', 'sipulia'] }),
  i('red-onion', 'Punasipuli', 'produce', 34234, 2.9, 500, { piece: [80, 'punasipuli', 'punasipulia'] }),
  i('garlic', 'Valkosipuli', 'produce', 393, 9, 100, {
    piece: [5, 'valkosipulinkynsi', 'valkosipulinkynttä'],
    pantry: 'eligible',
  }),
  i('carrot', 'Porkkana', 'produce', 300, 1.3, 1000, { piece: [70, 'porkkana', 'porkkanaa'] }),
  i('potato', 'Peruna', 'produce', 205, 1.2, 2000),
  i('new-potato', 'Uusi peruna', 'produce', 204, 3.5, 1000),
  i('sweet-potato', 'Bataatti', 'produce', 30223, 3.9, 1000),
  i('tomato', 'Tomaatti', 'produce', 352, 4.5, 500, { piece: [100, 'tomaatti', 'tomaattia'] }),
  i('cherry-tomato', 'Kirsikkatomaatti', 'produce', 352, 9.6, 250),
  i('cucumber', 'Kurkku', 'produce', 346, 3.4, 350, { piece: [350, 'kurkku', 'kurkkua'] }),
  i('bell-pepper', 'Paprika', 'produce', 386, 6.5, 150, { piece: [150, 'paprika', 'paprikaa'] }),
  i('zucchini', 'Kesäkurpitsa', 'produce', 389, 3.5, 300, { piece: [300, 'kesäkurpitsa', 'kesäkurpitsaa'] }),
  i('eggplant', 'Munakoiso', 'produce', 362, 4.5, 300, { piece: [300, 'munakoiso', 'munakoisoa'] }),
  i('broccoli', 'Parsakaali', 'produce', 324, 4.5, 400),
  i('cauliflower', 'Kukkakaali', 'produce', 322, 3.9, 600),
  i('cabbage', 'Valkokaali', 'produce', 320, 1.4, 1000),
  i('kale', 'Lehtikaali', 'produce', 326, 12, 150),
  i('brussels-sprouts', 'Ruusukaali', 'produce', 327, 6, 400),
  i('leek', 'Purjo', 'produce', 337, 4.5, 300),
  i('spinach', 'Babypinaatti', 'produce', 360, 19.9, 100, {
    proxy: 'Fineli has no raw spinach; chard (mangoldi) is the closest leafy green.',
  }),
  i('salad-mix', 'Salaattisekoitus', 'produce', 330, 18, 100),
  i('iceberg', 'Jäävuorisalaatti', 'produce', 331, 4.5, 300),
  i('mushroom', 'Herkkusieni', 'produce', 345, 8, 250),
  i('chanterelle', 'Kantarelli', 'produce', 367, 25, 200),
  i('forest-mushroom', 'Metsäsieni (tatti, suppilovahvero)', 'frozen', 342, 14, 250),
  i('lemon', 'Sitruuna', 'produce', 11048, 4.5, 130, { piece: [130, 'sitruuna', 'sitruunaa'] }),
  i('lime', 'Lime', 'produce', 11048, 6, 70, {
    piece: [70, 'lime', 'limeä'],
    proxy: 'Fineli has no lime; lemon is the closest citrus.',
  }),
  i('orange', 'Appelsiini', 'produce', 11045, 2.5, 1000, { piece: [180, 'appelsiini', 'appelsiinia'] }),
  i('apple', 'Omena', 'produce', 11060, 2.9, 1000, { piece: [150, 'omena', 'omenaa'] }),
  i('ginger', 'Inkivääri', 'produce', 33023, 6, 100),
  i('basil', 'Basilika', 'produce', 11134, 66, 30, HERB),
  i('coriander', 'Korianteri', 'produce', 34238, 66, 30, HERB),
  i('parsley', 'Persilja', 'produce', 333, 66, 30, HERB),
  i('dill', 'Tilli', 'produce', 369, 66, 30, HERB),
  i('chives', 'Ruohosipuli', 'produce', 392, 66, 30, HERB),
  i('spring-onion', 'Kevätsipuli', 'produce', 337, 15, 100, {
    proxy: 'Fineli has no spring onion; leek is the closest allium.',
  }),
  i('chili', 'Chili', 'produce', 31557, 20, 50, { piece: [15, 'chili', 'chiliä'] }),
  i('avocado', 'Avokado', 'produce', 11057, 8, 300, { piece: [150, 'avokado', 'avokadoa'] }),
  i('beetroot', 'Punajuuri', 'produce', 305, 1.9, 1000),
  i('swede', 'Lanttu', 'produce', 303, 1.9, 1000),
  i('turnip', 'Nauris', 'produce', 304, 4, 500),
  i('parsnip', 'Palsternakka', 'produce', 309, 3.9, 500),
  i('celeriac', 'Juuriselleri', 'produce', 311, 3.5, 600, { a: ['celery'] }),
  i('pumpkin', 'Myskikurpitsa', 'produce', 350, 2.9, 1000),
  i('radish', 'Retiisi', 'produce', 308, 8, 200),
  i('sugar-snap', 'Sokeriherne', 'produce', 34244, 16, 150),
  i('blueberry', 'Mustikka', 'frozen', 442, 9, 250),
  i('lingonberry-fresh', 'Puolukka', 'frozen', 440, 7, 250),
  i('strawberry', 'Mansikka', 'frozen', 447, 7, 250),

  // Leivät ja taikinat
  i('tortilla', 'Vehnätortilla', 'bread', 30186, 8, 320, { a: ['gluten'], piece: [40, 'tortilla', 'tortillaa'] }),
  i('corn-tortilla', 'Maissitortilla (gluteeniton)', 'bread', 35554, 10, 300, {
    piece: [30, 'maissitortilla', 'maissitortillaa'],
  }),
  i('pita', 'Pitaleipä', 'bread', 1056, 6, 300, { a: ['gluten'], piece: [75, 'pitaleipä', 'pitaleipää'] }),
  i('rye-bread', 'Ruisleipä', 'bread', 1009, 5, 500, {
    a: ['gluten'],
    piece: [35, 'ruisleipäviipale', 'ruisleipäviipaletta'],
  }),
  i('baguette', 'Patonki', 'bread', 1309, 5, 400, { a: ['gluten'] }),
  i('puff-pastry', 'Voitaikina (pakaste)', 'frozen', 31672, 6, 500, { a: ['gluten', 'milk'], t: ['dairy'] }),

  // Liha ja kana
  i('chicken-breast', 'Broilerin rintafilee', 'meat', 11565, 13.5, 400, { t: ['meat', 'poultry'] }),
  i('chicken-thigh', 'Broilerin reisifilee', 'meat', 30792, 11.5, 450, { t: ['meat', 'poultry'] }),
  i('chicken-strips', 'Broilerin suikale', 'meat', 754, 11.9, 400, { t: ['meat', 'poultry'] }),
  i('chicken-mince', 'Broilerin jauheliha', 'meat', 28930, 9.5, 400, { t: ['meat', 'poultry'] }),
  i('whole-chicken-legs', 'Broilerin koipireisi', 'meat', 11563, 5.5, 1000, { t: ['meat', 'poultry'] }),
  i('turkey-breast', 'Kalkkunan rintafilee', 'meat', 11551, 17, 400, { t: ['meat', 'poultry'] }),
  i('minced-beef', 'Naudan jauheliha 7 %', 'meat', 712, 10.5, 400, { t: ['meat', 'beef'] }),
  i('minced-beef-17', 'Naudan jauheliha 17 %', 'meat', 11562, 8.9, 400, { t: ['meat', 'beef'] }),
  i('minced-mixed', 'Sika-nautajauheliha', 'meat', 711, 7.9, 400, { t: ['meat', 'beef', 'pork'] }),
  i('minced-pork', 'Porsaan jauheliha', 'meat', 28946, 7.5, 400, { t: ['meat', 'pork'] }),
  i('beef-strips', 'Naudan suikale', 'meat', 31145, 22, 300, {
    t: ['meat', 'beef'],
    proxy: 'Raw beef strips; Fineli lists them as marinated, the closest raw strip.',
  }),
  i('beef-stew', 'Naudan paistipala', 'meat', 718, 16, 500, { t: ['meat', 'beef'] }),
  i('beef-steak', 'Naudan ulkofileepihvi', 'meat', 722, 36, 300, { t: ['meat', 'beef'] }),
  i('lamb', 'Lampaanliha (paisti)', 'meat', 732, 22, 500, { t: ['meat'] }),
  i('pork-fillet', 'Porsaan ulkofilee', 'meat', 34188, 12.9, 400, { t: ['meat', 'pork'] }),
  i('pork-stew', 'Porsaan gulassipala', 'meat', 713, 10.5, 500, { t: ['meat', 'pork'] }),
  i('pork-roast', 'Porsaanpaisti', 'meat', 7083, 9.9, 800, { t: ['meat', 'pork'] }),
  i('bacon', 'Pekoni', 'meat', 707, 14, 140, { t: ['meat', 'pork'] }),
  i('ham-cubes', 'Kinkkukuutio', 'meat', 779, 13, 150, { t: ['meat', 'pork'] }),
  i('frankfurter', 'Nakki', 'meat', 7600, 7, 300, {
    t: ['meat', 'pork'],
    proxy: 'Fineli has boiled frankfurters; boiling hardly changes the nutrients.',
  }),
  i('grill-sausage', 'Grillimakkara', 'meat', 7189, 7.5, 400, {
    // Many Finnish sausages contain milk protein, lactose and soy.
    a: ['milk', 'soy'],
    t: ['meat', 'pork', 'dairy', 'lactose'],
  }),

  // Kala ja äyriäiset
  i('salmon', 'Lohifilee', 'fish', 871, 22, 400, FISH),
  i('cold-smoked-salmon', 'Kylmäsavulohi', 'fish', 33420, 35, 150, FISH),
  i('rainbow-trout', 'Kirjolohifilee', 'fish', 848, 19, 400, FISH),
  i('baltic-herring', 'Silakkafilee', 'fish', 800, 9, 400, FISH),
  i('vendace', 'Muikku', 'fish', 809, 10, 400, FISH),
  i('white-fish', 'Seitifilee (pakaste)', 'frozen', 826, 9.5, 400, FISH),
  i('fish-sticks', 'Kalapuikko (pakaste)', 'frozen', 32217, 9, 450, { a: ['fish', 'gluten'], t: ['fish'] }),
  i('shrimp', 'Katkarapu, kuorittu (pakaste)', 'frozen', 835, 19, 200, { a: ['crustaceans'], t: ['seafood'] }),
  i('mussels', 'Sinisimpukka (säilyke)', 'canned', 834, 14, 250, { a: ['molluscs'], t: ['seafood'] }),
  i('tuna', 'Tonnikala vedessä', 'canned', 862, 14, 150, FISH),

  // Maito, juusto ja munat
  i('milk', 'Kevytmaito', 'dairy', 684, 1.05, 1000, { ...MILK_LACTOSE, liquid: true }),
  i('milk-lactose-free', 'Laktoositon kevytmaitojuoma', 'dairy', 29064, 1.45, 1000, { ...MILK, liquid: true }),
  i('cream', 'Ruokakerma 15 %', 'dairy', 632, 6, 200, {
    ...MILK_LACTOSE,
    liquid: true,
    proxy: 'Fineli lists cooking cream at 19 % fat; the closest to 15 % cooking cream.',
  }),
  i('whipping-cream', 'Vispikerma', 'dairy', 629, 7, 200, { ...MILK_LACTOSE, liquid: true }),
  i('oat-cream', 'Kaurakerma', 'dairy', 30211, 7, 200, { a: ['gluten'], liquid: true }),
  i('soy-cream', 'Soijakerma', 'dairy', 31231, 7, 200, { a: ['soy'], liquid: true }),
  i('oat-drink', 'Kaurajuoma', 'dairy', 33596, 1.9, 1000, { a: ['gluten'], liquid: true }),
  i('butter', 'Voi', 'dairy', 576, 12, 500, { ...MILK_LACTOSE, pantry: 'eligible' }),
  i('cheese', 'Juustoraaste', 'dairy', 643, 14, 150, MILK),
  i('cheddar', 'Cheddar', 'dairy', 698, 18, 200, MILK),
  i('parmesan', 'Parmesaani', 'dairy', 691, 30, 100, {
    ...MILK,
    proxy: 'Fineli has no Parmesan; Emmental/Gruyère is the closest hard cheese.',
  }),
  i('feta', 'Fetajuusto', 'dairy', 11211, 14, 200, MILK_LACTOSE),
  i('salad-cheese', 'Salaattijuusto', 'dairy', 690, 10, 200, MILK_LACTOSE),
  i('mozzarella', 'Mozzarella', 'dairy', 29239, 10, 125, MILK_LACTOSE),
  i('halloumi', 'Halloumi', 'dairy', 33465, 16, 200, MILK_LACTOSE),
  i('goat-cheese', 'Vuohenjuusto', 'dairy', 32925, 28, 150, MILK),
  i('blue-cheese', 'Sinihomejuusto', 'dairy', 653, 20, 150, MILK),
  i('bread-cheese', 'Leipäjuusto', 'dairy', 657, 16, 300, MILK_LACTOSE),
  i('cream-cheese', 'Tuorejuusto', 'dairy', 650, 12, 200, MILK_LACTOSE),
  i('cottage-cheese', 'Raejuusto', 'dairy', 649, 6.5, 200, MILK_LACTOSE),
  i('quark', 'Maitorahka', 'dairy', 622, 4.5, 250, MILK_LACTOSE),
  i('yogurt', 'Turkkilainen jogurtti', 'dairy', 32201, 5.5, 400, MILK_LACTOSE),
  i('creme-fraiche', 'Kermaviili', 'dairy', 615, 6.5, 200, MILK_LACTOSE),
  i('eggs', 'Kananmuna', 'dairy', 858, 5, 600, {
    a: ['egg'],
    t: ['egg'],
    piece: [60, 'kananmuna', 'kananmunaa'],
    packageLabel: '10 kpl',
  }),

  // Kasviproteiinit
  i('tofu', 'Tofu', 'dairy', 33501, 9.5, 270, { a: ['soy'] }),
  i('tempeh', 'Tempeh', 'dairy', 31249, 22, 200, { a: ['soy'] }),
  i('oat-mince', 'Nyhtökaura', 'dairy', 34909, 20, 250, { a: ['gluten'] }),
  i('fava-mince', 'Härkis (härkäpapurouhe)', 'dairy', 34893, 16, 250, { a: ['gluten'] }),
  i('soy-mince', 'Soijarouhe', 'dry', 33499, 9, 200, { a: ['soy'] }),

  // Pakasteet
  i('green-beans', 'Vihreä papu (pakaste)', 'frozen', 372, 5, 400),
  i('peas', 'Herne (pakaste)', 'frozen', 370, 4, 500),
  i('wok-veg', 'Wokkivihannekset (pakaste)', 'frozen', 29048, 4.5, 500),
  i('soup-veg', 'Keittojuurekset (pakaste)', 'frozen', 313, 3, 500, { a: ['celery'] }),
  i('fava-beans', 'Härkäpapu (pakaste)', 'frozen', 34243, 6, 400),
  i('corn-frozen', 'Maissi (pakaste)', 'frozen', 363, 4, 400),

  // Kuivatuotteet
  i('penne', 'Pennepasta', 'dry', 121, 2.4, 500, { a: ['gluten'] }),
  i('spaghetti', 'Spagetti', 'dry', 121, 2.2, 500, { a: ['gluten'] }),
  i('macaroni', 'Makaroni', 'dry', 117, 2, 400, { a: ['gluten'] }),
  i('wholegrain-pasta', 'Täysjyväpasta', 'dry', 119, 3, 500, { a: ['gluten'] }),
  i('gluten-free-pasta', 'Gluteeniton pasta', 'dry', 33632, 6, 400),
  i('tagliatelle', 'Nauhapasta', 'dry', 172, 4.5, 500, {
    a: ['gluten', 'egg'],
    t: ['egg'],
    proxy: 'Fineli has no plain egg pasta; spinach egg pasta has nearly the same nutrients.',
  }),
  i('lasagne-sheets', 'Lasagnelevy', 'dry', 121, 5, 500, { a: ['gluten'] }),
  i('rice', 'Jasmiiniriisi', 'dry', 11521, 3.2, 1000, { pantry: 'eligible' }),
  i('brown-rice', 'Täysjyväriisi', 'dry', 28910, 3.9, 1000),
  i('porridge-rice', 'Puuroriisi', 'dry', 156, 2.5, 1000),
  i('egg-noodles', 'Munanuudeli', 'dry', 120, 6.5, 250, {
    a: ['gluten', 'egg'],
    t: ['egg'],
    proxy: 'Fineli has wheat noodles without egg; egg noodles have nearly the same nutrients.',
  }),
  i('rice-noodles', 'Riisinuudeli', 'dry', 29055, 8, 250),
  i('bulgur', 'Bulgur', 'dry', 29208, 4, 500, {
    a: ['gluten'],
    proxy: 'Fineli has no bulgur; couscous is the closest wheat grain.',
  }),
  i('couscous', 'Kuskus', 'dry', 29208, 4, 500, { a: ['gluten'] }),
  i('quinoa', 'Kvinoa', 'dry', 31175, 9, 400),
  i('barley', 'Ohrasuurimo', 'dry', 151, 2.5, 1000, { a: ['gluten'] }),
  i('buckwheat', 'Tattarisuurimo', 'dry', 161, 5, 500),
  i('oats', 'Kaurahiutale', 'dry', 153, 1.5, 1000, { a: ['gluten'], pantry: 'eligible' }),
  i('red-lentils', 'Punainen linssi', 'dry', 31219, 4.2, 500),
  i('green-lentils', 'Vihreä linssi', 'dry', 399, 5, 500),
  i('split-peas', 'Herne, kuivattu', 'dry', 371, 3.2, 500),
  i('wheat-flour', 'Vehnäjauho', 'dry', 110, 1.1, 2000, { a: ['gluten'], pantry: 'default' }),
  i('rye-flour', 'Ruisjauho', 'dry', 100, 1.8, 1000, { a: ['gluten'] }),
  i('cornstarch', 'Maissitärkkelys', 'dry', 27, 4, 400, { pantry: 'eligible' }),
  i('sugar', 'Sokeri', 'dry', 1, 1.3, 1000, { pantry: 'default' }),
  i('syrup', 'Siirappi', 'dry', 3, 4, 500, { pantry: 'eligible' }),
  i('breadcrumbs', 'Korppujauho', 'dry', 126, 6, 200, { a: ['gluten'], pantry: 'eligible' }),
  i('gf-breadcrumbs', 'Gluteeniton korppujauho', 'dry', 31692, 12, 200),
  i('walnuts', 'Saksanpähkinä', 'dry', 376, 22, 200, { a: ['nuts'] }),
  i('cashews', 'Cashewpähkinä', 'dry', 11086, 20, 200, { a: ['nuts'] }),
  i('almonds', 'Manteli', 'dry', 379, 18, 200, { a: ['nuts'] }),
  i('peanuts', 'Maapähkinä', 'dry', 378, 9, 300, { a: ['peanut'] }),
  i('peanut-butter', 'Maapähkinävoi', 'dry', 34667, 10, 350, { a: ['peanut'] }),
  i('sesame', 'Seesaminsiemen', 'dry', 385, 12, 100, { a: ['sesame'], pantry: 'eligible' }),
  i('tahini', 'Tahini', 'dry', 11087, 16, 300, { a: ['sesame'] }),
  i('sunflower-seeds', 'Auringonkukansiemen', 'dry', 11212, 6, 300),
  i('pumpkin-seeds', 'Kurpitsansiemen', 'dry', 31211, 14, 200),
  i('raisins', 'Rusina', 'dry', 428, 7, 250),
  i('honey', 'Hunaja', 'dry', 4, 12, 350, { t: ['honey'], pantry: 'eligible' }),
  i('coconut-flakes', 'Kookoshiutale', 'dry', 382, 9, 200),

  // Säilykkeet ja kastikkeet
  i('coconut-milk', 'Kookosmaito', 'canned', 29014, 5, 400, { liquid: true }),
  i('crushed-tomatoes', 'Tomaattimurska', 'canned', 398, 2.3, 390),
  i('tomato-paste', 'Tomaattipyree', 'canned', 354, 9, 70, { pantry: 'eligible' }),
  i('sun-dried-tomatoes', 'Aurinkokuivattu tomaatti', 'canned', 30444, 20, 280),
  i('roasted-pepper', 'Paahdettu paprika (säilyke)', 'canned', 33494, 9, 300),
  i('chickpeas', 'Kikherne (säilyke)', 'canned', 11089, 3.5, 400),
  i('kidney-beans', 'Kidneypapu (säilyke)', 'canned', 31214, 3.5, 400),
  i('white-beans', 'Valkoinen papu (säilyke)', 'canned', 373, 3.5, 400, {
    proxy: 'Fineli lists dried white beans; recipes use drained canned beans at about a third of the dried weight.',
  }),
  i('black-beans', 'Mustapapu (säilyke)', 'canned', 35638, 4, 400),
  i('corn', 'Maissi (säilyke)', 'canned', 363, 4, 340),
  i('olives', 'Oliivi', 'canned', 34972, 12, 200),
  i('pickles', 'Maustekurkku', 'canned', 348, 6, 400),
  i('pickled-beetroot', 'Etikkapunajuuri', 'canned', 307, 5, 500),
  i('salsa', 'Tacosalsa', 'canned', 33207, 8, 230),
  i('sauerkraut', 'Hapankaali', 'canned', 3204, 6, 500),
  i('lingonberry', 'Puolukkasurvos', 'canned', 4403, 8, 400, {
    proxy: 'Fineli has sugared blueberry purée but not lingonberry; the sugared berry purée is the closest.',
  }),
  i('pesto', 'Basilikapesto', 'canned', 3323, 20, 190, { a: ['milk', 'nuts'], t: ['dairy', 'lactose'] }),
  i('red-curry-paste', 'Currytahna (kasvis)', 'canned', 33021, 30, 110),
  i('ketchup', 'Ketsuppi', 'canned', 353, 4, 500, { pantry: 'eligible' }),
  i('mayonnaise', 'Majoneesi', 'canned', 578, 7, 300, { a: ['egg', 'mustard'], t: ['egg'] }),

  // Mausteet, öljyt ja liemet
  i('oil', 'Rypsiöljy', 'spices', 535, 3.5, 1000, { liquid: true, pantry: 'default' }),
  i('olive-oil', 'Oliiviöljy', 'spices', 536, 11, 500, { liquid: true, pantry: 'eligible' }),
  i('vinegar', 'Viinietikka', 'spices', 929, 5, 500, { liquid: true, pantry: 'eligible' }),
  i('salt', 'Suola', 'spices', 30, 0.6, 1000, SPICE),
  i('black-pepper', 'Mustapippuri', 'spices', 11177, 30, 50, SPICE),
  i('paprika-powder', 'Paprikajauhe', 'spices', 11182, 30, 50, SPICE),
  i('curry-powder', 'Curryjauhe', 'spices', 11182, 30, 50, {
    ...SPICE,
    proxy: 'Fineli has no curry powder; paprika powder is the closest ground spice.',
  }),
  i('oregano', 'Oregano', 'spices', 11191, 40, 15, SPICE),
  i('dried-basil', 'Basilika, kuivattu', 'spices', 33433, 40, 15, { pantry: 'eligible' }),
  i('cumin', 'Juustokumina', 'spices', 11182, 35, 40, {
    ...SPICE,
    proxy: 'Fineli has no cumin; paprika powder is the closest ground spice.',
  }),
  i('chili-flakes', 'Chilihiutale', 'spices', 11182, 35, 40, {
    ...SPICE,
    proxy: 'Fineli has no chili flakes; paprika powder is the closest ground spice.',
  }),
  i('garam-masala', 'Garam masala', 'spices', 11182, 35, 40, {
    pantry: 'eligible',
    proxy: 'Fineli has no garam masala; paprika powder is the closest ground spice.',
  }),
  i('taco-spice', 'Tacomauste', 'spices', 11182, 25, 40, {
    pantry: 'eligible',
    proxy: 'Fineli has no taco spice mix; paprika powder is the closest ground spice.',
  }),
  i('cinnamon', 'Kaneli', 'spices', 11184, 30, 40, { pantry: 'eligible' }),
  i('allspice', 'Maustepippuri', 'spices', 11177, 30, 40, {
    pantry: 'eligible',
    proxy: 'Fineli has no allspice; black pepper is the closest whole spice.',
  }),
  i('stock-cube', 'Kasvisliemikuutio', 'spices', 29008, 30, 72, {
    a: ['celery'],
    piece: [12, 'liemikuutio', 'liemikuutiota'],
    pantry: 'eligible',
  }),
  i('chicken-stock-cube', 'Kanaliemikuutio', 'spices', 29009, 30, 72, {
    a: ['gluten', 'celery'],
    t: ['meat', 'poultry'],
    piece: [12, 'liemikuutio', 'liemikuutiota'],
  }),
  i('fish-stock-cube', 'Kalaliemikuutio', 'spices', 29010, 30, 72, {
    a: ['fish', 'celery'],
    t: ['fish'],
    piece: [12, 'liemikuutio', 'liemikuutiota'],
  }),
  i('beef-stock', 'Lihaliemitiiviste', 'spices', 38, 30, 100, {
    a: ['celery'],
    t: ['meat', 'beef'],
    liquid: true,
  }),
  i('soy-sauce', 'Soijakastike', 'spices', 31, 10, 150, { a: ['soy', 'gluten'], liquid: true, pantry: 'eligible' }),
  i('teriyaki', 'Teriyakikastike', 'spices', 31, 12, 250, {
    a: ['soy', 'gluten'],
    liquid: true,
    proxy: 'Fineli has no teriyaki sauce; soy sauce is its base.',
  }),
  i('sweet-chili', 'Makea chilikastike', 'spices', 33020, 8, 250, { liquid: true }),
  i('mustard', 'Sinappi', 'spices', 28, 8, 275, { a: ['mustard', 'gluten'], pantry: 'eligible' }),
];

export const INGREDIENTS_BY_ID: Readonly<Record<string, Ingredient>> = Object.fromEntries(
  INGREDIENTS.map((ingredient) => [ingredient.id, ingredient]),
);

/** Ingredients every new profile has at home (`is_default_pantry`). */
export const DEFAULT_PANTRY: readonly string[] = INGREDIENTS.filter(
  (ingredient) => ingredient.pantry === 'default',
).map((ingredient) => ingredient.id);

/** Ingredients the user may mark as pantry staples (`pantry_eligible`). */
export const PANTRY_ELIGIBLE: readonly Ingredient[] = INGREDIENTS.filter(
  (ingredient) => ingredient.pantry !== 'no',
);
