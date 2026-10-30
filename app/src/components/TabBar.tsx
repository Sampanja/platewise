import { useEffect, useState } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';
import type { BottomTabBarProps } from 'expo-router/js-tabs';

import { Icon, PressableScale, Text, useReducedMotion, type IconName } from '@/components/ui';
import { format, strings } from '@/i18n';
import { colors, motion, radii, shadows, spacing } from '@/theme';

/** Route name → icon. Route order and titles come from the tabs layout. */
const ICONS: Record<string, IconName> = {
  index: 'home',
  recipes: 'recipes',
  plan: 'plus',
  diary: 'diary',
  profile: 'profile',
};

/** The centre tab is the app's main action and gets the raised button. */
const PRIMARY_ROUTE = 'plan';

/** Tab labels may grow with the system text size, but only this much, so five still fit. */
const MAX_LABEL_SCALE = 1.3;

export function TabBar({ state, descriptors, emitter, navigateToTab, insets }: BottomTabBarProps) {
  return (
    <View
      role="tablist"
      style={[styles.bar, { paddingBottom: Math.max(insets.bottom, spacing.sm) }]}
    >
      {/*
        The bar's surface starts below the raised centre button. Keeping the button
        inside the bar's bounds matters on Android, which ignores touches that fall
        outside a parent view.
      */}
      <View style={styles.surface} pointerEvents="none" />
      {state.routes.map((route, index) => {
        const focused = index === state.index;
        const { options } = descriptors[route.key];
        const label = options.title ?? route.name;

        const onPress = () => {
          const event = emitter.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
          if (!focused && !event.defaultPrevented) navigateToTab(route.key);
        };
        const onLongPress = () => emitter.emit({ type: 'tabLongPress', target: route.key });

        const a11y = {
          accessibilityRole: 'tab' as const,
          accessibilityState: { selected: focused },
          accessibilityLabel: format(strings.tabs.a11yPosition, {
            label,
            index: index + 1,
            count: state.routes.length,
          }),
        };

        return route.name === PRIMARY_ROUTE ? (
          <PrimaryTab
            key={route.key}
            label={label}
            focused={focused}
            onPress={onPress}
            onLongPress={onLongPress}
            {...a11y}
          />
        ) : (
          <Tab
            key={route.key}
            icon={ICONS[route.name] ?? 'home'}
            label={label}
            focused={focused}
            onPress={onPress}
            onLongPress={onLongPress}
            {...a11y}
          />
        );
      })}
    </View>
  );
}

type TabProps = {
  label: string;
  focused: boolean;
  onPress: () => void;
  onLongPress: () => void;
  accessibilityRole: 'tab';
  accessibilityState: { selected: boolean };
  accessibilityLabel: string;
};

function useFocusProgress(focused: boolean) {
  const reducedMotion = useReducedMotion();
  const [progress] = useState(() => new Animated.Value(focused ? 1 : 0));

  useEffect(() => {
    const animation = reducedMotion
      ? Animated.timing(progress, { toValue: focused ? 1 : 0, duration: 0, useNativeDriver: true })
      : Animated.spring(progress, {
          toValue: focused ? 1 : 0,
          useNativeDriver: true,
          speed: 22,
          bounciness: 10,
        });
    animation.start();
    return () => animation.stop();
  }, [focused, progress, reducedMotion]);

  return progress;
}

function Tab({ icon, label, focused, ...pressable }: TabProps & { icon: IconName }) {
  const progress = useFocusProgress(focused);
  const color = focused ? 'accentText' : 'textSubtle';

  return (
    <PressableScale haptic="select" style={styles.tab} {...pressable}>
      <View style={styles.iconWrap}>
        {/* Soft pill behind the active icon, grows in from the centre. */}
        <Animated.View
          style={[
            styles.activePill,
            {
              opacity: progress,
              transform: [{ scaleX: progress.interpolate({ inputRange: [0, 1], outputRange: [0.4, 1] }) }],
            },
          ]}
        />
        <Icon name={icon} color={color} strokeWidth={focused ? 2.2 : 1.8} />
      </View>
      <Text
        variant="tabLabel"
        color={focused ? 'accentText' : 'textSubtle'}
        numberOfLines={1}
        maxFontSizeMultiplier={MAX_LABEL_SCALE}
      >
        {label}
      </Text>
    </PressableScale>
  );
}

function PrimaryTab({ label, focused, ...pressable }: TabProps) {
  const reducedMotion = useReducedMotion();
  const [rotation] = useState(() => new Animated.Value(focused ? 1 : 0));

  useEffect(() => {
    const animation = Animated.timing(rotation, {
      toValue: focused ? 1 : 0,
      duration: reducedMotion ? 0 : motion.durationBase,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    });
    animation.start();
    return () => animation.stop();
  }, [focused, reducedMotion, rotation]);

  return (
    <PressableScale haptic="tap" style={styles.tab} {...pressable}>
      <View style={styles.primaryButton}>
        {/* A quarter turn of the plus marks the active state without changing the shape. */}
        <Animated.View
          style={{
            transform: [{ rotate: rotation.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '90deg'] }) }],
          }}
        >
          <Icon name="plus" size={28} color="textOnAccent" strokeWidth={2.4} />
        </Animated.View>
      </View>
      <Text
        variant="tabLabel"
        color={focused ? 'accentText' : 'textMuted'}
        numberOfLines={1}
        maxFontSizeMultiplier={MAX_LABEL_SCALE}
      >
        {label}
      </Text>
    </PressableScale>
  );
}

const PRIMARY_SIZE = 58;
/** Height of the icon area of ordinary tabs (the active pill). */
const ICON_AREA = 32;
const BAR_PADDING_TOP = spacing.xs;
/**
 * Tabs are bottom-aligned, so ordinary tabs start (PRIMARY_SIZE − ICON_AREA)
 * lower than the centre button. The surface begins a little above them, and
 * the centre button rises above the surface by the difference.
 */
const SURFACE_TOP = BAR_PADDING_TOP + PRIMARY_SIZE - ICON_AREA - spacing.sm;

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: colors.bg,
    paddingTop: BAR_PADDING_TOP,
    paddingHorizontal: spacing.xs,
  },
  surface: {
    ...StyleSheet.absoluteFill,
    top: SURFACE_TOP,
    backgroundColor: colors.surface,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.glassBorder,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: spacing.xs,
  },
  iconWrap: {
    width: 56,
    height: ICON_AREA,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activePill: {
    ...StyleSheet.absoluteFill,
    borderRadius: radii.pill,
    backgroundColor: colors.accentSoft,
  },
  primaryButton: {
    width: PRIMARY_SIZE,
    height: PRIMARY_SIZE,
    borderRadius: PRIMARY_SIZE / 2,
    backgroundColor: colors.accent,
    borderWidth: 3,
    borderColor: colors.bg,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.glow,
  },
});
