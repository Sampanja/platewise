import type { TextStyle } from 'react-native';

/** Font family names as registered with `useFonts` in the root layout. */
export const fontFamilies = {
  display: 'DMSerifDisplay_400Regular',
  body: 'DMSans_400Regular',
  bodyMedium: 'DMSans_500Medium',
  bodySemiBold: 'DMSans_600SemiBold',
  bodyBold: 'DMSans_700Bold',
} as const;

/**
 * Type scale. Sizes scale with the system text size setting (Text's default
 * `allowFontScaling`), so layouts must not assume fixed heights for text.
 */
export const typography = {
  displayLarge: { fontFamily: fontFamilies.display, fontSize: 34, lineHeight: 40 },
  display: { fontFamily: fontFamilies.display, fontSize: 28, lineHeight: 34 },
  title: { fontFamily: fontFamilies.display, fontSize: 22, lineHeight: 28 },
  heading: { fontFamily: fontFamilies.bodySemiBold, fontSize: 17, lineHeight: 24 },
  body: { fontFamily: fontFamilies.body, fontSize: 16, lineHeight: 24 },
  bodyStrong: { fontFamily: fontFamilies.bodySemiBold, fontSize: 16, lineHeight: 24 },
  label: { fontFamily: fontFamilies.bodyMedium, fontSize: 14, lineHeight: 20 },
  caption: { fontFamily: fontFamilies.body, fontSize: 13, lineHeight: 18 },
  overline: {
    fontFamily: fontFamilies.bodySemiBold,
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  /** Prices, macros and other numbers: tabular figures keep columns aligned. */
  number: {
    fontFamily: fontFamilies.bodyBold,
    fontSize: 16,
    lineHeight: 22,
    fontVariant: ['tabular-nums'],
  },
} as const satisfies Record<string, TextStyle>;

export type TypographyVariant = keyof typeof typography;
