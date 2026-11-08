import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { deviceStorage, STORAGE_PREFIX } from '../storage';

/** Local favourites repository (future `recipe_favorites` table). */
type FavoritesState = {
  ids: string[];
  toggle: (recipeId: string) => void;
  reset: () => void;
};

export const useFavoritesStore = create<FavoritesState>()(
  persist(
    (set) => ({
      ids: [],
      toggle: (recipeId) =>
        set((state) => ({
          ids: state.ids.includes(recipeId)
            ? state.ids.filter((id) => id !== recipeId)
            : [recipeId, ...state.ids],
        })),
      reset: () => set({ ids: [] }),
    }),
    { name: `${STORAGE_PREFIX}favorites`, storage: deviceStorage, version: 1 },
  ),
);

export function useIsFavorite(recipeId: string): boolean {
  return useFavoritesStore((state) => state.ids.includes(recipeId));
}
