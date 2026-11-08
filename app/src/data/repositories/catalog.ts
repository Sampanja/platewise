import { FOODS, RECIPES } from '../catalog';
import type { Food, Recipe } from '../types';

/**
 * Read access to shared reference data. The local implementation serves the
 * bundled test catalog; the Supabase implementation will call the
 * `list-recipes` Edge Function and the Fineli tables with the same signatures.
 */
export interface CatalogRepository {
  listRecipes(): Promise<readonly Recipe[]>;
  listFoods(): Promise<readonly Food[]>;
}

/** Small artificial delay so loading states are exercised like with a network. */
const LATENCY_MS = 350;

function later<T>(value: T): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), LATENCY_MS));
}

const localCatalog: CatalogRepository = {
  listRecipes: () => later(RECIPES),
  listFoods: () => later(FOODS),
};

export const catalogRepository: CatalogRepository = localCatalog;
