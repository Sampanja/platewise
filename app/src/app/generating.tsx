import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { EmptyState, haptics, Icon, Text, useReducedMotion } from '@/components/ui';
import { INGREDIENTS_BY_ID, RECIPES } from '@/data/catalog';
import { useUserRules } from '@/data/hooks';
import { usePlansStore } from '@/data/stores/plans';
import { generateMeals, NoRecipesError } from '@/domain/generate';
import { strings } from '@/i18n';
import { newId } from '@/lib/id';
import { today } from '@/lib/dates';
import { colors, spacing } from '@/theme';

const t = strings.plan.generating;
const STEP_TEXTS = [t.step1, t.step2, t.step3, t.step4];
/** Each status line shows this long; the test data needs no real waiting. */
const STEP_MS = 850;

/**
 * Generation view: a calm, looping animation with changing status lines.
 * With test data the plan is computed locally; the backend version will wait
 * for the `generate-plan` function here instead.
 */
export default function GeneratingScreen() {
  const rules = useUserRules();
  const reducedMotion = useReducedMotion();
  const [stepIndex, setStepIndex] = useState(0);
  const [failed, setFailed] = useState(false);
  const [pulse] = useState(() => new Animated.Value(0));
  const [spin] = useState(() => new Animated.Value(0));
  const [textIn] = useState(() => new Animated.Value(1));

  useEffect(() => {
    if (reducedMotion) return;
    const loop = Animated.loop(
      Animated.parallel([
        Animated.sequence([
          Animated.timing(pulse, { toValue: 1, duration: 900, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
          Animated.timing(pulse, { toValue: 0, duration: 900, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
        ]),
        Animated.timing(spin, { toValue: 1, duration: 1800, easing: Easing.linear, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [pulse, spin, reducedMotion]);

  useEffect(() => {
    const timers = STEP_TEXTS.slice(1).map((_, i) =>
      setTimeout(() => {
        textIn.setValue(0);
        setStepIndex(i + 1);
        Animated.timing(textIn, { toValue: 1, duration: 300, useNativeDriver: true }).start();
      }, STEP_MS * (i + 1)),
    );

    const done = setTimeout(() => {
      const { lastAnswers, pinnedRecipeIds, setProposal, clearPinned } = usePlansStore.getState();
      if (!lastAnswers) {
        router.replace('/questionnaire');
        return;
      }
      try {
        const keep = pinnedRecipeIds
          .slice(0, lastAnswers.mealCount)
          .map((recipeId, dayOffset) => ({ dayOffset, recipeId }));
        const meals = generateMeals({
          answers: lastAnswers,
          recipes: RECIPES,
          index: INGREDIENTS_BY_ID,
          user: rules,
          seed: Date.now() % 2147483647,
          keep,
        });
        setProposal({
          id: newId(),
          createdAt: new Date().toISOString(),
          startDate: today(),
          answers: lastAnswers,
          meals,
        });
        clearPinned();
        haptics.success();
        router.replace('/proposal');
      } catch (error) {
        if (!(error instanceof NoRecipesError)) throw error;
        haptics.warning();
        setFailed(true);
      }
    }, STEP_MS * STEP_TEXTS.length);

    return () => {
      timers.forEach(clearTimeout);
      clearTimeout(done);
    };
  }, [rules, textIn]);

  if (failed) {
    return (
      <SafeAreaView style={[styles.safe, styles.center]}>
        <EmptyState
          icon="alert"
          tone="danger"
          title={t.errorTitle}
          body={t.errorBody}
          action={{ label: t.errorCta, onPress: () => router.replace('/questionnaire') }}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.safe, styles.center]}>
      <View
        style={styles.stage}
        accessible
        accessibilityLabel={`${t.title}. ${STEP_TEXTS[stepIndex]}`}
        accessibilityLiveRegion="polite"
      >
        <Animated.View
          style={[
            styles.glow,
            {
              opacity: pulse.interpolate({ inputRange: [0, 1], outputRange: [0.35, 0.8] }),
              transform: [{ scale: pulse.interpolate({ inputRange: [0, 1], outputRange: [0.9, 1.15] }) }],
            },
          ]}
        />
        <Animated.View
          style={[
            styles.orbit,
            { transform: [{ rotate: spin.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] }) }] },
          ]}
        >
          <View style={styles.dot} />
        </Animated.View>
        <View style={styles.plate}>
          <Icon name="pot" size={48} color="textOnAccent" />
        </View>
      </View>
      <Text variant="display" style={styles.title}>
        {t.title}
      </Text>
      <Animated.View style={{ opacity: textIn }}>
        <Text variant="body" color="textMuted" style={styles.title}>
          {STEP_TEXTS[stepIndex]}
        </Text>
      </Animated.View>
      <View style={styles.dots}>
        {STEP_TEXTS.map((text, i) => (
          <View key={text} style={[styles.stepDot, i <= stepIndex && styles.stepDotActive]} />
        ))}
      </View>
    </SafeAreaView>
  );
}

const STAGE = 200;

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.bg,
    padding: spacing.xl,
  },
  center: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.lg,
  },
  stage: {
    width: STAGE,
    height: STAGE,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  glow: {
    position: 'absolute',
    width: STAGE,
    height: STAGE,
    borderRadius: STAGE / 2,
    backgroundColor: colors.accentGlow,
  },
  orbit: {
    position: 'absolute',
    width: STAGE - 24,
    height: STAGE - 24,
    borderRadius: (STAGE - 24) / 2,
    borderWidth: 2,
    borderColor: colors.accentSoft,
  },
  dot: {
    position: 'absolute',
    top: -7,
    left: (STAGE - 24) / 2 - 6,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.accentText,
  },
  plate: {
    width: 112,
    height: 112,
    borderRadius: 56,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    textAlign: 'center',
  },
  dots: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  stepDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.surfaceRaised,
  },
  stepDotActive: {
    backgroundColor: colors.accent,
  },
});
