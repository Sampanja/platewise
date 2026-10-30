import { create } from 'zustand';

/**
 * Which test-data situation the mock API returns. Lets the UI phase show
 * empty, loading and error states on a phone without a backend.
 */
export type DevScenario = 'plan' | 'ending' | 'empty' | 'loading' | 'error';

type DevScenarioState = {
  scenario: DevScenario;
  setScenario: (scenario: DevScenario) => void;
};

export const useDevScenario = create<DevScenarioState>((set) => ({
  scenario: 'plan',
  setScenario: (scenario) => set({ scenario }),
}));
