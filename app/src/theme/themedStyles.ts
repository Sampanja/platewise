import { themeKey } from './colors';

/**
 * Styles that follow the active theme (character + light/dark). The factory
 * runs once per theme, on first use, so it can read `colors` and `shadows`
 * like a plain `StyleSheet.create` block:
 *
 *   const styles = themedStyles(() => StyleSheet.create({ card: { backgroundColor: colors.surface } }));
 *
 * Reading `styles.card` during render returns the active theme's style.
 */
export function themedStyles<T extends object>(factory: () => T): T {
  const cache: Record<string, T> = {};
  const current = (): T => {
    const key = themeKey();
    return (cache[key] ??= factory());
  };
  return new Proxy({} as T, {
    get: (_target, key) => current()[key as keyof T],
    has: (_target, key) => key in current(),
    ownKeys: () => Reflect.ownKeys(current()),
    getOwnPropertyDescriptor: (_target, key) => ({
      enumerable: true,
      configurable: true,
      value: current()[key as keyof T],
    }),
  });
}
