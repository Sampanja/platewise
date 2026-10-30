import { useQuery } from '@tanstack/react-query';

import { fetchCurrentPlan, fetchMonthSavingsCents, fetchTodayNutrition } from './api';
import { useDevScenario } from './devScenario';

/** Query keys include the dev scenario so switching it refetches. */
function useScenarioKey() {
  return useDevScenario((state) => state.scenario);
}

export function useCurrentPlan() {
  const scenario = useScenarioKey();
  return useQuery({ queryKey: ['plan', 'current', scenario], queryFn: fetchCurrentPlan });
}

export function useMonthSavings() {
  const scenario = useScenarioKey();
  return useQuery({ queryKey: ['plan', 'savings', scenario], queryFn: fetchMonthSavingsCents });
}

export function useTodayNutrition() {
  const scenario = useScenarioKey();
  return useQuery({ queryKey: ['diary', 'today', scenario], queryFn: fetchTodayNutrition });
}
