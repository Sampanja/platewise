import { Image } from 'expo-image';
import { NavigationContext } from 'expo-router/react-navigation';
import { useContext, useEffect, useState } from 'react';
import { Animated, AppState, Easing, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { useReducedMotion } from '@/components/ui';
import { format, strings } from '@/i18n';
import type { CharacterId } from '@/theme/characters';

import { CHARACTER_IMAGES } from '../../../assets/mascot';
import { CharacterSvg } from './CharacterSvg';
import type { MascotState } from './types';
import { characterVoice, useCharacter } from './useCharacter';

type Props = {
  state?: MascotState;
  size?: number;
  style?: StyleProp<ViewStyle>;
  /** Draw this character instead of the user's own (the picker). */
  character?: CharacterId;
  /** Spoken label; the mascot is decorative by default. */
  accessibilityLabel?: string;
};

/** States whose eyes are open, so a blink shows. */
const BLINKING: ReadonlySet<MascotState> = new Set(['idle', 'thinking', 'cooking', 'encouraging']);
const BLINK_MS = 130;

/**
 * True while the mascot can be seen: its screen is focused and the app is in
 * the foreground. Outside a screen (the celebration overlay) only the app
 * state counts. Every loop below stops when this turns false.
 */
function useVisible(): boolean {
  const navigation = useContext(NavigationContext);
  const [focused, setFocused] = useState(() => navigation?.isFocused() ?? true);
  const [active, setActive] = useState(() => AppState.currentState === 'active');
  useEffect(() => {
    if (!navigation) return;
    const offFocus = navigation.addListener('focus', () => setFocused(true));
    const offBlur = navigation.addListener('blur', () => setFocused(false));
    return () => {
      offFocus();
      offBlur();
    };
  }, [navigation]);
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (next) => setActive(next === 'active'));
    return () => subscription.remove();
  }, []);
  return focused && active;
}

/**
 * The user's character in a given state. Uses the final artwork from
 * assets/mascot when it exists, otherwise the vector drawing. Motion comes
 * from here, so still artwork comes alive too:
 * - a soft pop when the state changes,
 * - the state's own gesture a few times (bounce, tilt, stir…),
 * - breathing and blinking all the time the character is visible.
 * Everything stops when the screen is not focused or the app is in the
 * background, and with the system's reduce-motion setting.
 */
export function Mascot({ state = 'idle', size = 96, style, character, accessibilityLabel }: Props) {
  const own = useCharacter();
  const id = character ?? own.id;
  const reducedMotion = useReducedMotion();
  const visible = useVisible();
  const animate = visible && !reducedMotion;
  const [y] = useState(() => new Animated.Value(0));
  const [rotate] = useState(() => new Animated.Value(0));
  const [scale] = useState(() => new Animated.Value(1));
  const [breath] = useState(() => new Animated.Value(0));
  const [blink, setBlink] = useState(false);

  // The state's gesture: a pop, then a few rounds of its motion, then rest.
  useEffect(() => {
    y.setValue(0);
    rotate.setValue(0);
    scale.setValue(1);
    if (!animate) return;
    const timing = (value: Animated.Value, toValue: number, duration: number, easing = Easing.inOut(Easing.quad)) =>
      Animated.timing(value, { toValue, duration, easing, useNativeDriver: true });
    const loop = (part: Animated.CompositeAnimation) => Animated.loop(part, { iterations: state === 'celebrating' ? 4 : 3 });
    let gesture: Animated.CompositeAnimation;
    switch (state) {
      case 'happy':
        gesture = loop(
          Animated.sequence([timing(y, -size * 0.1, 260, Easing.out(Easing.quad)), timing(y, 0, 260, Easing.bounce), Animated.delay(900)]),
        );
        break;
      case 'celebrating':
        gesture = loop(
          Animated.sequence([
            Animated.parallel([timing(y, -size * 0.18, 300, Easing.out(Easing.quad)), timing(rotate, 1, 300)]),
            Animated.parallel([timing(y, 0, 320, Easing.bounce), timing(rotate, 0, 320)]),
            Animated.delay(300),
          ]),
        );
        break;
      case 'thinking':
        gesture = loop(Animated.sequence([timing(rotate, -0.4, 1200), timing(rotate, 0.4, 1200)]));
        break;
      case 'cooking':
        gesture = loop(Animated.sequence([timing(rotate, -0.3, 260), timing(rotate, 0.3, 260)]));
        break;
      case 'sleepy':
        gesture = loop(Animated.sequence([timing(rotate, 0.3, 2200), timing(rotate, -0.3, 2200)]));
        break;
      case 'encouraging':
        gesture = loop(
          Animated.sequence([timing(rotate, -0.5, 180), timing(rotate, 0.5, 180), timing(rotate, 0, 180), Animated.delay(1400)]),
        );
        break;
      case 'idle':
      default:
        gesture = loop(Animated.sequence([timing(y, -size * 0.03, 1300), timing(y, 0, 1300)]));
    }
    scale.setValue(0.92);
    const pop = Animated.spring(scale, { toValue: 1, speed: 16, bounciness: 12, useNativeDriver: true });
    const animation = Animated.parallel([pop, gesture]);
    animation.start(({ finished }) => {
      if (finished) Animated.parallel([timing(y, 0, 300), timing(rotate, 0, 300)]).start();
    });
    return () => animation.stop();
  }, [state, size, animate, y, rotate, scale]);

  // Breathing: a slow, endless rise and fall while visible.
  useEffect(() => {
    breath.setValue(0);
    if (!animate) return;
    const duration = state === 'sleepy' ? 2400 : 1700;
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(breath, { toValue: 1, duration, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(breath, { toValue: 0, duration, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ]),
    );
    animation.start();
    return () => animation.stop();
  }, [animate, state, breath]);

  // Blinking at natural, slightly random intervals.
  const canBlink = animate && BLINKING.has(state);
  useEffect(() => {
    if (!canBlink) return;
    let timer: ReturnType<typeof setTimeout>;
    const schedule = () => {
      timer = setTimeout(
        () => {
          setBlink(true);
          timer = setTimeout(() => {
            setBlink(false);
            schedule();
          }, BLINK_MS);
        },
        2600 + Math.random() * 3200,
      );
    };
    schedule();
    return () => {
      clearTimeout(timer);
      setBlink(false);
    };
  }, [canBlink]);

  const images = CHARACTER_IMAGES[id];
  const image = (state === 'idle' && blink ? images?.idleBlink : undefined) ?? images?.[state] ?? images?.idle;
  const spin = rotate.interpolate({ inputRange: [-1, 1], outputRange: ['-12deg', '12deg'] });
  const breathY = breath.interpolate({ inputRange: [0, 1], outputRange: [1, 1.03] });
  const breathX = breath.interpolate({ inputRange: [0, 1], outputRange: [1, 0.99] });
  // Breathing grows from the feet, so the character does not float.
  const breathShift = breath.interpolate({ inputRange: [0, 1], outputRange: [0, -size * 0.015] });

  return (
    <View
      style={[{ width: size, height: size }, style]}
      accessible={Boolean(accessibilityLabel)}
      accessibilityLabel={accessibilityLabel ?? format(strings.mascot.a11y, { name: characterVoice(id).name })}
      importantForAccessibility={accessibilityLabel ? 'yes' : 'no-hide-descendants'}
    >
      <Animated.View style={[styles.fill, { transform: [{ translateY: y }, { rotate: spin }, { scale }] }]}>
        <Animated.View style={[styles.fill, { transform: [{ translateY: breathShift }, { scaleX: breathX }, { scaleY: breathY }] }]}>
          {image ? (
            <Image source={image} style={styles.fill} contentFit="contain" />
          ) : (
            <CharacterSvg character={id} state={state} size={size} blink={blink && BLINKING.has(state)} />
          )}
        </Animated.View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  fill: {
    width: '100%',
    height: '100%',
  },
});
