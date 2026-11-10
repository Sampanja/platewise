import type { Cuisine, Difficulty, DishType, MainProtein, MealType, RecipeSource } from '../types';

import { LEGACY_EXTRAS } from './recipeExtras';

/**
 * Default storage and reheating advice per category. A recipe overrides them
 * when it needs something else (e.g. a salad with fish, a crispy oven dish).
 */
const STORAGE: Record<DishType, string> = {
  soup: 'Jäähdytä nopeasti ja säilytä kannellisessa rasiassa jääkaapissa 2–3 päivää. Keiton voi pakastaa annoksina 3 kuukaudeksi.',
  stew: 'Jäähdytä nopeasti ja säilytä kannellisessa rasiassa jääkaapissa 3 päivää. Pata pakastuu hyvin 3 kuukaudeksi.',
  pasta: 'Säilytä jääkaapissa kannellisessa rasiassa 2 päivää.',
  rice: 'Jäähdytä riisi nopeasti ja säilytä jääkaapissa enintään 1–2 päivää.',
  potato: 'Säilytä jääkaapissa kannellisessa rasiassa 2 päivää.',
  oven: 'Säilytä jääkaapissa kannellisessa rasiassa 2–3 päivää.',
  casserole: 'Säilytä vuoassa kelmulla peitettynä jääkaapissa 3 päivää. Laatikko pakastuu hyvin annospaloina.',
  stir_fry: 'Paras heti. Säilytä tähteet jääkaapissa 1–2 päivää.',
  salad: 'Paras heti. Säilytä kastike erikseen; valmis salaatti säilyy jääkaapissa 1 päivän.',
  bowl: 'Säilytä osat erikseen jääkaapissa 2 päivää ja kokoa kulho vasta syödessä.',
  wrap: 'Säilytä täyte ja leivät erikseen jääkaapissa 2 päivää.',
  patty: 'Säilytä kypsät pihvit tai pyörykät jääkaapissa 2–3 päivää. Ne pakastuvat hyvin.',
  pie: 'Säilytä jääkaapissa kelmulla peitettynä 2–3 päivää. Piiras pakastuu paloina.',
  porridge: 'Säilytä jääkaapissa kannellisessa rasiassa 2 päivää.',
  egg: 'Paras heti. Säilytä tähteet jääkaapissa enintään 1 päivä.',
  sandwich: 'Paras heti. Eväänä säilytä jääkaapissa ja syö samana päivänä.',
  pancake: 'Säilytä jäähtyneet letut tai pannukakku jääkaapissa 2 päivää. Ne pakastuvat hyvin.',
  smoothie: 'Paras heti. Säilytä suljetussa pullossa jääkaapissa enintään 1 päivä ja ravista ennen juomista.',
  snack: 'Säilytä jääkaapissa kannellisessa rasiassa 2–3 päivää.',
  other: 'Säilytä jääkaapissa kannellisessa rasiassa 2 päivää.',
};

const REHEATING: Record<DishType, string> = {
  soup: 'Kuumenna kattilassa sekoitellen kiehuvaksi. Lisää tilkka vettä, jos keitto on paksuuntunut.',
  stew: 'Kuumenna kattilassa miedolla lämmöllä sekoitellen tai mikrossa kannen alla, kunnes kauttaaltaan kuuma.',
  pasta: 'Kuumenna pannulla tilkan vettä kanssa tai mikrossa kannen alla sekoittaen välillä.',
  rice: 'Kuumenna mikrossa kannen alla tai pannulla, kunnes riisi on kauttaaltaan höyryävän kuumaa.',
  potato: 'Kuumenna mikrossa kannen alla tai uunissa 175 asteessa noin 15 minuuttia.',
  oven: 'Kuumenna uunissa 175 asteessa 10–15 minuuttia, niin pinta pysyy rapeana. Mikro käy kiireessä.',
  casserole: 'Kuumenna peitettynä uunissa 175 asteessa 20–25 minuuttia tai annos mikrossa.',
  stir_fry: 'Kuumenna kuumalla pannulla nopeasti sekoitellen.',
  salad: 'Tarjoa kylmänä. Lämpimät osat voi kuumentaa erikseen pannulla.',
  bowl: 'Kuumenna lämpimät osat mikrossa tai pannulla ja lisää kylmät osat vasta sitten.',
  wrap: 'Kuumenna täyte pannulla ja lämmitä leivät kuivalla pannulla juuri ennen syömistä.',
  patty: 'Kuumenna pannulla tai uunissa 175 asteessa noin 10 minuuttia.',
  pie: 'Kuumenna uunissa 175 asteessa noin 15 minuuttia, niin pohja pysyy rapeana.',
  porridge: 'Lisää tilkka maitoa tai vettä ja kuumenna kattilassa tai mikrossa sekoittaen.',
  egg: 'Kuumenna miedolla lämmöllä pannulla tai lyhyesti mikrossa.',
  sandwich: 'Tarjoa sellaisenaan. Lämpimän leivän voi lämmittää pannulla tai uunissa.',
  pancake: 'Lämmitä pannulla, mikrossa tai uunissa 175 asteessa noin 5 minuuttia.',
  smoothie: 'Ei lämmitetä. Ravista tai sekoita ennen juomista.',
  snack: 'Tarjoa sellaisenaan.',
  other: 'Kuumenna pannulla tai mikrossa kunnes kauttaaltaan kuuma.',
};

/** Breakfast and snack categories; everything else is lunch and dinner by default. */
const DEFAULT_MEALS: Partial<Record<DishType, MealType[]>> = {
  porridge: ['breakfast'],
  smoothie: ['breakfast', 'snack'],
  snack: ['snack'],
  sandwich: ['breakfast', 'lunch'],
  pancake: ['breakfast', 'snack'],
};

type Input = {
  id: string;
  title: string;
  description: string;
  totalTimeMin: number;
  dishType: DishType;
  cuisine: Cuisine;
  mainProtein: MainProtein;
  oven?: boolean;
  goodForLeftovers?: boolean;
  ingredients: [string, number][];
  steps: string[];
};

/**
 * The first test recipes, written before the full recipe format. Their
 * hands-on time, difficulty, servings and tips are in recipeExtras.ts. They
 * are lunches and dinners.
 */
export function r(input: Input): RecipeSource {
  const extra = LEGACY_EXTRAS[input.id];
  if (!extra) throw new Error(`Recipe ${input.id}: missing entry in recipeExtras.ts`);
  return {
    ...input,
    oven: input.oven ?? false,
    goodForLeftovers: input.goodForLeftovers ?? false,
    imageUrl: null,
    meals: ['lunch', 'dinner'],
    ingredients: input.ingredients.map(([ingredientId, grams]) => ({ ingredientId, grams })),
    activeTimeMin: extra.active,
    difficulty: extra.level ?? 'easy',
    servings: extra.serves ?? 4,
    tips: extra.tips,
    storage: extra.keep ?? STORAGE[input.dishType],
    reheating: extra.heat ?? REHEATING[input.dishType],
  };
}

export type DishInput = {
  id: string;
  title: string;
  desc: string;
  cat: DishType;
  cuisine: Cuisine;
  protein: MainProtein;
  /** Omitted → by category: breakfast/snack categories or lunch + dinner. */
  meals?: MealType[];
  /** [hands-on minutes, total minutes] */
  time: [number, number];
  level?: Difficulty;
  /** Servings the recipe is written for (default 4). Ingredients are per serving. */
  serves?: number;
  oven?: boolean;
  leftovers?: boolean;
  /** "ingredient-id grams, ingredient-id grams, …" per serving. */
  ing: string;
  steps: string[];
  tips: string[];
  keep?: string;
  heat?: string;
};

/** Parses "salmon 120, potato 200" into ingredient lines. */
export function parseIngredients(text: string, recipeId: string): { ingredientId: string; grams: number }[] {
  return text
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean)
    .map((part) => {
      const match = /^([a-z0-9-]+)\s+(\d+(?:\.\d+)?)$/.exec(part);
      if (!match) throw new Error(`Recipe ${recipeId}: cannot read ingredient "${part}"`);
      return { ingredientId: match[1], grams: Number(match[2]) };
    });
}

/**
 * Compact recipe definition used by the recipe batches. Images are null: the
 * app draws a category illustration card until the backend adds a photo.
 */
export function dish(input: DishInput): RecipeSource {
  return {
    id: input.id,
    title: input.title,
    description: input.desc,
    activeTimeMin: input.time[0],
    totalTimeMin: input.time[1],
    difficulty: input.level ?? 'easy',
    servings: input.serves ?? 4,
    dishType: input.cat,
    meals: input.meals ?? DEFAULT_MEALS[input.cat] ?? ['lunch', 'dinner'],
    cuisine: input.cuisine,
    mainProtein: input.protein,
    oven: input.oven ?? false,
    goodForLeftovers: input.leftovers ?? false,
    imageUrl: null,
    ingredients: parseIngredients(input.ing, input.id),
    steps: input.steps,
    tips: input.tips,
    storage: input.keep ?? STORAGE[input.cat],
    reheating: input.heat ?? REHEATING[input.cat],
  };
}
