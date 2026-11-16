import type {
  Ingredient,
  PantryAmount,
  PantryItem,
  PantryLevel,
  PantryLocation,
  Recipe,
} from '@/data/types';
import { addDays, parseLocalDate, type LocalDate } from '@/lib/dates';

/**
 * Ruokavarasto: what is at home, and what can be cooked from it. Pure and
 * unit tested (pantry.test.ts). Rules:
 * - One item per ingredient; adding the same ingredient again merges.
 * - Basic staples (the profile's pantry: oil, salt…) always count as available.
 * - A rough level is a share of the ingredient's package (low ≈ 20 %, half
 *   50 %, plenty a whole package), so it can be compared with recipe grams.
 */

type IngredientIndex = Readonly<Record<string, Ingredient>>;

const LEVEL_SHARE: Record<PantryLevel, number> = { low: 0.2, half: 0.5, plenty: 1 };

/** Days before the best-before date when an item counts as "vanhenee pian". */
export const EXPIRING_DAYS = 2;

export function levelGrams(level: PantryLevel, ingredient: Ingredient): number {
  return Math.round(ingredient.packageG * LEVEL_SHARE[level]);
}

export function amountGrams(amount: PantryAmount, ingredient: Ingredient): number {
  return amount.kind === 'grams' ? amount.grams : levelGrams(amount.level, ingredient);
}

/** The level that best describes an amount in grams. */
export function levelFor(grams: number, ingredient: Ingredient): PantryLevel {
  const share = grams / ingredient.packageG;
  if (share <= 0.3) return 'low';
  if (share <= 0.7) return 'half';
  return 'plenty';
}

/** Default storage place by store section. */
export function defaultLocation(ingredient: Ingredient): PantryLocation {
  switch (ingredient.aisle) {
    case 'frozen':
      return 'freezer';
    case 'dairy':
    case 'meat':
    case 'fish':
    case 'produce':
      return 'fridge';
    default:
      return 'cupboard';
  }
}

/** Whole days from `now` to the date (negative when past). */
export function daysUntil(date: LocalDate, now: LocalDate): number {
  return Math.round((parseLocalDate(date).getTime() - parseLocalDate(now).getTime()) / 86_400_000);
}

export function isExpiringSoon(item: PantryItem, now: LocalDate, within = EXPIRING_DAYS): boolean {
  return item.bestBefore !== null && item.bestBefore <= addDays(now, within);
}

/** Items expiring within `within` days (also already expired), soonest first. */
export function expiringItems(items: readonly PantryItem[], now: LocalDate, within = EXPIRING_DAYS): PantryItem[] {
  return items
    .filter((item) => isExpiringSoon(item, now, within))
    .sort((a, b) => (a.bestBefore ?? '').localeCompare(b.bestBefore ?? ''));
}

export type PantryAddition = Omit<PantryItem, 'id' | 'addedAt'>;

/**
 * Adds items, one per ingredient: grams add up, otherwise the new amount
 * replaces the old one. The earlier best-before date wins (the older package
 * is used first). An edited item stops being an estimate.
 */
export function mergeIntoPantry(
  items: readonly PantryItem[],
  additions: readonly PantryAddition[],
  makeId: () => string,
  nowIso: string,
): PantryItem[] {
  const out = [...items];
  for (const add of additions) {
    const index = out.findIndex((item) => item.ingredientId === add.ingredientId);
    if (index < 0) {
      out.push({ ...add, id: makeId(), addedAt: nowIso });
      continue;
    }
    const old = out[index];
    const amount: PantryAmount =
      old.amount.kind === 'grams' && add.amount.kind === 'grams'
        ? { kind: 'grams', grams: old.amount.grams + add.amount.grams }
        : add.amount;
    const dates = [old.bestBefore, add.bestBefore].filter((d): d is LocalDate => d !== null).sort();
    out[index] = {
      ...old,
      amount,
      bestBefore: dates[0] ?? null,
      location: add.location,
      estimate: old.estimate && add.estimate,
    };
  }
  return out;
}

export type PantrySuggestion = {
  recipe: Recipe;
  /** Non-staple ingredients found in the pantry. */
  used: string[];
  /** Non-staple ingredients not at home. */
  missing: string[];
  /** Used ingredients that expire soon: these recipes come first. */
  expiring: string[];
};

export type PantrySuggestions = {
  /** "Voit tehdä heti": nothing missing. */
  ready: PantrySuggestion[];
  /** "Puuttuu 1–2 ainesosaa". */
  almost: PantrySuggestion[];
};

/**
 * Recipes that can be cooked from the pantry. `recipes` must already be the
 * user's allowed recipes (isRecipeAllowed): this never widens the gate.
 * A recipe must use at least one pantry item; "almost" recipes must use at
 * least two, so a single egg does not suggest everything with eggs.
 */
export function pantrySuggestions(
  recipes: readonly Recipe[],
  items: readonly PantryItem[],
  staples: ReadonlySet<string>,
  now: LocalDate,
): PantrySuggestions {
  const have = new Set(items.map((item) => item.ingredientId));
  const expiringIds = new Set(expiringItems(items, now, EXPIRING_DAYS + 1).map((item) => item.ingredientId));
  const ready: PantrySuggestion[] = [];
  const almost: PantrySuggestion[] = [];
  for (const recipe of recipes) {
    const needed = [...new Set(recipe.ingredients.map((i) => i.ingredientId))].filter((id) => !staples.has(id));
    const used = needed.filter((id) => have.has(id));
    if (used.length === 0) continue;
    const missing = needed.filter((id) => !have.has(id));
    const suggestion = { recipe, used, missing, expiring: used.filter((id) => expiringIds.has(id)) };
    if (missing.length === 0) ready.push(suggestion);
    else if (missing.length <= 2 && used.length >= 2) almost.push(suggestion);
  }
  const order = (a: PantrySuggestion, b: PantrySuggestion) =>
    b.expiring.length - a.expiring.length ||
    a.missing.length - b.missing.length ||
    b.used.length - a.used.length ||
    a.recipe.totalTimeMin - b.recipe.totalTimeMin ||
    a.recipe.id.localeCompare(b.recipe.id);
  return { ready: ready.sort(order), almost: almost.sort(order) };
}

export type Deduction = { ingredientId: string; grams: number };

/**
 * What cooking a recipe takes from the pantry: each recipe ingredient that is
 * at home (staples excluded, they are not tracked), at most what is there.
 */
export function plannedDeductions(
  recipe: Recipe,
  servings: number,
  items: readonly PantryItem[],
  index: IngredientIndex,
): Deduction[] {
  const out: Deduction[] = [];
  for (const { ingredientId, grams } of recipe.ingredients) {
    const item = items.find((i) => i.ingredientId === ingredientId);
    const ingredient = index[ingredientId];
    if (!item || !ingredient) continue;
    const available = amountGrams(item.amount, ingredient);
    const need = Math.round(grams * servings);
    const existing = out.find((d) => d.ingredientId === ingredientId);
    if (existing) existing.grams = Math.min(available, existing.grams + need);
    else out.push({ ingredientId, grams: Math.min(available, need) });
  }
  return out.filter((d) => d.grams > 0);
}

/**
 * Takes the deductions out of the pantry. Exact amounts go down in grams; a
 * rough level becomes the level of what is left. An item with almost nothing
 * left (under 10 % of a package, or 0 g) is removed.
 */
export function applyDeductions(
  items: readonly PantryItem[],
  deductions: readonly Deduction[],
  index: IngredientIndex,
): PantryItem[] {
  const out: PantryItem[] = [];
  for (const item of items) {
    const deduction = deductions.find((d) => d.ingredientId === item.ingredientId);
    const ingredient = index[item.ingredientId];
    if (!deduction || !ingredient) {
      out.push(item);
      continue;
    }
    const left = amountGrams(item.amount, ingredient) - deduction.grams;
    if (left <= 0 || left < ingredient.packageG * 0.1) continue;
    const amount: PantryAmount =
      item.amount.kind === 'grams' ? { kind: 'grams', grams: Math.round(left) } : { kind: 'level', level: levelFor(left, ingredient) };
    out.push({ ...item, amount, estimate: false });
  }
  return out;
}

/** Hour of the morning when expiry reminders are shown. */
export const EXPIRY_REMINDER_HOUR = 9;
/** At most this many upcoming reminder days are scheduled at a time. */
export const EXPIRY_REMINDER_DAYS = 5;

export type ExpiryReminder = { date: LocalDate; ingredientIds: string[] };

/**
 * When to remind about expiring food: the morning before the best-before
 * date. Items expiring on the same day share one reminder. A reminder whose
 * time has already passed today is skipped (the item is visible in the app).
 */
export function expiryReminderPlan(items: readonly PantryItem[], now: LocalDate, hourNow: number): ExpiryReminder[] {
  const byDay = new Map<LocalDate, string[]>();
  for (const item of items) {
    if (!item.bestBefore) continue;
    const day = addDays(item.bestBefore, -1);
    if (day < now || (day === now && hourNow >= EXPIRY_REMINDER_HOUR)) continue;
    byDay.set(day, [...(byDay.get(day) ?? []), item.ingredientId]);
  }
  return [...byDay.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(0, EXPIRY_REMINDER_DAYS)
    .map(([date, ingredientIds]) => ({ date, ingredientIds }));
}
