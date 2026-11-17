import type { RecipeText } from '../types';

/** English text for recipe batch 3 (structure: catalog/recipes3.ts). */
export const EN_RECIPES_03: Readonly<Record<string, RecipeText>> = {
  'oat-porridge-blueberries': {
    title: 'Oat porridge with blueberries',
    description: 'Soft oat porridge with milk and blueberries: a warm, filling morning classic.',
    steps: [
      'Bring the milk and 100 ml of water to the boil in a pan.',
      'Add the oats and salt. Simmer gently, stirring, for 3–5 minutes.',
      'Let the porridge rest under the lid for a moment and top with the blueberries.',
    ],
    tips: [
      'Frozen blueberries can go straight into the hot porridge.',
      'A pinch of cinnamon adds sweetness without sugar.',
    ],
  },
  'gf-oat-porridge-apple': {
    title: 'Gluten-free oat porridge with apple and cinnamon',
    description: 'Porridge cooked in water with warm apple, cinnamon and flaxseed.',
    steps: [
      'Bring 300 ml of water to the boil in a pan.',
      'Add the gluten-free oats and salt. Simmer, stirring, for 3–5 minutes.',
      'Grate or dice the apple into the porridge for the last minute.',
      'Sprinkle the cinnamon and flaxseed on top.',
    ],
    tips: [
      'Check the packet to make sure the oats are labelled gluten-free.',
      'Pear works instead of apple.',
    ],
  },
  'oven-barley-porridge': {
    title: 'Oven-baked barley porridge',
    description: 'A slow-baked, creamy-soft barley porridge: a weekend breakfast treat.',
    steps: [
      'Heat the oven to 150 °C.',
      'Pour the pearl barley, milk and salt into a greased ovenproof dish and stir.',
      'Bake for about 3 hours. Stir the porridge once or twice.',
      'Top with a knob of butter and serve with berries or cinnamon sugar.',
    ],
    tips: [
      'You can put the porridge in the oven in the evening with a timer.',
      'Leftover porridge is good cold with berries.',
    ],
  },
  'rice-porridge': {
    title: 'Rice porridge with cinnamon sugar',
    description: 'Traditional rice porridge cooked in milk, with a melting pat of butter and cinnamon sugar.',
    steps: [
      'Simmer the pudding rice in 100 ml of water for about 10 minutes until the water is absorbed.',
      'Add the milk and bring to the boil, stirring.',
      'Simmer gently with the lid on for about 45 minutes. Stir now and then so it doesn’t catch on the bottom.',
      'Season with salt and serve with a pat of butter and cinnamon sugar.',
    ],
    tips: [
      'A heavy-based pan stops the porridge from catching.',
      'Leftovers make a baked rice pudding the next day.',
    ],
  },
  'semolina-berries': {
    title: 'Semolina porridge with strawberries',
    description: 'Smooth semolina porridge with milk and sweet strawberries: a childhood favourite.',
    steps: [
      'Heat the milk in a pan until almost boiling.',
      'Sprinkle in the semolina, whisking all the time so no lumps form.',
      'Simmer gently, stirring, for about 5 minutes. Season with salt and sugar.',
      'Serve with the strawberries.',
    ],
    tips: [
      'A whisk is the best tool for lump-free porridge.',
      'Any berries or jam work instead of strawberries.',
    ],
  },
  'whipped-lingonberry-porridge': {
    title: 'Whipped lingonberry porridge with oat drink',
    description: 'A fluffy whipped lingonberry porridge served with cold oat drink.',
    steps: [
      'Simmer the lingonberries in 400 ml of water and strain if you want a smooth porridge.',
      'Sprinkle the semolina into the boiling liquid, whisking. Simmer gently for 10 minutes.',
      'Season with sugar and salt and let it cool.',
      'Whip the cooled porridge with an electric whisk until pale and fluffy.',
      'Serve with cold oat drink.',
    ],
    tips: [
      'The porridge only turns pale and fluffy once cool: don’t whip it hot.',
      'It keeps in the fridge and works as a snack too.',
    ],
    storage: 'Keep in a covered container in the fridge for 3 days.',
    reheating: 'Served cold. Whip briefly before serving.',
  },
  'buckwheat-porridge-raspberry': {
    title: 'Lactose-free buckwheat porridge with raspberries',
    description: 'Nutty buckwheat porridge with lactose-free milk, raspberries and a drizzle of honey.',
    steps: [
      'Rinse the buckwheat in a sieve.',
      'Simmer the buckwheat in 200 ml of water with the salt for about 10 minutes.',
      'Add the milk and simmer, stirring, for another 5 minutes until the porridge is soft.',
      'Serve with the raspberries and honey.',
    ],
    tips: [
      'Buckwheat is naturally gluten-free.',
      'Toast the groats in a dry pan first for a deeper flavour.',
    ],
  },
  'overnight-oats': {
    title: 'Overnight oats with blueberries',
    description: 'Yogurt oats mixed the evening before, waiting ready in the fridge in the morning.',
    steps: [
      'Mix the oats, chia seeds, yogurt and milk in a jar.',
      'Add the blueberries and honey on top.',
      'Close the lid and leave in the fridge overnight.',
    ],
    tips: [
      'Make three days’ worth at once.',
      'Take the jar to work or school.',
    ],
    storage: 'Keep in a closed jar in the fridge for 2–3 days.',
    reheating: 'Eaten cold. In winter you can warm it in the microwave.',
  },
  'vegan-overnight-oats': {
    title: 'Vegan overnight oats with raspberries',
    description: 'Oats and chia soaked in oat yogurt, topped with raspberries and syrup.',
    steps: [
      'Mix the oats, chia seeds, oat yogurt and oat drink in a jar.',
      'Top with the raspberries and drizzle over the syrup.',
      'Leave in the fridge for at least 4 hours or overnight.',
    ],
    tips: [
      'Add crushed seeds in the morning for crunch.',
      'Frozen raspberries thaw overnight into juicy berries.',
    ],
    storage: 'Keep in a closed jar in the fridge for 2–3 days.',
    reheating: 'Eaten cold.',
  },
  'chia-pudding-mango': {
    title: 'Chia pudding with mango',
    description: 'Chia pudding set in coconut milk with fresh mango and lime zest.',
    steps: [
      'Mix the chia seeds, coconut milk, 50 ml of water and the syrup.',
      'Stir again after 10 minutes so the seeds don’t clump.',
      'Leave to set in the fridge for at least 4 hours.',
      'Top with the diced mango and grate over some lime zest.',
    ],
    tips: [
      'For a lighter version, replace half of the coconut milk with water.',
      'The pudding keeps in the fridge for three days.',
    ],
    storage: 'Keep in a closed jar in the fridge for 3 days.',
    reheating: 'Eaten cold.',
  },
  'protein-porridge': {
    title: 'Quark porridge with banana',
    description: 'Oat porridge with quark stirred in: more protein than usual and fills you up for longer.',
    steps: [
      'Simmer the oats in the milk and 100 ml of water with the salt for 3–5 minutes.',
      'Take the pan off the heat and stir the quark into the porridge.',
      'Slice the banana on top and sprinkle with cinnamon.',
    ],
    tips: [
      'Add the quark only after taking the porridge off the heat so it doesn’t split.',
      'For a lactose-free version, use lactose-free milk and quark.',
    ],
  },
  'spinach-feta-omelette': {
    title: 'Omelette with spinach and feta',
    description: 'A soft omelette with spinach and salty feta. Ready in ten minutes.',
    steps: [
      'Whisk the eggs and season with salt and pepper.',
      'Melt the butter in a pan and soften the spinach for a minute.',
      'Pour the egg mixture into the pan and let it set over low heat.',
      'Crumble the feta on top, fold the omelette in half and serve at once.',
    ],
    tips: [
      'A lid on the pan cooks the top of the omelette evenly.',
      'Add cherry tomatoes if you like.',
    ],
  },
  'scrambled-eggs-rye': {
    title: 'Scrambled eggs on rye bread',
    description: 'Creamy-soft scrambled eggs with chives on rye bread: a Finnish breakfast classic.',
    steps: [
      'Lightly whisk the eggs, milk and salt together.',
      'Melt the butter in a pan over low heat and pour in the egg mixture.',
      'Fold gently with a spatula until the eggs have set but are still glossy.',
      'Serve on the rye bread and sprinkle chives on top.',
    ],
    tips: [
      'Take the eggs off the heat a little before they look done: the residual heat finishes them.',
    ],
  },
  'avocado-egg-toast': {
    title: 'Avocado toast with a boiled egg',
    description: 'Crisp wholemeal toast, lemony avocado, egg and a pinch of chilli.',
    steps: [
      'Boil the egg for 8 minutes, cool it and peel.',
      'Toast the bread slices.',
      'Mash the avocado with a fork and season with lemon juice and salt.',
      'Spread the avocado on the toast, slice the egg on top and sprinkle with chilli flakes.',
    ],
    tips: [
      'A ripe avocado gives a little when you press it gently.',
    ],
  },
  'gf-avocado-toast': {
    title: 'Gluten-free avocado toast with tomatoes',
    description: 'Gluten-free seeded bread, lime-seasoned avocado and juicy cherry tomatoes.',
    steps: [
      'Toast the bread slices in a pan or toaster.',
      'Mash the avocado and season with lime, salt and pepper.',
      'Spread the avocado on the bread and top with the halved cherry tomatoes.',
    ],
    tips: [
      'Always toast gluten-free bread: it tastes better and holds the topping better.',
    ],
  },
  'tofu-scramble': {
    title: 'Tofu scramble with tomato and spinach',
    description: 'Crumbled tofu as a spiced scramble with tomato and spinach. A vegan breakfast.',
    steps: [
      'Soften the finely chopped onion in oil in a frying pan.',
      'Crumble the tofu into the pan and season with curry powder, salt and pepper. Fry for 5 minutes.',
      'Add the diced tomato and spinach and fry until the spinach has wilted.',
    ],
    tips: [
      'Curry powder gives the tofu a golden, scrambled-egg colour.',
      'Serve with toast or rice cakes.',
    ],
  },
  'ham-cheese-toast': {
    title: 'Hot ham and cheese toast',
    description: 'Oven-melted cheese, ham and tomato on toast.',
    steps: [
      'Heat the oven to 225 °C.',
      'Spread the bread and top with the ham, tomato slices and grated cheese.',
      'Bake on the top shelf for 5–7 minutes until the cheese has melted and browned.',
    ],
    tips: [
      'A pinch of oregano makes it taste like pizza.',
    ],
  },
  'smoked-salmon-rye': {
    title: 'Smoked salmon on rye with cucumber',
    description: 'Rye bread, cream cheese, cold-smoked salmon, cucumber and dill. Festive but fast.',
    steps: [
      'Spread the cream cheese on the rye bread slices.',
      'Top with thin cucumber slices and the cold-smoked salmon.',
      'Finish with dill and a few drops of lemon juice.',
    ],
    tips: [
      'Cured Baltic herring or smoked rainbow trout works instead of salmon.',
    ],
  },
  'cottage-cheese-crispbread': {
    title: 'Crispbread with cottage cheese and tomato',
    description: 'Crisp rye crispbread, cottage cheese, tomato and chives. Light and high in protein.',
    steps: [
      'Spread the cottage cheese on the crispbreads.',
      'Top with tomato slices and chives and grind over some black pepper.',
    ],
    tips: [
      'Assemble just before eating so the crispbread stays crisp.',
    ],
  },
  'hummus-veggie-bread': {
    title: 'Hummus on rye with crisp vegetables',
    description: 'Rye bread, velvety hummus and crisp cucumber and pepper slices. Vegan and filling.',
    steps: [
      'Spread the hummus thickly on the rye bread slices.',
      'Top with the cucumber and pepper slices and grind over some pepper.',
    ],
    tips: [
      'Sprinkle toasted seeds or chilli flakes on top.',
    ],
  },
  'oven-omelette-vegetables': {
    title: 'Baked omelette with vegetables',
    description: 'A juicy baked omelette with pepper, spinach and cheese. Enough for the whole week’s breakfasts.',
    steps: [
      'Heat the oven to 200 °C and grease an ovenproof dish with oil.',
      'Whisk the eggs, milk and salt.',
      'Spread the pepper, onion and spinach in the dish and pour the egg mixture over them.',
      'Sprinkle the grated cheese on top and bake for 20–25 minutes until the omelette has set.',
    ],
    tips: [
      'Cut the cooled omelette into pieces for lunch boxes.',
      'Swap the vegetables for whatever is left in the fridge.',
    ],
    storage: 'Keep in pieces in the fridge for 3 days.',
    reheating: 'Eat cold or warm in the microwave for 30–60 seconds.',
  },
  'yogurt-muesli-bowl': {
    title: 'Yogurt bowl with berries and muesli',
    description: 'Plain yogurt, muesli, blueberries and strawberries. A quick, fresh morning.',
    steps: [
      'Spoon the yogurt into a bowl.',
      'Top with the berries and muesli just before eating.',
    ],
    tips: [
      'Add the muesli only when you eat so it stays crunchy.',
    ],
    storage: 'Assemble the bowl when you eat. Opened yogurt keeps in the fridge for 3 days.',
    reheating: 'Eaten cold.',
  },
  'lactose-free-quark-bowl': {
    title: 'Lactose-free quark bowl with raspberries',
    description: 'Lactose-free quark and yogurt, raspberries and gluten-free muesli: protein for the morning.',
    steps: [
      'Mix the quark and yogurt in a bowl until smooth.',
      'Top with the raspberries, muesli and honey.',
    ],
    tips: [
      'A mix of quark and yogurt is fluffier than quark alone.',
    ],
    storage: 'Assemble the bowl when you eat.',
    reheating: 'Eaten cold.',
  },
  'soy-yogurt-mango-bowl': {
    title: 'Soy yogurt bowl with mango',
    description: 'A vegan breakfast bowl: soy yogurt, mango, gluten-free muesli and pumpkin seeds.',
    steps: [
      'Spoon the soy yogurt into a bowl.',
      'Top with the thawed mango, muesli and pumpkin seeds.',
    ],
    tips: [
      'Thaw the frozen mango in the fridge overnight.',
    ],
    storage: 'Assemble the bowl when you eat.',
    reheating: 'Eaten cold.',
  },
  'banana-egg-pancakes': {
    title: 'Two-ingredient banana pancakes',
    description: 'Little pancakes made from just banana and egg, with no flour.',
    steps: [
      'Mash the banana smooth with a fork.',
      'Whisk in the eggs and cinnamon.',
      'Fry small pancakes in an oiled pan over medium heat for about a minute per side.',
    ],
    tips: [
      'Small pancakes are easier to flip than big ones.',
      'Serve with berries.',
    ],
  },
  'eggs-bacon-tomato': {
    title: 'Fried eggs, bacon and tomato',
    description: 'A warm weekend breakfast plate: fried eggs, crisp bacon, mushrooms and tomato.',
    steps: [
      'Fry the bacon until crisp and lift it onto kitchen paper.',
      'Fry the halved tomatoes and mushrooms in the bacon fat.',
      'Fry the eggs in oil to your liking.',
      'Serve with toast.',
    ],
    tips: [
      'Eggs fry nicely when the pan isn’t too hot.',
    ],
  },
};
