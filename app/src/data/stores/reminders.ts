import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { deviceStorage, STORAGE_PREFIX } from '../storage';
import type { DiaryMeal } from '../types';

/** Meal reminder settings. Off by default; the user picks meals and times. */
export type ReminderTime = { on: boolean; hour: number; minute: number };

export const DEFAULT_REMINDERS: Record<DiaryMeal, ReminderTime> = {
  breakfast: { on: true, hour: 8, minute: 0 },
  lunch: { on: true, hour: 11, minute: 30 },
  dinner: { on: true, hour: 17, minute: 30 },
  snack: { on: false, hour: 14, minute: 30 },
};

type RemindersState = {
  enabled: boolean;
  times: Record<DiaryMeal, ReminderTime>;
  setEnabled: (enabled: boolean) => void;
  setTime: (meal: DiaryMeal, patch: Partial<ReminderTime>) => void;
  reset: () => void;
};

export const useRemindersStore = create<RemindersState>()(
  persist(
    (set) => ({
      enabled: false,
      times: { ...DEFAULT_REMINDERS },
      setEnabled: (enabled) => set({ enabled }),
      setTime: (meal, patch) => set((state) => ({ times: { ...state.times, [meal]: { ...state.times[meal], ...patch } } })),
      reset: () => set({ enabled: false, times: { ...DEFAULT_REMINDERS } }),
    }),
    { name: `${STORAGE_PREFIX}reminders`, storage: deviceStorage, version: 1 },
  ),
);
