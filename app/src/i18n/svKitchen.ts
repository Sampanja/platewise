import type { KitchenStrings } from './types';

/** Swedish strings for the quick actions, the pantry, text and voice logging and recipe import. */
export const svKitchen: KitchenStrings = {
  castRenewed: 'Figurerna har förnyats! Din kompis är nu {name}. Du kan byta figur i profilen.',
  quick: {
    tabLabel: 'Lägg till',
    a11y: 'Snabbval',
    title: 'Vad vill du göra?',
    logMeal: 'Logga en måltid',
    logMealTo: 'Loggas som: {meal}',
    photo: 'Foto',
    speak: 'Tala',
    write: 'Skriv',
    barcode: 'Streckkod',
    search: 'Sök',
    scanPantry: 'Skanna kylskåpet eller skafferiet',
    scanPantryHint: 'Fotografera hyllorna så uppdateras ditt förråd',
    makePlan: 'Gör en matsedel',
    makePlanHint: 'Middagar och en inköpslista inom budget',
    addWeight: 'Lägg till vikt',
    addWeightHint: 'Dagens vägning och din vikttrend',
  },
  recipeSegments: {
    library: 'Bibliotek',
    pantry: 'Från förrådet',
    favorites: 'Favoriter',
    mine: 'Egna',
    a11y: 'Receptvy',
  },
  diarySegments: {
    today: 'Idag',
    reports: 'Rapporter',
    a11y: 'Dagboksvy',
  },
  myRecipes: {
    title: 'Egna recept',
    intro: 'Dina egna och importerade recept syns bara för dig.',
    create: 'Skapa ett recept',
    emptyTitle: 'Inga egna recept än',
    emptyBody: 'Sätt ihop ett recept av ingredienser, så kan du logga det i dagboken en portion i taget.',
    servings: '{count} portioner',
    perServing: '{kcal} kcal / portion',
  },
};
