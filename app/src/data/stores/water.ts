import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import {
  DEFAULT_GLASS_ML,
  MAX_DAY_ML,
  NO_EXTRAS,
  totalsByDate,
  type DayExtras,
  type DrinkType,
  type WaterEntry,
} from '@/domain/hydration';

import { waterToEntries } from '../migrations';
import { deviceStorage, STORAGE_PREFIX } from '../storage';

/**
 * Local drink log (future `water_entries`, `water_settings`). Health data:
 * stays on the device, never in logs or analytics.
 */

export type WaterReminders = { on: boolean; startHour: number; endHour: number; everyHours: number };
export const DEFAULT_WATER_REMINDERS: WaterReminders = { on: false, startHour: 9, endHour: 21, everyHours: 2 };

/** Entries older than this are dropped to keep the saved state small. */
const KEEP_DAYS = 400;

type WaterState = {
  entries: WaterEntry[];
  /** Daily totals, kept in sync with `entries` for cheap selectors. */
  byDate: Record<string, number>;
  /** 'auto' follows the personal recommendation; 'manual' uses `manualGoalMl`. */
  goalMode: 'auto' | 'manual';
  manualGoalMl: number;
  /** Exercise and heat per day; they raise that day's goal. */
  dayExtras: Record<string, DayExtras>;
  /** The one-tap glass size. */
  glassMl: number;
  /** The drink type picked last, preselected next time. */
  lastDrink: DrinkType;
  reminders: WaterReminders;
  add: (date: string, ml: number, drink?: DrinkType, time?: string) => WaterEntry | null;
  remove: (id: string) => WaterEntry | null;
  /** The minus button: removes the day's latest drink. */
  removeLast: (date: string) => WaterEntry | null;
  restore: (entry: WaterEntry) => void;
  setGoalMode: (mode: 'auto' | 'manual') => void;
  setManualGoal: (ml: number) => void;
  setDayExtras: (date: string, patch: Partial<DayExtras>) => void;
  setGlassMl: (ml: number) => void;
  setLastDrink: (drink: DrinkType) => void;
  setReminders: (patch: Partial<WaterReminders>) => void;
  reset: () => void;
};

function nowTime(): string {
  const d = new Date();
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

function newId(): string {
  return `w-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

function cutoff(): string {
  const d = new Date();
  d.setDate(d.getDate() - KEEP_DAYS);
  return d.toISOString().slice(0, 10);
}

const withTotals = (entries: WaterEntry[]) => ({ entries, byDate: totalsByDate(entries) });

const INITIAL = {
  entries: [] as WaterEntry[],
  byDate: {} as Record<string, number>,
  goalMode: 'auto' as const,
  manualGoalMl: 2000,
  dayExtras: {} as Record<string, DayExtras>,
  glassMl: DEFAULT_GLASS_ML,
  lastDrink: 'water' as DrinkType,
  reminders: DEFAULT_WATER_REMINDERS,
};

export const useWaterStore = create<WaterState>()(
  persist(
    (set, get) => ({
      ...INITIAL,
      add: (date, ml, drink = get().lastDrink, time = nowTime()) => {
        const room = MAX_DAY_ML - (get().byDate[date] ?? 0);
        const amount = Math.min(Math.round(ml), room);
        if (amount <= 0) return null;
        const entry: WaterEntry = { id: newId(), date, time, ml: amount, drink };
        const keepFrom = cutoff();
        set((state) => ({
          ...withTotals([...state.entries.filter((e) => e.date >= keepFrom), entry]),
          lastDrink: drink,
        }));
        return entry;
      },
      remove: (id) => {
        const entry = get().entries.find((e) => e.id === id) ?? null;
        if (entry) set((state) => withTotals(state.entries.filter((e) => e.id !== id)));
        return entry;
      },
      removeLast: (date) => {
        const last = [...get().entries].reverse().find((e) => e.date === date) ?? null;
        if (last) set((state) => withTotals(state.entries.filter((e) => e.id !== last.id)));
        return last;
      },
      restore: (entry) =>
        set((state) =>
          state.entries.some((e) => e.id === entry.id) ? state : withTotals([...state.entries, entry]),
        ),
      setGoalMode: (goalMode) => set({ goalMode }),
      setManualGoal: (manualGoalMl) => set({ manualGoalMl, goalMode: 'manual' }),
      setDayExtras: (date, patch) =>
        set((state) => ({
          dayExtras: { ...state.dayExtras, [date]: { ...(state.dayExtras[date] ?? NO_EXTRAS), ...patch } },
        })),
      setGlassMl: (glassMl) => set({ glassMl }),
      setLastDrink: (lastDrink) => set({ lastDrink }),
      setReminders: (patch) => set((state) => ({ reminders: { ...state.reminders, ...patch } })),
      reset: () => set({ ...INITIAL }),
    }),
    {
      name: `${STORAGE_PREFIX}water`,
      storage: deviceStorage,
      version: 2,
      migrate: (persisted, version) => {
        if (version < 2) {
          const moved = waterToEntries(persisted);
          return { ...INITIAL, ...moved, byDate: totalsByDate(moved.entries) };
        }
        return { ...INITIAL, ...(persisted as Partial<WaterState>) };
      },
    },
  ),
);
