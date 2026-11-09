import { useMemo, useRef, useState } from 'react';
import {
  Animated,
  Pressable,
  ScrollView,
  StyleSheet,
  useWindowDimensions,
  View,
  type FlatList,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { haptics, Icon, Text } from '@/components/ui';
import { Mascot } from '@/features/mascot/Mascot';
import { characterVoice } from '@/features/mascot/useCharacter';
import { format, strings } from '@/i18n';
import { buttonHeight, CHARACTER_IDS, palettes, radii, spacing, touchTarget, type CharacterId, type ThemeName } from '@/theme';

import { ThemePreview } from './ThemePreview';

const t = strings.characters;
const IDS = CHARACTER_IDS;

export type CharacterPickerProps = {
  /** The page shown first. */
  initial: CharacterId;
  /** Light or dark: every page is drawn in this mode. */
  mode: ThemeName;
  /** The user's current character (shown as chosen); omit in onboarding. */
  current?: CharacterId;
  onChoose: (id: CharacterId) => void;
  onBack?: () => void;
};

/**
 * Swipeable character cards. While the user browses, the whole view blends
 * into the next character's colours, the character introduces itself in its
 * own voice and a miniature of the app shows the theme. Nothing is saved
 * until the user chooses. Arrow buttons make it usable without swiping
 * (screen readers, switch control).
 */
export function CharacterPicker({ initial, mode, current, onChoose, onBack }: CharacterPickerProps) {
  const { width } = useWindowDimensions();
  const startIndex = Math.max(0, IDS.indexOf(initial));
  const [index, setIndex] = useState(startIndex);
  const [scrollX] = useState(() => new Animated.Value(startIndex * width));
  const list = useRef<FlatList<CharacterId>>(null);

  const id = IDS[index];
  const palette = palettes[id][mode];
  const voice = characterVoice(id);
  const isCurrent = current === id;

  // Colours blend page by page as the list scrolls.
  const blend = useMemo(() => {
    const inputRange = IDS.map((_, i) => i * width);
    const pick = (token: 'bg' | 'accent') =>
      scrollX.interpolate({ inputRange, outputRange: IDS.map((c) => palettes[c][mode][token]), extrapolate: 'clamp' });
    return { bg: pick('bg'), accent: pick('accent') };
  }, [scrollX, width, mode]);

  const onScroll = useMemo(
    () =>
      Animated.event([{ nativeEvent: { contentOffset: { x: scrollX } } }], {
        useNativeDriver: false,
        listener: (event: NativeSyntheticEvent<NativeScrollEvent>) => {
          const next = Math.round(event.nativeEvent.contentOffset.x / width);
          if (next !== index && next >= 0 && next < IDS.length) {
            setIndex(next);
            haptics.tap();
          }
        },
      }),
    [scrollX, width, index],
  );

  const goTo = (next: number) => {
    const clamped = Math.max(0, Math.min(IDS.length - 1, next));
    list.current?.scrollToIndex({ index: clamped, animated: true });
  };

  return (
    <Animated.View style={[styles.fill, { backgroundColor: blend.bg }]}>
      <SafeAreaView style={styles.fill} edges={['top', 'bottom']}>
        <View style={styles.header}>
          {onBack ? (
            <Pressable
              onPress={onBack}
              accessibilityRole="button"
              accessibilityLabel={strings.common.back}
              hitSlop={8}
              style={[styles.round, { backgroundColor: palette.surface, borderColor: palette.border }]}
            >
              <Icon name="chevronLeft" size={22} tint={palette.text} />
            </Pressable>
          ) : null}
          <View style={styles.flex}>
            <Text variant="title" style={{ color: palette.text }} accessibilityRole="header">
              {t.title}
            </Text>
            <Text variant="label" style={{ color: palette.textMuted }}>
              {t.body}
            </Text>
          </View>
        </View>

        <Animated.FlatList
          ref={list}
          data={IDS}
          keyExtractor={(item) => item}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          initialScrollIndex={startIndex}
          getItemLayout={(_, i) => ({ length: width, offset: width * i, index: i })}
          onScroll={onScroll}
          scrollEventThrottle={16}
          style={styles.flex}
          renderItem={({ item, index: i }) => (
            <Page id={item} mode={mode} width={width} active={i === index} position={i} />
          )}
        />

        <View style={styles.footer}>
          <View style={styles.pager}>
            <Pressable
              onPress={() => goTo(index - 1)}
              disabled={index === 0}
              accessibilityRole="button"
              accessibilityLabel={t.previous}
              accessibilityState={{ disabled: index === 0 }}
              style={[styles.round, { backgroundColor: palette.surface, borderColor: palette.border }, index === 0 && styles.dim]}
            >
              <Icon name="chevronLeft" size={22} tint={palette.text} />
            </Pressable>
            <View
              style={styles.dots}
              accessible
              accessibilityLabel={format(t.position, { index: index + 1, total: IDS.length })}
            >
              {IDS.map((c, i) => (
                <View
                  key={c}
                  style={[
                    styles.dot,
                    { backgroundColor: i === index ? palette.accent : palette.border },
                    i === index && styles.dotActive,
                  ]}
                />
              ))}
            </View>
            <Pressable
              onPress={() => goTo(index + 1)}
              disabled={index === IDS.length - 1}
              accessibilityRole="button"
              accessibilityLabel={t.next}
              accessibilityState={{ disabled: index === IDS.length - 1 }}
              style={[
                styles.round,
                { backgroundColor: palette.surface, borderColor: palette.border },
                index === IDS.length - 1 && styles.dim,
              ]}
            >
              <Icon name="chevronRight" size={22} tint={palette.text} />
            </Pressable>
          </View>

          <Pressable
            onPress={() => {
              if (isCurrent) return;
              haptics.success();
              onChoose(id);
            }}
            accessibilityRole="button"
            accessibilityState={{ disabled: isCurrent }}
            accessibilityLabel={isCurrent ? format(t.chosen, { name: voice.name }) : format(t.choose, { name: voice.name })}
          >
            {({ pressed }) => (
              <Animated.View
                style={[
                  styles.cta,
                  { backgroundColor: isCurrent ? palette.surfaceRaised : pressed ? palette.accentPressed : blend.accent },
                ]}
              >
                {isCurrent ? <Icon name="check" size={20} tint={palette.text} /> : null}
                <Text variant="bodyStrong" style={{ color: isCurrent ? palette.text : palette.textOnAccent }}>
                  {isCurrent ? format(t.chosen, { name: voice.name }) : format(t.choose, { name: voice.name })}
                </Text>
              </Animated.View>
            )}
          </Pressable>
        </View>
      </SafeAreaView>
    </Animated.View>
  );
}

function Page({
  id,
  mode,
  width,
  active,
  position,
}: {
  id: CharacterId;
  mode: ThemeName;
  width: number;
  active: boolean;
  position: number;
}) {
  const p = palettes[id][mode];
  const voice = characterVoice(id);
  return (
    <ScrollView
      style={{ width }}
      contentContainerStyle={styles.page}
      showsVerticalScrollIndicator={false}
      accessibilityLabel={format(t.position, { index: position + 1, total: IDS.length })}
    >
      <View style={styles.hero}>
        <View style={[styles.halo, { backgroundColor: p.accentSoft }]} />
        <Mascot character={id} state={active ? 'happy' : 'idle'} size={148} />
      </View>
      <View style={styles.names} accessible accessibilityRole="header">
        <Text variant="display" style={[styles.centered, { color: p.text }]}>
          {voice.name}
        </Text>
        <Text variant="label" style={[styles.centered, { color: p.accentText }]}>
          {voice.tagline}
        </Text>
      </View>
      <View style={styles.traits}>
        {voice.traits.map((trait) => (
          <View key={trait} style={[styles.trait, { backgroundColor: p.surface, borderColor: p.border }]}>
            <Text variant="caption" style={{ color: p.textMuted }}>
              {trait}
            </Text>
          </View>
        ))}
      </View>
      <View
        style={[styles.bubble, { backgroundColor: p.surface, borderColor: p.border }]}
        accessible
        accessibilityLabel={`${voice.name}: ${voice.intro}`}
        accessibilityLiveRegion={active ? 'polite' : 'none'}
      >
        <View style={[styles.tail, { backgroundColor: p.surface, borderColor: p.border }]} />
        <Text variant="body" style={{ color: p.text }}>
          {voice.intro}
        </Text>
      </View>
      <ThemePreview palette={p} />
    </ScrollView>
  );
}

const HALO = 172;

const styles = StyleSheet.create({
  fill: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.xs,
  },
  round: {
    width: touchTarget,
    height: touchTarget,
    borderRadius: touchTarget / 2,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dim: {
    opacity: 0.4,
  },
  page: {
    alignItems: 'stretch',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.xl,
  },
  hero: {
    alignItems: 'center',
    justifyContent: 'center',
    height: HALO,
  },
  halo: {
    position: 'absolute',
    width: HALO,
    height: HALO,
    borderRadius: HALO / 2,
  },
  names: {
    gap: spacing.xxs,
  },
  centered: {
    textAlign: 'center',
  },
  traits: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  trait: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radii.pill,
    borderWidth: StyleSheet.hairlineWidth,
  },
  bubble: {
    padding: spacing.lg,
    borderRadius: radii.lg,
    borderWidth: StyleSheet.hairlineWidth,
    marginTop: spacing.xs,
  },
  tail: {
    position: 'absolute',
    top: -7,
    alignSelf: 'center',
    left: '50%',
    marginLeft: -7,
    width: 14,
    height: 14,
    borderLeftWidth: StyleSheet.hairlineWidth,
    borderTopWidth: StyleSheet.hairlineWidth,
    transform: [{ rotate: '45deg' }],
  },
  footer: {
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
  },
  pager: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dots: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    minHeight: touchTarget,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  dotActive: {
    width: 22,
  },
  cta: {
    height: buttonHeight,
    borderRadius: radii.pill,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.xl,
  },
});
