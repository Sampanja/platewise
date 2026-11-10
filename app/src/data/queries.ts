import { useQuery } from '@tanstack/react-query';
import { useCallback } from 'react';

import { useRecipeAllowed } from './hooks';
import { catalogRepository } from './repositories/catalog';
import type { Recipe } from './types';

/** Reference data changes rarely: load once per app session. */
const REFERENCE = { staleTime: Infinity, gcTime: Infinity } as const;

/**
 * The recipe library as this user may see it: only recipes that pass
 * isRecipeAllowed for their allergies and diets. There is deliberately no
 * unfiltered recipe query for screens.
 */
export function useAllowedRecipesQuery() {
  const allowed = useRecipeAllowed();
  const select = useCallback((recipes: readonly Recipe[]) => recipes.filter(allowed), [allowed]);
  return useQuery({ queryKey: ['catalog', 'recipes'], queryFn: catalogRepository.listRecipes, select, ...REFERENCE });
}

export function useFoodsQuery() {
  return useQuery({ queryKey: ['catalog', 'foods'], queryFn: catalogRepository.listFoods, ...REFERENCE });
}
