import { useEffect, useState } from 'react';
import { Animated, Easing, type DimensionValue, type StyleProp, type ViewStyle } from 'react-native';

import { colors, radii } from '@/theme';

import { useReducedMotion } from './useReducedMotion';

export type SkeletonProps = {
  width?: DimensionValue;
  height: DimensionValue;
  radius?: number;
  style?: StyleProp<ViewStyle>;
};

/**
 * Gently pulsing placeholder shaped like the content it stands in for.
 * Group skeletons inside a container with `accessibilityLabel` + busy state.
 */
export function Skeleton({ width = '100%', height, radius = radii.md, style }: SkeletonProps) {
  const reducedMotion = useReducedMotion();
  const [opacity] = useState(() => new Animated.Value(0.55));

  useEffect(() => {
    if (reducedMotion) return;
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 700,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.55,
          duration: 700,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ]),
    );
    pulse.start();
    return () => pulse.stop();
  }, [opacity, reducedMotion]);

  return (
    <Animated.View
      style={[
        { width, height, borderRadius: radius, backgroundColor: colors.surfaceRaised, opacity },
        style,
      ]}
    />
  );
}
