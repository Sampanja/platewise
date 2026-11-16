import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { newId } from '@/lib/id';

import { deviceStorage, STORAGE_PREFIX } from '../storage';
import type { ImportedRecipe } from '../types';

/** Imported and typed-in recipes (future `user_recipes`). Page images are never stored. */
type ImportedRecipesState = {
  recipes: ImportedRecipe[];
  save: (recipe: Omit<ImportedRecipe, 'id' | 'createdAt'> & { id?: string }) => ImportedRecipe;
  remove: (id: string) => ImportedRecipe | undefined;
  restore: (recipe: ImportedRecipe) => void;
  reset: () => void;
};

export const useImportedRecipesStore = create<ImportedRecipesState>()(
  persist(
    (set, get) => ({
      recipes: [],
      save: ({ id, ...input }) => {
        const existing = id ? get().recipes.find((r) => r.id === id) : undefined;
        const recipe: ImportedRecipe = { ...input, id: id ?? newId(), createdAt: existing?.createdAt ?? new Date().toISOString() };
        set((state) => ({ recipes: [recipe, ...state.recipes.filter((r) => r.id !== recipe.id)] }));
        return recipe;
      },
      remove: (id) => {
        const removed = get().recipes.find((r) => r.id === id);
        set((state) => ({ recipes: state.recipes.filter((r) => r.id !== id) }));
        return removed;
      },
      restore: (recipe) => set((state) => ({ recipes: [recipe, ...state.recipes.filter((r) => r.id !== recipe.id)] })),
      reset: () => set({ recipes: [] }),
    }),
    { name: `${STORAGE_PREFIX}importedRecipes`, storage: deviceStorage, version: 1 },
  ),
);
