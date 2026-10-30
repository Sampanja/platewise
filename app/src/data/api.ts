import { savingsCents } from '@/domain/plan';

import { useDevScenario, type DevScenario } from './devScenario';
import {
  mockCurrentPlan,
  mockEarlierPlansThisMonth,
  mockEndingPlan,
  mockTodayNutrition,
} from './mock/plans';
import { mockRecipesById } from './mock/recipes';
import type { DayNutrition, MealPlan, Recipe } from './types';

/**
 * Mock API for the UI phase. Function signatures are what the Supabase layer
 * will implement; the latency makes loading states visible on a device.
 */
const LATENCY_MS = 650;

async function respond<T>(make: (scenario: DevScenario) => T): Promise<T> {
  const { scenario } = useDevScenario.getState();
  if (scenario === 'loading') return new Promise<T>(() => undefined);
  await new Promise((resolve) => setTimeout(resolve, LATENCY_MS));
  if (scenario === 'error') throw new Error('Mock API error');
  return make(scenario);
}

export type CurrentPlan = {
  plan: MealPlan;
  recipesById: Readonly<Record<string, Recipe>>;
};

export function fetchCurrentPlan(): Promise<CurrentPlan | null> {
  return respond((scenario) => {
    if (scenario === 'empty') return null;
    const plan = scenario === 'ending' ? mockEndingPlan() : mockCurrentPlan();
    return { plan, recipesById: mockRecipesById };
  });
}

export function fetchMonthSavingsCents(): Promise<number> {
  return respond((scenario) => {
    if (scenario === 'empty') return 0;
    return savingsCents([...mockEarlierPlansThisMonth, mockCurrentPlan()]);
  });
}

export function fetchTodayNutrition(): Promise<DayNutrition> {
  return respond((scenario) => mockTodayNutrition(scenario === 'empty'));
}
