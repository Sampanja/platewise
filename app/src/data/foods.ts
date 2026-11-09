import { useMemo } from 'react';

import { FOODS_BY_ID } from './catalog';
import { useFoodsQuery } from './queries';
import { useCustomFoodsStore } from './stores/customFoods';
import type { Food } from './types';

/** A food by id from the Fineli list or the user's own foods and scanned products. */
export function useFood(id: string | undefined): Food | undefined {
  const custom = useCustomFoodsStore((s) => (id ? s.foods.find((food) => food.id === id) : undefined));
  return id ? (FOODS_BY_ID[id] ?? custom) : undefined;
}

/** Everything the food search covers: own foods and products first, then the Fineli list. */
export function useSearchableFoods(): { foods: Food[]; isPending: boolean } {
  const query = useFoodsQuery();
  const custom = useCustomFoodsStore((s) => s.foods);
  const foods = useMemo(() => [...custom, ...(query.data ?? [])], [custom, query.data]);
  return { foods, isPending: query.isPending };
}

export function findFood(id: string): Food | undefined {
  return FOODS_BY_ID[id] ?? useCustomFoodsStore.getState().foods.find((food) => food.id === id);
}
