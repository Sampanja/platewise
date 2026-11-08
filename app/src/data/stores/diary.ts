import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { newId } from '@/lib/id';

import { deviceStorage, STORAGE_PREFIX } from '../storage';
import type { DiaryEntry } from '../types';

/** Local diary repository (`diary_entries`). Health data: never logged. */
export type NewDiaryEntry = Omit<DiaryEntry, 'id' | 'createdAt'>;

type DiaryState = {
  entries: DiaryEntry[];
  /** Most recently used food ids, newest first (search shows these first). */
  recentFoodIds: string[];
  add: (entry: NewDiaryEntry) => DiaryEntry;
  addMany: (entries: NewDiaryEntry[]) => void;
  update: (id: string, patch: Partial<Pick<DiaryEntry, 'quantity' | 'meal' | 'date'>>) => void;
  remove: (id: string) => DiaryEntry | undefined;
  /** Puts back an entry removed a moment ago ("Kumoa"). */
  restore: (entry: DiaryEntry) => void;
  reset: () => void;
};

const RECENT_LIMIT = 12;

function rememberFood(recent: string[], entry: NewDiaryEntry): string[] {
  if (entry.basis.kind !== 'food') return recent;
  const foodId = entry.basis.foodId;
  return [foodId, ...recent.filter((id) => id !== foodId)].slice(0, RECENT_LIMIT);
}

export const useDiaryStore = create<DiaryState>()(
  persist(
    (set, get) => ({
      entries: [],
      recentFoodIds: [],
      add: (input) => {
        const entry: DiaryEntry = { ...input, id: newId(), createdAt: new Date().toISOString() };
        set((state) => ({
          entries: [...state.entries, entry],
          recentFoodIds: rememberFood(state.recentFoodIds, input),
        }));
        return entry;
      },
      addMany: (inputs) =>
        set((state) => ({
          entries: [
            ...state.entries,
            ...inputs.map((input) => ({ ...input, id: newId(), createdAt: new Date().toISOString() })),
          ],
          recentFoodIds: inputs.reduce(rememberFood, state.recentFoodIds),
        })),
      update: (id, patch) =>
        set((state) => ({
          entries: state.entries.map((entry) => (entry.id === id ? { ...entry, ...patch } : entry)),
        })),
      remove: (id) => {
        const removed = get().entries.find((entry) => entry.id === id);
        set((state) => ({ entries: state.entries.filter((entry) => entry.id !== id) }));
        return removed;
      },
      restore: (entry) =>
        set((state) =>
          state.entries.some((e) => e.id === entry.id) ? state : { entries: [...state.entries, entry] },
        ),
      reset: () => set({ entries: [], recentFoodIds: [] }),
    }),
    { name: `${STORAGE_PREFIX}diary`, storage: deviceStorage, version: 1 },
  ),
);
