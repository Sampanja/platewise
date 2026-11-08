import { useDiaryStore } from './stores/diary';
import { useFavoritesStore } from './stores/favorites';
import { usePlansStore } from './stores/plans';
import { useProfileStore } from './stores/profile';
import { useWeightStore } from './stores/weight';
import { clearDeviceStorage } from './storage';

/** "Nollaa sovelluksen tiedot": empties every local repository on this device. */
export async function resetAppData(): Promise<void> {
  useDiaryStore.getState().reset();
  useFavoritesStore.getState().reset();
  usePlansStore.getState().reset();
  useProfileStore.getState().reset();
  useWeightStore.getState().reset();
  await clearDeviceStorage();
}
