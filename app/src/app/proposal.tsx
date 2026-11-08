import { router } from 'expo-router';
import { useMemo } from 'react';
import { Alert, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { openRecipe } from '@/components/RecipeCard';
import { RecipeImage } from '@/components/RecipeImage';
import { ScreenHeader } from '@/components/ScreenHeader';
import {
  AnimatedNumber,
  Button,
  Card,
  Chip,
  EmptyState,
  FadeInView,
  haptics,
  Icon,
  IconButton,
  PressableScale,
  ProgressMeter,
  Text,
} from '@/components/ui';
import { CHAINS_BY_CODE, INGREDIENTS_BY_ID, RECIPES, RECIPES_BY_ID } from '@/data/catalog';
import { useUserRules } from '@/data/hooks';
import { usePlansStore } from '@/data/stores/plans';
import type { Proposal, ProposalMeal } from '@/data/types';
import {
  acceptProposal,
  dinnerServings,
  generateMeals,
  proposalShoppingList,
  swapMeal,
} from '@/domain/generate';
import { recipeCostCents } from '@/domain/recipes';
import { format, formatCents, formatInteger, strings } from '@/i18n';
import { addDays, relativeDayLabel } from '@/lib/dates';
import { showToast } from '@/lib/toast';
import { colors, radii, spacing } from '@/theme';

const t = strings.plan.proposal;

export default function ProposalScreen() {
  const proposal = usePlansStore((s) => s.proposal);
  const setProposalMeals = usePlansStore((s) => s.setProposalMeals);
  const setProposal = usePlansStore((s) => s.setProposal);
  const savePlan = usePlansStore((s) => s.savePlan);
  const rules = useUserRules();

  const totals = useMemo(() => {
    if (!proposal) return null;
    const ids = proposal.meals.map((meal) => meal.recipeId);
    const list = proposalShoppingList(ids, RECIPES_BY_ID, proposal.answers, INGREDIENTS_BY_ID, rules.pantry);
    const recipes = ids.map((id) => RECIPES_BY_ID[id]);
    const avg = (pick: (r: (typeof recipes)[number]) => number) =>
      recipes.reduce((sum, r) => sum + pick(r), 0) / Math.max(1, recipes.length);
    return {
      totalCents: list.totalCents,
      kcal: avg((r) => r.perServing.kcal),
      proteinG: avg((r) => r.perServing.proteinG),
      carbsG: avg((r) => r.perServing.carbsG),
      fatG: avg((r) => r.perServing.fatG),
    };
  }, [proposal, rules.pantry]);

  if (!proposal || !totals) {
    return (
      <SafeAreaView style={styles.safe}>
        <ScreenHeader title={t.title} />
        <EmptyState
          icon="sparkles"
          title={strings.home.emptyTitle}
          body={strings.home.emptyBody}
          action={{ label: strings.plan.start, onPress: () => router.replace('/questionnaire') }}
        />
      </SafeAreaView>
    );
  }

  const { answers } = proposal;
  const headroom = answers.budgetCents - totals.totalCents;

  const update = (meals: ProposalMeal[]) => setProposalMeals(meals);
  const swap = (dayOffset: number) => {
    haptics.tap();
    update(swapMeal(proposal.meals, dayOffset));
  };
  const toggleLock = (dayOffset: number) => {
    haptics.select();
    update(proposal.meals.map((m) => (m.dayOffset === dayOffset ? { ...m, locked: !m.locked } : m)));
  };
  const reshuffle = () => {
    haptics.tap();
    const meals = generateMeals({
      answers,
      recipes: RECIPES,
      index: INGREDIENTS_BY_ID,
      user: rules,
      seed: Date.now() % 2147483647,
      keep: proposal.meals.filter((m) => m.locked).map(({ dayOffset, recipeId }) => ({ dayOffset, recipeId })),
    });
    update(meals);
  };
  const accept = () => {
    const plan = acceptProposal(proposal, RECIPES_BY_ID, INGREDIENTS_BY_ID, rules.pantry, new Date());
    savePlan(plan);
    setProposal(null);
    haptics.success();
    showToast(t.acceptedToast);
    router.replace('/shopping-list');
  };
  const discard = () =>
    Alert.alert(t.discardTitle, t.discardBody, [
      { text: strings.common.cancel, style: 'cancel' },
      {
        text: t.discard,
        style: 'destructive',
        onPress: () => {
          setProposal(null);
          router.replace('/plan');
        },
      },
    ]);

  const unlockedCount = proposal.meals.filter((m) => !m.locked).length;

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <ScreenHeader
        title={t.title}
        onBack={() => router.replace('/plan')}
        trailing={<IconButton icon="trash" variant="plain" accessibilityLabel={t.discard} onPress={discard} />}
      />
      <ScrollView contentContainerStyle={styles.content}>
        <Card style={styles.summary}>
          <Text variant="overline" color="textSubtle">
            {t.total}
          </Text>
          <View style={styles.totalRow}>
            <AnimatedNumber
              variant="displayLarge"
              color="accentText"
              value={totals.totalCents}
              format={(v) => formatCents(Math.round(v))}
            />
            <Text variant="heading" color="textMuted">
              {format(t.ofBudget, { budget: formatCents(answers.budgetCents) })}
            </Text>
          </View>
          <ProgressMeter
            value={totals.totalCents / answers.budgetCents}
            accessibilityLabel={`${t.total} ${formatCents(totals.totalCents)} ${format(t.ofBudget, {
              budget: formatCents(answers.budgetCents),
            })}`}
          />
          <Text variant="bodyStrong" color={headroom >= 0 ? 'success' : 'accentText'}>
            {headroom >= 0
              ? format(t.under, { amount: formatCents(headroom) })
              : format(t.over, { amount: formatCents(-headroom) })}
          </Text>
          {headroom < 0 ? (
            <Text variant="caption" color="textMuted">
              {t.overBudgetHint}
            </Text>
          ) : null}
          <View style={styles.divider} />
          <Text variant="overline" color="textSubtle">
            {t.avgMacros}
          </Text>
          <View style={styles.macros}>
            <Macro label={strings.macros.energy} unit="kcal" value={totals.kcal} />
            <Macro label={strings.macros.protein} unit="g" value={totals.proteinG} />
            <Macro label={strings.macros.carbs} unit="g" value={totals.carbsG} />
            <Macro label={strings.macros.fat} unit="g" value={totals.fatG} />
          </View>
          <Text variant="caption" color="textSubtle">
            {strings.budget.explainer}
          </Text>
        </Card>

        {proposal.meals.map((meal, i) => (
          <FadeInView key={meal.dayOffset} delay={i * 50}>
            <MealCard proposal={proposal} meal={meal} onSwap={swap} onToggleLock={toggleLock} />
          </FadeInView>
        ))}

        <Button
          label={t.reshuffle}
          variant="ghost"
          size="compact"
          icon={<Icon name="shuffle" size={18} color="accentText" />}
          onPress={reshuffle}
          disabled={unlockedCount === 0}
        />
      </ScrollView>
      <View style={styles.footer}>
        <Button label={t.accept} onPress={accept} haptic="none" />
      </View>
    </SafeAreaView>
  );
}

function Macro({ label, unit, value }: { label: string; unit: string; value: number }) {
  return (
    <View style={styles.macro}>
      <AnimatedNumber
        variant="number"
        value={value}
        format={(v) => `${formatInteger(v)} ${unit}`}
        accessibilityLabel={`${label} ${formatInteger(value)} ${unit}`}
      />
      <Text variant="caption" color="textSubtle" numberOfLines={1}>
        {label}
      </Text>
    </View>
  );
}

function MealCard({
  proposal,
  meal,
  onSwap,
  onToggleLock,
}: {
  proposal: Proposal;
  meal: ProposalMeal;
  onSwap: (dayOffset: number) => void;
  onToggleLock: (dayOffset: number) => void;
}) {
  const recipe = RECIPES_BY_ID[meal.recipeId];
  const { pantry } = useUserRules();
  if (!recipe) return null;
  const { answers } = proposal;
  const day = relativeDayLabel(addDays(proposal.startDate, meal.dayOffset));
  const servings = dinnerServings(answers);
  const perServing =
    recipeCostCents(recipe, INGREDIENTS_BY_ID, pantry, CHAINS_BY_CODE[answers.chainCode].priceMultiplier);
  const inPlan = new Set(proposal.meals.map((m) => m.recipeId));
  const canSwap = !meal.locked && meal.alternatives.some((id) => !inPlan.has(id));

  return (
    <Card padding="flush" style={meal.locked && styles.lockedCard}>
      <PressableScale
        onPress={() => openRecipe(recipe.id)}
        accessibilityRole="button"
        accessibilityLabel={`${day}: ${recipe.title}`}
        style={styles.mealTop}
      >
        {/* Keyed by recipe so a swap fades the new dish in. */}
        <FadeInView key={recipe.id} style={styles.mealTopInner}>
          <RecipeImage recipe={recipe} style={styles.thumb} />
          <View style={styles.mealTexts}>
            <Text variant="overline" color="accentText">
              {format(t.day, { index: meal.dayOffset + 1 })} · {day}
            </Text>
            <Text variant="bodyStrong" numberOfLines={3} hyphenate>
              {recipe.title}
            </Text>
            <Text variant="caption" color="textSubtle">
              {formatCents(perServing)} {strings.common.perServing} · {formatInteger(recipe.perServing.kcal)} kcal ·{' '}
              {format(strings.common.minutes, { count: recipe.cookTimeMin })}
            </Text>
            {answers.cookDouble ? (
              <View style={styles.chipRow}>
                <Chip tone="success" label={t.lunch} />
              </View>
            ) : null}
          </View>
        </FadeInView>
      </PressableScale>
      <View style={styles.mealActions}>
        <Text variant="caption" color="textSubtle" style={styles.flex}>
          {format(strings.common.servings, { count: servings })}
        </Text>
        <IconButton
          icon={meal.locked ? 'lock' : 'unlock'}
          variant={meal.locked ? 'accent' : 'raised'}
          size={44}
          accessibilityLabel={
            meal.locked ? format(t.unlockA11y, { title: recipe.title }) : format(t.lockA11y, { title: recipe.title })
          }
          accessibilityState={{ selected: meal.locked }}
          haptic="none"
          onPress={() => onToggleLock(meal.dayOffset)}
        />
        <Button
          label={t.swap}
          size="compact"
          variant="secondary"
          icon={<Icon name="swap" size={18} />}
          haptic="none"
          disabled={!canSwap}
          accessibilityLabel={canSwap ? format(t.swapA11y, { title: recipe.title }) : t.noAlternatives}
          onPress={() => onSwap(meal.dayOffset)}
        />
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  flex: {
    flex: 1,
  },
  content: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
    gap: spacing.md,
  },
  summary: {
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  totalRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.border,
    marginVertical: spacing.sm,
  },
  macros: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  macro: {
    flex: 1,
    gap: spacing.xxs,
  },
  lockedCard: {
    borderColor: colors.accent,
    borderWidth: 1,
  },
  mealTop: {
    padding: spacing.md,
  },
  mealTopInner: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  thumb: {
    width: 96,
    height: 96,
    borderRadius: radii.md,
  },
  mealTexts: {
    flex: 1,
    gap: spacing.xxs,
  },
  chipRow: {
    flexDirection: 'row',
    marginTop: spacing.xxs,
  },
  mealActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
  },
  footer: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
});
