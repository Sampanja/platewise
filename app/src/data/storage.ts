import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppState } from 'react-native';
import type { PersistStorage, StorageValue } from 'zustand/middleware';

/**
 * Device storage for the local repositories. Everything stays on this device
 * in the UI phase; the Supabase repositories will replace these stores.
 *
 * Writes are coalesced: zustand's persist middleware calls `setItem` after
 * every state change, and serialising a whole store to AsyncStorage on each
 * tap made toggles feel slow. Here `setItem` only remembers the latest value;
 * it is serialised and written once the store has been quiet for
 * WRITE_DELAY_MS, and at once when the app goes to the background. Reads see
 * pending values, so nothing is lost or read stale.
 */

/** Key prefix, so "Nollaa sovelluksen tiedot" can clear exactly our keys. */
export const STORAGE_PREFIX = 'platewise:';

export const WRITE_DELAY_MS = 400;

const pending = new Map<string, StorageValue<unknown>>();
let timer: ReturnType<typeof setTimeout> | null = null;

/** Writes every pending value now. */
export async function flushDeviceStorage(): Promise<void> {
  if (timer) {
    clearTimeout(timer);
    timer = null;
  }
  if (pending.size === 0) return;
  const entries = [...pending.entries()];
  pending.clear();
  await AsyncStorage.multiSet(entries.map(([name, value]) => [name, JSON.stringify(value)]));
}

function schedule(): void {
  if (timer) clearTimeout(timer);
  timer = setTimeout(() => {
    timer = null;
    void flushDeviceStorage().catch(() => undefined);
  }, WRITE_DELAY_MS);
}

AppState.addEventListener('change', (state) => {
  if (state !== 'active') void flushDeviceStorage().catch(() => undefined);
});

export const deviceStorage: PersistStorage<unknown> = {
  getItem: async (name) => {
    if (pending.has(name)) return pending.get(name) ?? null;
    const raw = await AsyncStorage.getItem(name);
    return raw === null ? null : (JSON.parse(raw) as StorageValue<unknown>);
  },
  setItem: (name, value) => {
    pending.set(name, value);
    schedule();
  },
  removeItem: async (name) => {
    pending.delete(name);
    await AsyncStorage.removeItem(name);
  },
};

export async function clearDeviceStorage(): Promise<void> {
  pending.clear();
  if (timer) {
    clearTimeout(timer);
    timer = null;
  }
  const keys = await AsyncStorage.getAllKeys();
  await AsyncStorage.multiRemove(keys.filter((key) => key.startsWith(STORAGE_PREFIX)));
}
