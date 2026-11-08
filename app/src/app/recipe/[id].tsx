import { router, useLocalSearchParams } from 'expo-router';
import { useState, type ReactNode } from 'react';
import { Animated, StyleSheet, useWindowDimensions, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { HeartButton } from '@/components/HeartButton';
import { RecipeImage } from '@/components/RecipeImage';
import { Sheet } from '@/components/Sheet';
import {
  Button,
  Card,
  CheckRow,
  Chip,
  EmptyState,
  Icon,
  IconButton,
  OptionRow,
  Stepper,
  Text,
} from '@/components/ui';
import { INGREDIENTS_BY_ID, RECIPES_BY_ID } from '@/data/catalog';
import { useServingPrice, useUserRules } from '@/data/hooks';
import { useProfileStore } from '@/data/stores/profile';
import type { DiaryMeal } from '@/data/types';
import { DIARY_MEALS, mealForHour } from '@/domain/diary';
import { MacroBars } from '@/features/recipe/MacroBars';
import { useRecipeActions } from '@/features/recipe/useRecipeActions';
import { format, formatCents, formatInteger, strings } from '@/i18n';
import { formatAmount } from '@/lib/amounts';
import { colors, radii, spacing } from '@/theme';

const t = strings.recipe;

export default function RecipeScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const recipe = id ? RECIPES_BY_ID[id] : undefined;
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const householdSize = useProfileStore((s) => s.householdSize);
  const rules = useUserRules();
  const servingPrice = useServingPrice();
  const actions = useRecipeActions(recipe);

  const [servings, setServings] = useState(householdSize);
  const [checked, setChecked] = useState<ReadonlySet<string>>(new Set());
  const [sheet, setSheet] = useState<'diary' | 'plan' | null>(null);
  const [scrollY] = useState(() => new Animated.Value(0));

  if (!recipe) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.topBarStatic}>
          <IconButton icon="chevronLeft" accessibilityLabel={strings.common.back} onPress={() => router.back()} />
        </View>
        <EmptyState icon="search" title={t.notFoundTitle} body={t.notFoundBody} />
      </SafeAreaView>
    );
  }

  const heroHeight = Math.min(width * 0.95, 420);
  const perServing = servingPrice(recipe);
  const total = servingPrice(recipe, servings);
  const userAllergens = recipe.allergens.filter((code) => rules.allergens.includes(code));

  const toggleIngredient = (ingredientId: string) =>
    setChecked((current) => {
      const next = new Set(current);
      if (next.has(ingredientId)) next.delete(ingredientId);
      else next.add(ingredientId);
      return next;
    });

  // The photo dims and drifts as the page scrolls; a solid title bar fades in over it.
  const imageOpacity = scrollY.interpolate({
    inputRange: [0, heroHeight * 0.8],
    outputRange: [1, 0.25],
    extrapolate: 'clamp',
  });
  const imageTranslate = scrollY.interpolate({
    inputRange: [-heroHeight, 0, heroHeight],
    outputRange: [-heroHeight / 2, 0, heroHeight * 0.4],
    extrapolate: 'clamp',
  });
  const imageScale = scrollY.interpolate({
    inputRange: [-heroHeight, 0],
    outputRange: [2, 1],
    extrapolate: 'clamp',
  });
  const barOpacity = scrollY.interpolate({
    inputRange: [heroHeight * 0.55, heroHeight * 0.8],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  return (
    <View style={styles.safe}>
      <Animated.ScrollView
        scrollEventThrottle={16}
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], {
          useNativeDriver: true,
        })}
        contentContainerStyle={{ paddingBottom: insets.bottom + 120 }}
      >
        <Animated.View
          style={{
            height: heroHeight,
            opacity: imageOpacity,
            transform: [{ translateY: imageTranslate }, { scale: imageScale }],
          }}
        >
          <RecipeImage recipe={recipe} scrim style={StyleSheet.absoluteFill} />
        </Animated.View>

        <View style={styles.sheet}>
          <View style={styles.titleBlock}>
            <Text variant="displayLarge" accessibilityRole="header" hyphenate>
              {recipe.title}
            </Text>
            <Text variant="body" color="textMuted">
              {recipe.description}
            </Text>
            <View style={styles.chips}>
              <Chip label={format(strings.common.minutes, { count: recipe.cookTimeMin })} />
              <Chip label={format(strings.common.kcal, { value: formatInteger(recipe.perServing.kcal) })} />
              {recipe.goodForLeftovers ? <Chip tone="success" label={t.leftovers} /> : null}
            </View>
          </View>

          <Card style={styles.card}>
            <View style={styles.priceRow}>
              <View style={styles.flex}>
                <Text variant="overline" color="textSubtle">
                  {strings.common.priceEstimate}
                </Text>
                <Text variant="display" color="accentText" style={styles.tabular}>
                  {formatCents(total)}
                </Text>
                <Text variant="caption" color="textSubtle">
                  {format(t.pricePerServing, { price: formatCents(perServing) })}
                </Text>
              </View>
              <View style={styles.servings}>
                <Text variant="caption" color="textSubtle">
                  {t.servingsLabel}
                </Text>
                <Stepper
                  value={servings}
                  min={1}
                  max={12}
                  onChange={setServings}
                  accessibilityLabel={t.servingsLabel}
                  format={(v) => String(v)}
                />
              </View>
            </View>
            <View style={styles.actionRow}>
              <Button
                size="compact"
                variant="secondary"
                label={t.addToDiary}
                icon={<Icon name="diary" size={18} />}
                onPress={() => setSheet('diary')}
                style={styles.flex}
              />
              <Button
                size="compact"
                variant="secondary"
                label={t.addToList}
                icon={<Icon name="basket" size={18} />}
                onPress={() => actions.addToShoppingList(servings)}
                style={styles.flex}
              />
            </View>
          </Card>

          <Section title={strings.macros.perServingTitle}>
            <MacroBars macros={recipe.perServing} />
            <Text variant="caption" color="textSubtle">
              {strings.macros.source}
            </Text>
          </Section>

          <Section title={t.allergensTitle}>
            {recipe.allergens.length === 0 ? (
              <Text variant="body" color="textMuted">
                {t.noAllergens}
              </Text>
            ) : (
              <View style={styles.chips}>
                {recipe.allergens.map((code) => (
                  <View
                    key={code}
                    style={[styles.allergen, userAllergens.includes(code) && styles.allergenUser]}
                    accessible
                    accessibilityLabel={strings.allergens[code]}
                  >
                    <Icon name="info" size={16} color={userAllergens.includes(code) ? 'danger' : 'accentText'} />
                    <Text variant="label" color={userAllergens.includes(code) ? 'danger' : 'accentText'}>
                      {strings.allergens[code]}
                    </Text>
                  </View>
                ))}
              </View>
            )}
            <Text variant="caption" color="textSubtle">
              {t.allergenDisclaimer}
            </Text>
          </Section>

          <Section title={`${t.ingredients} · ${format(strings.common.servings, { count: servings })}`}>
            <View>
              {recipe.ingredients.map(({ ingredientId, grams }) => {
                const ingredient = INGREDIENTS_BY_ID[ingredientId];
                const fromHome = rules.pantry.has(ingredientId);
                const amount = formatAmount(ingredient, grams * servings);
                return (
                  <CheckRow
                    key={ingredientId}
                    label={ingredient.name}
                    detail={fromHome ? `${amount} · ${strings.common.fromHome}` : amount}
                    checked={checked.has(ingredientId)}
                    onToggle={() => toggleIngredient(ingredientId)}
                  />
                );
              })}
            </View>
            <Text variant="caption" color="textSubtle">
              {t.fromHomeHint}
            </Text>
          </Section>

          <Section title={t.steps}>
            <View style={styles.steps}>
              {recipe.steps.map((step, index) => (
                <View
                  key={index}
                  style={styles.step}
                  accessible
                  accessibilityLabel={`${format(t.step, { index: index + 1 })}. ${step}`}
                >
                  <View style={styles.stepNumber}>
                    <Text variant="bodyStrong" color="textOnAccent">
                      {index + 1}
                    </Text>
                  </View>
                  <Text variant="body" style={styles.flex}>
                    {step}
                  </Text>
                </View>
              ))}
            </View>
          </Section>
        </View>
      </Animated.ScrollView>

      {/* Title bar that appears once the photo has scrolled away. */}
      <Animated.View
        pointerEvents="none"
        style={[styles.titleBar, { paddingTop: insets.top, height: insets.top + 64, opacity: barOpacity }]}
      >
        <Text variant="heading" numberOfLines={1} style={styles.titleBarText}>
          {recipe.title}
        </Text>
      </Animated.View>

      <View style={[styles.topBar, { top: insets.top + spacing.sm }]} pointerEvents="box-none">
        <IconButton
          icon="chevronLeft"
          variant="glass"
          accessibilityLabel={strings.common.back}
          onPress={() => (router.canGoBack() ? router.back() : router.replace('/recipes'))}
        />
        <HeartButton recipeId={recipe.id} size={48} />
      </View>

      <View style={[styles.bottomBar, { paddingBottom: Math.max(insets.bottom, spacing.md) }]}>
        <Button label={t.addToPlan} onPress={() => setSheet('plan')} haptic="tap" />
      </View>

      <Sheet visible={sheet === 'diary'} onClose={() => setSheet(null)} title={t.chooseMeal}>
        {DIARY_MEALS.map((meal: DiaryMeal) => (
          <OptionRow
            key={meal}
            title={strings.diaryMeals[meal]}
            hint={strings.diary.servingsAmountOne}
            selected={meal === mealForHour(new Date().getHours())}
            onPress={() => {
              setSheet(null);
              actions.addToDiary(meal);
            }}
          />
        ))}
      </Sheet>

      <Sheet
        visible={sheet === 'plan'}
        onClose={() => setSheet(null)}
        title={actions.planDays.length > 0 ? t.chooseDay : t.noPlanTitle}
      >
        {actions.planDays.length > 0 ? (
          actions.planDays.map((day) => (
            <OptionRow
              key={day.dayOffset}
              icon="calendar"
              title={day.dayLabel}
              hint={day.currentTitle}
              selected={false}
              onPress={() => {
                setSheet(null);
                actions.replaceInPlan(day.dayOffset);
              }}
            />
          ))
        ) : (
          <View style={styles.noPlan}>
            <Text variant="body" color="textMuted">
              {t.noPlanBody}
            </Text>
            <Button
              label={t.noPlanCta}
              onPress={() => {
                setSheet(null);
                actions.pinForNextPlan(true);
              }}
            />
            <Button
              label={t.keepForLater}
              variant="secondary"
              onPress={() => {
                setSheet(null);
                actions.pinForNextPlan(false);
              }}
            />
          </View>
        )}
      </Sheet>
    </View>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <View style={styles.section}>
      <Text variant="title" accessibilityRole="header">
        {title}
      </Text>
      {children}
    </View>
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
  tabular: {
    fontVariant: ['tabular-nums'],
  },
  sheet: {
    marginTop: -radii.card,
    borderTopLeftRadius: radii.card,
    borderTopRightRadius: radii.card,
    backgroundColor: colors.bg,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    gap: spacing.xxl,
  },
  titleBlock: {
    gap: spacing.sm,
    paddingHorizontal: spacing.xs,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  card: {
    gap: spacing.lg,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: spacing.lg,
  },
  servings: {
    alignItems: 'center',
    gap: spacing.xs,
  },
  actionRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  section: {
    gap: spacing.md,
    paddingHorizontal: spacing.xs,
  },
  allergen: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radii.pill,
    backgroundColor: colors.accentSoft,
  },
  allergenUser: {
    backgroundColor: colors.dangerSoft,
  },
  steps: {
    gap: spacing.lg,
  },
  step: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  stepNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    justifyContent: 'center',
    backgroundColor: colors.bg,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
    paddingHorizontal: 72,
  },
  titleBarText: {
    textAlign: 'center',
  },
  topBar: {
    position: 'absolute',
    left: spacing.lg,
    right: spacing.lg,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  topBarStatic: {
    padding: spacing.lg,
  },
  bottomBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    backgroundColor: colors.bg,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
  noPlan: {
    gap: spacing.md,
    paddingBottom: spacing.sm,
  },
});
