import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { deviceStorage, STORAGE_PREFIX } from '../storage';

/** Water tracking per day (ml). Future `water_entries`. */
export const GLASS_ML = 250;
export const DEFAULT_WATER_GOAL_ML = 1500;
const MAX_DAY_ML = 8000;

type WaterState = {
  byDate: Record<string, number>;
  goalMl: number;
  add: (date: string, ml: number) => void;
  setGoal: (ml: number) => void;
  reset: () => void;
};

export const useWaterStore = create<WaterState>()(
  persist(
    (set) => ({
      byDate: {},
      goalMl: DEFAULT_WATER_GOAL_ML,
      add: (date, ml) =>
        set((state) => ({
          byDate: { ...state.byDate, [date]: Math.min(MAX_DAY_ML, Math.max(0, (state.byDate[date] ?? 0) + ml)) },
        })),
      setGoal: (goalMl) => set({ goalMl }),
      reset: () => set({ byDate: {}, goalMl: DEFAULT_WATER_GOAL_ML }),
    }),
    { name: `${STORAGE_PREFIX}water`, storage: deviceStorage, version: 1 },
  ),
);
