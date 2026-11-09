import { activeTheme, type ThemeName } from './colors';

/**
 * Styles that follow the active theme. The factory runs once per theme, on
 * first use, so it can read `colors` and `shadows` like a plain
 * `StyleSheet.create` block:
 *
 *   const styles = themedStyles(() => StyleSheet.create({ card: { backgroundColor: colors.surface } }));
 *
 * Reading `styles.card` during render returns the active theme's style.
 */
export function themedStyles<T extends object>(factory: () => T): T {
  const cache: Partial<Record<ThemeName, T>> = {};
  const current = (): T => {
    const theme = activeTheme();
    return (cache[theme] ??= factory());
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
