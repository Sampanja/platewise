import { router } from 'expo-router';
import { useState, type ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { CharacterPicker } from '@/features/characters/CharacterPicker';
import { MascotSays } from '@/features/mascot/SpeechBubble';
import { useCharacter } from '@/features/mascot/useCharacter';
import { WizardFrame } from '@/components/WizardFrame';
import {
  Button,
  Card,
  haptics,
  Icon,
  OptionRow,
  Stepper,
  SwitchRow,
  Text,
  TextField,
} from '@/components/ui';
import { MIN_KCAL_GOAL } from '@/data/catalog';
import { useProfileStore, type Profile } from '@/data/stores/profile';
import type { AllergenCode, DietCode } from '@/data/types';
import { LanguageStep } from '@/features/settings/LanguageStep';
import { UnitsStep } from '@/features/settings/UnitsStep';
import { DietPicker } from '@/features/shared/DietPicker';
import { format, strings } from '@/i18n';
import { energyUnitLabel, formatEnergy, formatEnergyBare } from '@/lib/amounts';
import { activeTheme, colors, radii, spacing, themedStyles } from '@/theme';

const t = strings.onboarding;
const STEPS = ['welcome', 'diet', 'goal'] as const;
type Step = (typeof STEPS)[number];

type Draft = Pick<
  Profile,
  'name' | 'allergens' | 'diets' | 'goals' | 'hasCalorieGoal'
>;

/**
 * First-run setup. It starts with the language (preselected from the phone),
 * then the units (suggested by the region, always confirmed), then the character picker: choosing a character
 * re-themes the whole app (the navigator remounts), so the choice is saved
 * right away and the rest of the setup starts after it. Then a few short
 * screens, each one skippable. Shown only once.
 */
export default function OnboardingScreen() {
  const languageChosen = useProfileStore((s) => s.languageChosen);
  const unitsChosen = useProfileStore((s) => s.unitsChosen);
  const chosen = useProfileStore((s) => s.characterChosen);
  const characterId = useProfileStore((s) => s.characterId);
  const update = useProfileStore((s) => s.update);
  if (!languageChosen) return <LanguageStep />;
  if (!unitsChosen) return <UnitsStep />;
  if (!chosen) {
    return (
      <CharacterPicker
        initial={characterId}
        mode={activeTheme()}
        onChoose={(id) => update({ characterId: id, characterChosen: true })}
        onBack={() => update({ unitsChosen: false })}
      />
    );
  }
  return <Setup />;
}

function Setup() {
  const { voice } = useCharacter();
  const profile = useProfileStore.getState();
  const update = useProfileStore((s) => s.update);
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState<1 | -1>(1);
  const [draft, setDraft] = useState<Draft>({
    name: profile.name,
    allergens: profile.allergens,
    diets: profile.diets,
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
          <MascotSays state="happy" message={voice.hello} size={96} />
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
                format={(v) => formatEnergyBare(v)}
                accessibilityLabel={format(strings.profileEdit.kcal, { unit: energyUnitLabel() })}
              />
              <Text variant="label" color="textSubtle">
                {energyUnitLabel()}
              </Text>
              <Text variant="caption" color="textSubtle" style={styles.center}>
                {format(t.goalHint, { min: formatEnergy(MIN_KCAL_GOAL) })}
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
      // Step 1 goes back to the character picker.
      onBack={index > 0 ? back : () => update({ characterChosen: false })}
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
