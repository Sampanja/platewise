import type { RecipeText } from '../types';

/** English text for recipe batch 1 (structure: catalog/recipes1.ts). */
export const EN_RECIPES_01: Readonly<Record<string, RecipeText>> = {
  'chicken-tomato-pan': {
    title: 'Tomato chicken skillet with basil',
    description: 'Juicy chicken, roasted tomatoes and fresh basil in one pan.',
    steps: [
      'Cook the rice according to the packet.',
      'Cut the chicken into strips and dice the onion. Fry the chicken in oil until cooked through and season with salt and pepper.',
      'Add the onion, garlic and cherry tomatoes. Fry until the tomatoes soften.',
      'Pour in the chopped tomatoes and cream. Simmer for 5 minutes.',
      'Tear basil over the top and serve with the rice.',
    ],
    tips: [
      'You can swap the cream for oat cream or leave it out for a lighter dish.',
      'Wholegrain pasta works instead of rice.',
    ],
  },
  'minced-penne': {
    title: 'Beef penne in tomato sauce',
    description: 'An everyday classic: minced beef, tomato and penne.',
    steps: [
      'Cook the penne in salted water.',
      'Brown the mince in oil. Add the onion and garlic and soften them.',
      'Add the chopped tomatoes, tomato purée and oregano. Simmer for 10 minutes.',
      'Stir the pasta into the sauce and sprinkle grated cheese on top.',
    ],
    tips: [
      'Grate in a carrot for sweetness and extra vegetables.',
      'Make a double batch: the sauce freezes well.',
    ],
  },
  'salmon-coconut': {
    title: 'Salmon in coconut sauce',
    description: 'Pan-cooked salmon in a spiced coconut and tomato sauce.',
    steps: [
      'Cook the rice.',
      'Heat the curry paste in oil, then add the coconut milk and chopped tomatoes. Bring to the boil.',
      'Cut the salmon into pieces and add them to the sauce. Simmer with the lid on for 8 minutes.',
      'Add the spinach and lime juice just before serving.',
    ],
    tips: [
      'Rainbow trout or saithe work instead of salmon.',
      'Stir a handful of spinach into the sauce just before serving.',
    ],
    storage: 'Keep in a covered container in the fridge for 1–2 days.',
  },
  'bulgur-bowl': {
    title: 'Vegetable bulgur bowl',
    description: 'Bulgur, roasted tomatoes and green beans with a lemony dressing.',
    steps: [
      'Cook the bulgur in twice its volume of salted water.',
      'Roast the cherry tomatoes and rinsed chickpeas in olive oil in a frying pan.',
      'Cook the green beans in boiling water for 3 minutes.',
      'Assemble the bowls, crumble the feta on top and squeeze over some lemon. Finish with parsley.',
    ],
    tips: [
      'The bowl is good cold as a packed lunch too.',
      'For a gluten-free version, swap the bulgur for quinoa.',
    ],
  },
  'chicken-curry': {
    title: 'Chicken curry with jasmine rice',
    description: 'A mild coconut curry with chicken thigh. Tastes even better the next day.',
    steps: [
      'Cook the rice.',
      'Soften the onion, garlic and ginger in oil. Add the curry powder and fry for a minute.',
      'Add the chicken pieces and brown them.',
      'Pour in the chopped tomatoes and coconut milk. Simmer for 15 minutes.',
      'Serve with the rice and sprinkle coriander on top.',
    ],
    tips: [
      'Season mildly at first and add chilli at the end to taste.',
      'The chicken stays juicy when it isn’t simmered in the sauce for too long.',
    ],
  },
  'veggie-noodles': {
    title: 'Vegetable noodles with sesame',
    description: 'A quick stir-fry: tofu, crisp vegetables and soy.',
    steps: [
      'Cook and drain the noodles.',
      'Dice the tofu and fry it in oil until crisp.',
      'Add the stir-fry vegetables, garlic and ginger. Fry over high heat for 4 minutes.',
      'Toss in the noodles and soy sauce. Finish with sesame seeds and spring onion.',
    ],
    tips: [
      'Fry the tofu until properly crisp before adding the sauce.',
      'Frozen stir-fry vegetables can go straight into the pan without thawing.',
    ],
  },
  'pesto-pasta': {
    title: 'Pesto pasta with cherry tomatoes',
    description: 'A 15-minute pasta with basil pesto and sweet cherry tomatoes.',
    steps: [
      'Cook the pasta in salted water.',
      'Halve the cherry tomatoes.',
      'Stir the pesto, tomatoes and spinach into the hot pasta.',
      'Grate parmesan on top.',
    ],
    tips: [
      'Add a splash of the pasta water so the pesto coats the pasta evenly.',
      'Sprinkle toasted seeds on top for crunch.',
    ],
  },
  'shrimp-spaghetti': {
    title: 'Garlic prawn spaghetti',
    description: 'Prawns, garlic, chilli and lemon.',
    steps: [
      'Thaw the prawns and cook the spaghetti.',
      'Heat the olive oil and butter. Add the garlic and chilli and soften them over low heat.',
      'Add the prawns and heat for 2–3 minutes.',
      'Toss in the spaghetti, lemon juice and parsley.',
    ],
    tips: [
      'Thaw the prawns in a sieve under cold running water in a few minutes.',
      'Prawns cook in a moment: add them at the very end.',
    ],
    storage: 'Best eaten right away. Keep leftovers in the fridge for no more than 1 day.',
  },
  'grilled-chicken': {
    title: 'Roast chicken with roasted vegetables',
    description: 'Paprika-seasoned chicken, roast potatoes and a garlic yogurt sauce.',
    steps: [
      'Heat the oven to 225 °C (435 °F).',
      'Cut the potatoes and vegetables into wedges on a baking tray, drizzle with olive oil and season with salt.',
      'Rub the paprika and salt into the chicken. Add it to the tray after 15 minutes.',
      'Roast for another 20 minutes until the chicken is cooked through.',
      'Stir crushed garlic into the yogurt and serve it as a sauce.',
    ],
    tips: [
      'Cut the vegetables to the same size so they cook evenly.',
      'Chicken is cooked when the core temperature reaches 75 °C (165 °F).',
    ],
  },
  'beef-ragu': {
    title: 'Beef ragù with tagliatelle',
    description: 'A slow-simmered tomato and mince sauce with ribbon pasta.',
    steps: [
      'Finely chop the onion, carrot and garlic. Soften them in oil.',
      'Add the mince and brown it.',
      'Add the tomato purée and chopped tomatoes. Simmer with the lid on over low heat for an hour.',
      'Cook the tagliatelle and toss it with the sauce. Serve with parmesan.',
    ],
    tips: [
      'The longer the ragù simmers, the more tender the meat.',
      'Ragù is even better the next day.',
    ],
  },
  'chicken-fried-rice': {
    title: 'Fried rice with chicken and vegetables',
    description: 'Fried rice with chicken, egg and vegetables.',
    steps: [
      'Cook the rice (or use rice from the day before).',
      'Fry the diced chicken in oil and set it aside.',
      'Fry the carrot and peas. Crack in the eggs and stir.',
      'Add the rice, chicken and soy sauce. Fry over high heat and finish with spring onion.',
    ],
    tips: [
      'Cold rice from the day before fries best.',
      'Keep the pan hot and fry in small batches.',
    ],
  },
  'chicken-salad-bowl': {
    title: 'Chicken salad bowl',
    description: 'A fresh bowl of chicken, avocado and sweetcorn with a yogurt dressing.',
    steps: [
      'Fry the chicken in olive oil and season with salt. Let it rest, then slice.',
      'Chop the cucumber, tomatoes and avocado.',
      'Fill the bowls with salad, vegetables, sweetcorn and chicken.',
      'Stir lemon juice into the yogurt and serve as a dressing.',
    ],
    tips: [
      'Cook the chicken ahead and the bowl is ready in five minutes.',
      'You can make the dressing from yogurt, lemon and herbs.',
    ],
  },
  'oven-lasagne': {
    title: 'Oven-baked lasagne',
    description: 'Layers of meat sauce, white sauce and cheese.',
    steps: [
      'Brown the mince and onion. Add the chopped tomatoes and oregano and simmer for 10 minutes.',
      'Melt the butter, add the flour and whisk in the milk. Cook into a thick white sauce.',
      'Layer meat sauce, lasagne sheets and white sauce in an ovenproof dish.',
      'Sprinkle the cheese on top and bake at 200 °C (400 °F) for 40 minutes.',
    ],
    tips: [
      'Let the lasagne rest for 10 minutes before cutting so the pieces hold together.',
      'You can assemble the lasagne the day before and bake it on the evening you serve it.',
    ],
  },
  'carbonara': {
    title: 'Bacon carbonara',
    description: 'Carbonara without cream: bacon, egg, parmesan and black pepper.',
    steps: [
      'Cook the spaghetti in salted water. Save 100 ml of the cooking water.',
      'Fry the bacon until crisp and add the garlic at the end.',
      'Whisk the eggs with the grated parmesan.',
      'Take the pan off the heat and toss in the pasta and the egg mixture. Add cooking water until the sauce is glossy.',
    ],
    tips: [
      'Mix the eggs into the pasta off the heat so they don’t scramble.',
      'A splash of cooking water makes the sauce glossy.',
    ],
    storage: 'Best eaten right away. Keep leftovers in the fridge for no more than 1 day.',
    reheating: 'Heat gently in a pan with a splash of water, stirring all the time.',
  },
  'meatballs-mash': {
    title: 'Meatballs, mashed potato and lingonberries',
    description: 'Homely oven-baked meatballs, buttery mash and crushed lingonberries.',
    steps: [
      'Soak the breadcrumbs in a splash of milk. Mix in the mince, egg, finely chopped onion and seasoning.',
      'Roll into balls on a baking tray and bake at 225 °C (435 °F) for 15–20 minutes.',
      'Boil the peeled potatoes until soft and mash them with the rest of the milk and the butter.',
      'Serve with the crushed lingonberries.',
    ],
    tips: [
      'Wet your hands with water and the meatballs are easy to roll.',
      'Meatballs freeze well: make a double batch at once.',
    ],
  },
  'beef-stroganoff': {
    title: 'Beef stroganoff with mashed potato',
    description: 'Beef strips and mushrooms in a creamy mustard sauce.',
    steps: [
      'Boil the potatoes and mash them with the milk and butter.',
      'Brown the beef strips in hot oil in batches.',
      'Fry the onion and mushrooms. Add the tomato purée, mustard and cream.',
      'Return the meat to the pan and simmer for 10 minutes. Finish with parsley.',
    ],
    tips: [
      'Cut the meat into thin strips across the grain so it stays tender.',
      'Pickled gherkins give stroganoff its classic tang.',
    ],
  },
  'sweet-sour-chicken': {
    title: 'Sweet and sour chicken',
    description: 'Crisp-fried chicken and peppers in a sweet and sour sauce.',
    steps: [
      'Cook the rice.',
      'Toss the chicken pieces in flour and fry them in oil until crisp.',
      'Fry the pepper and onion. Add the chilli sauce, soy sauce, tomato purée, sugar and a splash of water.',
      'Stir the chicken into the sauce and serve with the rice.',
    ],
    tips: [
      'Orange segments work instead of pineapple.',
      'Cornflour thickens the sauce and makes it glossy.',
    ],
  },
  'katsu-curry': {
    title: 'Chicken katsu with curry sauce',
    description: 'Breaded chicken, Japanese-style curry sauce and rice.',
    steps: [
      'Cook the rice.',
      'Soften the onion and carrot. Add the curry powder, stock cube and 200 ml of water. Simmer for 15 minutes and blend.',
      'Flatten the chicken fillets and coat them in flour, egg and breadcrumbs.',
      'Fry the fillets in oil until golden. Slice and serve with the sauce and rice.',
    ],
    tips: [
      'Fry the breaded chicken in properly hot oil so the coating stays crisp.',
      'You can make the curry sauce the day before.',
    ],
    reheating: 'Heat the sauce in a pan and the chicken in the oven at 200 °C (400 °F) for about 10 minutes so the coating stays crisp.',
  },
  'pad-thai': {
    title: 'Chicken pad thai',
    description: 'Rice noodles, chicken, egg and peanuts with lime.',
    steps: [
      'Soak the rice noodles in hot water until soft.',
      'Fry the chicken and carrot strips in oil. Push them to the side and scramble the eggs.',
      'Add the noodles, soy sauce, sugar and lime juice. Toss over high heat.',
      'Serve with crushed peanuts, spring onion and chilli.',
    ],
    tips: [
      'Soak the noodles only until bendy: they finish cooking in the pan.',
      'Have everything ready before you start, as stir-frying is quick.',
    ],
  },
  'chicken-enchiladas': {
    title: 'Baked chicken enchiladas',
    description: 'Tortillas, chicken and black beans under salsa and cheese.',
    steps: [
      'Heat the oven to 200 °C (400 °F).',
      'Fry the chicken and onion in oil. Add the taco seasoning, black beans and a splash of water.',
      'Fill the tortillas and roll them into an ovenproof dish.',
      'Pour the salsa and chopped tomatoes over, sprinkle with cheese. Bake for 20 minutes and serve with soured cream.',
    ],
    tips: [
      'You can make the filling a day ahead.',
      'Serve with a fresh salad and soured cream.',
    ],
  },
  'kofta-burgers': {
    title: 'Kofta patties in pitta',
    description: 'Cumin-spiced beef patties, yogurt and fresh vegetables.',
    steps: [
      'Mix the grated onion, garlic, parsley, cumin and salt into the mince.',
      'Shape into flat patties and fry them in a pan until cooked.',
      'Warm the pitta breads.',
      'Fill the pittas with the patties, yogurt, tomato, cucumber and red onion.',
    ],
    tips: [
      'Wet your hands and the patties are easy to shape.',
      'Kofta patties are great on the barbecue too.',
    ],
  },
  'chicken-mushroom-stew': {
    title: 'Oven-baked chicken and mushroom stew',
    description: 'Chicken thigh, mushrooms and root vegetables in a soured cream sauce.',
    steps: [
      'Heat the oven to 200 °C (400 °F).',
      'Brown the chicken and mushrooms in oil.',
      'Cut the potatoes and carrots into wedges in an ovenproof dish. Add the chicken, mushrooms, onion and 200 ml of stock made with the stock cube.',
      'Cook with the lid on for 35 minutes. Stir in the soured cream and parsley.',
    ],
    tips: [
      'Thigh fillet stays juicier than breast in a long braise.',
      'Chanterelles or funnel chanterelles give the stew a woodland flavour.',
    ],
  },
};
