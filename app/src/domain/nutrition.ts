import type { Macros } from '@/data/types';

/** Energy from macros with EU label factors: 4 / 4 / 9 kcal per g, fibre 2 kcal per g. */
export function energyFromMacros(m: Macros): number {
  return m.proteinG * 4 + m.carbsG * 4 + m.fatG * 9 + (m.fiberG ?? 0) * 2;
}

/**
 * When typed or read label values do not add up, returns the energy computed
 * from the macros so the UI can ask the user to check (never blocks saving).
 * Tolerance: 20 kcal or 15 %, whichever is larger (labels round values).
 */
export function energyMismatch(m: Macros): number | null {
  const computed = energyFromMacros(m);
  if (m.kcal <= 0 && computed <= 0) return null;
  const tolerance = Math.max(20, m.kcal * 0.15);
  return Math.abs(computed - m.kcal) > tolerance ? Math.round(computed) : null;
}

/** A number typed on a form ("12,5"). Empty, negative or invalid input is undefined. */
export function parseAmount(text: string): number | undefined {
  const value = Number(text.replace(',', '.').trim());
  return text.trim() === '' || !Number.isFinite(value) || value < 0 ? undefined : value;
}
