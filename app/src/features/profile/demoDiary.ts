import { FOODS_BY_ID } from '@/data/catalog';
import type { NewDiaryEntry } from '@/data/stores/diary';
import type { DiaryMeal } from '@/data/types';
import { seededRandom } from '@/domain/generate';
import { addDays, type LocalDate } from '@/lib/dates';

/** Typical Finnish days used to fill the diary for testing the charts. */
const MEALS: Record<DiaryMeal, readonly (readonly [string, number])[][]> = {
  breakfast: [
    [['oat-porridge-milk', 250], ['blueberries', 60], ['coffee-milk', 170]],
    [['rye-bread', 70], ['edam', 20], ['cucumber', 40], ['coffee', 150]],
    [['greek-yogurt', 150], ['granola', 45], ['banana', 120]],
  ],
  lunch: [
    [['salmon-soup', 350], ['rye-bread', 35]],
    [['macaroni-casserole', 300], ['mixed-salad', 80]],
    [['caesar-salad', 300]],
    [['pea-soup', 350], ['pancake', 100]],
  ],
  dinner: [
    [['chicken-breast', 130], ['rice-cooked', 150], ['mixed-salad', 80]],
    [['spaghetti-bolognese', 350]],
    [['salmon-baked', 130], ['potato-boiled', 200], ['broccoli', 100]],
    [['meatballs', 150], ['mashed-potato', 200], ['lingonberries', 30]],
  ],
  snack: [
    [['apple', 150]],
    [['protein-bar', 55]],
    [['cinnamon-bun', 80], ['coffee-milk', 170]],
    [['nuts-mix', 30], ['mandarin', 70]],
  ],
};

/** Plausible entries for the seven days ending on `endDate`. */
export function demoDiaryEntries(endDate: LocalDate): NewDiaryEntry[] {
  const random = seededRandom(Date.parse(endDate) / 86_400_000);
  const entries: NewDiaryEntry[] = [];
  for (let day = 6; day >= 0; day--) {
    const date = addDays(endDate, -day);
    for (const meal of Object.keys(MEALS) as DiaryMeal[]) {
      if (meal === 'snack' && random() < 0.3) continue;
      const options = MEALS[meal];
      const plate = options[Math.floor(random() * options.length)];
      for (const [foodId, grams] of plate) {
        const food = FOODS_BY_ID[foodId];
        if (!food) continue;
        entries.push({
          date,
          meal,
          name: food.name,
          basis: { kind: 'food', foodId, per100g: food.per100g },
          quantity: Math.round(grams * (0.85 + random() * 0.3)),
          estimate: false,
        });
      }
    }
  }
  return entries;
}
