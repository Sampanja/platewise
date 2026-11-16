import { INGREDIENTS_BY_ID } from '@/data/catalog';
import type { PantryAmount, PantryItem } from '@/data/types';
import { daysUntil } from '@/domain/pantry';
import { format, strings } from '@/i18n';
import { formatAmount } from '@/lib/amounts';
import { shortDate, today } from '@/lib/dates';

/** "Puolet" or "400 g" / "2 sipulia" in the user's units. */
export function pantryAmountLabel(ingredientId: string, amount: PantryAmount): string {
  if (amount.kind === 'level') return strings.pantry.levels[amount.level];
  const ingredient = INGREDIENTS_BY_ID[ingredientId];
  return ingredient ? formatAmount(ingredient, amount.grams) : '';
}

/** Best-before text, or null without a date. Neutral wording, no warning colours. */
export function expiryLabel(item: Pick<PantryItem, 'bestBefore'>, now = today()): string | null {
  if (!item.bestBefore) return null;
  const days = daysUntil(item.bestBefore, now);
  if (days < 0) return format(strings.pantry.expired, { date: shortDate(item.bestBefore) });
  if (days === 0) return strings.pantry.expiresToday;
  if (days === 1) return strings.pantry.expiresTomorrow;
  return format(strings.pantry.bestBefore, { date: shortDate(item.bestBefore) });
}

export function ingredientName(id: string): string {
  return INGREDIENTS_BY_ID[id]?.name ?? id;
}
