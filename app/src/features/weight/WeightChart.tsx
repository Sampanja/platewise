import { useState } from 'react';
import { StyleSheet, View, type LayoutChangeEvent } from 'react-native';
import Svg, { Circle, Line, Polyline } from 'react-native-svg';

import { Text } from '@/components/ui';
import { movingAverage, type WeightEntry } from '@/domain/energy';
import { format, strings } from '@/i18n';
import { colors, spacing, themedStyles } from '@/theme';

type Props = {
  entries: readonly WeightEntry[];
  /** Dashed line at the target weight, if any. */
  targetKg: number | null;
};

const HEIGHT = 180;
const PAD = 12;
const decimal = new Intl.NumberFormat('fi-FI', { maximumFractionDigits: 1 });

/** Weigh-ins as dots and the 7-day moving average as a line, over time. */
export function WeightChart({ entries, targetKg }: Props) {
  const [width, setWidth] = useState(0);
  const onLayout = (event: LayoutChangeEvent) => setWidth(event.nativeEvent.layout.width);

  const sorted = [...entries].sort((a, b) => a.date.localeCompare(b.date));
  const average = movingAverage(sorted);
  // Scale to the weigh-ins; a distant target would flatten the curve, so its
  // line is only drawn when it is close and otherwise shown as text.
  const dataMin = Math.min(...sorted.map((e) => e.kg));
  const dataMax = Math.max(...sorted.map((e) => e.kg));
  const showTargetLine = targetKg !== null && targetKg >= dataMin - 3 && targetKg <= dataMax + 3;
  const values = [dataMin, dataMax, ...(showTargetLine && targetKg !== null ? [targetKg] : [])];
  const min = Math.min(...values) - 0.8;
  const max = Math.max(...values) + 0.8;
  const first = Date.parse(sorted[0]?.date ?? '');
  const last = Date.parse(sorted.at(-1)?.date ?? '');
  const span = Math.max(1, last - first);

  const x = (date: string) =>
    sorted.length === 1 ? width / 2 : PAD + ((Date.parse(date) - first) / span) * (width - PAD * 2);
  const y = (kg: number) => PAD + (1 - (kg - min) / (max - min)) * (HEIGHT - PAD * 2);

  return (
    <View
      style={styles.wrap}
      accessible
      accessibilityLabel={format(strings.weight.chartA11y, { count: sorted.length })}
    >
      <View style={styles.axis}>
        <Text variant="caption" color="textSubtle">
          {decimal.format(max)}
        </Text>
        <Text variant="caption" color="textSubtle">
          {decimal.format(min)}
        </Text>
      </View>
      <View style={styles.plot} onLayout={onLayout}>
        {width > 0 && sorted.length > 0 ? (
          <Svg width={width} height={HEIGHT}>
            {showTargetLine && targetKg !== null ? (
              <Line
                x1={0}
                x2={width}
                y1={y(targetKg)}
                y2={y(targetKg)}
                stroke={colors.success}
                strokeDasharray="6 6"
                strokeWidth={1.5}
              />
            ) : null}
            {sorted.map((entry) => (
              <Circle key={entry.date} cx={x(entry.date)} cy={y(entry.kg)} r={3.5} fill={colors.textSubtle} />
            ))}
            {average.length > 1 ? (
              <Polyline
                points={average.map((e) => `${x(e.date)},${y(e.kg)}`).join(' ')}
                fill="none"
                stroke={colors.accent}
                strokeWidth={3}
                strokeLinejoin="round"
                strokeLinecap="round"
              />
            ) : null}
          </Svg>
        ) : null}
      </View>
      <View style={styles.legend}>
        <View style={[styles.dot, { backgroundColor: colors.textSubtle }]} />
        <Text variant="caption" color="textSubtle">
          {strings.weight.legendDaily}
        </Text>
        <View style={[styles.lineKey, { backgroundColor: colors.accent }]} />
        <Text variant="caption" color="textSubtle">
          {strings.weight.legendAverage}
        </Text>
        {targetKg !== null ? (
          <>
            <View style={[styles.lineKey, styles.targetKey]} />
            <Text variant="caption" color="textSubtle">
              {format(strings.weight.legendTarget, { value: decimal.format(targetKg) })}
            </Text>
          </>
        ) : null}
      </View>
    </View>
  );
}

const styles = themedStyles(() =>
  StyleSheet.create({
    wrap: {
      gap: spacing.sm,
    },
    axis: {
      position: 'absolute',
      right: 0,
      top: 0,
      height: HEIGHT,
      justifyContent: 'space-between',
      zIndex: 1,
    },
    plot: {
      height: HEIGHT,
      marginRight: 36,
    },
    legend: {
      flexDirection: 'row',
      alignItems: 'center',
      flexWrap: 'wrap',
      gap: spacing.sm,
    },
    dot: {
      width: 8,
      height: 8,
      borderRadius: 4,
    },
    targetKey: {
      backgroundColor: colors.success,
      height: 2,
    },
    lineKey: {
      width: 18,
      height: 3,
      borderRadius: 2,
      marginLeft: spacing.sm,
    },
  }),
);
