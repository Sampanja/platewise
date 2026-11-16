import { describe, expect, it } from '@jest/globals';

import { DEFAULT_PANTRY, INGREDIENTS_BY_ID, RECIPES } from '@/data/catalog';
import type { PantryItem } from '@/data/types';

import {
  amountGrams,
  applyDeductions,
  daysUntil,
  defaultLocation,
  expiringItems,
  expiryReminderPlan,
  levelFor,
  mergeIntoPantry,
  pantrySuggestions,
  plannedDeductions,
} from './pantry';

const NOW = '2026-11-16';
let n = 0;
const makeId = () => `id${n++}`;

function item(ingredientId: string, extra: Partial<PantryItem> = {}): PantryItem {
  return {
    id: `p-${ingredientId}`,
    ingredientId,
    amount: { kind: 'level', level: 'plenty' },
    bestBefore: null,
    location: 'fridge',
    source: 'search',
    estimate: false,
    addedAt: '2026-11-01T10:00:00.000Z',
    ...extra,
  };
}

const staples = new Set(DEFAULT_PANTRY);

describe('amounts and places', () => {
  const cream = INGREDIENTS_BY_ID.cream;

  it('turns levels into a share of the package and back', () => {
    expect(amountGrams({ kind: 'level', level: 'half' }, cream)).toBe(Math.round(cream.packageG / 2));
    expect(amountGrams({ kind: 'grams', grams: 150 }, cream)).toBe(150);
    expect(levelFor(cream.packageG * 0.1, cream)).toBe('low');
    expect(levelFor(cream.packageG * 0.5, cream)).toBe('half');
    expect(levelFor(cream.packageG, cream)).toBe('plenty');
  });

  it('defaults dairy to the fridge and frozen food to the freezer', () => {
    expect(defaultLocation(cream)).toBe('fridge');
    expect(defaultLocation(INGREDIENTS_BY_ID['puff-pastry'])).toBe('freezer');
  });

  it('counts days to a date', () => {
    expect(daysUntil('2026-11-17', NOW)).toBe(1);
    expect(daysUntil('2026-11-14', NOW)).toBe(-2);
  });
});

describe('expiring items', () => {
  it('lists items within two days and already expired ones, soonest first', () => {
    const items = [
      item('milk', { bestBefore: '2026-11-18' }),
      item('cream', { bestBefore: '2026-11-15' }),
      item('egg', { bestBefore: '2026-11-25' }),
      item('onion'),
    ];
    expect(expiringItems(items, NOW).map((i) => i.ingredientId)).toEqual(['cream', 'milk']);
  });
});

describe('mergeIntoPantry', () => {
  it('keeps one item per ingredient, sums grams and keeps the earlier date', () => {
    const start = [item('milk', { amount: { kind: 'grams', grams: 500 }, bestBefore: '2026-11-20', estimate: true })];
    const merged = mergeIntoPantry(
      start,
      [
        { ingredientId: 'milk', amount: { kind: 'grams', grams: 1000 }, bestBefore: '2026-11-19', location: 'fridge', source: 'shopping', estimate: false },
        { ingredientId: 'cream', amount: { kind: 'level', level: 'half' }, bestBefore: null, location: 'fridge', source: 'scan', estimate: true },
      ],
      makeId,
      'now',
    );
    expect(merged).toHaveLength(2);
    expect(merged[0].amount).toEqual({ kind: 'grams', grams: 1500 });
    expect(merged[0].bestBefore).toBe('2026-11-19');
    expect(merged[0].estimate).toBe(false);
    expect(merged[1].ingredientId).toBe('cream');
  });
});

describe('pantrySuggestions', () => {
  // A real library recipe and its non-staple ingredients.
  const recipe = RECIPES.find((r) => r.ingredients.filter((i) => !staples.has(i.ingredientId)).length >= 4)!;
  const needed = [...new Set(recipe.ingredients.map((i) => i.ingredientId))].filter((id) => !staples.has(id));

  it('puts a recipe with everything at home in "ready"', () => {
    const result = pantrySuggestions([recipe], needed.map((id) => item(id)), staples, NOW);
    expect(result.ready.map((s) => s.recipe.id)).toEqual([recipe.id]);
    expect(result.ready[0].missing).toEqual([]);
  });

  it('puts a recipe missing one or two ingredients in "almost" and names them', () => {
    const result = pantrySuggestions([recipe], needed.slice(2).map((id) => item(id)), staples, NOW);
    expect(result.ready).toEqual([]);
    expect(result.almost[0].missing.sort()).toEqual(needed.slice(0, 2).sort());
  });

  it('ignores recipes missing more than two, and staples never count as missing', () => {
    const result = pantrySuggestions([recipe], [item(needed[0])], staples, NOW);
    expect(result.almost).toEqual([]);
    expect(result.ready).toEqual([]);
  });

  it('orders recipes that use expiring items first', () => {
    const other = RECIPES.find((r) => r.id !== recipe.id && r.ingredients.some((i) => i.ingredientId === needed[0]))!;
    const otherNeeded = [...new Set(other.ingredients.map((i) => i.ingredientId))].filter((id) => !staples.has(id));
    const items = [...new Set([...needed, ...otherNeeded])].map((id) =>
      item(id, { bestBefore: otherNeeded.includes(id) && !needed.includes(id) ? '2026-11-17' : null }),
    );
    const result = pantrySuggestions([recipe, other], items, staples, NOW);
    const expiringFirst = otherNeeded.some((id) => !needed.includes(id));
    if (expiringFirst) expect(result.ready[0].recipe.id).toBe(other.id);
  });
});

describe('cooking from the pantry', () => {
  it('plans at most what is at home and removes what runs out', () => {
    const cream = INGREDIENTS_BY_ID.cream;
    const recipe = RECIPES.find((r) => r.ingredients.some((i) => i.ingredientId === 'cream'))!;
    const need = recipe.ingredients.filter((i) => i.ingredientId === 'cream').reduce((sum, i) => sum + i.grams, 0);
    const items = [item('cream', { amount: { kind: 'grams', grams: 1000 } })];
    const deductions = plannedDeductions(recipe, 2, items, INGREDIENTS_BY_ID);
    expect(deductions.find((d) => d.ingredientId === 'cream')?.grams).toBe(Math.round(need * 2));
    const after = applyDeductions(items, deductions, INGREDIENTS_BY_ID);
    expect(after[0].amount).toEqual({ kind: 'grams', grams: 1000 - Math.round(need * 2) });

    const little = [item('cream', { amount: { kind: 'grams', grams: 10 } })];
    const small = plannedDeductions(recipe, 2, little, INGREDIENTS_BY_ID);
    expect(small[0].grams).toBe(10);
    expect(applyDeductions(little, small, INGREDIENTS_BY_ID)).toEqual([]);
    expect(cream.packageG).toBeGreaterThan(0);
  });

  it('turns a rough level into the level of what is left', () => {
    const recipe = RECIPES.find((r) => r.ingredients.some((i) => i.ingredientId === 'cream'))!;
    const items = [item('cream', { amount: { kind: 'level', level: 'plenty' } })];
    const after = applyDeductions(items, [{ ingredientId: 'cream', grams: INGREDIENTS_BY_ID.cream.packageG * 0.5 }], INGREDIENTS_BY_ID);
    expect(after[0].amount).toEqual({ kind: 'level', level: 'half' });
    expect(recipe).toBeDefined();
  });
});

describe('expiryReminderPlan', () => {
  it('reminds the morning before, one reminder per day, and skips past times', () => {
    const items = [
      item('milk', { bestBefore: '2026-11-18' }),
      item('cream', { bestBefore: '2026-11-18' }),
      item('eggs', { bestBefore: '2026-11-17' }),
      item('onion'),
    ];
    expect(expiryReminderPlan(items, NOW, 8)).toEqual([
      { date: '2026-11-16', ingredientIds: ['eggs'] },
      { date: '2026-11-17', ingredientIds: ['milk', 'cream'] },
    ]);
    // After nine today's reminder has passed.
    expect(expiryReminderPlan(items, NOW, 10).map((r) => r.date)).toEqual(['2026-11-17']);
  });
});
