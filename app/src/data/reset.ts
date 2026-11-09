import { useDiaryStore } from './stores/diary';
import { useFavoritesStore } from './stores/favorites';
import { usePlansStore } from './stores/plans';
import { useProfileStore } from './stores/profile';
import { useChatStore } from './stores/chat';
import { useCustomFoodsStore } from './stores/customFoods';
import { useGameStore } from './stores/game';
import { useMyMealsStore } from './stores/myMeals';
import { useRemindersStore } from './stores/reminders';
import { useWaterStore } from './stores/water';
import { useWeightStore } from './stores/weight';
import { clearDeviceStorage } from './storage';

/** "Nollaa sovelluksen tiedot": empties every local repository on this device. */
export async function resetAppData(): Promise<void> {
  useDiaryStore.getState().reset();
  useFavoritesStore.getState().reset();
  usePlansStore.getState().reset();
  useProfileStore.getState().reset();
  useWeightStore.getState().reset();
  useCustomFoodsStore.getState().reset();
  useMyMealsStore.getState().reset();
  useWaterStore.getState().reset();
  useRemindersStore.getState().reset();
  useGameStore.getState().reset();
  useChatStore.getState().reset();
  await clearDeviceStorage();
}
