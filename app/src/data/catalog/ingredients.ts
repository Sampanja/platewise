import type {
  AisleCode,
  AllergenCode,
  AmountDisplay,
  Ingredient,
  IngredientTag,
} from '../types';

/**
 * Closed ingredient list for the UI phase: a stand-in for the `ingredients`
 * table with its Fineli link and base prices. Nutrition values are rounded
 * Fineli-like figures per 100 g; prices are plausible Finnish base prices
 * (Prisma level) in euros per kg.
 */

type Options = {
  a?: AllergenCode[];
  t?: IngredientTag[];
  pantry?: 'default' | 'eligible';
  /** [grams per piece, singular, plural] */
  piece?: [number, string, string];
  liquid?: boolean;
  packageLabel?: string;
};

function i(
  id: string,
  name: string,
  aisle: AisleCode,
  [kcal, proteinG, carbsG, fatG]: [number, number, number, number],
  eurPerKg: number,
  packageG: number,
  options: Options = {},
): Ingredient {
  const display: AmountDisplay = options.piece
    ? { kind: 'piece', grams: options.piece[0], one: options.piece[1], many: options.piece[2] }
    : options.liquid
      ? { kind: 'liquid' }
      : { kind: 'weight' };
  return {
    id,
    name,
    aisle,
    per100g: { kcal, proteinG, carbsG, fatG },
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

export const INGREDIENTS: readonly Ingredient[] = [
  // Hedelmät ja vihannekset
  i('onion', 'Sipuli', 'produce', [40, 1.1, 9, 0.1], 1.5, 1000, { piece: [80, 'sipuli', 'sipulia'] }),
  i('red-onion', 'Punasipuli', 'produce', [40, 1.1, 9, 0.1], 2.9, 500, {
    piece: [80, 'punasipuli', 'punasipulia'],
  }),
  i('garlic', 'Valkosipuli', 'produce', [149, 6.4, 33, 0.5], 9, 100, {
    piece: [5, 'valkosipulinkynsi', 'valkosipulinkynttä'],
    pantry: 'eligible',
  }),
  i('carrot', 'Porkkana', 'produce', [41, 0.9, 10, 0.2], 1.3, 1000, {
    piece: [70, 'porkkana', 'porkkanaa'],
  }),
  i('potato', 'Peruna', 'produce', [77, 2, 17, 0.1], 1.2, 2000),
  i('sweet-potato', 'Bataatti', 'produce', [86, 1.6, 20, 0.1], 3.9, 1000),
  i('tomato', 'Tomaatti', 'produce', [18, 0.9, 3.9, 0.2], 4.5, 500, {
    piece: [100, 'tomaatti', 'tomaattia'],
  }),
  i('cherry-tomato', 'Kirsikkatomaatti', 'produce', [18, 0.9, 3.9, 0.2], 9.6, 250),
  i('cucumber', 'Kurkku', 'produce', [15, 0.7, 3.6, 0.1], 3.4, 350, {
    piece: [350, 'kurkku', 'kurkkua'],
  }),
  i('bell-pepper', 'Paprika', 'produce', [31, 1, 6, 0.3], 6.5, 150, {
    piece: [150, 'paprika', 'paprikaa'],
  }),
  i('zucchini', 'Kesäkurpitsa', 'produce', [17, 1.2, 3.1, 0.3], 3.5, 300, {
    piece: [300, 'kesäkurpitsa', 'kesäkurpitsaa'],
  }),
  i('broccoli', 'Parsakaali', 'produce', [34, 2.8, 7, 0.4], 4.5, 400),
  i('cabbage', 'Valkokaali', 'produce', [25, 1.3, 6, 0.1], 1.4, 1000),
  i('leek', 'Purjo', 'produce', [61, 1.5, 14, 0.3], 4.5, 300),
  i('spinach', 'Babypinaatti', 'produce', [23, 2.9, 3.6, 0.4], 19.9, 100),
  i('salad-mix', 'Salaattisekoitus', 'produce', [17, 1.3, 3, 0.2], 18, 100),
  i('mushroom', 'Herkkusieni', 'produce', [22, 3.1, 3.3, 0.3], 8, 250),
  i('lemon', 'Sitruuna', 'produce', [29, 1.1, 9, 0.3], 4.5, 130, {
    piece: [130, 'sitruuna', 'sitruunaa'],
  }),
  i('lime', 'Lime', 'produce', [30, 0.7, 11, 0.2], 6, 70, { piece: [70, 'lime', 'limeä'] }),
  i('ginger', 'Inkivääri', 'produce', [80, 1.8, 18, 0.8], 6, 100),
  i('basil', 'Basilika', 'produce', [23, 3.2, 2.7, 0.6], 66, 30, HERB),
  i('coriander', 'Korianteri', 'produce', [23, 2.1, 3.7, 0.5], 66, 30, HERB),
  i('parsley', 'Persilja', 'produce', [36, 3, 6, 0.8], 66, 30, HERB),
  i('dill', 'Tilli', 'produce', [43, 3.5, 7, 1.1], 66, 30, HERB),
  i('spring-onion', 'Kevätsipuli', 'produce', [32, 1.8, 7, 0.2], 15, 100),
  i('chili', 'Chili', 'produce', [40, 2, 9, 0.4], 20, 50, { piece: [15, 'chili', 'chiliä'] }),
  i('avocado', 'Avokado', 'produce', [160, 2, 9, 15], 8, 300, {
    piece: [150, 'avokado', 'avokadoa'],
  }),
  i('beetroot', 'Punajuuri', 'produce', [43, 1.6, 10, 0.2], 1.9, 1000),
  i('pumpkin', 'Myskikurpitsa', 'produce', [45, 1, 12, 0.1], 2.9, 1000),

  // Leivät
  i('tortilla', 'Vehnätortilla', 'bread', [300, 8, 50, 7], 8, 320, {
    a: ['gluten'],
    piece: [40, 'tortilla', 'tortillaa'],
  }),
  i('pita', 'Pitaleipä', 'bread', [260, 9, 52, 1], 6, 300, {
    a: ['gluten'],
    piece: [75, 'pitaleipä', 'pitaleipää'],
  }),
  i('rye-bread', 'Ruisleipä', 'bread', [220, 7, 40, 2], 5, 500, {
    a: ['gluten'],
    piece: [35, 'ruisleipäviipale', 'ruisleipäviipaletta'],
  }),
  i('baguette', 'Patonki', 'bread', [260, 8, 52, 2], 5, 400, { a: ['gluten'] }),

  // Liha ja kana
  i('chicken-breast', 'Broilerin rintafilee', 'meat', [110, 23, 0, 1.7], 13.5, 400, {
    t: ['meat', 'poultry'],
  }),
  i('chicken-thigh', 'Broilerin reisifilee', 'meat', [160, 18, 0, 10], 11.5, 450, {
    t: ['meat', 'poultry'],
  }),
  i('minced-beef', 'Naudan jauheliha 10 %', 'meat', [170, 20, 0, 10], 10.5, 400, {
    t: ['meat', 'beef'],
  }),
  i('minced-mixed', 'Sika-nautajauheliha', 'meat', [220, 18, 0, 16], 7.9, 400, {
    t: ['meat', 'beef', 'pork'],
  }),
  i('beef-strips', 'Naudan suikale', 'meat', [130, 21, 0, 5], 22, 300, { t: ['meat', 'beef'] }),
  i('beef-steak', 'Naudan ulkofileepihvi', 'meat', [150, 22, 0, 7], 36, 300, {
    t: ['meat', 'beef'],
  }),
  i('pork-fillet', 'Porsaan ulkofilee', 'meat', [140, 21, 0, 6], 12.9, 400, {
    t: ['meat', 'pork'],
  }),
  i('pork-stew', 'Porsaan gulassipala', 'meat', [180, 19, 0, 11], 10.5, 500, {
    t: ['meat', 'pork'],
  }),
  i('bacon', 'Pekoni', 'meat', [300, 13, 1, 27], 14, 140, { t: ['meat', 'pork'] }),
  i('ham-cubes', 'Kinkkukuutio', 'meat', [110, 18, 1, 4], 13, 150, { t: ['meat', 'pork'] }),

  // Kala
  i('salmon', 'Lohifilee', 'fish', [200, 20, 0, 13], 22, 400, { a: ['fish'], t: ['fish'] }),

  // Maito, juusto ja munat
  i('milk', 'Kevytmaito', 'dairy', [46, 3.5, 4.9, 1.5], 1.05, 1000, {
    ...MILK_LACTOSE,
    liquid: true,
  }),
  i('cream', 'Ruokakerma 15 %', 'dairy', [160, 3, 4, 15], 6, 200, {
    ...MILK_LACTOSE,
    liquid: true,
  }),
  i('oat-cream', 'Kaurakerma', 'dairy', [150, 1, 6, 13], 7, 200, { a: ['gluten'], liquid: true }),
  i('butter', 'Voi', 'dairy', [740, 0.6, 0.6, 82], 12, 500, { ...MILK, pantry: 'eligible' }),
  i('cheese', 'Juustoraaste', 'dairy', [380, 28, 0, 30], 14, 150, MILK),
  i('parmesan', 'Parmesaani', 'dairy', [400, 35, 0, 29], 30, 100, MILK),
  i('feta', 'Fetajuusto', 'dairy', [260, 14, 1, 22], 14, 200, MILK),
  i('mozzarella', 'Mozzarella', 'dairy', [250, 18, 1, 19], 10, 125, MILK),
  i('halloumi', 'Halloumi', 'dairy', [320, 22, 2, 25], 16, 200, MILK),
  i('cottage-cheese', 'Raejuusto', 'dairy', [100, 12, 3, 4], 6.5, 200, MILK_LACTOSE),
  i('yogurt', 'Turkkilainen jogurtti', 'dairy', [120, 4, 4, 10], 5.5, 400, MILK_LACTOSE),
  i('creme-fraiche', 'Kermaviili', 'dairy', [160, 3, 4, 15], 6.5, 200, MILK_LACTOSE),
  i('eggs', 'Kananmuna', 'dairy', [140, 12.5, 0.4, 10], 5, 600, {
    a: ['egg'],
    t: ['egg'],
    piece: [60, 'kananmuna', 'kananmunaa'],
    packageLabel: '10 kpl',
  }),
  i('tofu', 'Tofu', 'dairy', [120, 12, 2, 7], 9.5, 270, { a: ['soy'] }),
  i('oat-mince', 'Nyhtökaura', 'dairy', [180, 25, 6, 6], 20, 250, { a: ['gluten'] }),

  // Pakasteet
  i('white-fish', 'Seitifilee (pakaste)', 'frozen', [75, 17, 0, 0.6], 9.5, 400, {
    a: ['fish'],
    t: ['fish'],
  }),
  i('shrimp', 'Katkarapu, kuorittu (pakaste)', 'frozen', [70, 16, 0, 1], 19, 200, {
    a: ['crustaceans'],
    t: ['seafood'],
  }),
  i('green-beans', 'Vihreä papu (pakaste)', 'frozen', [30, 2, 5, 0.2], 5, 400),
  i('peas', 'Herne (pakaste)', 'frozen', [80, 5, 13, 0.4], 4, 500),
  i('wok-veg', 'Wokkivihannekset (pakaste)', 'frozen', [35, 2, 6, 0.3], 4.5, 500),

  // Kuivatuotteet
  i('penne', 'Pennepasta', 'dry', [360, 12, 72, 1.5], 2.4, 500, { a: ['gluten'] }),
  i('spaghetti', 'Spagetti', 'dry', [360, 12, 72, 1.5], 2.2, 500, { a: ['gluten'] }),
  i('tagliatelle', 'Nauhapasta', 'dry', [370, 13, 70, 3], 4.5, 500, {
    a: ['gluten', 'egg'],
    t: ['egg'],
  }),
  i('lasagne-sheets', 'Lasagnelevy', 'dry', [360, 12, 72, 1.5], 5, 500, { a: ['gluten'] }),
  i('rice', 'Jasmiiniriisi', 'dry', [350, 7, 78, 0.6], 3.2, 1000, { pantry: 'eligible' }),
  i('egg-noodles', 'Munanuudeli', 'dry', [380, 13, 70, 4], 6.5, 250, {
    a: ['gluten', 'egg'],
    t: ['egg'],
  }),
  i('rice-noodles', 'Riisinuudeli', 'dry', [360, 6, 80, 0.6], 8, 250),
  i('bulgur', 'Bulgur', 'dry', [350, 12, 70, 1.5], 4, 500, { a: ['gluten'] }),
  i('red-lentils', 'Punainen linssi', 'dry', [340, 24, 50, 1.5], 4.2, 500),
  i('split-peas', 'Herne, kuivattu', 'dry', [340, 22, 55, 1.5], 3.2, 500),
  i('wheat-flour', 'Vehnäjauho', 'dry', [350, 11, 72, 1.5], 1.1, 2000, {
    a: ['gluten'],
    pantry: 'default',
  }),
  i('sugar', 'Sokeri', 'dry', [400, 0, 100, 0], 1.3, 1000, { pantry: 'default' }),
  i('breadcrumbs', 'Korppujauho', 'dry', [380, 12, 75, 3], 6, 200, {
    a: ['gluten'],
    pantry: 'eligible',
  }),
  i('walnuts', 'Saksanpähkinä', 'dry', [680, 15, 7, 65], 22, 200, { a: ['nuts'] }),
  i('peanuts', 'Maapähkinä', 'dry', [600, 26, 15, 50], 9, 300, { a: ['peanut'] }),
  i('sesame', 'Seesaminsiemen', 'dry', [600, 18, 10, 50], 12, 100, {
    a: ['sesame'],
    pantry: 'eligible',
  }),
  i('honey', 'Hunaja', 'dry', [330, 0.3, 82, 0], 12, 350, { t: ['honey'], pantry: 'eligible' }),

  // Säilykkeet
  i('coconut-milk', 'Kookosmaito', 'canned', [180, 1.6, 3, 18], 5, 400, { liquid: true }),
  i('crushed-tomatoes', 'Tomaattimurska', 'canned', [25, 1.2, 4, 0.2], 2.3, 390),
  i('tomato-paste', 'Tomaattipyree', 'canned', [90, 4.5, 15, 0.5], 9, 70, { pantry: 'eligible' }),
  i('chickpeas', 'Kikherne (säilyke)', 'canned', [120, 7, 15, 2.5], 3.5, 400),
  i('kidney-beans', 'Kidneypapu (säilyke)', 'canned', [100, 7, 14, 0.5], 3.5, 400),
  i('black-beans', 'Mustapapu (säilyke)', 'canned', [110, 7, 16, 0.5], 4, 400),
  i('corn', 'Maissi (säilyke)', 'canned', [80, 2.5, 15, 1.2], 4, 340),
  i('tuna', 'Tonnikala vedessä', 'canned', [110, 25, 0, 1], 14, 150, { a: ['fish'], t: ['fish'] }),
  i('salsa', 'Tacosalsa', 'canned', [40, 1.5, 8, 0.2], 8, 230),
  i('sauerkraut', 'Hapankaali', 'canned', [20, 1, 4, 0], 6, 500),
  i('lingonberry', 'Puolukkasurvos', 'canned', [150, 0.5, 35, 0.5], 8, 400),
  i('pesto', 'Basilikapesto', 'canned', [450, 5, 6, 45], 20, 190, {
    a: ['milk', 'nuts'],
    t: ['dairy'],
  }),
  i('red-curry-paste', 'Punainen currytahna', 'canned', [120, 2, 12, 7], 30, 110),

  // Mausteet, öljyt ja kastikkeet
  i('oil', 'Rypsiöljy', 'spices', [900, 0, 0, 100], 3.5, 1000, { liquid: true, pantry: 'default' }),
  i('olive-oil', 'Oliiviöljy', 'spices', [900, 0, 0, 100], 11, 500, {
    liquid: true,
    pantry: 'eligible',
  }),
  i('salt', 'Suola', 'spices', [0, 0, 0, 0], 0.6, 1000, { pantry: 'default' }),
  i('black-pepper', 'Mustapippuri', 'spices', [250, 10, 64, 3], 30, 50, { pantry: 'default' }),
  i('paprika-powder', 'Paprikajauhe', 'spices', [280, 14, 54, 13], 30, 50, { pantry: 'default' }),
  i('curry-powder', 'Curryjauhe', 'spices', [300, 12, 55, 14], 30, 50, { pantry: 'default' }),
  i('oregano', 'Oregano', 'spices', [265, 9, 69, 4], 40, 15, { pantry: 'default' }),
  i('cumin', 'Juustokumina', 'spices', [375, 18, 44, 22], 35, 40, { pantry: 'default' }),
  i('chili-flakes', 'Chilihiutale', 'spices', [300, 12, 50, 15], 35, 40, { pantry: 'default' }),
  i('garam-masala', 'Garam masala', 'spices', [380, 15, 45, 15], 35, 40, { pantry: 'eligible' }),
  i('taco-spice', 'Tacomauste', 'spices', [300, 8, 50, 5], 25, 40, { pantry: 'eligible' }),
  i('stock-cube', 'Kasvisliemikuutio', 'spices', [250, 8, 30, 12], 30, 72, {
    piece: [12, 'liemikuutio', 'liemikuutiota'],
    pantry: 'eligible',
  }),
  i('soy-sauce', 'Soijakastike', 'spices', [60, 8, 6, 0], 10, 150, {
    a: ['soy', 'gluten'],
    liquid: true,
    pantry: 'eligible',
  }),
  i('teriyaki', 'Teriyakikastike', 'spices', [120, 3, 25, 0], 12, 250, {
    a: ['soy', 'gluten'],
    liquid: true,
  }),
  i('sweet-chili', 'Makea chilikastike', 'spices', [200, 0.5, 50, 0.2], 8, 250, { liquid: true }),
  i('mustard', 'Sinappi', 'spices', [150, 6, 10, 10], 8, 275, {
    a: ['mustard'],
    pantry: 'eligible',
  }),
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
