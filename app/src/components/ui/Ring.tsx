import { useEffect, useState, type ReactNode } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

import { colors, motion } from '@/theme';

import { useReducedMotion } from './useReducedMotion';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

export type RingProps = {
  /** 0–1. Clamped; going over the goal simply shows a full ring (no warning colour). */
  value: number;
  size?: number;
  thickness?: number;
  tone?: 'accent' | 'success';
  /** Content centred inside the ring, e.g. the kcal figure. */
  children?: ReactNode;
  accessibilityLabel: string;
};

/** Circular progress meter for calories and macros. */
export function Ring({
  value,
  size = 112,
  thickness = 10,
  tone = 'accent',
  children,
  accessibilityLabel,
}: RingProps) {
  const reducedMotion = useReducedMotion();
  const clamped = Math.min(1, Math.max(0, value));
  const [progress] = useState(() => new Animated.Value(0));

  const radius = (size - thickness) / 2;
  const circumference = 2 * Math.PI * radius;

  useEffect(() => {
    // SVG props cannot use the native driver; the ring is small and animates once.
    const animation = Animated.timing(progress, {
      toValue: clamped,
      duration: reducedMotion ? 0 : motion.durationSlow * 1.5,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    });
    animation.start();
    return () => animation.stop();
  }, [clamped, progress, reducedMotion]);

  const color = tone === 'success' ? colors.success : colors.accent;

  return (
    <View
      style={{ width: size, height: size }}
      accessible
      accessibilityRole="progressbar"
      accessibilityLabel={accessibilityLabel}
      accessibilityValue={{ min: 0, max: 100, now: Math.round(clamped * 100) }}
    >
      <Svg width={size} height={size} style={styles.rotated}>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={colors.surfaceRaised}
          strokeWidth={thickness}
          fill="none"
        />
        <AnimatedCircle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={thickness}
          strokeLinecap="round"
          fill="none"
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={progress.interpolate({
            inputRange: [0, 1],
            outputRange: [circumference, 0],
          })}
        />
      </Svg>
      <View style={styles.center} pointerEvents="none">
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  rotated: {
    // Start the arc at 12 o'clock.
    transform: [{ rotate: '-90deg' }],
  },
  center: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
