import { create } from 'zustand';

import type { PantryAmount, PantryLocation } from '../types';

/** One row of the scan review: a recognised (or added) ingredient before it is saved. */
export type DraftRow = {
  key: string;
  ingredientId: string;
  amount: PantryAmount;
  location: PantryLocation;
  /** Recognition confidence 0–1; below 0.6 the row asks to be checked. Null when added by hand. */
  confidence: number | null;
};

/**
 * The scan → review hand-off. Not persisted: photos are not stored, and a
 * review the user leaves is simply dropped.
 */
type DraftState = {
  rows: DraftRow[];
  photoCount: number;
  set: (rows: DraftRow[], photoCount: number) => void;
  clear: () => void;
};

export const usePantryDraftStore = create<DraftState>()((set) => ({
  rows: [],
  photoCount: 0,
  set: (rows, photoCount) => set({ rows, photoCount }),
  clear: () => set({ rows: [], photoCount: 0 }),
}));
