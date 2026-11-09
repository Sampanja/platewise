import { StyleSheet, View } from 'react-native';

import { colors, type ColorToken, radii, spacing, themedStyles } from '@/theme';

import { Text } from './Text';

type Tone = 'neutral' | 'accent' | 'success' | 'glass';

export type ChipProps = {
  label: string;
  tone?: Tone;
  accessibilityLabel?: string;
};

/** Resolved at render time so the chip follows the active theme. */
const toneStyles = (): Record<Tone, { bg: string; border: string; text: ColorToken }> => ({
  neutral: { bg: colors.surfaceRaised, border: colors.border, text: 'textMuted' },
  accent: { bg: colors.accentSoft, border: 'transparent', text: 'accentText' },
  success: { bg: colors.successSoft, border: 'transparent', text: 'success' },
  glass: { bg: colors.glass, border: colors.glassBorder, text: 'text' },
});

/** Small non-interactive label for macros, time, price and diet tags. */
export function Chip({ label, tone = 'neutral', accessibilityLabel }: ChipProps) {
  const t = toneStyles()[tone];
  return (
    <View
      accessible
      accessibilityLabel={accessibilityLabel ?? label}
      style={[styles.chip, { backgroundColor: t.bg, borderColor: t.border }]}
    >
      <Text variant="label" color={t.text}>
        {label}
      </Text>
    </View>
  );
}

const styles = themedStyles(() =>
  StyleSheet.create({
    chip: {
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.xs,
      borderRadius: radii.pill,
      borderWidth: 1,
      alignSelf: 'flex-start',
    },
  }),
);
