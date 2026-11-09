import type { ViewStyle } from 'react-native';

import { activeTheme, colors } from './colors';

/** 4-pt spacing scale. */
export const spacing = {
  xxs: 2,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  xxxl: 48,
} as const;

export const radii = {
  sm: 10,
  md: 16,
  lg: 22,
  card: 28,
  pill: 999,
} as const;

/** Minimum touch target. Apple asks for 44 pt, Material for 48 dp; we use the larger. */
export const touchTarget = 48;
/** Height of primary buttons, comfortably above the minimum. */
export const buttonHeight = 56;

/** Shadows follow the active theme (read them inside themedStyles or at render time). */
export const shadows = {
  get card(): ViewStyle {
    const dark = activeTheme() === 'dark';
    return {
      shadowColor: colors.shadow,
      shadowOpacity: dark ? 0.45 : 0.12,
      shadowRadius: dark ? 24 : 18,
      shadowOffset: { width: 0, height: dark ? 12 : 6 },
      elevation: dark ? 10 : 4,
    };
  },
  /** Warm glow under the primary call to action. */
  get glow(): ViewStyle {
    const dark = activeTheme() === 'dark';
    return {
      shadowColor: colors.accent,
      shadowOpacity: dark ? 0.5 : 0.3,
      shadowRadius: 18,
      shadowOffset: { width: 0, height: 6 },
      elevation: dark ? 8 : 5,
    };
  },
};

/** Motion: short, springy and never blocking. */
export const motion = {
  pressScale: 0.96,
  spring: { speed: 40, bounciness: 8 },
  durationFast: 150,
  durationBase: 250,
  durationSlow: 600,
} as const;
