import { StyleSheet, View, type ViewProps } from 'react-native';

import { colors, radii, shadows, spacing } from '@/theme';

export type CardProps = ViewProps & {
  /** `flush` removes padding for edge-to-edge content such as photos. */
  padding?: 'normal' | 'flush';
};

export function Card({ padding = 'normal', style, ...rest }: CardProps) {
  return <View {...rest} style={[styles.card, padding === 'normal' && styles.padded, style]} />;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radii.card,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.glassBorder,
    ...shadows.card,
  },
  padded: {
    padding: spacing.xl,
  },
});
