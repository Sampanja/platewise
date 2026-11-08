import AsyncStorage from '@react-native-async-storage/async-storage';
import { createJSONStorage } from 'zustand/middleware';

/**
 * Device storage for the local repositories. Everything stays on this device
 * in the UI phase; the Supabase repositories will replace these stores.
 */
export const deviceStorage = createJSONStorage(() => AsyncStorage);

/** Key prefix, so "Nollaa sovelluksen tiedot" can clear exactly our keys. */
export const STORAGE_PREFIX = 'platewise:';

export async function clearDeviceStorage(): Promise<void> {
  const keys = await AsyncStorage.getAllKeys();
  await AsyncStorage.multiRemove(keys.filter((key) => key.startsWith(STORAGE_PREFIX)));
}
