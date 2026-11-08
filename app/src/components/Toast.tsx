import { useEffect, useState } from 'react';
import { AccessibilityInfo, Animated, Easing, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { PressableScale, Text, useReducedMotion } from '@/components/ui';
import { useToastStore } from '@/lib/toast';
import { colors, radii, shadows, spacing, touchTarget } from '@/theme';

const VISIBLE_MS = 3200;
const WITH_ACTION_MS = 5000;
/** Keeps the toast above the floating tab bar. */
const BOTTOM_OFFSET = 100;

/** Renders the current toast above everything. Mounted once in the root layout. */
export function ToastHost() {
  const current = useToastStore((s) => s.current);
  const hide = useToastStore((s) => s.hide);
  const insets = useSafeAreaInsets();
  const reducedMotion = useReducedMotion();
  const [progress] = useState(() => new Animated.Value(0));

  useEffect(() => {
    if (!current) return;
    AccessibilityInfo.announceForAccessibility(current.message);
    progress.setValue(0);
    const enter = Animated.timing(progress, {
      toValue: 1,
      duration: reducedMotion ? 0 : 220,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    });
    enter.start();
    const timer = setTimeout(
      () => {
        Animated.timing(progress, {
          toValue: 0,
          duration: reducedMotion ? 0 : 180,
          useNativeDriver: true,
        }).start(() => hide(current.id));
      },
      current.action ? WITH_ACTION_MS : VISIBLE_MS,
    );
    return () => {
      clearTimeout(timer);
      enter.stop();
    };
  }, [current, hide, progress, reducedMotion]);

  if (!current) return null;

  return (
    <View
      pointerEvents="box-none"
      style={[styles.host, { bottom: Math.max(insets.bottom, spacing.md) + BOTTOM_OFFSET }]}
    >
      <Animated.View
        accessibilityLiveRegion="polite"
        style={[
          styles.toast,
          {
            opacity: progress,
            transform: [{ translateY: progress.interpolate({ inputRange: [0, 1], outputRange: [16, 0] }) }],
          },
        ]}
      >
        <Text variant="label" style={styles.message}>
          {current.message}
        </Text>
        {current.action ? (
          <PressableScale
            accessibilityRole="button"
            accessibilityLabel={current.action.label}
            onPress={() => {
              current.action?.onPress();
              hide(current.id);
            }}
            style={styles.action}
          >
            <Text variant="bodyStrong" color="accentText">
              {current.action.label}
            </Text>
          </PressableScale>
        ) : null}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  host: {
    position: 'absolute',
    left: spacing.lg,
    right: spacing.lg,
    alignItems: 'center',
  },
  toast: {
    alignSelf: 'stretch',
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    minHeight: touchTarget + 4,
    paddingLeft: spacing.lg,
    paddingRight: spacing.sm,
    paddingVertical: spacing.sm,
    borderRadius: radii.lg,
    backgroundColor: colors.surfaceRaised,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.glassBorder,
    ...shadows.card,
  },
  message: {
    flex: 1,
  },
  action: {
    minHeight: touchTarget,
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
  },
});
