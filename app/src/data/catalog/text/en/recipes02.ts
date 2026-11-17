import type { RecipeText } from '../types';

/** English text for recipe batch 2 (structure: catalog/recipes2.ts). */
export const EN_RECIPES_02: Readonly<Record<string, RecipeText>> = {
  'red-curry-soup': {
    title: 'Red curry soup',
    description: 'A rich sweet potato and lentil soup with coconut and lime.',
    steps: [
      'Soften the onion, garlic and ginger in oil. Add the curry paste.',
      'Add the diced sweet potato, rinsed lentils, stock cube and 300 ml of water per serving.',
      'Simmer for 15 minutes until the sweet potato is soft. Add the coconut milk.',
      'Blend if you like. Season with lime and coriander.',
    ],
    tips: [
      'Adjust the heat with the amount of curry paste.',
      'Squeeze in some lime at the end.',
    ],
  },
  'feta-salad': {
    title: 'Feta salad with walnuts',
    description: 'A ten-minute salad with feta, walnuts and baguette.',
    steps: [
      'Toast the walnuts in a dry frying pan.',
      'Chop the cucumber, tomatoes and red onion.',
      'Assemble the salad, crumble the feta and walnuts on top and drizzle with olive oil.',
      'Serve with baguette.',
    ],
    tips: [
      'Toasting the walnuts in a dry pan deepens their flavour.',
      'The salad makes a good packed lunch with the dressing in a separate tub.',
    ],
  },
  'salmon-zucchini': {
    title: 'Pan-fried salmon with courgette salsa',
    description: 'Crisp-skinned salmon, a dill and courgette salsa and boiled potatoes.',
    steps: [
      'Boil the potatoes.',
      'Dice the courgette and tomatoes. Mix them with lemon juice, dill and olive oil.',
      'Fry the salmon skin side down until the skin is crisp. Turn and fry for a minute.',
      'Serve the salmon with the salsa and potatoes.',
    ],
    tips: [
      'Fry the salmon skin side down and turn it only when the skin releases from the pan.',
      'Make the salsa an hour ahead so the flavours have time to settle.',
    ],
    storage: 'Keep in the fridge for 1–2 days.',
  },
  'chickpea-curry': {
    title: 'Chickpea curry',
    description: 'A vegan chickpea curry with spinach and coconut.',
    steps: [
      'Cook the rice.',
      'Soften the onion, garlic and ginger. Add the garam masala.',
      'Add the chickpeas, chopped tomatoes and coconut milk. Simmer for 15 minutes.',
      'Stir in the spinach and serve with the rice.',
    ],
    tips: [
      'The liquid from the chickpea can can be used to thicken the sauce.',
      'The curry freezes well in portions.',
    ],
  },
  'chicken-noodle-soup': {
    title: 'Coconut chicken noodle soup',
    description: 'A Thai-style soup with chicken, rice noodles and lime.',
    steps: [
      'Bring 300 ml of water per serving, the stock cube and the curry paste to the boil.',
      'Add the thin chicken strips and the pepper. Simmer for 8 minutes.',
      'Add the coconut milk and noodles. Cook until the noodles are soft.',
      'Season with lime and finish with coriander and spring onion.',
    ],
    tips: [
      'Cook the noodles separately if there will be leftovers, so they don’t go too soft.',
      'Coriander and lime finish the soup.',
    ],
  },
  'beef-noodle-soup': {
    title: 'Beef noodle soup',
    description: 'A gingery broth, beef strips and egg noodles.',
    steps: [
      'Make the broth: 400 ml of water per serving, the stock cube, soy sauce, ginger and garlic. Simmer for 10 minutes.',
      'Add the carrot strips and noodles.',
      'Add the thin beef strips at the end and cook for 1–2 minutes.',
      'Serve with spring onion and chilli.',
    ],
    tips: [
      'Slice the meat as thinly as you can so it cooks quickly in the broth.',
      'Add fresh chilli and spring onion at the end.',
    ],
  },
  'shrimp-paella': {
    title: 'Prawn paella',
    description: 'A Spanish-style rice pan with prawns, pepper and peas.',
    steps: [
      'Soften the onion, garlic and pepper in olive oil in a wide pan.',
      'Add the rice, paprika and chopped tomatoes. Fry for a moment.',
      'Pour in the stock (250 ml per serving) and simmer without stirring for 18 minutes.',
      'Scatter the prawns and peas on top, cover and let it rest for 5 minutes. Serve with lemon wedges.',
    ],
    tips: [
      'Don’t stir the rice while it cooks: a tasty crisp layer forms on the bottom.',
      'You can make the paella with chicken too.',
    ],
    storage: 'Keep in the fridge for no more than 1 day.',
  },
  'steak-potatoes': {
    title: 'Steak and roast potatoes',
    description: 'Beef sirloin steak, garlic potatoes and a green salad.',
    steps: [
      'Cut the potatoes into wedges and toss them in olive oil and salt. Roast at 225 °C for 30 minutes.',
      'Bring the steaks to room temperature and season with salt and pepper.',
      'Fry the steaks in a hot pan for 3 minutes per side. Add the butter and garlic at the end.',
      'Let them rest for 5 minutes and serve with the potatoes and salad.',
    ],
    tips: [
      'Take the steaks out of the fridge half an hour before frying.',
      'Let the steak rest for 5 minutes before cutting.',
    ],
  },
  'pea-soup': {
    title: 'Pea soup with mustard',
    description: 'The Finnish Thursday classic with ham. Soak the dried peas the night before.',
    steps: [
      'Soak the peas in cold water overnight.',
      'Drain and cook the peas in fresh water (400 ml per serving) with the stock cube. Skim off the foam.',
      'Add the onion, carrot and diced ham. Simmer gently for about 1½ hours.',
      'Serve with mustard and rye bread.',
    ],
    tips: [
      'Soak the dried peas overnight so they cook faster.',
      'Pea soup freezes excellently.',
    ],
  },
  'teriyaki-salmon': {
    title: 'Teriyaki salmon with rice',
    description: 'Glossy salmon, broccoli and sesame seeds.',
    steps: [
      'Cook the rice.',
      'Fry the salmon pieces in oil on both sides.',
      'Pour the teriyaki sauce into the pan and let it bubble until the salmon is glossy.',
      'Steam the broccoli. Serve with sesame seeds and spring onion.',
    ],
    tips: [
      'The sauce caramelises quickly: keep the heat at medium.',
      'Sprinkle sesame seeds and spring onion over at the end.',
    ],
    storage: 'Keep in the fridge for 1–2 days.',
  },
  'fish-tacos': {
    title: 'Fish tacos with slaw',
    description: 'Paprika-seasoned saithe, crisp cabbage and lime yogurt in a tortilla.',
    steps: [
      'Thaw the fish. Toss the pieces in flour, paprika and salt.',
      'Fry the fish in oil until crisp.',
      'Shred the cabbage and mix it with lime juice. Stir lime zest into the yogurt.',
      'Warm the tortillas and fill them with the fish, cabbage, yogurt and coriander.',
    ],
    tips: [
      'The slaw is best mixed just before serving.',
      'You can also bake the fish in the oven at 200 °C for 12 minutes.',
    ],
    storage: 'Keep the fish and slaw separately in the fridge for 1 day.',
  },
  'lentil-chili': {
    title: 'Smoky lentil chilli',
    description: 'A vegan chilli with squash, lentils and kidney beans.',
    steps: [
      'Soften the onion and garlic in oil. Add the spices.',
      'Add the diced squash, lentils, chopped tomatoes and 100 ml of water per serving.',
      'Simmer for 25 minutes. Add the rinsed kidney beans for the last five minutes.',
      'Serve with rice and coriander.',
    ],
    tips: [
      'Chilli tastes even better the next day.',
      'Serve with rice, tortillas or a baked potato.',
    ],
  },
  'shakshuka': {
    title: 'Shakshuka with baguette',
    description: 'Eggs poached in a spiced tomato and pepper sauce.',
    steps: [
      'Soften the onion, pepper and garlic in olive oil.',
      'Add the spices and chopped tomatoes. Simmer for 10 minutes.',
      'Make hollows in the sauce and crack the eggs into them. Cover and cook for 6–8 minutes.',
      'Crumble feta and parsley on top. Serve with baguette.',
    ],
    tips: [
      'Cover the pan with a lid so the eggs cook evenly.',
      'Leave the yolks runny and dip in with bread.',
    ],
    storage: 'Best eaten right away. The tomato sauce can be made ahead and kept for 3 days.',
  },
  'falafel': {
    title: 'Falafel with yogurt sauce',
    description: 'Homemade chickpea balls in pitta with fresh vegetables.',
    steps: [
      'Drain the chickpeas well. Blitz them with the onion, garlic, parsley, cumin and flour into a coarse paste.',
      'Shape into small balls and fry them in oil until crisp.',
      'Mix lemon juice and salt into the yogurt.',
      'Fill the pittas with the falafel, vegetables and sauce.',
    ],
    tips: [
      'Dry the chickpeas well so the balls hold together.',
      'You can also bake the falafel in the oven, brushed with oil.',
    ],
  },
  'fish-pie': {
    title: 'Fish pie with mashed potato',
    description: 'Saithe with dill and peas under a mash topping.',
    steps: [
      'Boil the potatoes and mash them with the milk and butter.',
      'Cut the fish into an ovenproof dish and season with salt, lemon and dill. Add the peas.',
      'Spread the mash on top and sprinkle with the cheese.',
      'Bake at 200 °C for 25 minutes.',
    ],
    tips: [
      'Frozen fish can go straight into the dish: bake for 10 minutes longer.',
      'Sprinkle grated cheese on top for a crisp crust.',
    ],
  },
  'pumpkin-soup': {
    title: 'Thai squash soup',
    description: 'A velvety butternut squash soup with curry and coconut.',
    steps: [
      'Soften the onion, garlic and ginger in oil. Add the curry paste.',
      'Add the diced squash, stock cube and 250 ml of water per serving. Simmer for 20 minutes.',
      'Add the coconut milk and blend until smooth.',
      'Season with lime, finish with coriander and serve with baguette.',
    ],
    tips: [
      'Roast the squash in the oven before cooking for a deeper flavour.',
      'Garnish with toasted pumpkin seeds.',
    ],
  },
  'cabbage-soup': {
    title: 'Cabbage soup',
    description: 'A homely minced meat and cabbage soup that gets better by the next day.',
    steps: [
      'Brown the mince and onion in a pan.',
      'Add the diced cabbage, carrot and potato with 400 ml of water per serving and the stock cube.',
      'Simmer gently for 35 minutes.',
      'Season with pepper and salt. Serve with rye bread.',
    ],
    tips: [
      'Brown the cabbage lightly before simmering to sweeten its flavour.',
      'Cabbage soup gets better as it stands.',
    ],
  },
  'tomato-soup': {
    title: 'Creamy tomato soup with cheese toast',
    description: 'A tomato soup with basil and an oven-melted cheese baguette.',
    steps: [
      'Soften the onion and garlic in oil.',
      'Add the chopped tomatoes, stock cube, sugar and 100 ml of water per serving. Simmer for 10 minutes.',
      'Add the cream and blend. Season with basil.',
      'Sprinkle the cheese over baguette slices and bake at 225 °C for 5 minutes.',
    ],
    tips: [
      'Blend the soup smooth with a stick blender.',
      'The cheese toast can be made in the oven or in a frying pan.',
    ],
  },
  'dal': {
    title: 'Lentil dal with rice',
    description: 'A warming, budget-friendly red lentil dal with spinach.',
    steps: [
      'Cook the rice.',
      'Soften the onion, garlic and ginger. Add the spices.',
      'Add the lentils, chopped tomatoes and 300 ml of water per serving. Simmer for 15 minutes.',
      'Stir in the coconut milk, spinach and lemon juice.',
    ],
    tips: [
      'Red lentils don’t need soaking.',
      'A spiced oil (tadka) drizzled on top at the end gives the dal depth.',
    ],
  },
  'tomato-egg-rice': {
    title: 'Tomato and egg stir-fry with rice',
    description: 'Chinese home cooking: soft egg and sweet tomato.',
    steps: [
      'Cook the rice.',
      'Whisk the eggs and fry them in oil into soft curds. Set aside.',
      'Fry the tomato wedges until they soften. Add the sugar and soy sauce.',
      'Return the eggs to the pan and finish with spring onion.',
    ],
    tips: [
      'Keep the eggs soft and combine them with the tomato only at the end.',
      'An easy weekday meal that’s ready in 15 minutes.',
    ],
    storage: 'Best eaten right away. Keep leftovers in the fridge for no more than 1 day.',
  },
  'shrimp-stir-fry': {
    title: 'Prawn stir-fry with crisp vegetables',
    description: 'A 15-minute stir-fry of prawns, vegetables and sweet chilli.',
    steps: [
      'Cook the rice.',
      'Fry the garlic and ginger in oil. Add the stir-fry vegetables.',
      'Add the prawns and sauces. Heat for 3 minutes.',
      'Serve with the rice.',
    ],
    tips: [
      'Pat the prawns dry with kitchen paper so they fry rather than boil.',
      'Serve the stir-fry with rice or noodles.',
    ],
    storage: 'Best eaten right away. Keep leftovers in the fridge for no more than 1 day.',
  },
  'mushroom-soup': {
    title: 'Creamy mushroom soup',
    description: 'A mushroom and potato soup with parsley and rye bread.',
    steps: [
      'Fry the sliced mushrooms and onion in butter.',
      'Add the diced potatoes, stock cube and 300 ml of water per serving. Simmer for 15 minutes.',
      'Add the cream and heat through. Blend partly.',
      'Finish with parsley and serve with rye bread.',
    ],
    tips: [
      'Brown the mushrooms in a hot pan before adding any liquid.',
      'A splash of lemon juice at the end freshens the soup.',
    ],
  },
  'ramen': {
    title: 'Ramen with egg',
    description: 'Soy broth, noodles, mushrooms and a soft-boiled egg.',
    steps: [
      'Boil the eggs for 6½ minutes and cool them in cold water.',
      'Bring 400 ml of water per serving, the stock cube, soy sauce, garlic and ginger to the boil.',
      'Add the mushrooms and noodles and cook according to the packet. Add the spinach at the end.',
      'Divide into bowls and top with the halved eggs, spring onion and sesame.',
    ],
    tips: [
      'Boil the eggs for 6½ minutes and cool them in cold water so the yolk stays soft.',
      'You can make the broth ahead and assemble the bowls when you eat.',
    ],
    storage: 'Keep the broth and noodles separately in the fridge for 2 days.',
  },
  'pork-goulash': {
    title: 'Pork and sauerkraut goulash',
    description: 'A paprika pork stew with sauerkraut and boiled potatoes.',
    steps: [
      'Brown the meat in oil in batches.',
      'Add the onion, paprika and tomato purée. Fry for a moment.',
      'Add the sauerkraut, stock cube and 200 ml of water per serving. Simmer with the lid on for 1 hour.',
      'Boil the potatoes. Serve the goulash with soured cream.',
    ],
    tips: [
      'Brown the meat in small batches so it gets a roasted surface.',
      'Goulash improves as it stands and freezes well.',
    ],
  },
  'tonkatsu': {
    title: 'Pork tonkatsu with cabbage salad',
    description: 'Crisp breaded pork loin, fresh cabbage and rice.',
    steps: [
      'Cook the rice.',
      'Cut the loin into 1.5 cm (½ in) thick steaks and pound them thinner. Season with salt.',
      'Coat them in flour, egg and breadcrumbs. Fry in oil until golden.',
      'Shred the cabbage finely and season with soy sauce and sesame. Serve with the rice.',
    ],
    tips: [
      'Pound the meat to an even thickness so it cooks evenly.',
      'Drain the fried pieces on a rack so the underside stays crisp.',
    ],
    reheating: 'Heat in the oven at 200 °C for about 10 minutes so the coating stays crisp.',
  },
  'spinach-cannelloni': {
    title: 'Spinach and cottage cheese cannelloni',
    description: 'Spinach and cottage cheese rolled in lasagne sheets in tomato sauce.',
    steps: [
      'Soften the onion and garlic. Add the spinach and let it wilt. Stir in the cottage cheese.',
      'Soften the lasagne sheets in hot water, spread the filling on them and roll them up.',
      'Pour the chopped tomatoes into an ovenproof dish, arrange the rolls on top and sprinkle with cheese.',
      'Bake at 200 °C for 30 minutes.',
    ],
    tips: [
      'Fill the cannelloni with a piping bag or a freezer bag with a corner cut off.',
      'The assembled dish keeps unbaked in the fridge overnight.',
    ],
  },
  'tuna-salad': {
    title: 'Tuna and potato salad',
    description: 'A Niçoise-style salad: tuna, potatoes, beans and egg.',
    steps: [
      'Boil the potatoes and eggs. Cook the beans with the potatoes for the last 3 minutes.',
      'Mix the dressing: olive oil, lemon juice, mustard and salt.',
      'Arrange the lettuce, tuna, potatoes, beans, tomatoes and red onion on plates.',
      'Add the egg wedges and the dressing.',
    ],
    tips: [
      'Boil the potatoes the day before and the salad is ready in no time.',
      'The salad makes a good packed lunch.',
    ],
    storage: 'Keep in a covered container in the fridge for 1–2 days.',
  },
  'cabbage-rolls': {
    title: 'Cabbage rolls',
    description: 'Grandma’s oven-baked cabbage rolls with lingonberries and potatoes.',
    steps: [
      'Par-cook the rice. Separate the cabbage leaves and blanch them in salted water until soft.',
      'Mix the mince, rice, onion, milk and salt.',
      'Wrap the filling in the leaves, arrange them in an ovenproof dish and dot with butter.',
      'Bake at 200 °C for about an hour, basting now and then. Serve with boiled potatoes and lingonberries.',
    ],
    tips: [
      'Blanch the cabbage whole so the leaves come off in one piece.',
      'Baste the rolls with syrup-sweetened liquid while they bake.',
    ],
  },
  'borscht': {
    title: 'Beetroot soup (borscht)',
    description: 'A vegetable borscht of beetroot, cabbage and potato with soured cream.',
    steps: [
      'Peel and grate the beetroots and carrots. Dice the potato and shred the cabbage.',
      'Simmer the vegetables in 400 ml of water per serving with the stock cube for about 40 minutes.',
      'Season with salt.',
      'Serve with soured cream, dill and rye bread.',
    ],
    tips: [
      'Beetroot stains: wear disposable gloves when peeling.',
      'Serve with smetana or soured cream and dill.',
    ],
  },
};
