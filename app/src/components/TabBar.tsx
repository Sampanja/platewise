import { useEffect, useState } from 'react';
import { Animated, Easing, StyleSheet, View, type LayoutChangeEvent } from 'react-native';
import type { BottomTabBarProps } from 'expo-router/js-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

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
const MAX_LABEL_SCALE = 1.25;

const BAR_HEIGHT = 66;
const PRIMARY_SIZE = 60;
/** How far the centre button rises above the bar. */
const RISE = 25;
/** Every label sits this far above the bar bottom, so the centre label lines up with the rest. */
const LABEL_BOTTOM = 11;
const SIDE_MARGIN = spacing.lg;
const PILL_INSET = 6;
/** Below this slot width (dp) labels use the compact size. */
const COMPACT_SLOT = 72;

/** Distance from the screen bottom to the bar: floats above the gesture area. */
function barBottom(insetBottom: number): number {
  return Math.max(insetBottom, spacing.md) + spacing.xs;
}

/**
 * Space scrollable screens must leave at the bottom so their last item clears
 * the floating bar.
 */
export function useTabBarSpace(): number {
  const insets = useSafeAreaInsets();
  return barBottom(insets.bottom) + BAR_HEIGHT + spacing.lg;
}

/**
 * Floating, rounded tab bar detached from the screen edges. A soft pill slides
 * behind the active tab; the centre "Suunnittele" button rises above the bar.
 * Screens outside the tabs (recipe, questionnaire, camera) cover it, so it is
 * hidden there.
 */
export function TabBar({ state, descriptors, emitter, navigateToTab }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const reducedMotion = useReducedMotion();
  const [slotWidth, setSlotWidth] = useState(0);
  const [pillX] = useState(() => new Animated.Value(0));
  const [pillOpacity] = useState(() => new Animated.Value(1));

  // Narrow phones (about 360 dp) get a slightly smaller label so "Suunnittele" fits its slot.
  const compact = slotWidth > 0 && slotWidth < COMPACT_SLOT;
  const focusedRoute = state.routes[state.index]?.name;
  const primaryFocused = focusedRoute === PRIMARY_ROUTE;

  useEffect(() => {
    if (slotWidth === 0) return;
    const toX = state.index * slotWidth;
    const animations = [
      reducedMotion
        ? Animated.timing(pillX, { toValue: toX, duration: 0, useNativeDriver: true })
        : Animated.spring(pillX, { toValue: toX, useNativeDriver: true, speed: 18, bounciness: 7 }),
      Animated.timing(pillOpacity, {
        toValue: primaryFocused ? 0 : 1,
        duration: reducedMotion ? 0 : motion.durationFast,
        useNativeDriver: true,
      }),
    ];
    const animation = Animated.parallel(animations);
    animation.start();
    return () => animation.stop();
  }, [state.index, slotWidth, primaryFocused, pillX, pillOpacity, reducedMotion]);

  const onBarLayout = (event: LayoutChangeEvent) =>
    setSlotWidth(event.nativeEvent.layout.width / state.routes.length);

  return (
    <View
      role="tablist"
      pointerEvents="box-none"
      style={[styles.container, { bottom: barBottom(insets.bottom) }]}
    >
      <View style={styles.bar} onLayout={onBarLayout}>
        {slotWidth > 0 ? (
          <Animated.View
            pointerEvents="none"
            style={[
              styles.pill,
              { width: slotWidth - PILL_INSET * 2, opacity: pillOpacity, transform: [{ translateX: pillX }] },
            ]}
          />
        ) : null}
      </View>

      <View style={styles.tabs} pointerEvents="box-none">
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
              compact={compact}
              label={label}
              focused={focused}
              onPress={onPress}
              onLongPress={onLongPress}
              {...a11y}
            />
          ) : (
            <Tab
              key={route.key}
              compact={compact}
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
    </View>
  );
}

type TabProps = {
  label: string;
  compact: boolean;
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
          speed: 20,
          bounciness: 10,
        });
    animation.start();
    return () => animation.stop();
  }, [focused, progress, reducedMotion]);

  return progress;
}

function Tab({ icon, label, focused, compact, ...pressable }: TabProps & { icon: IconName }) {
  const progress = useFocusProgress(focused);
  const color = focused ? 'accentText' : 'textSubtle';

  return (
    <PressableScale haptic="select" style={styles.tab} {...pressable}>
      <Animated.View
        style={{
          transform: [
            { scale: progress.interpolate({ inputRange: [0, 1], outputRange: [1, 1.08] }) },
            { translateY: progress.interpolate({ inputRange: [0, 1], outputRange: [0, -1] }) },
          ],
        }}
      >
        <Icon name={icon} size={22} color={color} strokeWidth={focused ? 2.2 : 1.8} />
      </Animated.View>
      <Text
        variant="tabLabel"
        color={color}
        numberOfLines={1}
        maxFontSizeMultiplier={MAX_LABEL_SCALE}
        style={[styles.label, compact && styles.labelCompact]}
      >
        {label}
      </Text>
    </PressableScale>
  );
}

function PrimaryTab({ label, focused, compact, ...pressable }: TabProps) {
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
    <PressableScale haptic="tap" style={styles.primaryTab} {...pressable}>
      <View style={styles.primaryButton}>
        {/* A quarter turn of the plus marks the active state without changing the shape. */}
        <Animated.View
          style={{
            transform: [
              { rotate: rotation.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '90deg'] }) },
            ],
          }}
        >
          <Icon name="plus" size={30} color="textOnAccent" strokeWidth={2.6} />
        </Animated.View>
      </View>
      <Text
        variant="tabLabel"
        color={focused ? 'accentText' : 'textMuted'}
        numberOfLines={1}
        maxFontSizeMultiplier={MAX_LABEL_SCALE}
        style={[styles.label, compact && styles.labelCompact]}
      >
        {label}
      </Text>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: SIDE_MARGIN,
    right: SIDE_MARGIN,
    // The container includes the space above the bar where the centre button
    // rises: Android ignores touches outside a parent's bounds.
    height: BAR_HEIGHT + RISE,
    justifyContent: 'flex-end',
  },
  bar: {
    height: BAR_HEIGHT,
    borderRadius: radii.pill,
    backgroundColor: colors.surfaceRaised,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.glassBorder,
    justifyContent: 'center',
    ...shadows.card,
  },
  pill: {
    position: 'absolute',
    left: PILL_INSET,
    top: PILL_INSET,
    bottom: PILL_INSET,
    borderRadius: radii.pill,
    backgroundColor: colors.accentSoft,
  },
  tabs: {
    ...StyleSheet.absoluteFill,
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  tab: {
    flex: 1,
    height: BAR_HEIGHT,
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingBottom: LABEL_BOTTOM,
    gap: 4,
  },
  primaryTab: {
    flex: 1,
    height: BAR_HEIGHT + RISE,
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingBottom: LABEL_BOTTOM,
    gap: 4,
  },
  label: {
    alignSelf: 'stretch',
    textAlign: 'center',
    paddingHorizontal: 1,
  },
  labelCompact: {
    fontSize: 11,
    letterSpacing: -0.1,
  },
  primaryButton: {
    width: PRIMARY_SIZE,
    height: PRIMARY_SIZE,
    borderRadius: PRIMARY_SIZE / 2,
    backgroundColor: colors.accent,
    borderWidth: 4,
    borderColor: colors.bg,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.glow,
  },
});
