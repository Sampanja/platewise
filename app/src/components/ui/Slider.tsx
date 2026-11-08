import { useMemo, useState } from 'react';
import { PanResponder, StyleSheet, View, type LayoutChangeEvent } from 'react-native';

import { colors, radii } from '@/theme';

import { haptics } from './haptics';

export type SliderProps = {
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (value: number) => void;
  accessibilityLabel: string;
  /** Spoken value, e.g. "50 euroa". */
  accessibilityValueText: string;
};

const THUMB = 30;
const TRACK = 8;

/** Horizontal slider with a large thumb; ticks lightly on every step. */
export function Slider({
  value,
  min,
  max,
  step,
  onChange,
  accessibilityLabel,
  accessibilityValueText,
}: SliderProps) {
  const [width, setWidth] = useState(0);
  const ratio = max > min ? (Math.min(max, Math.max(min, value)) - min) / (max - min) : 0;

  // Recreated when the value changes; only the touch position is used, so a
  // new responder mid-drag continues seamlessly.
  const responder = useMemo(() => {
    const setFromX = (x: number) => {
      if (width <= 0) return;
      const r = Math.min(1, Math.max(0, (x - THUMB / 2) / (width - THUMB)));
      const next = Math.min(max, Math.max(min, Math.round((min + r * (max - min)) / step) * step));
      if (next !== value) {
        haptics.select();
        onChange(next);
      }
    };
    return PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderTerminationRequest: () => false,
      onPanResponderGrant: (event) => setFromX(event.nativeEvent.locationX),
      onPanResponderMove: (event) => setFromX(event.nativeEvent.locationX),
    });
  }, [width, min, max, step, value, onChange]);

  const onLayout = (event: LayoutChangeEvent) => setWidth(event.nativeEvent.layout.width);
  const thumbLeft = ratio * Math.max(0, width - THUMB);

  return (
    <View
      onLayout={onLayout}
      style={styles.hit}
      accessible
      accessibilityRole="adjustable"
      accessibilityLabel={accessibilityLabel}
      accessibilityValue={{ min, max, now: value, text: accessibilityValueText }}
      accessibilityActions={[{ name: 'increment' }, { name: 'decrement' }]}
      onAccessibilityAction={(event) => {
        const delta = event.nativeEvent.actionName === 'increment' ? step : -step;
        onChange(Math.min(max, Math.max(min, value + delta)));
      }}
      {...responder.panHandlers}
    >
      <View style={styles.track} pointerEvents="none">
        <View style={[styles.fill, { width: thumbLeft + THUMB / 2 }]} />
      </View>
      <View pointerEvents="none" style={[styles.thumb, { left: thumbLeft }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  hit: {
    height: 48,
    justifyContent: 'center',
  },
  track: {
    height: TRACK,
    marginHorizontal: THUMB / 2,
    borderRadius: radii.pill,
    backgroundColor: colors.surfaceRaised,
    overflow: 'hidden',
  },
  fill: {
    height: TRACK,
    marginLeft: -THUMB / 2,
    backgroundColor: colors.accent,
  },
  thumb: {
    position: 'absolute',
    width: THUMB,
    height: THUMB,
    borderRadius: THUMB / 2,
    backgroundColor: colors.accent,
    borderWidth: 3,
    borderColor: colors.text,
  },
});
