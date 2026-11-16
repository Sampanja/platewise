import { RECIPES_BY_ID } from '@/data/catalog';
import { foodFruitVegPct, foodQuality, recipeFruitVegPct, recipeQuality } from '@/data/catalog/quality';
import { findFood } from '@/data/foods';
import type { DiaryEntry } from '@/data/types';
import { combine, qualityScore, type QualityGrade, type QualityScore, type WeightedFood } from '@/domain/qualityScore';

/** A logged entry's grade: our own score, or the product's official Nutri-Score. Quick entries have none. */
export type EntryQuality = { grade: QualityGrade; score: QualityScore | null };

function recipeServingGrams(recipeId: string): number {
  const recipe = RECIPES_BY_ID[recipeId];
  return recipe ? recipe.ingredients.reduce((sum, i) => sum + i.grams, 0) : 0;
}

export function entryQuality(entry: Pick<DiaryEntry, 'basis'>): EntryQuality | null {
  const { basis } = entry;
  if (basis.kind === 'quick') return null;
  if (basis.kind === 'recipe') {
    const recipe = RECIPES_BY_ID[basis.recipeId];
    const score = recipe ? recipeQuality(recipe) : null;
    return score ? { grade: score.grade, score } : null;
  }
  const food = findFood(basis.foodId);
  if (food?.nutriScore) return { grade: food.nutriScore, score: null };
  const score = food ? foodQuality({ ...food, per100g: basis.per100g }) : qualityScore({ per100g: basis.per100g, fruitVegPct: 0 });
  return { grade: score.grade, score };
}

/** The entry as grams of food for mixing a day together; null when its weight is unknown. */
export function entryWeighted(entry: Pick<DiaryEntry, 'basis' | 'quantity'>): WeightedFood | null {
  const { basis } = entry;
  if (basis.kind === 'quick') return null;
  if (basis.kind === 'food') {
    const food = findFood(basis.foodId);
    return { grams: entry.quantity, per100g: basis.per100g, fruitVegPct: food ? foodFruitVegPct(food) : 0 };
  }
  const recipe = RECIPES_BY_ID[basis.recipeId];
  const serving = recipeServingGrams(basis.recipeId);
  if (!recipe || serving <= 0) return null;
  const factor = 100 / serving;
  const per100g = Object.fromEntries(Object.entries(basis.perServing).map(([k, v]) => [k, (v as number) * factor])) as typeof basis.perServing;
  return { grams: serving * entry.quantity, per100g, fruitVegPct: recipeFruitVegPct(recipe) };
}

/** The whole day's score: every weighed entry mixed by grams. Null with nothing to weigh. */
export function dayQuality(entries: readonly Pick<DiaryEntry, 'basis' | 'quantity'>[]): QualityScore | null {
  const mix = combine(entries.map(entryWeighted).filter((item): item is WeightedFood => item !== null));
  return mix ? qualityScore(mix) : null;
}
