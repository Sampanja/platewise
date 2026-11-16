import { router, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Animated, Easing, KeyboardAvoidingView, Linking, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ScreenHeader } from '@/components/ScreenHeader';
import { Button, haptics, Icon, PressableScale, Text, TextField, useReducedMotion } from '@/components/ui';
import { useLogDraftStore } from '@/data/stores/logDraft';
import type { DiaryMeal } from '@/data/types';
import { mealForHour } from '@/domain/diary';
import { MascotSays } from '@/features/mascot/SpeechBubble';
import { useSpeechInput } from '@/features/textLog/useSpeechInput';
import { strings } from '@/i18n';
import { today } from '@/lib/dates';
import { showToast } from '@/lib/toast';
import { foodTextParser } from '@/services/foodTextParser';
import { colors, radii, spacing, themedStyles } from '@/theme';

const t = strings.textLog;

/**
 * Kirjaa puhumalla / kirjoittamalla: free text (typed or spoken on the
 * device) → foods from the closed list → the same review screen as a photo.
 */
export default function LogTextScreen() {
  const params = useLocalSearchParams<{ mode?: 'speak' | 'write'; meal?: DiaryMeal; date?: string }>();
  const speak = params.mode !== 'write';
  const meal = params.meal ?? mealForHour(new Date().getHours());
  const date = params.date || today();
  const [text, setText] = useState('');
  const [busy, setBusy] = useState(false);
  const setDraft = useLogDraftStore((s) => s.set);
  // Spoken words are added after what was already typed or said.
  const base = useRef('');
  const onSpeech = useCallback((words: string, final: boolean) => {
    const joined = base.current ? `${base.current} ${words}` : words;
    setText(joined);
    if (final) base.current = joined;
  }, []);
  const speech = useSpeechInput(onSpeech);
  const startedOnce = useRef(false);

  // "Puhu" from ＋ starts listening at once.
  useEffect(() => {
    if (!speak || startedOnce.current) return;
    startedOnce.current = true;
    void speech.start();
  }, [speak, speech]);

  const toggleMic = () => {
    haptics.tap();
    if (speech.listening) speech.stop();
    else {
      base.current = text.trim();
      void speech.start();
    }
  };

  const interpret = async () => {
    const value = text.trim();
    if (!value || busy) return;
    if (speech.listening) speech.stop();
    setBusy(true);
    try {
      const result = await foodTextParser.parse(value);
      if (result.foods.length === 0) {
        showToast(t.nothingFound);
        return;
      }
      setDraft({
        text: value,
        foods: result.foods.map((food) => ({ foodId: food.foodId, grams: food.grams, confidence: food.confidence })),
        unmatched: result.unmatched,
      });
      haptics.success();
      router.replace({ pathname: '/photo', params: { source: 'text', meal, date } });
    } catch {
      showToast(strings.errors.genericBody);
    } finally {
      setBusy(false);
    }
  };

  const problem = speech.problem ? t[speech.problem] : null;

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <ScreenHeader variant="close" title={speak ? t.speakTitle : t.writeTitle} />
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <MascotSays state={speech.listening ? 'thinking' : 'happy'} message={speak ? t.tapToSpeak : t.hint} size={56} />
          <TextField
            value={text}
            onChangeText={(value) => {
              setText(value);
              base.current = value;
            }}
            placeholder={t.placeholder}
            accessibilityLabel={speak ? t.speakTitle : t.writeTitle}
            multiline
            autoFocus={!speak}
          />
          <View style={styles.micRow}>
            <MicButton listening={speech.listening} onPress={toggleMic} />
            <Text variant="label" color={speech.listening ? 'accentText' : 'textSubtle'} accessibilityLiveRegion="polite" style={styles.flex}>
              {speech.listening ? t.listening : speak ? t.privacy : t.micStart}
            </Text>
          </View>
          {problem ? (
            <View style={styles.problem} accessibilityRole="alert">
              <Text variant="body" color="textMuted">
                {problem}
              </Text>
              {speech.problem === 'denied' ? (
                <Button label={t.openSettings} size="compact" variant="secondary" onPress={() => void Linking.openSettings()} />
              ) : null}
            </View>
          ) : null}
        </ScrollView>
        <View style={styles.footer}>
          <Button
            label={busy ? t.interpreting : t.interpret}
            disabled={!text.trim() || busy}
            icon={<Icon name="sparkles" size={20} color="textOnAccent" />}
            onPress={() => void interpret()}
          />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function MicButton({ listening, onPress }: { listening: boolean; onPress: () => void }) {
  const reducedMotion = useReducedMotion();
  const [pulse] = useState(() => new Animated.Value(0));
  useEffect(() => {
    pulse.setValue(0);
    if (!listening || reducedMotion) return;
    const loop = Animated.loop(
      Animated.timing(pulse, { toValue: 1, duration: 1200, easing: Easing.out(Easing.quad), useNativeDriver: true }),
    );
    loop.start();
    return () => loop.stop();
  }, [listening, reducedMotion, pulse]);
  return (
    <PressableScale
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={listening ? t.micStop : t.micStart}
      accessibilityState={{ selected: listening }}
      style={styles.micWrap}
    >
      <Animated.View
        style={[
          styles.pulse,
          {
            opacity: pulse.interpolate({ inputRange: [0, 1], outputRange: [0.5, 0] }),
            transform: [{ scale: pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.6] }) }],
          },
        ]}
      />
      <View style={[styles.mic, listening && styles.micOn]}>
        <Icon name={listening ? 'close' : 'mic'} size={28} color={listening ? 'textOnAccent' : 'accentText'} />
      </View>
    </PressableScale>
  );
}

const MIC = 64;

const styles = themedStyles(() =>
  StyleSheet.create({
    safe: {
      flex: 1,
      backgroundColor: colors.bg,
    },
    flex: {
      flex: 1,
    },
    content: {
      padding: spacing.lg,
      gap: spacing.lg,
    },
    micRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.lg,
    },
    micWrap: {
      width: MIC,
      height: MIC,
      alignItems: 'center',
      justifyContent: 'center',
    },
    pulse: {
      position: 'absolute',
      width: MIC,
      height: MIC,
      borderRadius: MIC / 2,
      backgroundColor: colors.accent,
    },
    mic: {
      width: MIC,
      height: MIC,
      borderRadius: MIC / 2,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.accentSoft,
    },
    micOn: {
      backgroundColor: colors.accent,
    },
    problem: {
      gap: spacing.sm,
      padding: spacing.md,
      borderRadius: radii.lg,
      backgroundColor: colors.surface,
    },
    footer: {
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.md,
    },
  }),
);
