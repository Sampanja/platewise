import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { applyDeductions, mergeIntoPantry, type Deduction, type PantryAddition } from '@/domain/pantry';
import { newId } from '@/lib/id';
import type { LocalDate } from '@/lib/dates';

import { INGREDIENTS_BY_ID } from '../catalog';
import { deviceStorage, STORAGE_PREFIX } from '../storage';
import type { CookedEntry, PantryItem } from '../types';

/**
 * Ruokavarasto (future `pantry_items` and `cooked_recipes`). Only the user's
 * own state is stored: ingredient ids and amounts, never catalog data.
 */
type PantryState = {
  items: PantryItem[];
  /** Recipes marked as cooked, with what they used from the pantry. */
  cooked: CookedEntry[];
  /** Local reminder when something is about to expire. On by default; can be turned off. */
  expiryReminders: boolean;
  add: (additions: readonly PantryAddition[]) => void;
  update: (id: string, patch: Partial<Omit<PantryItem, 'id' | 'ingredientId'>>) => void;
  /** Swaps the ingredient of an item (a corrected recognition); merges if it already exists. */
  replaceIngredient: (id: string, ingredientId: string) => void;
  remove: (id: string) => PantryItem | undefined;
  restore: (item: PantryItem) => void;
  /** Marks a recipe cooked and takes what it used out of the pantry. */
  cook: (entry: { date: LocalDate; recipeId: string; servings: number }, deductions: readonly Deduction[]) => CookedEntry;
  /** Undo of `cook`: the items as they were and the log entry removed. */
  undoCook: (entryId: string, previousItems: PantryItem[]) => void;
  setExpiryReminders: (on: boolean) => void;
  reset: () => void;
};

export const usePantryStore = create<PantryState>()(
  persist(
    (set) => ({
      items: [],
      cooked: [],
      expiryReminders: true,
      add: (additions) =>
        set((state) => ({ items: mergeIntoPantry(state.items, additions, newId, new Date().toISOString()) })),
      update: (id, patch) =>
        set((state) => ({ items: state.items.map((item) => (item.id === id ? { ...item, ...patch, estimate: false } : item)) })),
      replaceIngredient: (id, ingredientId) =>
        set((state) => {
          const item = state.items.find((i) => i.id === id);
          if (!item) return state;
          const rest = state.items.filter((i) => i.id !== id);
          const { id: _id, addedAt: _addedAt, ...addition } = item;
          return {
            items: mergeIntoPantry(rest, [{ ...addition, ingredientId, estimate: false }], newId, new Date().toISOString()),
          };
        }),
      remove: (id) => {
        let removed: PantryItem | undefined;
        set((state) => {
          removed = state.items.find((item) => item.id === id);
          return { items: state.items.filter((item) => item.id !== id) };
        });
        return removed;
      },
      restore: (item) => set((state) => ({ items: [...state.items.filter((i) => i.id !== item.id), item] })),
      cook: ({ date, recipeId, servings }, deductions) => {
        const entry: CookedEntry = {
          id: newId(),
          date,
          recipeId,
          servings,
          usedFromPantry: deductions.map((d) => ({ ingredientId: d.ingredientId, grams: d.grams })),
        };
        set((state) => ({
          items: applyDeductions(state.items, deductions, INGREDIENTS_BY_ID),
          cooked: [...state.cooked, entry],
        }));
        return entry;
      },
      undoCook: (entryId, previousItems) =>
        set((state) => ({ items: previousItems, cooked: state.cooked.filter((entry) => entry.id !== entryId) })),
      setExpiryReminders: (on) => set({ expiryReminders: on }),
      reset: () => set({ items: [], cooked: [], expiryReminders: true }),
    }),
    {
      name: `${STORAGE_PREFIX}pantry`,
      storage: deviceStorage,
      version: 1,
      // Items whose ingredient left the catalog are dropped rather than crash a screen.
      merge: (persisted, current) => {
        const saved = (persisted ?? {}) as Partial<PantryState>;
        return {
          ...current,
          ...saved,
          items: (saved.items ?? []).filter((item) => INGREDIENTS_BY_ID[item.ingredientId] !== undefined),
          cooked: saved.cooked ?? [],
        };
      },
    },
  ),
);
