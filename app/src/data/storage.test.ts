import { afterEach, beforeEach, describe, expect, it, jest } from '@jest/globals';

import AsyncStorage from '@react-native-async-storage/async-storage';

import { clearDeviceStorage, deviceStorage, flushDeviceStorage, STORAGE_PREFIX, WRITE_DELAY_MS } from './storage';

// Hoisted above the imports by babel-jest.
jest.mock('@react-native-async-storage/async-storage', () =>
  jest.requireActual('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

const KEY = `${STORAGE_PREFIX}test`;

beforeEach(async () => {
  jest.useFakeTimers();
  await clearDeviceStorage();
  jest.mocked(AsyncStorage.multiSet).mockClear();
});

afterEach(() => {
  jest.useRealTimers();
});

describe('deviceStorage', () => {
  it('coalesces rapid writes into one write of the latest value', async () => {
    for (let i = 1; i <= 5; i++) deviceStorage.setItem(KEY, { state: { count: i }, version: 1 });
    expect(AsyncStorage.multiSet).not.toHaveBeenCalled();
    jest.advanceTimersByTime(WRITE_DELAY_MS);
    await flushDeviceStorage();
    expect(AsyncStorage.multiSet).toHaveBeenCalledTimes(1);
    expect(JSON.parse((await AsyncStorage.getItem(KEY)) ?? 'null')).toEqual({ state: { count: 5 }, version: 1 });
  });

  it('reads a pending value before it has been written', async () => {
    deviceStorage.setItem(KEY, { state: { name: 'Aino' }, version: 1 });
    expect(await deviceStorage.getItem(KEY)).toEqual({ state: { name: 'Aino' }, version: 1 });
    expect(await AsyncStorage.getItem(KEY)).toBeNull();
  });

  it('flushes on demand', async () => {
    deviceStorage.setItem(KEY, { state: { ok: true }, version: 2 });
    await flushDeviceStorage();
    expect(JSON.parse((await AsyncStorage.getItem(KEY)) ?? 'null')).toEqual({ state: { ok: true }, version: 2 });
  });

  it('drops pending writes when the app data is reset', async () => {
    deviceStorage.setItem(KEY, { state: { gone: true }, version: 1 });
    await clearDeviceStorage();
    await flushDeviceStorage();
    expect(await AsyncStorage.getItem(KEY)).toBeNull();
    expect(await deviceStorage.getItem(KEY)).toBeNull();
  });
});
