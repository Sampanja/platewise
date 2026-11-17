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
import { INGREDIENTS_BY_ID, RECIPES, RECIPES_BY_ID } from '@/data/catalog';
import { useUserRules } from '@/data/hooks';
import { usePlansStore } from '@/data/stores/plans';
import type { PlanAnswers, Proposal, ProposalMeal } from '@/data/types';
import { assessProposal, dropMeal, type Assessment } from '@/domain/feasibility';
import { priceFactor } from '@/domain/priceRegion';
import { PriceRegionNote } from '@/features/shared/PriceRegionNote';
import {
  acceptProposal,
  dinnerServings,
  generateMeals,
  proposalShoppingList,
  swapMeal,
} from '@/domain/generate';
import { recipeCostCents } from '@/domain/recipes';
import { displayEnergy } from '@/domain/units';
import { format, formatInteger, formatMoney, formatServings, formatWholeMoney, strings } from '@/i18n';
import { activeUnits } from '@/i18n/locale';
import { energyUnitLabel, formatEnergy } from '@/lib/amounts';
import { addDays, relativeDayLabel } from '@/lib/dates';
import { showToast } from '@/lib/toast';
import { colors, radii, spacing, themedStyles } from '@/theme';

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
    const assessment = assessProposal({
      meals: proposal.meals,
      answers: proposal.answers,
      recipes: RECIPES,
      recipesById: RECIPES_BY_ID,
      index: INGREDIENTS_BY_ID,
      user: rules,
    });
    const recipes = ids.map((id) => RECIPES_BY_ID[id]);
    const avg = (pick: (r: (typeof recipes)[number]) => number) =>
      recipes.reduce((sum, r) => sum + pick(r), 0) / Math.max(1, recipes.length);
    return {
      assessment,
      totalCents: list.totalCents,
      kcal: avg((r) => r.perServing.kcal),
      proteinG: avg((r) => r.perServing.proteinG),
      carbsG: avg((r) => r.perServing.carbsG),
      fatG: avg((r) => r.perServing.fatG),
    };
  }, [proposal, rules]);

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
  const updateAnswers = (patch: Partial<PlanAnswers>, meals = proposal.meals) => {
    const next = { ...answers, ...patch };
    setProposal({ ...proposal, answers: next, meals });
    usePlansStore.getState().setLastAnswers(next);
  };
  const raiseBudget = (budgetCents: number) => {
    haptics.tap();
    updateAnswers({ budgetCents });
    showToast(format(t.budgetRaised, { amount: formatWholeMoney(budgetCents) }));
  };
  const removeMeal = (dayOffset: number) => {
    haptics.tap();
    const meals = dropMeal(proposal.meals, dayOffset);
    updateAnswers({ mealCount: meals.length }, meals);
    showToast(t.mealDropped);
  };
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
              format={(v) => formatMoney(Math.round(v))}
            />
            <Text variant="heading" color="textMuted">
              {format(t.ofBudget, { budget: formatMoney(answers.budgetCents) })}
            </Text>
          </View>
          <ProgressMeter
            value={totals.totalCents / answers.budgetCents}
            accessibilityLabel={`${t.total} ${formatMoney(totals.totalCents)} ${format(t.ofBudget, {
              budget: formatMoney(answers.budgetCents),
            })}`}
          />
          <Text variant="bodyStrong" color={headroom >= 0 ? 'success' : 'accentText'}>
            {headroom >= 0
              ? format(t.under, { amount: formatMoney(headroom) })
              : format(t.over, { amount: formatMoney(-headroom) })}
          </Text>
          <View style={styles.divider} />
          <Text variant="overline" color="textSubtle">
            {t.avgMacros}
          </Text>
          <View style={styles.macros}>
            <Macro label={strings.macros.energy} unit={energyUnitLabel()} value={displayEnergy(totals.kcal, activeUnits().energy)} />
            <Macro label={strings.macros.protein} unit={strings.unitNames.g} value={totals.proteinG} />
            <Macro label={strings.macros.carbs} unit={strings.unitNames.g} value={totals.carbsG} />
            <Macro label={strings.macros.fat} unit={strings.unitNames.g} value={totals.fatG} />
          </View>
          <Text variant="caption" color="textSubtle">
            {strings.budget.explainer}
          </Text>
        </Card>

        <IssueCard assessment={totals.assessment} onRaise={raiseBudget} onDrop={removeMeal} />

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

        <PriceRegionNote region={answers.priceRegion} />
      </ScrollView>
      <View style={styles.footer}>
        <Button label={t.accept} onPress={accept} haptic="none" />
      </View>
    </SafeAreaView>
  );
}

/** Explains what the plan could not meet and offers one-tap fixes. Neutral tone, no red. */
function IssueCard({
  assessment,
  onRaise,
  onDrop,
}: {
  assessment: Assessment;
  onRaise: (budgetCents: number) => void;
  onDrop: (dayOffset: number) => void;
}) {
  const { overBudgetCents, unmetWishes, fixes } = assessment;
  if (overBudgetCents === 0 && unmetWishes.length === 0) return null;
  const fixLabel = (fix: Assessment['fixes'][number]) => {
    switch (fix.kind) {
      case 'raiseBudget':
        return format(t.fixRaise, { amount: formatWholeMoney(fix.byCents) });
      case 'fewerMeals':
        return format(t.fixFewer, { total: formatMoney(fix.totalCents) });
    }
  };
  const apply = (fix: Assessment['fixes'][number]) => {
    if (fix.kind === 'raiseBudget') onRaise(fix.budgetCents);
    else onDrop(fix.dayOffset);
  };
  return (
    <FadeInView>
      <Card style={styles.issue}>
        {overBudgetCents > 0 ? (
          <>
            <View style={styles.issueHead}>
              <Icon name="info" size={20} color="accentText" />
              <Text variant="heading" style={styles.flex}>
                {format(t.overTitle, { amount: formatMoney(overBudgetCents) })}
              </Text>
            </View>
            <Text variant="body" color="textMuted">
              {t.overBody}
            </Text>
            <View style={styles.fixes}>
              {fixes.map((fix) => (
                <Button
                  key={fix.kind}
                  size="compact"
                  variant="secondary"
                  haptic="none"
                  label={fixLabel(fix)}
                  onPress={() => apply(fix)}
                />
              ))}
            </View>
            <Text variant="caption" color="textSubtle">
              {t.fixSwapHint}
            </Text>
          </>
        ) : null}
        {unmetWishes.map((wish) => (
          <View key={wish.craving} style={styles.issueHead}>
            <Icon name="info" size={20} color="textSubtle" />
            <Text variant="body" color="textMuted" style={styles.flex}>
              {format(wish.reason === 'rules' ? t.wishRules : t.wishBudget, {
                wish: strings.cravings[wish.craving],
              })}
            </Text>
          </View>
        ))}
      </Card>
    </FadeInView>
  );
}

function Macro({ label, unit, value }: { label: string; unit: string; value: number }) {
  return (
    <View style={styles.macro}>
      <AnimatedNumber
        variant="number"
        value={value}
        format={(v) => format(strings.units.valueUnit, { value: formatInteger(v), unit })}
        accessibilityLabel={`${label} ${format(strings.units.valueUnit, { value: formatInteger(value), unit })}`}
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
    recipeCostCents(recipe, INGREDIENTS_BY_ID, pantry, priceFactor(answers.priceRegion));
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
              {formatMoney(perServing)} {strings.common.perServing} · {formatEnergy(recipe.perServing.kcal)} ·{' '}
              {format(strings.common.minutes, { count: recipe.totalTimeMin })}
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
          {formatServings(servings)}
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
    issue: {
      gap: spacing.sm,
      borderColor: colors.accent,
      borderWidth: 1,
    },
    issueHead: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: spacing.sm,
    },
    fixes: {
      gap: spacing.sm,
      alignItems: 'flex-start',
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
  }),
);
