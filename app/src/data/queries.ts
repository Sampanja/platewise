import { useQuery } from '@tanstack/react-query';

import { catalogRepository } from './repositories/catalog';

/** Reference data changes rarely: load once per app session. */
const REFERENCE = { staleTime: Infinity, gcTime: Infinity } as const;

export function useRecipesQuery() {
  return useQuery({ queryKey: ['catalog', 'recipes'], queryFn: catalogRepository.listRecipes, ...REFERENCE });
}

export function useFoodsQuery() {
  return useQuery({ queryKey: ['catalog', 'foods'], queryFn: catalogRepository.listFoods, ...REFERENCE });
}
