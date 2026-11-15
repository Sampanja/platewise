import type { Food } from '@/data/types';

function normalize(text: string): string {
  return text.toLowerCase().normalize('NFC').trim();
}

/**
 * Food search: names containing the query, those starting with it first, then
 * alphabetical. An empty query returns the list as is.
 */
export function searchFoods(foods: readonly Food[], query: string): Food[] {
  const q = normalize(query);
  if (!q) return [...foods];
  return foods
    .filter((food) => normalize(food.name).includes(q))
    .sort((a, b) => {
      const aStarts = normalize(a.name).startsWith(q) ? 0 : 1;
      const bStarts = normalize(b.name).startsWith(q) ? 0 : 1;
      return aStarts - bStarts || a.name.localeCompare(b.name, 'fi');
    });
}
