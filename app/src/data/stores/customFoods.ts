import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { deviceStorage, STORAGE_PREFIX } from '../storage';
import type { Food } from '../types';

/**
 * Foods that are not in the Fineli list: own foods, foods read from a
 * nutrition label, and Open Food Facts products found by barcode (a cache, so
 * a scanned product works offline next time). Future `user_foods` table.
 */
type CustomFoodsState = {
  foods: Food[];
  /** Adds or replaces by id. */
  upsert: (food: Food) => void;
  remove: (id: string) => void;
  reset: () => void;
};

export const useCustomFoodsStore = create<CustomFoodsState>()(
  persist(
    (set) => ({
      foods: [],
      upsert: (food) => set((state) => ({ foods: [food, ...state.foods.filter((f) => f.id !== food.id)] })),
      remove: (id) => set((state) => ({ foods: state.foods.filter((f) => f.id !== id) })),
      reset: () => set({ foods: [] }),
    }),
    { name: `${STORAGE_PREFIX}customFoods`, storage: deviceStorage, version: 1 },
  ),
);

export function findCustomFood(id: string): Food | undefined {
  return useCustomFoodsStore.getState().foods.find((food) => food.id === id);
}
