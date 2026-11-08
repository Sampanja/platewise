import { router } from 'expo-router';
import { useMemo, useState, type ReactNode } from 'react';
import { Alert, StyleSheet, View } from 'react-native';

import { WizardFrame } from '@/components/WizardFrame';
import {
  Button,
  Card,
  Icon,
  IconButton,
  NumberChoice,
  OptionRow,
  SelectChip,
  Slider,
  Text,
  TextField,
} from '@/components/ui';
import { CHAINS_BY_CODE, CRAVINGS, INGREDIENTS_BY_ID, RECIPES } from '@/data/catalog';
import { useUserRules } from '@/data/hooks';
import { usePlansStore } from '@/data/stores/plans';
import { useProfileStore } from '@/data/stores/profile';
import type { AllergenCode, CravingCode, DietCode, PlanAnswers } from '@/data/types';
import { minimumBudgetCents } from '@/domain/generate';
import { ChainPicker } from '@/features/shared/ChainPicker';
import { DietPicker } from '@/features/shared/DietPicker';
import { format, formatCents, strings } from '@/i18n';
import { colors, radii, spacing } from '@/theme';

const t = strings.plan;
const STEPS = ['budget', 'eaters', 'meals', 'double', 'diet', 'cravings', 'store', 'summary'] as const;
type Step = (typeof STEPS)[number];

const BUDGET_MIN_EUR = 10;
const BUDGET_MAX_EUR = 300;

function toggle<T>(list: readonly T[], value: T): T[] {
  return list.includes(value) ? list.filter((v) => v !== value) : [...list, value];
}

/** Suggested budget when the user has not set one: the weekly budget scaled to the meal count. */
function suggestedBudget(weeklyCents: number, meals: number): number {
  return Math.round((weeklyCents * meals) / 7 / 100) * 100;
}

/** Suunnittele: one question per screen, prefilled from the last run or the profile. */
export default function QuestionnaireScreen() {
  const profile = useProfileStore.getState();
  const lastAnswers = usePlansStore((s) => s.lastAnswers);
  const pinnedCount = usePlansStore((s) => s.pinnedRecipeIds.length);
  const setLastAnswers = usePlansStore((s) => s.setLastAnswers);
  const rules = useUserRules();

  const [answers, setAnswers] = useState<PlanAnswers>(() => ({
    budgetCents: lastAnswers?.budgetCents ?? profile.weeklyBudgetCents,
    eaters: lastAnswers?.eaters ?? profile.householdSize,
    mealCount: lastAnswers?.mealCount ?? 7,
    cookDouble: lastAnswers?.cookDouble ?? false,
    // Plan-only additions (e.g. a guest) are not carried over to the next plan.
    extraAllergens: [],
    extraDiets: [],
    cravings: lastAnswers?.cravings ?? [],
    chainCode: lastAnswers?.chainCode ?? profile.chainCode,
  }));
  const [budgetTouched, setBudgetTouched] = useState(lastAnswers !== null);
  const [budgetText, setBudgetText] = useState(String(Math.round(answers.budgetCents / 100)));
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState<1 | -1>(1);
  const step: Step = STEPS[index];

  const patch = (value: Partial<PlanAnswers>) => setAnswers((a) => ({ ...a, ...value }));
  const setBudgetEur = (eur: number) => {
    setBudgetTouched(true);
    setBudgetText(String(eur));
    patch({ budgetCents: eur * 100 });
  };
  const setMeals = (mealCount: number) => {
    if (budgetTouched) return patch({ mealCount });
    const budgetCents = suggestedBudget(profile.weeklyBudgetCents, mealCount);
    setBudgetText(String(Math.round(budgetCents / 100)));
    patch({ mealCount, budgetCents });
  };

  const minimumCents = useMemo(
    () => (step === 'summary' ? minimumBudgetCents(answers, RECIPES, INGREDIENTS_BY_ID, rules) : 0),
    [step, answers, rules],
  );
  const tooLow = step === 'summary' && answers.budgetCents < minimumCents;

  const goTo = (target: number) => {
    setDirection(target > index ? 1 : -1);
    setIndex(target);
  };
  const next = () => goTo(Math.min(index + 1, STEPS.length - 1));
  const back = () => (index === 0 ? close() : goTo(index - 1));
  const close = () => {
    Alert.alert(t.exitTitle, t.exitBody, [
      { text: strings.common.cancel, style: 'cancel' },
      {
        text: t.exit,
        style: 'destructive',
        onPress: () => {
          setLastAnswers(answers);
          router.back();
        },
      },
    ]);
  };
  const create = () => {
    setLastAnswers(answers);
    router.replace('/generating');
  };

  const eatersLabel = (n: number) => (n === 1 ? t.eaters.one : format(t.eaters.many, { count: n }));
  const perMeal = answers.budgetCents / Math.max(1, answers.mealCount);

  const content: Record<Step, { title: string; body?: string; node: ReactNode }> = {
    budget: {
      title: t.budget.title,
      body: t.budget.body,
      node: (
        <Card style={styles.gap}>
          <TextField
            large
            value={budgetText}
            keyboardType="number-pad"
            accessibilityLabel={t.budget.inputA11y}
            maxLength={3}
            onChangeText={(text) => {
              const digits = text.replace(/\D/g, '');
              setBudgetText(digits);
              const eur = Number(digits);
              if (eur > 0) {
                setBudgetTouched(true);
                patch({ budgetCents: Math.min(BUDGET_MAX_EUR, eur) * 100 });
              }
            }}
            onBlur={() => setBudgetText(String(Math.round(answers.budgetCents / 100)))}
            trailing={
              <Text variant="title" color="textMuted">
                {strings.common.euroSign}
              </Text>
            }
          />
          <Slider
            value={Math.round(answers.budgetCents / 100)}
            min={BUDGET_MIN_EUR}
            max={BUDGET_MAX_EUR}
            step={1}
            onChange={setBudgetEur}
            accessibilityLabel={t.budget.sliderA11y}
            accessibilityValueText={formatCents(answers.budgetCents)}
          />
          <Text variant="label" color="textMuted" style={styles.center}>
            {format(t.budget.perMeal, { amount: formatCents(perMeal) })}
          </Text>
        </Card>
      ),
    },
    eaters: {
      title: t.eaters.title,
      body: t.eaters.body,
      node: (
        <NumberChoice
          options={[1, 2, 3, 4, 5, 6]}
          value={answers.eaters}
          onChange={(eaters) => patch({ eaters })}
          accessibilityLabelFor={eatersLabel}
        />
      ),
    },
    meals: {
      title: t.meals.title,
      body: t.meals.body,
      node: (
        <View style={styles.gap}>
          <OptionRow
            icon="calendar"
            title={t.meals.week}
            hint={t.meals.weekHint}
            selected={answers.mealCount === 7}
            onPress={() => setMeals(7)}
          />
          <NumberChoice
            options={[2, 3, 4, 5, 6]}
            columns={5}
            value={answers.mealCount}
            onChange={setMeals}
            accessibilityLabelFor={(n) => format(t.meals.count, { count: n })}
          />
        </View>
      ),
    },
    double: {
      title: t.double.title,
      body: t.double.body,
      node: (
        <View style={styles.gap}>
          <OptionRow
            icon="pot"
            title={t.double.yes}
            hint={t.double.yesHint}
            selected={answers.cookDouble}
            onPress={() => patch({ cookDouble: true })}
          />
          <OptionRow
            icon="plate"
            title={t.double.no}
            hint={t.double.noHint}
            selected={!answers.cookDouble}
            onPress={() => patch({ cookDouble: false })}
          />
        </View>
      ),
    },
    diet: {
      title: t.diet.title,
      body: t.diet.body,
      node: (
        <View style={styles.gap}>
          {rules.allergens.length + rules.diets.length > 0 ? (
            <View style={styles.note}>
              <Icon name="shield" size={18} color="textSubtle" />
              <Text variant="caption" color="textSubtle" style={styles.flex}>
                {`${t.diet.fromProfile}: ${[
                  ...rules.allergens.map((c) => strings.allergens[c]),
                  ...rules.diets.map((c) => strings.diets[c]),
                ].join(', ')}. ${t.diet.fromProfileHint}.`}
              </Text>
            </View>
          ) : null}
          <DietPicker
            allergens={answers.extraAllergens}
            diets={answers.extraDiets}
            lockedAllergens={rules.allergens}
            lockedDiets={rules.diets}
            onToggleAllergen={(code: AllergenCode) =>
              patch({ extraAllergens: toggle(answers.extraAllergens, code) })
            }
            onToggleDiet={(code: DietCode) => patch({ extraDiets: toggle(answers.extraDiets, code) })}
          />
        </View>
      ),
    },
    cravings: {
      title: t.cravings.title,
      body: t.cravings.body,
      node: (
        <View style={styles.chips}>
          {CRAVINGS.map((code: CravingCode) => (
            <SelectChip
              key={code}
              label={strings.cravings[code]}
              selected={answers.cravings.includes(code)}
              onPress={() => patch({ cravings: toggle(answers.cravings, code) })}
            />
          ))}
        </View>
      ),
    },
    store: {
      title: t.store.title,
      body: t.store.body,
      node: <ChainPicker value={answers.chainCode} onChange={(chainCode) => patch({ chainCode })} />,
    },
    summary: {
      title: t.summary.title,
      body: t.summary.body,
      node: (
        <View style={styles.gap}>
          {tooLow ? (
            <Card style={styles.warning}>
              <Text variant="heading">{t.budget.tooLowTitle}</Text>
              <Text variant="body" color="textMuted">
                {format(t.budget.tooLowBody, { amount: formatCents(minimumCents) })}
              </Text>
            </Card>
          ) : null}
          <Card padding="flush">
            <SummaryRow label={t.summary.budget} value={formatCents(answers.budgetCents)} onEdit={() => goTo(0)} />
            <SummaryRow label={t.summary.eaters} value={eatersLabel(answers.eaters)} onEdit={() => goTo(1)} />
            <SummaryRow
              label={t.summary.meals}
              value={answers.mealCount === 7 ? t.meals.week : format(t.meals.count, { count: answers.mealCount })}
              onEdit={() => goTo(2)}
            />
            <SummaryRow
              label={t.summary.double}
              value={answers.cookDouble ? strings.common.yes : strings.common.no}
              onEdit={() => goTo(3)}
            />
            <SummaryRow
              label={t.summary.diet}
              value={
                [
                  ...[...rules.allergens, ...answers.extraAllergens].map((c): string => strings.allergens[c]),
                  ...[...rules.diets, ...answers.extraDiets].map((c): string => strings.diets[c]),
                ].join(', ') || t.summary.noneSelected
              }
              onEdit={() => goTo(4)}
            />
            <SummaryRow
              label={t.summary.cravings}
              value={answers.cravings.map((c) => strings.cravings[c]).join(', ') || t.summary.noneSelected}
              onEdit={() => goTo(5)}
            />
            <SummaryRow
              label={t.summary.store}
              value={CHAINS_BY_CODE[answers.chainCode].name}
              onEdit={() => goTo(6)}
              last
            />
          </Card>
          {pinnedCount > 0 ? (
            <Text variant="label" color="accentText">
              {format(t.summary.pinned, { count: pinnedCount })}
            </Text>
          ) : null}
          <Text variant="caption" color="textSubtle">
            {strings.budget.explainer}
          </Text>
        </View>
      ),
    },
  };

  const current = content[step];
  const footer =
    step === 'summary' ? (
      tooLow ? (
        <Button label={t.budget.title} onPress={() => goTo(0)} />
      ) : (
        <Button label={t.summary.create} onPress={create} haptic="success" />
      )
    ) : step === 'cravings' ? (
      <Button label={answers.cravings.length === 0 ? t.cravings.skip : strings.common.next} onPress={next} />
    ) : (
      <Button label={strings.common.next} onPress={next} />
    );

  return (
    <WizardFrame
      step={index + 1}
      total={STEPS.length}
      stepKey={step}
      direction={direction}
      title={current.title}
      body={current.body}
      onBack={back}
      onClose={close}
      footer={footer}
    >
      {current.node}
    </WizardFrame>
  );
}

function SummaryRow({
  label,
  value,
  onEdit,
  last = false,
}: {
  label: string;
  value: string;
  onEdit: () => void;
  last?: boolean;
}) {
  return (
    <View style={[styles.summaryRow, !last && styles.summaryDivider]}>
      <View style={styles.flex}>
        <Text variant="caption" color="textSubtle">
          {label}
        </Text>
        <Text variant="bodyStrong">{value}</Text>
      </View>
      <IconButton
        icon="pencil"
        variant="plain"
        size={40}
        accessibilityLabel={`${strings.common.edit}: ${label}`}
        onPress={onEdit}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  gap: {
    gap: spacing.lg,
  },
  flex: {
    flex: 1,
  },
  center: {
    textAlign: 'center',
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  note: {
    flexDirection: 'row',
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: radii.md,
    backgroundColor: colors.surface,
  },
  warning: {
    gap: spacing.sm,
    borderColor: colors.accent,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingLeft: spacing.xl,
    paddingRight: spacing.md,
    paddingVertical: spacing.md,
  },
  summaryDivider: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
});
