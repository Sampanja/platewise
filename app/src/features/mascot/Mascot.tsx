import { Image } from 'expo-image';
import { useEffect, useState } from 'react';
import { Animated, Easing, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

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

/**
 * The user's character in a given state. Uses the final artwork from
 * assets/mascot when it exists, otherwise the temporary vector drawing. The
 * motion comes from here, so still artwork comes alive too. Respects the
 * system's reduce-motion setting.
 */
export function Mascot({ state = 'idle', size = 96, style, character, accessibilityLabel }: Props) {
  const own = useCharacter();
  const id = character ?? own.id;
  const reducedMotion = useReducedMotion();
  const [y] = useState(() => new Animated.Value(0));
  const [rotate] = useState(() => new Animated.Value(0));
  const [scale] = useState(() => new Animated.Value(1));

  useEffect(() => {
    y.setValue(0);
    rotate.setValue(0);
    scale.setValue(1);
    if (reducedMotion) return;
    const timing = (value: Animated.Value, toValue: number, duration: number, easing = Easing.inOut(Easing.quad)) =>
      Animated.timing(value, { toValue, duration, easing, useNativeDriver: true });

    // A few rounds, then rest: endless motion drains the battery and keeps the UI from ever idling.
    const loop = (part: Animated.CompositeAnimation) => Animated.loop(part, { iterations: state === 'celebrating' ? 4 : 3 });
    let animation: Animated.CompositeAnimation;
    switch (state) {
      case 'happy':
        animation = loop(
          Animated.sequence([timing(y, -size * 0.1, 260, Easing.out(Easing.quad)), timing(y, 0, 260, Easing.bounce), Animated.delay(900)]),
        );
        break;
      case 'celebrating':
        animation = loop(
          Animated.sequence([
            Animated.parallel([timing(y, -size * 0.18, 300, Easing.out(Easing.quad)), timing(rotate, 1, 300)]),
            Animated.parallel([timing(y, 0, 320, Easing.bounce), timing(rotate, 0, 320)]),
            Animated.delay(300),
          ]),
        );
        break;
      case 'thinking':
        animation = loop(Animated.sequence([timing(rotate, -0.4, 1200), timing(rotate, 0.4, 1200)]));
        break;
      case 'cooking':
        animation = loop(Animated.sequence([timing(rotate, -0.3, 260), timing(rotate, 0.3, 260)]));
        break;
      case 'sleepy':
        animation = loop(
          Animated.sequence([
            Animated.parallel([timing(rotate, 0.3, 2200), timing(scale, 0.97, 2200)]),
            Animated.parallel([timing(rotate, -0.3, 2200), timing(scale, 1, 2200)]),
          ]),
        );
        break;
      case 'encouraging':
        animation = loop(
          Animated.sequence([timing(rotate, -0.5, 180), timing(rotate, 0.5, 180), timing(rotate, 0, 180), Animated.delay(1400)]),
        );
        break;
      case 'idle':
      default:
        animation = loop(
          Animated.sequence([
            Animated.parallel([timing(y, -size * 0.03, 1300), timing(scale, 1.02, 1300)]),
            Animated.parallel([timing(y, 0, 1300), timing(scale, 1, 1300)]),
          ]),
        );
    }
    animation.start(({ finished }) => {
      if (!finished) return;
      Animated.parallel([timing(y, 0, 300), timing(rotate, 0, 300), timing(scale, 1, 300)]).start();
    });
    return () => animation.stop();
  }, [state, size, reducedMotion, y, rotate, scale]);

  const images = CHARACTER_IMAGES[id];
  const image = images?.[state] ?? images?.idle;
  const spin = rotate.interpolate({ inputRange: [-1, 1], outputRange: ['-12deg', '12deg'] });

  return (
    <View
      style={[{ width: size, height: size }, style]}
      accessible={Boolean(accessibilityLabel)}
      accessibilityLabel={accessibilityLabel ?? format(strings.mascot.a11y, { name: characterVoice(id).name })}
      importantForAccessibility={accessibilityLabel ? 'yes' : 'no-hide-descendants'}
    >
      <Animated.View style={[styles.fill, { transform: [{ translateY: y }, { rotate: spin }, { scale }] }]}>
        {image ? (
          <Image source={image} style={styles.fill} contentFit="contain" />
        ) : (
          <CharacterSvg character={id} state={state} size={size} />
        )}
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
