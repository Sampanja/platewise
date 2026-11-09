import type { Food, FoodCategory } from '../types';

import { FOOD_MICROS } from './foodMicros';

/**
 * Diary search list for the UI phase: a stand-in for the Fineli foods and
 * their portion sizes (`fineli_food_units`). Values per 100 g are rounded
 * Fineli-like figures.
 */

type Portion = [label: string, grams: number];

function f(
  id: string,
  name: string,
  category: FoodCategory,
  [kcal, proteinG, carbsG, fatG]: [number, number, number, number],
  portions: Portion[] = [],
): Food {
  return {
    id,
    name,
    category,
    per100g: { kcal, proteinG, carbsG, fatG, ...micros(id) },
    portions: portions.map(([label, grams]) => ({ label, grams })),
  };
}

/** Fibre, sugars and salt from the micronutrient table (all foods have them; a test checks). */
function micros(id: string) {
  const values = FOOD_MICROS[id];
  if (!values) return {};
  const [fiberG, sugarG, saltG] = values;
  return { fiberG, sugarG, saltG };
}

const SLICE: Portion = ['1 viipale', 30];

export const FOODS: readonly Food[] = [
  // Leivät, puurot ja viljat
  f('rye-bread', 'Ruisleipä', 'bread', [220, 7, 40, 2], [['1 palalevy', 35], SLICE]),
  f('rye-crisp', 'Näkkileipä, ruis', 'bread', [340, 10, 62, 2], [['1 näkkileipä', 12]]),
  f('graham-bread', 'Grahamleipä', 'bread', [250, 9, 43, 3.5], [SLICE]),
  f('white-toast', 'Paahtoleipä, vaalea', 'bread', [260, 8, 48, 3], [['1 viipale', 25]]),
  f('multigrain-roll', 'Sämpylä, monivilja', 'bread', [270, 10, 45, 5], [['1 sämpylä', 70]]),
  f('karelian-pie', 'Karjalanpiirakka', 'bread', [220, 6, 38, 5], [['1 piirakka', 70]]),
  f('croissant', 'Croissant', 'bread', [410, 8, 45, 22], [['1 croissant', 60]]),
  f('oat-porridge', 'Kaurapuuro vedellä', 'bread', [62, 2.2, 10, 1.2], [['1 annos (2,5 dl)', 250]]),
  f('oat-porridge-milk', 'Kaurapuuro maidolla', 'bread', [85, 4, 12, 2], [['1 annos (2,5 dl)', 250]]),
  f('rice-porridge', 'Riisipuuro', 'bread', [100, 3.5, 16, 2.5], [['1 annos (2,5 dl)', 250]]),
  f('oat-flakes', 'Kaurahiutale', 'bread', [370, 13, 59, 7], [['1 dl', 35]]),
  f('muesli', 'Mysli', 'bread', [390, 10, 62, 9], [['1 dl', 45]]),
  f('granola', 'Granola', 'bread', [450, 9, 60, 18], [['1 dl', 45]]),
  f('cornflakes', 'Maissihiutale', 'bread', [380, 7, 84, 1], [['1 dl', 15]]),
  f('rice-cooked', 'Riisi, keitetty', 'bread', [130, 2.7, 28, 0.3], [['1 dl', 70], ['1 annos', 150]]),
  f('pasta-cooked', 'Pasta, keitetty', 'bread', [150, 5.5, 30, 0.9], [['1 dl', 50], ['1 annos', 180]]),
  f('wholegrain-pasta', 'Täysjyväpasta, keitetty', 'bread', [140, 6, 27, 1], [['1 annos', 180]]),
  f('bulgur-cooked', 'Bulgur, keitetty', 'bread', [110, 3.5, 21, 0.5], [['1 annos', 150]]),
  f('quinoa-cooked', 'Kvinoa, keitetty', 'bread', [120, 4.4, 21, 1.9], [['1 annos', 150]]),
  f('couscous-cooked', 'Kuskus, keitetty', 'bread', [112, 3.8, 23, 0.2], [['1 annos', 150]]),
  f('pancake', 'Ohukainen', 'bread', [190, 7, 23, 8], [['1 ohukainen', 50]]),

  // Maitotuotteet ja munat
  f('skim-milk', 'Rasvaton maito', 'dairy', [35, 3.5, 4.9, 0.1], [['1 lasi (2 dl)', 200]]),
  f('light-milk', 'Kevytmaito', 'dairy', [46, 3.5, 4.9, 1.5], [['1 lasi (2 dl)', 200]]),
  f('whole-milk', 'Täysmaito', 'dairy', [63, 3.4, 4.7, 3.5], [['1 lasi (2 dl)', 200]]),
  f('buttermilk', 'Piimä', 'dairy', [36, 3.5, 4.5, 0.5], [['1 lasi (2 dl)', 200]]),
  f('oat-drink', 'Kaurajuoma', 'dairy', [45, 0.8, 6.5, 1.5], [['1 lasi (2 dl)', 200]]),
  f('soy-drink', 'Soijajuoma', 'dairy', [38, 3, 2.5, 1.8], [['1 lasi (2 dl)', 200]]),
  f('yogurt-plain', 'Maustamaton jogurtti', 'dairy', [60, 4, 5, 2.5], [['1 purkki', 150], ['1 dl', 100]]),
  f('yogurt-flavoured', 'Maustettu jogurtti', 'dairy', [85, 3.5, 13, 2], [['1 purkki', 150]]),
  f('greek-yogurt', 'Turkkilainen jogurtti', 'dairy', [120, 4, 4, 10], [['1 dl', 100]]),
  f('quark', 'Maitorahka', 'dairy', [65, 12, 3.5, 0.2], [['1 purkki', 250], ['1 dl', 100]]),
  f('quark-flavoured', 'Maustettu rahka', 'dairy', [90, 9, 10, 1], [['1 purkki', 200]]),
  f('skyr', 'Skyr, maustamaton', 'dairy', [60, 11, 4, 0.2], [['1 purkki', 150]]),
  f('viili', 'Viili', 'dairy', [60, 3.5, 4.5, 3], [['1 purkki', 200]]),
  f('cottage-cheese', 'Raejuusto', 'dairy', [100, 12, 3, 4], [['1 purkki', 200], ['1 dl', 100]]),
  f('edam', 'Edam-juusto', 'dairy', [330, 26, 0, 25], [['1 viipale', 10]]),
  f('light-cheese', 'Kevytjuusto 17 %', 'dairy', [270, 30, 0, 17], [['1 viipale', 10]]),
  f('feta', 'Fetajuusto', 'dairy', [260, 14, 1, 22], [['30 g', 30]]),
  f('mozzarella', 'Mozzarella', 'dairy', [250, 18, 1, 19], [['1 pallo', 125]]),
  f('cream-cheese', 'Tuorejuusto', 'dairy', [230, 6, 4, 21], [['1 rkl', 15]]),
  f('egg-boiled', 'Kananmuna, keitetty', 'dairy', [140, 12.5, 0.4, 10], [['1 kananmuna', 60]]),
  f('egg-fried', 'Paistettu kananmuna', 'dairy', [190, 13, 0.4, 15], [['1 kananmuna', 55]]),
  f('scrambled-eggs', 'Munakokkeli', 'dairy', [150, 10, 2, 11], [['1 annos', 150]]),
  f('omelette', 'Munakas', 'dairy', [155, 10, 1.5, 12], [['1 annos', 150]]),
  f('ice-cream', 'Vaniljajäätelö', 'dairy', [200, 3.5, 22, 11], [['1 pallo', 50], ['1 tötterö', 70]]),

  // Liha, kala ja kasviproteiinit
  f('chicken-breast', 'Broilerin rintafilee, paistettu', 'meat', [150, 30, 0, 3], [['1 file', 130], ['1 annos', 120]]),
  f('chicken-cold-cuts', 'Broilerinleike', 'meat', [100, 18, 2, 2], [['1 viipale', 10]]),
  f('ham-slice', 'Kinkkuleike', 'meat', [105, 18, 1, 3.5], [['1 viipale', 10]]),
  f('salami', 'Salami', 'meat', [450, 22, 1, 40], [['1 viipale', 6]]),
  f('sausage', 'Lenkkimakkara, paistettu', 'meat', [250, 11, 6, 20], [['1 siivu', 50], ['1 annos', 120]]),
  f('hot-dog-sausage', 'Nakki', 'meat', [230, 11, 3, 20], [['1 nakki', 40]]),
  f('meatballs', 'Lihapullat', 'meat', [230, 15, 7, 16], [['1 lihapulla', 20], ['1 annos', 150]]),
  f('minced-beef-cooked', 'Jauheliha, paistettu', 'meat', [215, 26, 0, 12], [['1 annos', 120]]),
  f('pork-chop', 'Porsaankyljys, paistettu', 'meat', [220, 28, 0, 12], [['1 kyljys', 140]]),
  f('beef-steak', 'Naudan pihvi, paistettu', 'meat', [190, 30, 0, 8], [['1 pihvi', 150]]),
  f('salmon-baked', 'Lohi, uunissa', 'meat', [215, 22, 0, 14], [['1 annos', 130]]),
  f('smoked-salmon', 'Kylmäsavulohi', 'meat', [180, 21, 0, 11], [['1 siivu', 15]]),
  f('tuna-canned', 'Tonnikala vedessä', 'meat', [110, 25, 0, 1], [['1 tölkki', 150]]),
  f('white-fish-baked', 'Seiti, uunissa', 'meat', [90, 20, 0, 1], [['1 annos', 130]]),
  f('fish-fingers', 'Kalapuikot, paistettu', 'meat', [230, 13, 20, 11], [['1 puikko', 30]]),
  f('shrimp', 'Katkarapu, kypsä', 'meat', [80, 18, 0, 1], [['1 dl', 60]]),
  f('tofu', 'Tofu', 'meat', [120, 12, 2, 7], [['1 annos', 100]]),
  f('oat-mince', 'Nyhtökaura', 'meat', [180, 25, 6, 6], [['1 annos', 100]]),
  f('chickpeas', 'Kikherne, keitetty', 'meat', [120, 7, 15, 2.5], [['1 dl', 70]]),
  f('lentils-cooked', 'Linssi, keitetty', 'meat', [110, 8, 17, 0.5], [['1 dl', 85]]),
  f('falafel', 'Falafel', 'meat', [330, 13, 30, 18], [['1 pyörykkä', 20]]),

  // Kasvikset
  f('potato-boiled', 'Peruna, keitetty', 'produce', [77, 2, 17, 0.1], [['1 keskikokoinen', 70], ['1 annos', 200]]),
  f('mashed-potato', 'Perunamuusi', 'produce', [100, 2.2, 13, 4.5], [['1 annos', 200]]),
  f('fries', 'Ranskalaiset perunat', 'produce', [290, 3.4, 37, 14], [['1 annos', 120]]),
  f('sweet-potato', 'Bataatti, uunissa', 'produce', [90, 2, 21, 0.2], [['1 annos', 150]]),
  f('carrot', 'Porkkana', 'produce', [41, 0.9, 10, 0.2], [['1 porkkana', 70]]),
  f('cucumber', 'Kurkku', 'produce', [15, 0.7, 3.6, 0.1], [['5 viipaletta', 50]]),
  f('tomato', 'Tomaatti', 'produce', [18, 0.9, 3.9, 0.2], [['1 tomaatti', 100]]),
  f('bell-pepper', 'Paprika', 'produce', [31, 1, 6, 0.3], [['1/2 paprikaa', 75]]),
  f('lettuce', 'Lehtisalaatti', 'produce', [15, 1.4, 2.9, 0.2], [['1 annos', 50]]),
  f('broccoli', 'Parsakaali, keitetty', 'produce', [35, 2.4, 7, 0.4], [['1 annos', 100]]),
  f('cauliflower', 'Kukkakaali, keitetty', 'produce', [25, 2, 5, 0.3], [['1 annos', 100]]),
  f('peas', 'Herne, keitetty', 'produce', [80, 5, 13, 0.4], [['1 dl', 60]]),
  f('corn', 'Maissi', 'produce', [80, 2.5, 15, 1.2], [['1 dl', 65]]),
  f('mixed-salad', 'Vihersalaatti kastikkeella', 'produce', [70, 1.2, 4, 5.5], [['1 annos', 100]]),
  f('coleslaw', 'Coleslaw', 'produce', [150, 1, 8, 13], [['1 annos', 80]]),
  f('avocado', 'Avokado', 'produce', [160, 2, 9, 15], [['1/2 avokadoa', 75]]),
  f('mushrooms', 'Herkkusieni, paistettu', 'produce', [60, 3, 3, 4.5], [['1 annos', 80]]),
  f('beetroot', 'Punajuuri, keitetty', 'produce', [45, 1.7, 10, 0.2], [['1 annos', 80]]),
  f('spinach', 'Pinaatti', 'produce', [23, 2.9, 3.6, 0.4], [['1 kourallinen', 30]]),

  // Hedelmät ja marjat
  f('apple', 'Omena', 'fruit', [50, 0.3, 12, 0.2], [['1 keskikokoinen', 150]]),
  f('banana', 'Banaani', 'fruit', [95, 1.2, 21, 0.3], [['1 keskikokoinen', 120]]),
  f('orange', 'Appelsiini', 'fruit', [45, 1, 10, 0.2], [['1 appelsiini', 180]]),
  f('mandarin', 'Mandariini', 'fruit', [45, 0.8, 10, 0.3], [['1 mandariini', 70]]),
  f('pear', 'Päärynä', 'fruit', [50, 0.4, 12, 0.2], [['1 päärynä', 170]]),
  f('grapes', 'Viinirypäle', 'fruit', [70, 0.7, 17, 0.2], [['1 kourallinen', 80]]),
  f('kiwi', 'Kiivi', 'fruit', [55, 1, 12, 0.5], [['1 kiivi', 75]]),
  f('blueberries', 'Mustikka', 'fruit', [40, 0.5, 7, 0.6], [['1 dl', 65]]),
  f('strawberries', 'Mansikka', 'fruit', [35, 0.7, 7, 0.4], [['1 dl', 65]]),
  f('lingonberries', 'Puolukka', 'fruit', [45, 0.5, 8, 0.6], [['1 dl', 60]]),
  f('raspberries', 'Vadelma', 'fruit', [40, 1.2, 6, 0.5], [['1 dl', 55]]),
  f('melon', 'Vesimeloni', 'fruit', [30, 0.6, 7, 0.2], [['1 siivu', 200]]),
  f('pineapple', 'Ananas', 'fruit', [50, 0.5, 12, 0.1], [['1 siivu', 80]]),
  f('raisins', 'Rusina', 'fruit', [300, 3, 70, 0.5], [['1 rkl', 15]]),

  // Valmisruoat ja ruokalajit
  f('macaroni-casserole', 'Makaronilaatikko', 'meal', [140, 8, 15, 5], [['1 annos', 300]]),
  f('salmon-soup', 'Lohikeitto', 'meal', [75, 5, 6, 3.5], [['1 lautasellinen', 350]]),
  f('pea-soup', 'Hernekeitto', 'meal', [90, 6, 10, 2.5], [['1 lautasellinen', 350]]),
  f('meat-soup', 'Lihakeitto', 'meal', [60, 5, 5, 2], [['1 lautasellinen', 350]]),
  f('chicken-soup', 'Kanakeitto', 'meal', [55, 5, 5, 1.5], [['1 lautasellinen', 350]]),
  f('spaghetti-bolognese', 'Spagetti bolognese', 'meal', [150, 8, 18, 5], [['1 annos', 350]]),
  f('lasagne', 'Lasagne', 'meal', [160, 8, 13, 8], [['1 annos', 300]]),
  f('pizza', 'Pizza, kinkku-ananas', 'meal', [240, 11, 30, 8], [['1 pala', 100], ['1 pizza', 400]]),
  f('hamburger', 'Hampurilainen', 'meal', [250, 13, 25, 11], [['1 hampurilainen', 200]]),
  f('kebab', 'Kebab ranskalaisilla', 'meal', [210, 10, 20, 10], [['1 annos', 450]]),
  f('sushi', 'Sushi', 'meal', [145, 5, 27, 1.5], [['1 pala', 30], ['8 palaa', 240]]),
  f('chicken-curry', 'Kanacurry riisillä', 'meal', [140, 9, 15, 5], [['1 annos', 350]]),
  f('fried-rice', 'Paistettu riisi', 'meal', [165, 6, 22, 6], [['1 annos', 300]]),
  f('fish-and-potatoes', 'Kala ja perunat', 'meal', [110, 9, 12, 3], [['1 annos', 350]]),
  f('caesar-salad', 'Caesarsalaatti kanalla', 'meal', [140, 10, 5, 9], [['1 annos', 300]]),
  f('tortilla-wrap', 'Kanatortilla', 'meal', [200, 11, 20, 8], [['1 tortilla', 250]]),
  f('rice-pie', 'Riisipiirakka munavoilla', 'meal', [260, 6, 30, 13], [['1 piirakka', 85]]),
  f('sandwich-ham-cheese', 'Kinkku-juustovoileipä', 'meal', [250, 13, 25, 11], [['1 voileipä', 100]]),
  f('blood-pancakes', 'Veriohukaiset', 'meal', [190, 8, 20, 8], [['1 annos (5 kpl)', 150]]),
  f('liver-casserole', 'Maksalaatikko', 'meal', [150, 7, 20, 4.5], [['1 annos', 250]]),
  f('karelian-stew', 'Karjalanpaisti', 'meal', [160, 18, 1, 9], [['1 annos', 200]]),
  f('fish-soup-creamy', 'Kermainen kalakeitto', 'meal', [95, 6, 6, 5], [['1 lautasellinen', 350]]),

  // Juomat
  f('coffee', 'Kahvi', 'drink', [2, 0.1, 0, 0], [['1 kuppi', 150]]),
  f('coffee-milk', 'Kahvi maidolla', 'drink', [12, 0.6, 0.9, 0.5], [['1 kuppi', 170]]),
  f('latte', 'Caffè latte', 'drink', [45, 3, 4.5, 1.6], [['1 iso', 350]]),
  f('tea', 'Tee', 'drink', [1, 0, 0.2, 0], [['1 kuppi', 200]]),
  f('orange-juice', 'Appelsiinimehu', 'drink', [45, 0.7, 10, 0.2], [['1 lasi', 200]]),
  f('smoothie', 'Marjasmoothie', 'drink', [65, 2, 13, 0.5], [['1 lasi', 250]]),
  f('soft-drink', 'Virvoitusjuoma', 'drink', [42, 0, 10.6, 0], [['0,33 l tölkki', 330], ['0,5 l pullo', 500]]),
  f('soft-drink-zero', 'Virvoitusjuoma, sokeriton', 'drink', [0.3, 0, 0, 0], [['0,33 l tölkki', 330]]),
  f('beer', 'Olut, keskiolut', 'drink', [40, 0.3, 3, 0], [['0,33 l', 330], ['0,5 l', 500]]),
  f('wine-red', 'Punaviini', 'drink', [70, 0.1, 0.5, 0], [['1 lasi (12 cl)', 120]]),
  f('protein-shake', 'Proteiinijuoma', 'drink', [60, 8, 4.5, 1], [['1 pullo', 330]]),
  f('cocoa', 'Kaakao maidolla', 'drink', [75, 3.5, 10, 2], [['1 kuppi', 200]]),

  // Välipalat ja herkut
  f('dark-chocolate', 'Tumma suklaa 70 %', 'snack', [580, 8, 35, 43], [['1 rivi', 10]]),
  f('milk-chocolate', 'Maitosuklaa', 'snack', [540, 7, 57, 31], [['1 rivi', 10], ['1 levy', 200]]),
  f('candy', 'Karkit, irtokarkki', 'snack', [350, 4, 80, 1.5], [['1 kourallinen', 50]]),
  f('salty-licorice', 'Salmiakki', 'snack', [340, 3, 80, 0.5], [['1 kourallinen', 30]]),
  f('potato-chips', 'Perunalastut', 'snack', [540, 6, 50, 34], [['1 kulho', 40]]),
  f('popcorn', 'Popcorn', 'snack', [480, 8, 55, 25], [['1 kulho', 30]]),
  f('cinnamon-bun', 'Korvapuusti', 'snack', [370, 7, 50, 15], [['1 pulla', 80]]),
  f('cookie', 'Keksi', 'snack', [480, 6, 65, 22], [['1 keksi', 10]]),
  f('muffin', 'Muffinssi', 'snack', [400, 5, 50, 20], [['1 muffinssi', 80]]),
  f('protein-bar', 'Proteiinipatukka', 'snack', [360, 30, 30, 12], [['1 patukka', 55]]),
  f('granola-bar', 'Mysli- tai kauratanko', 'snack', [430, 7, 60, 17], [['1 patukka', 35]]),
  f('nuts-mix', 'Pähkinäsekoitus', 'snack', [600, 18, 15, 52], [['1 kourallinen', 30]]),
  f('peanuts', 'Maapähkinä, suolattu', 'snack', [600, 26, 15, 50], [['1 kourallinen', 30]]),
  f('almonds', 'Manteli', 'snack', [600, 21, 8, 52], [['1 kourallinen', 30]]),
  f('rice-cakes', 'Riisikakku', 'snack', [380, 8, 80, 3], [['1 riisikakku', 8]]),
  f('hummus', 'Hummus', 'snack', [270, 7, 14, 21], [['1 rkl', 15], ['1 dl', 100]]),

  // Rasvat, levitteet ja kastikkeet
  f('butter', 'Voi', 'fat', [740, 0.6, 0.6, 82], [['1 tl', 5], ['1 rkl', 14]]),
  f('margarine', 'Margariini 60 %', 'fat', [540, 0, 0.5, 60], [['1 tl', 5], ['levite leivälle', 4]]),
  f('rapeseed-oil', 'Rypsiöljy', 'fat', [900, 0, 0, 100], [['1 tl', 4.5], ['1 rkl', 13.5]]),
  f('olive-oil', 'Oliiviöljy', 'fat', [900, 0, 0, 100], [['1 tl', 4.5], ['1 rkl', 13.5]]),
  f('mayonnaise', 'Majoneesi', 'fat', [680, 1, 2, 75], [['1 rkl', 15]]),
  f('ketchup', 'Ketsuppi', 'fat', [110, 1.5, 25, 0.2], [['1 rkl', 15]]),
  f('peanut-butter', 'Maapähkinävoi', 'fat', [600, 25, 15, 50], [['1 rkl', 15]]),
  f('jam', 'Hillo', 'fat', [200, 0.4, 50, 0.1], [['1 rkl', 20]]),
  f('honey', 'Hunaja', 'fat', [330, 0.3, 82, 0], [['1 tl', 7]]),
  f('sugar', 'Sokeri', 'fat', [400, 0, 100, 0], [['1 tl', 4], ['1 pala', 3]]),
];

export const FOODS_BY_ID: Readonly<Record<string, Food>> = Object.fromEntries(
  FOODS.map((food) => [food.id, food]),
);
