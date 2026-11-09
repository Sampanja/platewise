import { router } from 'expo-router';
import { useState, type ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { WizardFrame } from '@/components/WizardFrame';
import {
  Button,
  Card,
  haptics,
  Icon,
  NumberChoice,
  OptionRow,
  Stepper,
  SwitchRow,
  Text,
  TextField,
} from '@/components/ui';
import { MIN_KCAL_GOAL } from '@/data/catalog';
import { useProfileStore, type Profile } from '@/data/stores/profile';
import type { AllergenCode, DietCode } from '@/data/types';
import { ChainPicker } from '@/features/shared/ChainPicker';
import { DietPicker } from '@/features/shared/DietPicker';
import { format, formatInteger, strings } from '@/i18n';
import { colors, radii, spacing, themedStyles } from '@/theme';

const t = strings.onboarding;
const STEPS = ['welcome', 'household', 'diet', 'store', 'goal'] as const;
type Step = (typeof STEPS)[number];

type Draft = Pick<
  Profile,
  'name' | 'householdSize' | 'allergens' | 'diets' | 'chainCode' | 'goals' | 'hasCalorieGoal'
>;

/** First-run setup: at most five screens, each one skippable. Shown only once. */
export default function OnboardingScreen() {
  const profile = useProfileStore.getState();
  const update = useProfileStore((s) => s.update);
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState<1 | -1>(1);
  const [draft, setDraft] = useState<Draft>({
    name: profile.name,
    householdSize: profile.householdSize,
    allergens: profile.allergens,
    diets: profile.diets,
    chainCode: profile.chainCode,
    goals: profile.goals,
    hasCalorieGoal: profile.hasCalorieGoal,
  });
  const step: Step = STEPS[index];
  const isLast = index === STEPS.length - 1;

  const patch = (value: Partial<Draft>) => setDraft((d) => ({ ...d, ...value }));
  const toggle = <T,>(list: readonly T[], value: T) =>
    list.includes(value) ? list.filter((v) => v !== value) : [...list, value];

  const finish = (save: Draft) => {
    haptics.success();
    update({ ...save, name: save.name.trim(), onboardingCompleted: true });
    router.replace('/');
  };
  const next = () => {
    if (isLast) return finish(draft);
    setDirection(1);
    setIndex((i) => i + 1);
  };
  /** Skipping keeps the defaults for this step and moves on. */
  const skip = () => {
    if (isLast) return finish({ ...draft, hasCalorieGoal: false });
    next();
  };
  const back = () => {
    setDirection(-1);
    setIndex((i) => Math.max(0, i - 1));
  };

  const content: Record<Step, { title: string; body?: string; node: ReactNode }> = {
    welcome: {
      title: t.welcomeTitle,
      body: t.welcomeBody,
      node: (
        <View style={styles.gap}>
          <View style={styles.hero} accessible={false}>
            <View style={styles.heroBadge}>
              <Icon name="pot" size={44} color="accentText" />
            </View>
          </View>
          <Text variant="label" color="textMuted">
            {t.nameLabel}
          </Text>
          <TextField
            value={draft.name}
            onChangeText={(name) => patch({ name })}
            placeholder={t.namePlaceholder}
            accessibilityLabel={t.nameLabel}
            autoCapitalize="words"
            autoComplete="given-name"
            returnKeyType="next"
            onSubmitEditing={next}
            maxLength={30}
          />
        </View>
      ),
    },
    household: {
      title: t.householdTitle,
      body: t.householdBody,
      node: (
        <NumberChoice
          options={[1, 2, 3, 4, 5, 6]}
          value={draft.householdSize}
          onChange={(householdSize) => patch({ householdSize })}
          accessibilityLabelFor={(n) =>
            n === 1 ? strings.plan.eaters.one : format(strings.plan.eaters.many, { count: n })
          }
        />
      ),
    },
    diet: {
      title: t.dietTitle,
      body: t.dietBody,
      node: (
        <View style={styles.gap}>
          <DietPicker
            allergens={draft.allergens}
            diets={draft.diets}
            onToggleAllergen={(code: AllergenCode) => patch({ allergens: toggle(draft.allergens, code) })}
            onToggleDiet={(code: DietCode) => patch({ diets: toggle(draft.diets, code) })}
          />
          <View style={styles.note}>
            <Icon name="shield" size={18} color="textSubtle" />
            <Text variant="caption" color="textSubtle" style={styles.flex}>
              {t.healthNote}
            </Text>
          </View>
        </View>
      ),
    },
    store: {
      title: t.storeTitle,
      body: t.storeBody,
      node: <ChainPicker value={draft.chainCode} onChange={(chainCode) => patch({ chainCode })} />,
    },
    goal: {
      title: t.goalTitle,
      body: t.goalBody,
      node: (
        <View style={styles.gap}>
          <OptionRow
            icon="target"
            title={t.calculate}
            hint={t.calculateHint}
            selected={false}
            action
            onPress={() => {
              // Save what was chosen so far; the calculator completes onboarding.
              update({ ...draft, name: draft.name.trim() });
              router.push({ pathname: '/calculator', params: { from: 'onboarding' } });
            }}
          />
          <Text variant="overline" color="textSubtle">
            {t.manualGoal}
          </Text>
        <Card style={styles.gap}>
          <SwitchRow
            label={t.goalToggle}
            value={draft.hasCalorieGoal}
            onValueChange={(hasCalorieGoal) => patch({ hasCalorieGoal })}
          />
          {draft.hasCalorieGoal ? (
            <View style={styles.goal}>
              <Stepper
                size="large"
                value={draft.goals.kcal}
                min={MIN_KCAL_GOAL}
                max={4000}
                step={50}
                onChange={(kcal) => patch({ goals: { ...draft.goals, kcal } })}
                format={(v) => formatInteger(v)}
                accessibilityLabel={strings.profileEdit.kcal}
              />
              <Text variant="label" color="textSubtle">
                {strings.common.kcalUnit}
              </Text>
              <Text variant="caption" color="textSubtle" style={styles.center}>
                {format(t.goalHint, { min: formatInteger(MIN_KCAL_GOAL) })}
              </Text>
            </View>
          ) : null}
        </Card>
        </View>
      ),
    },
  };

  const current = content[step];

  return (
    <WizardFrame
      step={index + 1}
      total={STEPS.length}
      stepKey={step}
      direction={direction}
      title={current.title}
      body={current.body}
      onBack={index > 0 ? back : undefined}
      onSkip={skip}
      footer={
        <Button
          label={index === 0 ? t.welcomeCta : isLast ? t.finish : strings.common.next}
          onPress={next}
          haptic={isLast ? 'none' : 'tap'}
        />
      }
    >
      {current.node}
    </WizardFrame>
  );
}

const styles = themedStyles(() =>
  StyleSheet.create({
    gap: {
      gap: spacing.lg,
    },
    flex: {
      flex: 1,
    },
    center: {
      textAlign: 'center',
    },
    hero: {
      alignItems: 'center',
      paddingVertical: spacing.lg,
    },
    heroBadge: {
      width: 104,
      height: 104,
      borderRadius: 52,
      backgroundColor: colors.accentSoft,
      alignItems: 'center',
      justifyContent: 'center',
    },
    note: {
      flexDirection: 'row',
      gap: spacing.sm,
      padding: spacing.md,
      borderRadius: radii.md,
      backgroundColor: colors.surface,
    },
    goal: {
      alignItems: 'center',
      gap: spacing.sm,
      paddingTop: spacing.sm,
    },
  }),
);
