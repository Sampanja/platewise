import { useEffect, useState } from 'react';
import { Animated, Easing, StyleSheet, View, type LayoutChangeEvent } from 'react-native';
import type { BottomTabBarProps } from 'expo-router/js-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';

import { Icon, PressableScale, Text, useReducedMotion, type IconName } from '@/components/ui';
import { format, strings } from '@/i18n';
import { activeTheme, colors, fontFamilies, motion, radii, shadows, spacing, themedStyles } from '@/theme';

import { BAR_HEIGHT, barPath, MAX_BAR_WIDTH, PRIMARY_SIZE, RISE } from './tabBarShape';

/** Route name → icon. Route order and titles come from the tabs layout. */
const ICONS: Record<string, IconName> = {
  index: 'home',
  recipes: 'recipes',
  plan: 'plus',
  diary: 'diary',
  profile: 'profile',
};

/** The centre tab is the app's main action and sits in the bar's notch. */
const PRIMARY_ROUTE = 'plan';

/** Tab labels may grow with the system text size, but only this much, so five still fit. */
const MAX_LABEL_SCALE = 1.25;

/** Every label sits this far above the bar bottom, so the centre label lines up with the rest. */
const LABEL_BOTTOM = 10;
const SIDE_MARGIN = spacing.lg;
const PILL_INSET = 7;
const PILL_MAX = 64;
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
 * Floating tab bar in the character's colours. Five evenly spaced slots; the
 * centre "Suunnittele" button rests in a notch cut into the bar, so it reads
 * as part of the bar rather than a separate bubble. A soft pill slides behind
 * the active side tab. Narrow phones get compact labels; wide screens cap the
 * bar width and centre it.
 */
export function TabBar({ state, descriptors, emitter, navigateToTab }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const reducedMotion = useReducedMotion();
  const [barWidth, setBarWidth] = useState(0);
  const [pillX] = useState(() => new Animated.Value(0));
  const [pillOpacity] = useState(() => new Animated.Value(1));

  const slotWidth = barWidth / state.routes.length;
  const pillWidth = Math.min(slotWidth - PILL_INSET * 2, PILL_MAX);
  // Narrow phones (about 360 dp) get a slightly smaller label so "Suunnittele" fits its slot.
  const compact = slotWidth > 0 && slotWidth < COMPACT_SLOT;
  const focusedRoute = state.routes[state.index]?.name;
  const primaryFocused = focusedRoute === PRIMARY_ROUTE;

  useEffect(() => {
    if (barWidth === 0) return;
    const toX = state.index * slotWidth + (slotWidth - pillWidth) / 2;
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
  }, [state.index, barWidth, slotWidth, pillWidth, primaryFocused, pillX, pillOpacity, reducedMotion]);

  const onBarLayout = (event: LayoutChangeEvent) => setBarWidth(event.nativeEvent.layout.width);
  const dark = activeTheme() === 'dark';

  return (
    <View role="tablist" pointerEvents="box-none" style={[styles.container, { bottom: barBottom(insets.bottom) }]}>
      <View style={styles.frame} pointerEvents="box-none">
        <View style={styles.bar} onLayout={onBarLayout} pointerEvents="none">
          {barWidth > 0 ? (
            <>
              {/* A soft drawn shadow: elevation cannot follow the notch. */}
              <Svg width={barWidth} height={BAR_HEIGHT + 8} style={styles.shadow}>
                <Path d={barPath(barWidth)} fill={colors.shadow} opacity={dark ? 0.35 : 0.07} transform="translate(0 4)" />
                <Path d={barPath(barWidth)} fill={colors.shadow} opacity={dark ? 0.25 : 0.05} transform="translate(0 1.5)" />
              </Svg>
              <Svg width={barWidth} height={BAR_HEIGHT} style={StyleSheet.absoluteFill}>
                <Path
                  d={barPath(barWidth)}
                  fill={dark ? colors.surfaceRaised : colors.surface}
                  stroke={colors.glassBorder}
                  strokeWidth={StyleSheet.hairlineWidth * 2}
                />
              </Svg>
              <Animated.View
                style={[styles.pill, { width: pillWidth, opacity: pillOpacity, transform: [{ translateX: pillX }] }]}
              />
            </>
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
        style={[styles.label, focused && styles.labelFocused, compact && styles.labelCompact]}
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
      <View style={[styles.primaryButton, focused && styles.primaryButtonFocused]}>
        {/* A quarter turn of the plus marks the active state without changing the shape. */}
        <Animated.View
          style={{
            transform: [{ rotate: rotation.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '90deg'] }) }],
          }}
        >
          <Icon name="plus" size={28} color="textOnAccent" strokeWidth={2.6} />
        </Animated.View>
      </View>
      <Text
        variant="tabLabel"
        color={focused ? 'accentText' : 'textMuted'}
        numberOfLines={1}
        maxFontSizeMultiplier={MAX_LABEL_SCALE}
        style={[styles.label, styles.labelFocused, compact && styles.labelCompact]}
      >
        {label}
      </Text>
    </PressableScale>
  );
}

const styles = themedStyles(() =>
  StyleSheet.create({
    container: {
      position: 'absolute',
      left: SIDE_MARGIN,
      right: SIDE_MARGIN,
      // The container includes the space above the bar where the centre button
      // rises: Android ignores touches outside a parent's bounds.
      height: BAR_HEIGHT + RISE,
      alignItems: 'center',
      justifyContent: 'flex-end',
    },
    frame: {
      width: '100%',
      maxWidth: MAX_BAR_WIDTH,
      height: BAR_HEIGHT + RISE,
      justifyContent: 'flex-end',
    },
    bar: {
      height: BAR_HEIGHT,
    },
    shadow: {
      position: 'absolute',
      left: 0,
      top: 0,
    },
    pill: {
      position: 'absolute',
      left: 0,
      top: PILL_INSET,
      bottom: PILL_INSET,
      borderRadius: radii.lg,
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
      justifyContent: 'space-between',
      paddingBottom: LABEL_BOTTOM,
    },
    label: {
      alignSelf: 'stretch',
      textAlign: 'center',
      paddingHorizontal: 1,
    },
    labelFocused: {
      fontFamily: fontFamilies.bodySemiBold,
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
      alignItems: 'center',
      justifyContent: 'center',
      ...shadows.glow,
    },
    primaryButtonFocused: {
      backgroundColor: colors.accentPressed,
    },
  }),
);
