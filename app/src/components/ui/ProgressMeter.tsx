import { useEffect, useRef, useState } from 'react';
import { Animated, Easing, StyleSheet, View, type LayoutChangeEvent } from 'react-native';

import { colors, motion, radii } from '@/theme';

import { haptics } from './haptics';

export type ProgressMeterProps = {
  /** 0–1. Values outside the range are clamped. */
  value: number;
  tone?: 'accent' | 'success';
  /** Spoken by screen readers, e.g. "Viikon budjetti". */
  accessibilityLabel: string;
  /** Plays a success haptic once when the meter reaches 100 %. */
  celebrateOnComplete?: boolean;
};

/** Animated horizontal meter for budget use, savings and week-plan progress. */
export function ProgressMeter({
  value,
  tone = 'accent',
  accessibilityLabel,
  celebrateOnComplete = false,
}: ProgressMeterProps) {
  const clamped = Math.min(1, Math.max(0, value));
  const [width, setWidth] = useState(0);
  const [fill] = useState(() => new Animated.Value(0));
  const wasComplete = useRef(clamped >= 1);

  useEffect(() => {
    Animated.timing(fill, {
      toValue: clamped,
      duration: motion.durationSlow,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();

    const isComplete = clamped >= 1;
    if (celebrateOnComplete && isComplete && !wasComplete.current) haptics.success();
    wasComplete.current = isComplete;
  }, [clamped, celebrateOnComplete, fill]);

  const onLayout = (event: LayoutChangeEvent) => setWidth(event.nativeEvent.layout.width);
  const color = tone === 'success' ? colors.success : colors.accent;

  return (
    <View
      onLayout={onLayout}
      style={styles.track}
      accessible
      accessibilityRole="progressbar"
      accessibilityLabel={accessibilityLabel}
      accessibilityValue={{ min: 0, max: 100, now: Math.round(clamped * 100) }}
    >
      {/* Slide a full-width bar in from the left: transform keeps the animation on the native driver. */}
      {width > 0 && (
        <Animated.View
          style={[
            styles.fill,
            {
              backgroundColor: color,
              transform: [
                { translateX: fill.interpolate({ inputRange: [0, 1], outputRange: [-width, 0] }) },
              ],
            },
          ]}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    height: 12,
    borderRadius: radii.pill,
    backgroundColor: colors.surfaceRaised,
    overflow: 'hidden',
  },
  fill: {
    ...StyleSheet.absoluteFill,
    borderRadius: radii.pill,
  },
});
