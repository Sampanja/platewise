import { useMemo, useState } from 'react';

import { QualityBadge } from '@/components/QualityBadge';
import { recipeQuality } from '@/data/catalog/quality';
import { useAllowedRecipesQuery } from '@/data/queries';
import type { Recipe } from '@/data/types';
import { isBetterGrade, type QualityGrade } from '@/domain/qualityScore';

import { QualitySheet } from './QualitySheet';

/**
 * A similar allowed recipe with a better grade: same dish type and meal,
 * preferring the same main protein. Only offered for C–E, kindly.
 */
export function betterAlternative(recipe: Recipe, allowed: readonly Recipe[]): { recipe: Recipe; grade: QualityGrade } | null {
  const own = recipeQuality(recipe)?.grade;
  if (!own || own === 'A' || own === 'B') return null;
  let best: { recipe: Recipe; grade: QualityGrade; rank: number } | null = null;
  for (const other of allowed) {
    if (other.id === recipe.id || other.dishType !== recipe.dishType) continue;
    if (!other.meals.some((meal) => recipe.meals.includes(meal))) continue;
    const grade = recipeQuality(other)?.grade;
    if (!grade || !isBetterGrade(grade, own)) continue;
    const rank = (other.mainProtein === recipe.mainProtein ? 0 : 10) + 'ABCDE'.indexOf(grade);
    if (!best || rank < best.rank) best = { recipe: other, grade, rank };
  }
  return best ? { recipe: best.recipe, grade: best.grade } : null;
}

/** Recipe page: the grade, and "Miksi tämä arvio?" on tap. */
export function RecipeQualityBadge({ recipe }: { recipe: Recipe }) {
  const score = recipeQuality(recipe);
  const [open, setOpen] = useState(false);
  const allowed = useAllowedRecipesQuery();
  const alternative = useMemo(() => (open && allowed.data ? betterAlternative(recipe, allowed.data) : null), [open, allowed.data, recipe]);
  if (!score) return null;
  return (
    <>
      <QualityBadge grade={score.grade} onPress={() => setOpen(true)} />
      <QualitySheet
        visible={open}
        onClose={() => setOpen(false)}
        title={recipe.title}
        score={score}
        grade={score.grade}
        alternative={alternative}
      />
    </>
  );
}
