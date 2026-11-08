import type { DiaryEntry } from '@/data/types';
import { format, strings } from '@/i18n';
import { formatCount, formatGrams } from '@/lib/amounts';

/** "150 g" for foods, "1 annos" / "1 ½ annosta" for recipes. */
export function entryAmount(entry: Pick<DiaryEntry, 'basis' | 'quantity'>): string {
  if (entry.basis.kind === 'food') return formatGrams(entry.quantity);
  return entry.quantity === 1
    ? strings.diary.servingsAmountOne
    : format(strings.diary.servingsAmount, { count: formatCount(entry.quantity) });
}
