import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { newId } from '@/lib/id';

import { deviceStorage, STORAGE_PREFIX } from '../storage';
import type { OwnRecipe, SavedMeal } from '../types';

/** "Omat ateriat" and "omat reseptit" (future `saved_meals` and `user_recipes`). */
type MyMealsState = {
  meals: SavedMeal[];
  recipes: OwnRecipe[];
  saveMeal: (meal: Omit<SavedMeal, 'id' | 'createdAt'>) => SavedMeal;
  removeMeal: (id: string) => void;
  saveRecipe: (recipe: Omit<OwnRecipe, 'id' | 'createdAt'> & { id?: string }) => OwnRecipe;
  removeRecipe: (id: string) => void;
  reset: () => void;
};

export const useMyMealsStore = create<MyMealsState>()(
  persist(
    (set) => ({
      meals: [],
      recipes: [],
      saveMeal: (input) => {
        const meal: SavedMeal = { ...input, id: newId(), createdAt: new Date().toISOString() };
        set((state) => ({ meals: [meal, ...state.meals] }));
        return meal;
      },
      removeMeal: (id) => set((state) => ({ meals: state.meals.filter((m) => m.id !== id) })),
      saveRecipe: ({ id, ...input }) => {
        const recipe: OwnRecipe = { ...input, id: id ?? newId(), createdAt: new Date().toISOString() };
        set((state) => ({ recipes: [recipe, ...state.recipes.filter((r) => r.id !== recipe.id)] }));
        return recipe;
      },
      removeRecipe: (id) => set((state) => ({ recipes: state.recipes.filter((r) => r.id !== id) })),
      reset: () => set({ meals: [], recipes: [] }),
    }),
    { name: `${STORAGE_PREFIX}myMeals`, storage: deviceStorage, version: 1 },
  ),
);
