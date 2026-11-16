import { AISLE_ORDER } from '@/data/catalog/reference';
import type { AisleCode, RecipeSource } from '@/data/types';

import type { IngredientIndex } from './recipes';

/** A recipe and its servings; single ingredients come as a recipe with only ingredients. */
export type ListEntry = { recipe: Pick<RecipeSource, 'ingredients'>; servings: number };

export type ShoppingItem = {
  ingredientId: string;
  /** Total needed across all recipes. */
  grams: number;
  /** Whole packages to buy. Zero for pantry staples. */
  packages: number;
  costCents: number;
  /** Pantry staple: expected at home, not in the total ("kotoa"). */
  fromPantry: boolean;
};

export type ShoppingList = {
  /** Items to buy, sorted by aisle and name. */
  items: ShoppingItem[];
  /** Pantry staples the recipes use. */
  pantryItems: ShoppingItem[];
  /** Sum of whole packages: the figure compared with the budget. */
  totalCents: number;
};

/**
 * One shopping list for many recipes: the same ingredient is merged across
 * recipes and rounded up to whole packages. Pantry staples are listed apart
 * and left out of the total (docs/PLAN.md, "perusvarat").
 */
export function buildShoppingList(
  entries: readonly ListEntry[],
  index: IngredientIndex,
  pantry: ReadonlySet<string>,
  /** Region price factor (domain/priceRegion.ts `priceFactor`). */
  priceFactor: number,
): ShoppingList {
  const gramsById = new Map<string, number>();
  for (const { recipe, servings } of entries) {
    if (servings <= 0) continue;
    for (const { ingredientId, grams } of recipe.ingredients) {
      if (!index[ingredientId]) throw new Error(`Unknown ingredient "${ingredientId}"`);
      gramsById.set(ingredientId, (gramsById.get(ingredientId) ?? 0) + grams * servings);
    }
  }

  const items: ShoppingItem[] = [];
  const pantryItems: ShoppingItem[] = [];
  for (const [ingredientId, grams] of gramsById) {
    const ingredient = index[ingredientId];
    if (pantry.has(ingredientId)) {
      pantryItems.push({ ingredientId, grams, packages: 0, costCents: 0, fromPantry: true });
      continue;
    }
    // Tiny floating-point overshoots must not cost an extra package.
    const packages = Math.max(1, Math.ceil(grams / ingredient.packageG - 1e-9));
    const costCents = Math.round(
      ((packages * ingredient.packageG) / 1000) * ingredient.pricePerKgCents * priceFactor,
    );
    items.push({ ingredientId, grams, packages, costCents, fromPantry: false });
  }

  const byAisleThenName = (a: ShoppingItem, b: ShoppingItem) => {
    const ia = index[a.ingredientId];
    const ib = index[b.ingredientId];
    const aisle = AISLE_ORDER.indexOf(ia.aisle) - AISLE_ORDER.indexOf(ib.aisle);
    return aisle !== 0 ? aisle : ia.name.localeCompare(ib.name, 'fi');
  };
  items.sort(byAisleThenName);
  pantryItems.sort(byAisleThenName);

  return {
    items,
    pantryItems,
    totalCents: items.reduce((sum, item) => sum + item.costCents, 0),
  };
}

/** Groups list items by store aisle, keeping the aisle walking order. */
export function groupByAisle(
  items: readonly ShoppingItem[],
  index: IngredientIndex,
): { aisle: AisleCode; items: ShoppingItem[] }[] {
  const groups = new Map<AisleCode, ShoppingItem[]>();
  for (const item of items) {
    const aisle = index[item.ingredientId].aisle;
    groups.set(aisle, [...(groups.get(aisle) ?? []), item]);
  }
  return AISLE_ORDER.filter((aisle) => groups.has(aisle)).map((aisle) => ({
    aisle,
    items: groups.get(aisle) ?? [],
  }));
}
