import type { AisleCode, AllergenCode, AmountDisplay, Ingredient, IngredientTag } from '../types';

import { FINELI } from './fineli.generated';
import { ingredientText } from './text';

/**
 * The closed ingredient list (stand-in for the `ingredients` table). Every
 * ingredient links to one Fineli food (THL, CC BY 4.0) by its FOODID, and
 * its nutrients per 100 g come only from that food (fineli.generated.ts,
 * built by scripts/fineli/build-ingredients.mjs). A few products Fineli does
 * not have (lime, spice mixes, bulgur…) link to the closest Fineli food;
 * `proxy` says which and why. Allergens and diet tags are set here by hand
 * and cross-checked against Fineli's special-diet flags in tests.
 * Prices are plausible Finnish average prices, euros per kg; other price
 * regions are derived from them (domain/priceRegion.ts). Names, piece names
 * and package labels are text in every language (text/<lang>/ingredients.ts):
 * they are read through getters, so the same object follows the UI language.
 */

type Options = {
  a?: AllergenCode[];
  t?: IngredientTag[];
  pantry?: 'default' | 'eligible';
  /** Grams per piece; the piece names are text. */
  piece?: number;
  liquid?: boolean;
  /** The Fineli food is the closest match, not the product itself. */
  proxy?: string;
};

function i(
  id: string,
  aisle: AisleCode,
  fineliId: number,
  eurPerKg: number,
  packageG: number,
  options: Options = {},
): Ingredient {
  const food = FINELI[fineliId];
  if (!food) throw new Error(`Ingredient ${id}: Fineli food ${fineliId} missing from fineli.generated.ts`);
  const display: AmountDisplay = options.piece
    ? Object.defineProperties({ kind: 'piece', grams: options.piece } as AmountDisplay, {
        one: { get: () => ingredientText(id).one ?? ingredientText(id).name, enumerable: true },
        many: { get: () => ingredientText(id).many ?? ingredientText(id).name, enumerable: true },
      })
    : options.liquid
      ? { kind: 'liquid' }
      : { kind: 'weight' };
  // The text fields (name, packageLabel) are added as getters below.
  return Object.defineProperties(
    {
    id,
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
    allergens: options.a ?? [],
    tags: options.t ?? [],
    pantry: options.pantry ?? 'no',
    display,
    } as unknown as Ingredient,
    {
      name: { get: () => ingredientText(id).name, enumerable: true },
      packageLabel: { get: () => ingredientText(id).packageLabel, enumerable: true },
    },
  );
}

const MILK: Options = { a: ['milk'], t: ['dairy'] };
const MILK_LACTOSE: Options = { a: ['milk'], t: ['dairy', 'lactose'] };
/** Fresh herbs sold in a pot: the package label ("1 ruukku") is text. */
const HERB: Options = {};
const FISH: Options = { a: ['fish'], t: ['fish'] };
const SPICE: Options = { pantry: 'default' };

export const INGREDIENTS: readonly Ingredient[] = [
  // Hedelmät, vihannekset ja yrtit
  i('onion', 'produce', 335, 1.5, 1000, { piece: 80 }),
  i('red-onion', 'produce', 34234, 2.9, 500, { piece: 80 }),
  i('garlic', 'produce', 393, 9, 100, {
    piece: 5,
    pantry: 'eligible',
  }),
  i('carrot', 'produce', 300, 1.3, 1000, { piece: 70 }),
  i('potato', 'produce', 205, 1.2, 2000),
  i('new-potato', 'produce', 204, 3.5, 1000),
  i('sweet-potato', 'produce', 30223, 3.9, 1000),
  i('tomato', 'produce', 352, 4.5, 500, { piece: 100 }),
  i('cherry-tomato', 'produce', 352, 9.6, 250),
  i('cucumber', 'produce', 346, 3.4, 350, { piece: 350 }),
  i('bell-pepper', 'produce', 386, 6.5, 150, { piece: 150 }),
  i('zucchini', 'produce', 389, 3.5, 300, { piece: 300 }),
  i('eggplant', 'produce', 362, 4.5, 300, { piece: 300 }),
  i('broccoli', 'produce', 324, 4.5, 400),
  i('cauliflower', 'produce', 322, 3.9, 600),
  i('cabbage', 'produce', 320, 1.4, 1000),
  i('kale', 'produce', 326, 12, 150),
  i('brussels-sprouts', 'produce', 327, 6, 400),
  i('leek', 'produce', 337, 4.5, 300),
  i('spinach', 'produce', 360, 19.9, 100, {
    proxy: 'Fineli has no raw spinach; chard (mangoldi) is the closest leafy green.',
  }),
  i('salad-mix', 'produce', 330, 18, 100),
  i('iceberg', 'produce', 331, 4.5, 300),
  i('mushroom', 'produce', 345, 8, 250),
  i('chanterelle', 'produce', 367, 25, 200),
  i('forest-mushroom', 'frozen', 342, 14, 250),
  i('lemon', 'produce', 11048, 4.5, 130, { piece: 130 }),
  i('lime', 'produce', 11048, 6, 70, {
    piece: 70,
    proxy: 'Fineli has no lime; lemon is the closest citrus.',
  }),
  i('orange', 'produce', 11045, 2.5, 1000, { piece: 180 }),
  i('apple', 'produce', 11060, 2.9, 1000, { piece: 150 }),
  i('ginger', 'produce', 33023, 6, 100),
  i('basil', 'produce', 11134, 66, 30, HERB),
  i('coriander', 'produce', 34238, 66, 30, HERB),
  i('parsley', 'produce', 333, 66, 30, HERB),
  i('dill', 'produce', 369, 66, 30, HERB),
  i('chives', 'produce', 392, 66, 30, HERB),
  i('spring-onion', 'produce', 337, 15, 100, {
    proxy: 'Fineli has no spring onion; leek is the closest allium.',
  }),
  i('chili', 'produce', 31557, 20, 50, { piece: 15 }),
  i('avocado', 'produce', 11057, 8, 300, { piece: 150 }),
  i('beetroot', 'produce', 305, 1.9, 1000),
  i('swede', 'produce', 303, 1.9, 1000),
  i('turnip', 'produce', 304, 4, 500),
  i('parsnip', 'produce', 309, 3.9, 500),
  i('celeriac', 'produce', 311, 3.5, 600, { a: ['celery'] }),
  i('pumpkin', 'produce', 350, 2.9, 1000),
  i('radish', 'produce', 308, 8, 200),
  i('sugar-snap', 'produce', 34244, 16, 150),
  i('blueberry', 'frozen', 442, 9, 250),
  i('lingonberry-fresh', 'frozen', 440, 7, 250),
  i('strawberry', 'frozen', 447, 7, 250),
  i('raspberry', 'frozen', 448, 10, 250),
  i('mango', 'frozen', 34361, 6, 250),
  i('banana', 'produce', 11049, 2, 1000, { piece: 120 }),
  i('pear', 'produce', 11062, 3, 1000, { piece: 170 }),

  // Leivät ja taikinat
  i('tortilla', 'bread', 30186, 8, 320, { a: ['gluten'], piece: 40 }),
  i('corn-tortilla', 'bread', 35554, 10, 300, {
    piece: 30,
  }),
  i('pita', 'bread', 1056, 6, 300, { a: ['gluten'], piece: 75 }),
  i('rye-bread', 'bread', 1009, 5, 500, {
    a: ['gluten'],
    piece: 35,
  }),
  i('baguette', 'bread', 1309, 5, 400, { a: ['gluten'] }),
  i('puff-pastry', 'frozen', 31672, 6, 500, { a: ['gluten', 'milk'], t: ['dairy'] }),
  i('toast-bread', 'bread', 31847, 4, 500, {
    a: ['gluten'],
    piece: 30,
  }),
  i('gf-bread', 'bread', 31689, 12, 300, {
    piece: 35,
  }),
  i('crispbread', 'bread', 29771, 6, 250, {
    a: ['gluten'],
    piece: 12,
  }),
  i('rice-cakes', 'bread', 31252, 12, 100, { piece: 8 }),

  // Liha ja kana
  i('chicken-breast', 'meat', 11565, 13.5, 400, { t: ['meat', 'poultry'] }),
  i('chicken-thigh', 'meat', 30792, 11.5, 450, { t: ['meat', 'poultry'] }),
  i('chicken-strips', 'meat', 754, 11.9, 400, { t: ['meat', 'poultry'] }),
  i('chicken-mince', 'meat', 28930, 9.5, 400, { t: ['meat', 'poultry'] }),
  i('whole-chicken-legs', 'meat', 11563, 5.5, 1000, { t: ['meat', 'poultry'] }),
  i('turkey-breast', 'meat', 11551, 17, 400, { t: ['meat', 'poultry'] }),
  i('minced-beef', 'meat', 712, 10.5, 400, { t: ['meat', 'beef'] }),
  i('minced-beef-17', 'meat', 11562, 8.9, 400, { t: ['meat', 'beef'] }),
  i('minced-mixed', 'meat', 711, 7.9, 400, { t: ['meat', 'beef', 'pork'] }),
  i('minced-pork', 'meat', 28946, 7.5, 400, { t: ['meat', 'pork'] }),
  i('beef-strips', 'meat', 31145, 22, 300, {
    t: ['meat', 'beef'],
    proxy: 'Raw beef strips; Fineli lists them as marinated, the closest raw strip.',
  }),
  i('beef-stew', 'meat', 718, 16, 500, { t: ['meat', 'beef'] }),
  i('beef-steak', 'meat', 722, 36, 300, { t: ['meat', 'beef'] }),
  i('lamb', 'meat', 732, 22, 500, { t: ['meat'] }),
  i('pork-fillet', 'meat', 34188, 12.9, 400, { t: ['meat', 'pork'] }),
  i('pork-stew', 'meat', 713, 10.5, 500, { t: ['meat', 'pork'] }),
  i('pork-roast', 'meat', 7083, 9.9, 800, { t: ['meat', 'pork'] }),
  i('bacon', 'meat', 707, 14, 140, { t: ['meat', 'pork'] }),
  i('ham-cubes', 'meat', 779, 13, 150, { t: ['meat', 'pork'] }),
  i('frankfurter', 'meat', 7600, 7, 300, {
    t: ['meat', 'pork'],
    proxy: 'Fineli has boiled frankfurters; boiling hardly changes the nutrients.',
  }),
  i('grill-sausage', 'meat', 7189, 7.5, 400, {
    // Many Finnish sausages contain milk protein, lactose and soy.
    a: ['milk', 'soy'],
    t: ['meat', 'pork', 'dairy', 'lactose'],
  }),
  i('ham-slices', 'meat', 799, 15, 150, { t: ['meat', 'pork'] }),
  i('turkey-slices', 'meat', 33927, 17, 150, { t: ['meat', 'poultry'] }),
  i('reindeer', 'frozen', 734, 45, 240, { t: ['meat'] }),
  i('liver', 'meat', 786, 8, 400, { t: ['meat', 'beef'] }),
  i('pork-belly', 'meat', 706, 9, 500, { t: ['meat', 'pork'] }),

  // Kala ja äyriäiset
  i('salmon', 'fish', 871, 22, 400, FISH),
  i('cold-smoked-salmon', 'fish', 33420, 35, 150, FISH),
  i('rainbow-trout', 'fish', 848, 19, 400, FISH),
  i('baltic-herring', 'fish', 800, 9, 400, FISH),
  i('vendace', 'fish', 809, 10, 400, FISH),
  i('white-fish', 'frozen', 826, 9.5, 400, FISH),
  i('fish-sticks', 'frozen', 32217, 9, 450, { a: ['fish', 'gluten'], t: ['fish'] }),
  i('shrimp', 'frozen', 835, 19, 200, { a: ['crustaceans'], t: ['seafood'] }),
  i('mussels', 'canned', 834, 14, 250, { a: ['molluscs'], t: ['seafood'] }),
  i('tuna', 'canned', 862, 14, 150, FISH),

  // Maito, juusto ja munat
  i('milk', 'dairy', 684, 1.05, 1000, { ...MILK_LACTOSE, liquid: true }),
  i('milk-lactose-free', 'dairy', 29064, 1.45, 1000, { ...MILK, liquid: true }),
  i('cream', 'dairy', 632, 6, 200, {
    ...MILK_LACTOSE,
    liquid: true,
    proxy: 'Fineli lists cooking cream at 19 % fat; the closest to 15 % cooking cream.',
  }),
  i('whipping-cream', 'dairy', 629, 7, 200, { ...MILK_LACTOSE, liquid: true }),
  i('oat-cream', 'dairy', 30211, 7, 200, { a: ['gluten'], liquid: true }),
  i('soy-cream', 'dairy', 31231, 7, 200, { a: ['soy'], liquid: true }),
  i('oat-drink', 'dairy', 33596, 1.9, 1000, { a: ['gluten'], liquid: true }),
  i('butter', 'dairy', 576, 12, 500, { ...MILK_LACTOSE, pantry: 'eligible' }),
  i('cheese', 'dairy', 643, 14, 150, MILK),
  i('cheddar', 'dairy', 698, 18, 200, MILK),
  i('parmesan', 'dairy', 691, 30, 100, {
    ...MILK,
    proxy: 'Fineli has no Parmesan; Emmental/Gruyère is the closest hard cheese.',
  }),
  i('feta', 'dairy', 11211, 14, 200, MILK_LACTOSE),
  i('salad-cheese', 'dairy', 690, 10, 200, MILK_LACTOSE),
  i('mozzarella', 'dairy', 29239, 10, 125, MILK_LACTOSE),
  i('halloumi', 'dairy', 33465, 16, 200, MILK_LACTOSE),
  i('goat-cheese', 'dairy', 32925, 28, 150, MILK),
  i('blue-cheese', 'dairy', 653, 20, 150, MILK),
  i('bread-cheese', 'dairy', 657, 16, 300, MILK_LACTOSE),
  i('plain-yogurt', 'dairy', 33162, 2.5, 1000, MILK_LACTOSE),
  i('lf-yogurt', 'dairy', 34630, 3, 1000, MILK),
  i('lf-quark', 'dairy', 34602, 6, 250, MILK),
  i('lf-cream', 'dairy', 632, 6.5, 200, {
    ...MILK,
    liquid: true,
    proxy: 'Fineli has no lactose-free cooking cream; ordinary cooking cream has the same nutrients.',
  }),
  i('soy-yogurt', 'dairy', 31525, 4, 500, { a: ['soy'] }),
  i('oat-yogurt', 'dairy', 32562, 4, 500, { a: ['gluten'] }),
  i('hummus', 'dairy', 34666, 12, 200, { a: ['sesame'] }),
  i('cream-cheese', 'dairy', 650, 12, 200, MILK_LACTOSE),
  i('cottage-cheese', 'dairy', 649, 6.5, 200, MILK_LACTOSE),
  i('quark', 'dairy', 622, 4.5, 250, MILK_LACTOSE),
  i('yogurt', 'dairy', 32201, 5.5, 400, MILK_LACTOSE),
  i('creme-fraiche', 'dairy', 615, 6.5, 200, MILK_LACTOSE),
  i('eggs', 'dairy', 858, 5, 600, {
    a: ['egg'],
    t: ['egg'],
    piece: 60,
  }),

  // Kasviproteiinit
  i('tofu', 'dairy', 33501, 9.5, 270, { a: ['soy'] }),
  i('tempeh', 'dairy', 31249, 22, 200, { a: ['soy'] }),
  i('oat-mince', 'dairy', 34909, 20, 250, { a: ['gluten'] }),
  i('fava-mince', 'dairy', 34893, 16, 250, { a: ['gluten'] }),
  i('soy-mince', 'dry', 33499, 9, 200, { a: ['soy'] }),

  // Pakasteet
  i('green-beans', 'frozen', 372, 5, 400),
  i('peas', 'frozen', 370, 4, 500),
  i('wok-veg', 'frozen', 29048, 4.5, 500),
  i('soup-veg', 'frozen', 313, 3, 500, { a: ['celery'] }),
  i('fava-beans', 'frozen', 34243, 6, 400),
  i('corn-frozen', 'frozen', 363, 4, 400),

  // Kuivatuotteet
  i('penne', 'dry', 121, 2.4, 500, { a: ['gluten'] }),
  i('spaghetti', 'dry', 121, 2.2, 500, { a: ['gluten'] }),
  i('macaroni', 'dry', 117, 2, 400, { a: ['gluten'] }),
  i('wholegrain-pasta', 'dry', 119, 3, 500, { a: ['gluten'] }),
  i('gluten-free-pasta', 'dry', 33632, 6, 400),
  i('tagliatelle', 'dry', 172, 4.5, 500, {
    a: ['gluten', 'egg'],
    t: ['egg'],
    proxy: 'Fineli has no plain egg pasta; spinach egg pasta has nearly the same nutrients.',
  }),
  i('lasagne-sheets', 'dry', 121, 5, 500, { a: ['gluten'] }),
  i('rice', 'dry', 11521, 3.2, 1000, { pantry: 'eligible' }),
  i('brown-rice', 'dry', 28910, 3.9, 1000),
  i('porridge-rice', 'dry', 156, 2.5, 1000),
  i('egg-noodles', 'dry', 120, 6.5, 250, {
    a: ['gluten', 'egg'],
    t: ['egg'],
    proxy: 'Fineli has wheat noodles without egg; egg noodles have nearly the same nutrients.',
  }),
  i('rice-noodles', 'dry', 29055, 8, 250),
  i('bulgur', 'dry', 29208, 4, 500, {
    a: ['gluten'],
    proxy: 'Fineli has no bulgur; couscous is the closest wheat grain.',
  }),
  i('couscous', 'dry', 29208, 4, 500, { a: ['gluten'] }),
  i('quinoa', 'dry', 31175, 9, 400),
  i('barley', 'dry', 151, 2.5, 1000, { a: ['gluten'] }),
  i('buckwheat', 'dry', 161, 5, 500),
  i('oats', 'dry', 153, 1.5, 1000, { a: ['gluten'], pantry: 'eligible' }),
  i('gf-oats', 'dry', 153, 5, 500),
  i('muesli', 'dry', 29785, 4, 500, { a: ['gluten'] }),
  i('gf-muesli', 'dry', 31543, 9, 375),
  i('semolina', 'dry', 112, 2.5, 500, { a: ['gluten'] }),
  i('flaxseed', 'dry', 30991, 5, 250, { pantry: 'eligible' }),
  i('chia', 'dry', 34847, 15, 200),
  i('baking-powder', 'dry', 74, 15, 100, { pantry: 'eligible' }),
  i('potato-starch', 'dry', 162, 2.5, 500, { pantry: 'eligible' }),
  i('cocoa', 'dry', 20, 15, 200),
  i('yeast', 'dairy', 26, 6, 50),
  i('red-lentils', 'dry', 31219, 4.2, 500),
  i('green-lentils', 'dry', 399, 5, 500),
  i('split-peas', 'dry', 371, 3.2, 500),
  i('wheat-flour', 'dry', 110, 1.1, 2000, { a: ['gluten'], pantry: 'default' }),
  i('rye-flour', 'dry', 100, 1.8, 1000, { a: ['gluten'] }),
  i('cornstarch', 'dry', 27, 4, 400, { pantry: 'eligible' }),
  i('sugar', 'dry', 1, 1.3, 1000, { pantry: 'default' }),
  i('syrup', 'dry', 3, 4, 500, { pantry: 'eligible' }),
  i('breadcrumbs', 'dry', 126, 6, 200, { a: ['gluten'], pantry: 'eligible' }),
  i('gf-breadcrumbs', 'dry', 31692, 12, 200),
  i('walnuts', 'dry', 376, 22, 200, { a: ['nuts'] }),
  i('cashews', 'dry', 11086, 20, 200, { a: ['nuts'] }),
  i('almonds', 'dry', 379, 18, 200, { a: ['nuts'] }),
  i('peanuts', 'dry', 378, 9, 300, { a: ['peanut'] }),
  i('peanut-butter', 'dry', 34667, 10, 350, { a: ['peanut'] }),
  i('sesame', 'dry', 385, 12, 100, { a: ['sesame'], pantry: 'eligible' }),
  i('tahini', 'dry', 11087, 16, 300, { a: ['sesame'] }),
  i('sunflower-seeds', 'dry', 11212, 6, 300),
  i('pumpkin-seeds', 'dry', 31211, 14, 200),
  i('raisins', 'dry', 428, 7, 250),
  i('honey', 'dry', 4, 12, 350, { t: ['honey'], pantry: 'eligible' }),
  i('coconut-flakes', 'dry', 382, 9, 200),

  // Säilykkeet ja kastikkeet
  i('coconut-milk', 'canned', 29014, 5, 400, { liquid: true }),
  i('crushed-tomatoes', 'canned', 398, 2.3, 390),
  i('tomato-paste', 'canned', 354, 9, 70, { pantry: 'eligible' }),
  i('sun-dried-tomatoes', 'canned', 30444, 20, 280),
  i('roasted-pepper', 'canned', 33494, 9, 300),
  i('chickpeas', 'canned', 11089, 3.5, 400),
  i('kidney-beans', 'canned', 31214, 3.5, 400),
  i('white-beans', 'canned', 373, 3.5, 400, {
    proxy: 'Fineli lists dried white beans; recipes use drained canned beans at about a third of the dried weight.',
  }),
  i('black-beans', 'canned', 35638, 4, 400),
  i('corn', 'canned', 363, 4, 340),
  i('olives', 'canned', 34972, 12, 200),
  i('pickles', 'canned', 348, 6, 400),
  i('pickled-beetroot', 'canned', 307, 5, 500),
  i('salsa', 'canned', 33207, 8, 230),
  i('sauerkraut', 'canned', 3204, 6, 500),
  i('lingonberry', 'canned', 4403, 8, 400, {
    proxy: 'Fineli has sugared blueberry purée but not lingonberry; the sugared berry purée is the closest.',
  }),
  i('jam', 'canned', 450, 5, 400),
  i('pesto', 'canned', 3323, 20, 190, { a: ['milk', 'nuts'], t: ['dairy', 'lactose'] }),
  i('red-curry-paste', 'canned', 33021, 30, 110),
  i('ketchup', 'canned', 353, 4, 500, { pantry: 'eligible' }),
  i('mayonnaise', 'canned', 578, 7, 300, { a: ['egg', 'mustard'], t: ['egg'] }),

  // Mausteet, öljyt ja liemet
  i('oil', 'spices', 535, 3.5, 1000, { liquid: true, pantry: 'default' }),
  i('olive-oil', 'spices', 536, 11, 500, { liquid: true, pantry: 'eligible' }),
  i('vinegar', 'spices', 929, 5, 500, { liquid: true, pantry: 'eligible' }),
  i('salt', 'spices', 30, 0.6, 1000, SPICE),
  i('black-pepper', 'spices', 11177, 30, 50, SPICE),
  i('paprika-powder', 'spices', 11182, 30, 50, SPICE),
  i('curry-powder', 'spices', 11182, 30, 50, {
    ...SPICE,
    proxy: 'Fineli has no curry powder; paprika powder is the closest ground spice.',
  }),
  i('oregano', 'spices', 11191, 40, 15, SPICE),
  i('dried-basil', 'spices', 33433, 40, 15, { pantry: 'eligible' }),
  i('cumin', 'spices', 11182, 35, 40, {
    ...SPICE,
    proxy: 'Fineli has no cumin; paprika powder is the closest ground spice.',
  }),
  i('chili-flakes', 'spices', 11182, 35, 40, {
    ...SPICE,
    proxy: 'Fineli has no chili flakes; paprika powder is the closest ground spice.',
  }),
  i('garam-masala', 'spices', 11182, 35, 40, {
    pantry: 'eligible',
    proxy: 'Fineli has no garam masala; paprika powder is the closest ground spice.',
  }),
  i('taco-spice', 'spices', 11182, 25, 40, {
    pantry: 'eligible',
    proxy: 'Fineli has no taco spice mix; paprika powder is the closest ground spice.',
  }),
  i('cinnamon', 'spices', 11184, 30, 40, { pantry: 'eligible' }),
  i('allspice', 'spices', 11177, 30, 40, {
    pantry: 'eligible',
    proxy: 'Fineli has no allspice; black pepper is the closest whole spice.',
  }),
  i('stock-cube', 'spices', 29008, 30, 72, {
    a: ['celery'],
    piece: 12,
    pantry: 'eligible',
  }),
  i('chicken-stock-cube', 'spices', 29009, 30, 72, {
    a: ['gluten', 'celery'],
    t: ['meat', 'poultry'],
    piece: 12,
  }),
  i('fish-stock-cube', 'spices', 29010, 30, 72, {
    a: ['fish', 'celery'],
    t: ['fish'],
    piece: 12,
  }),
  i('beef-stock', 'spices', 38, 30, 100, {
    a: ['celery'],
    t: ['meat', 'beef'],
    liquid: true,
  }),
  i('soy-sauce', 'spices', 31, 10, 150, { a: ['soy', 'gluten'], liquid: true, pantry: 'eligible' }),
  i('teriyaki', 'spices', 31, 12, 250, {
    a: ['soy', 'gluten'],
    liquid: true,
    proxy: 'Fineli has no teriyaki sauce; soy sauce is its base.',
  }),
  i('sweet-chili', 'spices', 33020, 8, 250, { liquid: true }),
  i('mustard', 'spices', 28, 8, 275, { a: ['mustard', 'gluten'], pantry: 'eligible' }),
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
