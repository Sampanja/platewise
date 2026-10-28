import { Text as RNText, type TextProps as RNTextProps } from 'react-native';

import { colors, typography, type ColorToken, type TypographyVariant } from '@/theme';

export type TextProps = RNTextProps & {
  variant?: TypographyVariant;
  color?: ColorToken;
};

/** The only text component. Always use a typography variant, never ad-hoc font sizes. */
export function Text({ variant = 'body', color = 'text', style, ...rest }: TextProps) {
  return (
    <RNText
      maxFontSizeMultiplier={2}
      {...rest}
      style={[typography[variant], { color: colors[color] }, style]}
    />
  );
}
