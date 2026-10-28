import type { ViewStyle } from 'react-native';

import { colors } from './colors';

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

export const shadows = {
  card: {
    shadowColor: colors.shadow,
    shadowOpacity: 0.45,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 12 },
    elevation: 10,
  },
  /** Warm glow under the primary call to action. */
  glow: {
    shadowColor: colors.accent,
    shadowOpacity: 0.5,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8,
  },
} as const satisfies Record<string, ViewStyle>;

/** Motion: short, springy and never blocking. */
export const motion = {
  pressScale: 0.96,
  spring: { speed: 40, bounciness: 8 },
  durationFast: 150,
  durationBase: 250,
  durationSlow: 600,
} as const;
