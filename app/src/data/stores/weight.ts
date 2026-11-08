import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import type { WeightEntry } from '@/domain/energy';

import { deviceStorage, STORAGE_PREFIX } from '../storage';

/**
 * Local weight log repository (future `weight_entries` table). Health data:
 * device only, never logged or sent to analytics. One entry per day.
 */
type WeightState = {
  entries: WeightEntry[];
  /** Adds or replaces the entry for the date. */
  log: (date: string, kg: number) => void;
  remove: (date: string) => WeightEntry | undefined;
  restore: (entry: WeightEntry) => void;
  reset: () => void;
};

const sortByDate = (entries: WeightEntry[]) => [...entries].sort((a, b) => a.date.localeCompare(b.date));

export const useWeightStore = create<WeightState>()(
  persist(
    (set, get) => ({
      entries: [],
      log: (date, kg) =>
        set((state) => ({
          entries: sortByDate([
            ...state.entries.filter((e) => e.date !== date),
            { date, kg: Math.round(kg * 10) / 10 },
          ]),
        })),
      remove: (date) => {
        const removed = get().entries.find((e) => e.date === date);
        set((state) => ({ entries: state.entries.filter((e) => e.date !== date) }));
        return removed;
      },
      restore: (entry) =>
        set((state) => ({
          entries: sortByDate([...state.entries.filter((e) => e.date !== entry.date), entry]),
        })),
      reset: () => set({ entries: [] }),
    }),
    { name: `${STORAGE_PREFIX}weight`, storage: deviceStorage, version: 1 },
  ),
);
