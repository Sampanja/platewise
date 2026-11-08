import { testDataPlate } from './foodRecognitionTestData';

/** One recognised food: an id from the closed food list and estimated grams. */
export type RecognizedFood = { foodId: string; grams: number };

/**
 * Food photo recognition. Screens depend only on this interface. The real
 * implementation will call the `recognize-food-photo` Edge Function, where the
 * model picks foods from the closed Fineli list and estimates grams; macros
 * are then computed from Fineli, never taken from the model. Results are
 * always shown with the label "arvio" and can be edited before saving.
 */
export interface FoodRecognitionService {
  recognize(photoUri: string): Promise<RecognizedFood[]>;
}

/** Simulated network and model time for the test data. */
const TEST_LATENCY_MS = 1600;

const testDataRecognition: FoodRecognitionService = {
  recognize: (photoUri) =>
    new Promise((resolve) => setTimeout(() => resolve(testDataPlate(photoUri)), TEST_LATENCY_MS)),
};

/** The active implementation. Swap for the backend one without touching screens. */
export const foodRecognition: FoodRecognitionService = testDataRecognition;
