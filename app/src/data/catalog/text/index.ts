import { activeLanguage, activeUnits } from '@/i18n/locale';
import { localizeRecipeText } from '@/lib/amounts';
import type { Language } from '@/i18n/languages';

import type { DishType } from '../../types';
import { enText } from './en';
import { fiText } from './fi';
import { svText } from './sv';
import type { CatalogText, FoodText, IngredientText, RecipeText } from './types';

export type { CatalogText, DishDefaults, FoodText, IngredientText, RecipeText } from './types';

/**
 * Catalog text per language. Finnish is the source: recipes are written in
 * Finnish first, and the allergen keyword scan (domain/recipes.ts) always
 * reads the Finnish text. A language may be missing an entry while a batch is
 * being translated; the Finnish text is shown then. catalog.test.ts checks
 * that every recipe, ingredient and food has every language.
 */
export const CATALOG_TEXT: Readonly<Record<Language, CatalogText>> = { fi: fiText, en: enText, sv: svText };

function missing(kind: string, id: string): never {
  throw new Error(`Catalog text: no Finnish ${kind} text for "${id}"`);
}

export function recipeText(id: string, language: Language = activeLanguage()): RecipeText {
  return CATALOG_TEXT[language].recipes[id] ?? fiText.recipes[id] ?? missing('recipe', id);
}

export function ingredientText(id: string, language: Language = activeLanguage()): IngredientText {
  return CATALOG_TEXT[language].ingredients[id] ?? fiText.ingredients[id] ?? missing('ingredient', id);
}

export function foodText(id: string, language: Language = activeLanguage()): FoodText {
  return CATALOG_TEXT[language].foods[id] ?? fiText.foods[id] ?? missing('food', id);
}

function defaults(language: Language) {
  return CATALOG_TEXT[language].dishDefaults;
}

/** Storage advice: the recipe's own or its dish type's default. */
export function recipeStorage(id: string, dishType: DishType, language: Language = activeLanguage()): string {
  return recipeText(id, language).storage ?? defaults(language).storage[dishType];
}

export function recipeReheating(id: string, dishType: DishType, language: Language = activeLanguage()): string {
  return recipeText(id, language).reheating ?? defaults(language).reheating[dishType];
}

/** The Finnish source text the allergen keyword scan reads. */
export function recipeSourceText(id: string): readonly string[] {
  const text = recipeText(id, 'fi');
  return [text.title, text.description, ...text.steps];
}

/**
 * Recipe texts are written metric ("200 °C", "2 dl"); users of °F, cups or
 * ounces see them converted ("400 °F", "¾ cup"). Converted lists are cached so a recipe's steps keep their
 * identity between renders (memoised rows, effects).
 */
const convertedTexts = new Map<string, readonly string[]>();

function displayList(id: string, field: 'steps' | 'tips'): readonly string[] {
  const texts = recipeText(id)[field];
  const units = activeUnits();
  if (units.temperature === 'c' && units.liquid === 'ml' && units.food === 'g') return texts;
  const key = `${activeLanguage()}|${units.temperature}${units.liquid}${units.food}|${field}|${id}`;
  let converted = convertedTexts.get(key);
  if (!converted) {
    converted = texts.map((text) => localizeRecipeText(text, units));
    convertedTexts.set(key, converted);
  }
  return converted;
}

/**
 * Defines the display text of a recipe as getters, so the same object shows
 * the active language and every cache keyed by the object stays valid.
 * Called again after deriveRecipe, which copies plain fields.
 */
export function withRecipeText<T extends { id: string; dishType: DishType }>(recipe: T): T {
  const { id, dishType } = recipe;
  const get = (read: () => unknown): PropertyDescriptor => ({ get: read, enumerable: true, configurable: true });
  Object.defineProperties(recipe, {
    title: get(() => recipeText(id).title),
    description: get(() => recipeText(id).description),
    steps: get(() => displayList(id, 'steps')),
    tips: get(() => displayList(id, 'tips')),
    storage: get(() => localizeRecipeText(recipeStorage(id, dishType))),
    reheating: get(() => localizeRecipeText(recipeReheating(id, dishType))),
  });
  return recipe;
}
