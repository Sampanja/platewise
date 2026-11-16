import type { KitchenStrings } from './types';

/** English strings for the quick actions, the pantry, text and voice logging and recipe import. */
export const enKitchen: KitchenStrings = {
  castRenewed: 'The characters have been renewed! Your companion is now {name}. You can change it in your profile.',
  quick: {
    tabLabel: 'Add',
    a11y: 'Quick actions',
    title: 'What would you like to do?',
    logMeal: 'Log a meal',
    logMealTo: 'Logging to: {meal}',
    photo: 'Photo',
    speak: 'Speak',
    write: 'Type',
    barcode: 'Barcode',
    search: 'Search',
    scanPantry: 'Scan your fridge or cupboard',
    scanPantryHint: 'Photograph the shelves to update your pantry',
    makePlan: 'Make a meal plan',
    makePlanHint: 'Dinners and one shopping list within budget',
    addWeight: 'Add weight',
    addWeightHint: 'Today’s weigh-in and your weight trend',
  },
  recipeSegments: {
    library: 'Library',
    pantry: 'From pantry',
    favorites: 'Favourites',
    mine: 'Mine',
    a11y: 'Recipe view',
  },
  diarySegments: {
    today: 'Today',
    reports: 'Reports',
    a11y: 'Diary view',
  },
  myRecipes: {
    title: 'My recipes',
    intro: 'Your own and imported recipes are visible only to you.',
    create: 'Create a recipe',
    emptyTitle: 'No recipes of your own yet',
    emptyBody: 'Put a recipe together from ingredients, then log it in your diary one serving at a time.',
    servings: '{count} servings',
    perServing: '{kcal} kcal / serving',
  },
};
