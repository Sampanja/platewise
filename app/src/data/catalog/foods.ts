import type { Food, FoodCategory } from '../types';

import { FOOD_MICROS } from './foodMicros';
import { foodText } from './text';

/**
 * Diary search list for the UI phase: a stand-in for the Fineli foods and
 * their portion sizes (`fineli_food_units`). Values per 100 g are rounded
 * Fineli-like figures. Names and portion labels are text in every language
 * (text/<lang>/foods.ts), read through getters.
 */

/** Grams of one portion; its label is text, in the same order. */
type Portion = number;

function f(
  id: string,
  category: FoodCategory,
  [kcal, proteinG, carbsG, fatG]: [number, number, number, number],
  portions: Portion[] = [],
): Food {
  const food = {
    id,
    category,
    per100g: { kcal, proteinG, carbsG, fatG, ...micros(id) },
    portions: portions.map((grams, index) =>
      Object.defineProperty({ grams } as Food['portions'][number], 'label', {
        get: () => foodText(id).portions[index],
        enumerable: true,
      }),
    ),
  } as unknown as Food; // `name` is added as a getter below
  return Object.defineProperty(food, 'name', { get: () => foodText(id).name, enumerable: true });
}

/** Fibre, sugars and salt from the micronutrient table (all foods have them; a test checks). */
function micros(id: string) {
  const values = FOOD_MICROS[id];
  if (!values) return {};
  const [fiberG, sugarG, saltG] = values;
  return { fiberG, sugarG, saltG };
}

const SLICE: Portion = 30;

export const FOODS: readonly Food[] = [
  // Leivät, puurot ja viljat
  f('rye-bread', 'bread', [220, 7, 40, 2], [35, SLICE]),
  f('rye-crisp', 'bread', [340, 10, 62, 2], [12]),
  f('graham-bread', 'bread', [250, 9, 43, 3.5], [SLICE]),
  f('white-toast', 'bread', [260, 8, 48, 3], [25]),
  f('multigrain-roll', 'bread', [270, 10, 45, 5], [70]),
  f('karelian-pie', 'bread', [220, 6, 38, 5], [70]),
  f('croissant', 'bread', [410, 8, 45, 22], [60]),
  f('oat-porridge', 'bread', [62, 2.2, 10, 1.2], [250]),
  f('oat-porridge-milk', 'bread', [85, 4, 12, 2], [250]),
  f('rice-porridge', 'bread', [100, 3.5, 16, 2.5], [250]),
  f('oat-flakes', 'bread', [370, 13, 59, 7], [35]),
  f('muesli', 'bread', [390, 10, 62, 9], [45]),
  f('granola', 'bread', [450, 9, 60, 18], [45]),
  f('cornflakes', 'bread', [380, 7, 84, 1], [15]),
  f('rice-cooked', 'bread', [130, 2.7, 28, 0.3], [70, 150]),
  f('pasta-cooked', 'bread', [150, 5.5, 30, 0.9], [50, 180]),
  f('wholegrain-pasta', 'bread', [140, 6, 27, 1], [180]),
  f('bulgur-cooked', 'bread', [110, 3.5, 21, 0.5], [150]),
  f('quinoa-cooked', 'bread', [120, 4.4, 21, 1.9], [150]),
  f('couscous-cooked', 'bread', [112, 3.8, 23, 0.2], [150]),
  f('pancake', 'bread', [190, 7, 23, 8], [50]),

  // Maitotuotteet ja munat
  f('skim-milk', 'dairy', [35, 3.5, 4.9, 0.1], [200]),
  f('light-milk', 'dairy', [46, 3.5, 4.9, 1.5], [200]),
  f('whole-milk', 'dairy', [63, 3.4, 4.7, 3.5], [200]),
  f('buttermilk', 'dairy', [36, 3.5, 4.5, 0.5], [200]),
  f('oat-drink', 'dairy', [45, 0.8, 6.5, 1.5], [200]),
  f('soy-drink', 'dairy', [38, 3, 2.5, 1.8], [200]),
  f('yogurt-plain', 'dairy', [60, 4, 5, 2.5], [150, 100]),
  f('yogurt-flavoured', 'dairy', [85, 3.5, 13, 2], [150]),
  f('greek-yogurt', 'dairy', [120, 4, 4, 10], [100]),
  f('quark', 'dairy', [65, 12, 3.5, 0.2], [250, 100]),
  f('quark-flavoured', 'dairy', [90, 9, 10, 1], [200]),
  f('skyr', 'dairy', [60, 11, 4, 0.2], [150]),
  f('viili', 'dairy', [60, 3.5, 4.5, 3], [200]),
  f('cottage-cheese', 'dairy', [100, 12, 3, 4], [200, 100]),
  f('edam', 'dairy', [330, 26, 0, 25], [10]),
  f('light-cheese', 'dairy', [270, 30, 0, 17], [10]),
  f('feta', 'dairy', [260, 14, 1, 22], [30]),
  f('mozzarella', 'dairy', [250, 18, 1, 19], [125]),
  f('cream-cheese', 'dairy', [230, 6, 4, 21], [15]),
  f('egg-boiled', 'dairy', [140, 12.5, 0.4, 10], [60]),
  f('egg-fried', 'dairy', [190, 13, 0.4, 15], [55]),
  f('scrambled-eggs', 'dairy', [150, 10, 2, 11], [150]),
  f('omelette', 'dairy', [155, 10, 1.5, 12], [150]),
  f('ice-cream', 'dairy', [200, 3.5, 22, 11], [50, 70]),

  // Liha, kala ja kasviproteiinit
  f('chicken-breast', 'meat', [150, 30, 0, 3], [130, 120]),
  f('chicken-cold-cuts', 'meat', [100, 18, 2, 2], [10]),
  f('ham-slice', 'meat', [105, 18, 1, 3.5], [10]),
  f('salami', 'meat', [450, 22, 1, 40], [6]),
  f('sausage', 'meat', [250, 11, 6, 20], [50, 120]),
  f('hot-dog-sausage', 'meat', [230, 11, 3, 20], [40]),
  f('meatballs', 'meat', [230, 15, 7, 16], [20, 150]),
  f('minced-beef-cooked', 'meat', [215, 26, 0, 12], [120]),
  f('pork-chop', 'meat', [220, 28, 0, 12], [140]),
  f('beef-steak', 'meat', [190, 30, 0, 8], [150]),
  f('salmon-baked', 'meat', [215, 22, 0, 14], [130]),
  f('smoked-salmon', 'meat', [180, 21, 0, 11], [15]),
  f('tuna-canned', 'meat', [110, 25, 0, 1], [150]),
  f('white-fish-baked', 'meat', [90, 20, 0, 1], [130]),
  f('fish-fingers', 'meat', [230, 13, 20, 11], [30]),
  f('shrimp', 'meat', [80, 18, 0, 1], [60]),
  f('tofu', 'meat', [120, 12, 2, 7], [100]),
  f('oat-mince', 'meat', [180, 25, 6, 6], [100]),
  f('chickpeas', 'meat', [120, 7, 15, 2.5], [70]),
  f('lentils-cooked', 'meat', [110, 8, 17, 0.5], [85]),
  f('falafel', 'meat', [330, 13, 30, 18], [20]),

  // Kasvikset
  f('potato-boiled', 'produce', [77, 2, 17, 0.1], [70, 200]),
  f('mashed-potato', 'produce', [100, 2.2, 13, 4.5], [200]),
  f('fries', 'produce', [290, 3.4, 37, 14], [120]),
  f('sweet-potato', 'produce', [90, 2, 21, 0.2], [150]),
  f('carrot', 'produce', [41, 0.9, 10, 0.2], [70]),
  f('cucumber', 'produce', [15, 0.7, 3.6, 0.1], [50]),
  f('tomato', 'produce', [18, 0.9, 3.9, 0.2], [100]),
  f('bell-pepper', 'produce', [31, 1, 6, 0.3], [75]),
  f('lettuce', 'produce', [15, 1.4, 2.9, 0.2], [50]),
  f('broccoli', 'produce', [35, 2.4, 7, 0.4], [100]),
  f('cauliflower', 'produce', [25, 2, 5, 0.3], [100]),
  f('peas', 'produce', [80, 5, 13, 0.4], [60]),
  f('corn', 'produce', [80, 2.5, 15, 1.2], [65]),
  f('mixed-salad', 'produce', [70, 1.2, 4, 5.5], [100]),
  f('coleslaw', 'produce', [150, 1, 8, 13], [80]),
  f('avocado', 'produce', [160, 2, 9, 15], [75]),
  f('mushrooms', 'produce', [60, 3, 3, 4.5], [80]),
  f('beetroot', 'produce', [45, 1.7, 10, 0.2], [80]),
  f('spinach', 'produce', [23, 2.9, 3.6, 0.4], [30]),

  // Hedelmät ja marjat
  f('apple', 'fruit', [50, 0.3, 12, 0.2], [150]),
  f('banana', 'fruit', [95, 1.2, 21, 0.3], [120]),
  f('orange', 'fruit', [45, 1, 10, 0.2], [180]),
  f('mandarin', 'fruit', [45, 0.8, 10, 0.3], [70]),
  f('pear', 'fruit', [50, 0.4, 12, 0.2], [170]),
  f('grapes', 'fruit', [70, 0.7, 17, 0.2], [80]),
  f('kiwi', 'fruit', [55, 1, 12, 0.5], [75]),
  f('blueberries', 'fruit', [40, 0.5, 7, 0.6], [65]),
  f('strawberries', 'fruit', [35, 0.7, 7, 0.4], [65]),
  f('lingonberries', 'fruit', [45, 0.5, 8, 0.6], [60]),
  f('raspberries', 'fruit', [40, 1.2, 6, 0.5], [55]),
  f('melon', 'fruit', [30, 0.6, 7, 0.2], [200]),
  f('pineapple', 'fruit', [50, 0.5, 12, 0.1], [80]),
  f('raisins', 'fruit', [300, 3, 70, 0.5], [15]),

  // Valmisruoat ja ruokalajit
  f('macaroni-casserole', 'meal', [140, 8, 15, 5], [300]),
  f('salmon-soup', 'meal', [75, 5, 6, 3.5], [350]),
  f('pea-soup', 'meal', [90, 6, 10, 2.5], [350]),
  f('meat-soup', 'meal', [60, 5, 5, 2], [350]),
  f('chicken-soup', 'meal', [55, 5, 5, 1.5], [350]),
  f('spaghetti-bolognese', 'meal', [150, 8, 18, 5], [350]),
  f('lasagne', 'meal', [160, 8, 13, 8], [300]),
  f('pizza', 'meal', [240, 11, 30, 8], [100, 400]),
  f('hamburger', 'meal', [250, 13, 25, 11], [200]),
  f('kebab', 'meal', [210, 10, 20, 10], [450]),
  f('sushi', 'meal', [145, 5, 27, 1.5], [30, 240]),
  f('chicken-curry', 'meal', [140, 9, 15, 5], [350]),
  f('fried-rice', 'meal', [165, 6, 22, 6], [300]),
  f('fish-and-potatoes', 'meal', [110, 9, 12, 3], [350]),
  f('caesar-salad', 'meal', [140, 10, 5, 9], [300]),
  f('tortilla-wrap', 'meal', [200, 11, 20, 8], [250]),
  f('rice-pie', 'meal', [260, 6, 30, 13], [85]),
  f('sandwich-ham-cheese', 'meal', [250, 13, 25, 11], [100]),
  f('blood-pancakes', 'meal', [190, 8, 20, 8], [150]),
  f('liver-casserole', 'meal', [150, 7, 20, 4.5], [250]),
  f('karelian-stew', 'meal', [160, 18, 1, 9], [200]),
  f('fish-soup-creamy', 'meal', [95, 6, 6, 5], [350]),

  // Juomat
  f('coffee', 'drink', [2, 0.1, 0, 0], [150]),
  f('coffee-milk', 'drink', [12, 0.6, 0.9, 0.5], [170]),
  f('latte', 'drink', [45, 3, 4.5, 1.6], [350]),
  f('tea', 'drink', [1, 0, 0.2, 0], [200]),
  f('orange-juice', 'drink', [45, 0.7, 10, 0.2], [200]),
  f('smoothie', 'drink', [65, 2, 13, 0.5], [250]),
  f('soft-drink', 'drink', [42, 0, 10.6, 0], [330, 500]),
  f('soft-drink-zero', 'drink', [0.3, 0, 0, 0], [330]),
  f('beer', 'drink', [40, 0.3, 3, 0], [330, 500]),
  f('wine-red', 'drink', [70, 0.1, 0.5, 0], [120]),
  f('protein-shake', 'drink', [60, 8, 4.5, 1], [330]),
  f('cocoa', 'drink', [75, 3.5, 10, 2], [200]),

  // Välipalat ja herkut
  f('dark-chocolate', 'snack', [580, 8, 35, 43], [10]),
  f('milk-chocolate', 'snack', [540, 7, 57, 31], [10, 200]),
  f('candy', 'snack', [350, 4, 80, 1.5], [50]),
  f('salty-licorice', 'snack', [340, 3, 80, 0.5], [30]),
  f('potato-chips', 'snack', [540, 6, 50, 34], [40]),
  f('popcorn', 'snack', [480, 8, 55, 25], [30]),
  f('cinnamon-bun', 'snack', [370, 7, 50, 15], [80]),
  f('cookie', 'snack', [480, 6, 65, 22], [10]),
  f('muffin', 'snack', [400, 5, 50, 20], [80]),
  f('protein-bar', 'snack', [360, 30, 30, 12], [55]),
  f('granola-bar', 'snack', [430, 7, 60, 17], [35]),
  f('nuts-mix', 'snack', [600, 18, 15, 52], [30]),
  f('peanuts', 'snack', [600, 26, 15, 50], [30]),
  f('almonds', 'snack', [600, 21, 8, 52], [30]),
  f('rice-cakes', 'snack', [380, 8, 80, 3], [8]),
  f('hummus', 'snack', [270, 7, 14, 21], [15, 100]),

  // Rasvat, levitteet ja kastikkeet
  f('butter', 'fat', [740, 0.6, 0.6, 82], [5, 14]),
  f('margarine', 'fat', [540, 0, 0.5, 60], [5, 4]),
  f('rapeseed-oil', 'fat', [900, 0, 0, 100], [4.5, 13.5]),
  f('olive-oil', 'fat', [900, 0, 0, 100], [4.5, 13.5]),
  f('mayonnaise', 'fat', [680, 1, 2, 75], [15]),
  f('ketchup', 'fat', [110, 1.5, 25, 0.2], [15]),
  f('peanut-butter', 'fat', [600, 25, 15, 50], [15]),
  f('jam', 'fat', [200, 0.4, 50, 0.1], [20]),
  f('honey', 'fat', [330, 0.3, 82, 0], [7]),
  f('sugar', 'fat', [400, 0, 100, 0], [4, 3]),
];

export const FOODS_BY_ID: Readonly<Record<string, Food>> = Object.fromEntries(
  FOODS.map((food) => [food.id, food]),
);
