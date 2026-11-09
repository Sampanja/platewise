import { StyleSheet, View } from 'react-native';

import { Text } from '@/components/ui';
import { colors, radii, spacing, themedStyles, type ColorToken } from '@/theme';

export type Bar = { key: string; label: string; value: number; a11y: string; muted?: boolean };

type Props = {
  bars: readonly Bar[];
  /** Dashed reference line (a goal), or null. */
  reference: number | null;
  tone?: ColorToken;
  height?: number;
  format: (value: number) => string;
};

/** Small vertical bar chart. Neutral: a bar over the reference is just taller, never red. */
export function BarChart({ bars, reference, tone = 'accent', height = 120, format }: Props) {
  const max = Math.max(reference ?? 0, ...bars.map((b) => b.value), 1) * 1.15;
  return (
    <View style={[styles.chart, { height: height + 40 }]}>
      {reference ? <View style={[styles.reference, { bottom: 20 + (reference / max) * height }]} /> : null}
      {bars.map((bar) => (
        <View key={bar.key} style={styles.column} accessible accessibilityLabel={bar.a11y}>
          <Text variant="caption" color="textSubtle" numberOfLines={1}>
            {bar.value > 0 ? format(bar.value) : ''}
          </Text>
          <View style={[styles.track, { height }]}>
            <View
              style={[
                styles.bar,
                { height: Math.max(bar.value > 0 ? 4 : 0, (bar.value / max) * height), backgroundColor: colors[tone] },
                bar.muted && styles.muted,
              ]}
            />
          </View>
          <Text variant="caption" color="textMuted">
            {bar.label}
          </Text>
        </View>
      ))}
    </View>
  );
}

const styles = themedStyles(() =>
  StyleSheet.create({
    chart: {
      flexDirection: 'row',
      alignItems: 'flex-end',
      gap: spacing.xs,
    },
    reference: {
      position: 'absolute',
      left: 0,
      right: 0,
      borderTopWidth: 1.5,
      borderStyle: 'dashed',
      borderColor: colors.textSubtle,
    },
    column: {
      flex: 1,
      alignItems: 'center',
      gap: spacing.xxs,
    },
    track: {
      width: '100%',
      justifyContent: 'flex-end',
      alignItems: 'center',
    },
    bar: {
      width: '70%',
      maxWidth: 28,
      borderRadius: radii.sm,
    },
    muted: {
      opacity: 0.45,
    },
  }),
);
