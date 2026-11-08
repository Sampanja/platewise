import { Text as RNText, type TextProps as RNTextProps } from 'react-native';

import { hyphenateFi } from '@/lib/hyphenate';
import { colors, typography, type ColorToken, type TypographyVariant } from '@/theme';

export type TextProps = RNTextProps & {
  variant?: TypographyVariant;
  color?: ColorToken;
  /** Adds Finnish syllable break points to long words (titles in narrow cards). */
  hyphenate?: boolean;
};

/** The only text component. Always use a typography variant, never ad-hoc font sizes. */
export function Text({ variant = 'body', color = 'text', style, hyphenate, children, ...rest }: TextProps) {
  return (
    <RNText
      maxFontSizeMultiplier={2}
      // Finnish compounds are long: hyphenate at syllable boundaries instead of
      // breaking mid-word (Android uses the device language's patterns).
      android_hyphenationFrequency="normal"
      {...rest}
      style={[typography[variant], { color: colors[color] }, style]}
    >
      {hyphenate && typeof children === 'string' ? hyphenateFi(children) : children}
    </RNText>
  );
}
