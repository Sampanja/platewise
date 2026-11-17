import { router, useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import { Alert, Linking, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { RecipeImage } from '@/components/RecipeImage';
import { ScreenHeader } from '@/components/ScreenHeader';
import { Sheet } from '@/components/Sheet';
import { Button, Card, Chip, EmptyState, haptics, Icon, OptionRow, PressableScale, Text } from '@/components/ui';
import { INGREDIENTS_BY_ID } from '@/data/catalog';
import { importedAsRecipe, importWarnings } from '@/data/catalog/imported';
import { useServingPrice, useUserRules } from '@/data/hooks';
import { useDiaryStore } from '@/data/stores/diary';
import { useImportDraftStore } from '@/data/stores/importDraft';
import { useImportedRecipesStore } from '@/data/stores/importedRecipes';
import type { DiaryMeal } from '@/data/types';
import { DIARY_MEALS, mealForHour } from '@/domain/diary';
import { RecipeNutrients } from '@/features/nutrients/RecipeNutrients';
import { RecipeQualityBadge } from '@/features/quality/RecipeQualityBadge';
import { MacroBars } from '@/features/recipe/MacroBars';
import { format, formatMoney, formatServings, strings } from '@/i18n';
import { formatAmount, localizeRecipeText } from '@/lib/amounts';
import { today } from '@/lib/dates';
import { showToast } from '@/lib/toast';
import { sourceHost } from '@/services/recipeImport';
import { colors, radii, spacing, themedStyles } from '@/theme';

const t = strings.recipeImport;

/**
 * An imported (or typed-in) recipe: the user's own, never shared. The source
 * link is shown; the picture is the category illustration, never the page's.
 * Nutrients, quality, allergens and the price estimate come from the matched
 * ingredients exactly as for library recipes. Allergens the user avoids are
 * warned about clearly (the recipe is still shown: the user brought it).
 */
export default function ImportedRecipeScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const imported = useImportedRecipesStore((s) => s.recipes.find((r) => r.id === id));
  const remove = useImportedRecipesStore((s) => s.remove);
  const restore = useImportedRecipesStore((s) => s.restore);
  const setDraft = useImportDraftStore((s) => s.set);
  const addEntry = useDiaryStore((s) => s.add);
  const removeEntry = useDiaryStore((s) => s.remove);
  const rules = useUserRules();
  const servingPrice = useServingPrice();
  const [mealSheet, setMealSheet] = useState(false);
  const recipe = useMemo(() => (imported ? importedAsRecipe(imported) : null), [imported]);
  const warnings = useMemo(() => (imported ? importWarnings(imported, rules) : null), [imported, rules]);

  if (!imported || !recipe || !warnings) {
    return (
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <ScreenHeader />
        <EmptyState icon="chef" title={t.notFoundTitle} body={t.notFoundBody} />
      </SafeAreaView>
    );
  }

  const unmatched = imported.ingredients.filter((i) => !i.ingredientId || !i.grams).length;
  const hasWarning = warnings.allergens.length > 0 || warnings.diets.length > 0;

  const logServing = (meal: DiaryMeal) => {
    setMealSheet(false);
    const entry = addEntry({
      date: today(),
      meal,
      name: recipe.title,
      basis: { kind: 'recipe', recipeId: recipe.id, perServing: recipe.perServing },
      quantity: 1,
      estimate: false,
    });
    haptics.success();
    showToast(t.logged, { label: strings.common.undo, onPress: () => removeEntry(entry.id) });
  };

  const edit = () => {
    const { id: recipeId, createdAt: _createdAt, ...rest } = imported;
    setDraft({ ...rest, id: recipeId });
    router.push('/import-review');
  };

  const confirmDelete = () =>
    Alert.alert(t.delete, imported.title, [
      { text: strings.common.cancel, style: 'cancel' },
      {
        text: strings.common.delete,
        style: 'destructive',
        onPress: () => {
          const removed = remove(imported.id);
          router.back();
          if (removed) showToast(t.deleted, { label: strings.common.undo, onPress: () => restore(removed) });
        },
      },
    ]);

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <ScreenHeader title={t.importedChip} />
      <ScrollView contentContainerStyle={styles.content}>
        <RecipeImage recipe={recipe} style={styles.hero} />
        <View style={styles.titleBlock}>
          <Text variant="display" accessibilityRole="header">
            {recipe.title}
          </Text>
          <View style={styles.chips}>
            <RecipeQualityBadge recipe={recipe} />
            <Chip label={t.importedChip} tone="accent" />
            <Chip label={formatServings(imported.servings)} />
            {imported.totalTimeMin ? <Chip label={format(strings.common.minutes, { count: imported.totalTimeMin })} /> : null}
          </View>
          {imported.sourceUrl ? (
            <PressableScale
              onPress={() => void Linking.openURL(imported.sourceUrl ?? '')}
              accessibilityRole="link"
              accessibilityHint={t.openSource}
              style={styles.source}
            >
              <Icon name="link" size={16} color="accentText" />
              <Text variant="label" color="accentText">
                {format(t.source, { host: sourceHost(imported.sourceUrl) })}
              </Text>
            </PressableScale>
          ) : null}
        </View>

        {hasWarning ? (
          <View style={styles.warning} accessibilityRole="alert">
            <Icon name="shield" size={22} color="danger" />
            <View style={styles.flex}>
              <Text variant="bodyStrong">{t.warningTitle}</Text>
              {warnings.allergens.length > 0 ? (
                <Text variant="body">{format(t.warningAllergens, { items: warnings.allergens.map((code) => strings.allergens[code]).join(', ') })}</Text>
              ) : null}
              {warnings.diets.length > 0 ? (
                <Text variant="body">{format(t.warningDiets, { items: warnings.diets.map((code) => strings.diets[code]).join(', ') })}</Text>
              ) : null}
            </View>
          </View>
        ) : null}

        <Card style={styles.gap}>
          <View style={styles.rowBetween}>
            <Text variant="overline" color="textSubtle">
              {strings.common.priceEstimate}
            </Text>
            <Text variant="title" color="accentText">
              {`${formatMoney(servingPrice(recipe))} ${strings.common.perServing}`}
            </Text>
          </View>
          <MacroBars macros={recipe.perServing} />
          <RecipeNutrients perServing={recipe.perServing} />
          {unmatched > 0 ? (
            <Text variant="caption" color="textSubtle">
              {format(t.unmatchedNote, { count: unmatched })}
            </Text>
          ) : null}
        </Card>

        <View style={styles.gap}>
          <Text variant="title" accessibilityRole="header">
            {t.ingredients}
          </Text>
          {imported.ingredients.map((item, index) => {
            const ingredient = item.ingredientId ? INGREDIENTS_BY_ID[item.ingredientId] : undefined;
            return (
              <View key={`${item.line}-${index}`} style={styles.ingredient}>
                <Text variant="body">{item.line}</Text>
                <Text variant="caption" color="textSubtle">
                  {ingredient && item.grams ? `${ingredient.name} · ${formatAmount(ingredient, item.grams)}` : t.notFound}
                </Text>
              </View>
            );
          })}
        </View>

        {imported.steps.length > 0 ? (
          <View style={styles.gap}>
            <Text variant="title" accessibilityRole="header">
              {t.steps}
            </Text>
            {imported.steps.map((step, index) => (
              <View key={`${index}-${step.slice(0, 12)}`} style={styles.step}>
                <View style={styles.stepNumber}>
                  <Text variant="label" color="textOnAccent">
                    {String(index + 1)}
                  </Text>
                </View>
                <Text variant="body" style={styles.flex}>
                  {localizeRecipeText(step)}
                </Text>
              </View>
            ))}
          </View>
        ) : null}

        <Button label={t.edit} variant="secondary" icon={<Icon name="pencil" size={18} />} onPress={edit} />
        <Button label={t.delete} variant="ghost" icon={<Icon name="trash" size={18} color="danger" />} onPress={confirmDelete} />
      </ScrollView>
      <View style={styles.footer}>
        <Button label={t.logServing} onPress={() => setMealSheet(true)} />
      </View>
      <Sheet visible={mealSheet} onClose={() => setMealSheet(false)} title={strings.recipe.chooseMeal}>
        {DIARY_MEALS.map((meal) => (
          <OptionRow
            key={meal}
            title={strings.diaryMeals[meal]}
            hint={strings.diary.servingsAmountOne}
            selected={meal === mealForHour(new Date().getHours())}
            onPress={() => logServing(meal)}
          />
        ))}
      </Sheet>
    </SafeAreaView>
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
      padding: spacing.lg,
      gap: spacing.xl,
    },
    hero: {
      height: 180,
      borderRadius: radii.card,
    },
    titleBlock: {
      gap: spacing.sm,
    },
    chips: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      alignItems: 'center',
      gap: spacing.sm,
    },
    source: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xs,
      minHeight: 44,
      alignSelf: 'flex-start',
    },
    warning: {
      flexDirection: 'row',
      gap: spacing.md,
      padding: spacing.lg,
      borderRadius: radii.lg,
      backgroundColor: colors.dangerSoft,
      borderWidth: 1,
      borderColor: colors.danger,
    },
    gap: {
      gap: spacing.md,
    },
    rowBetween: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: spacing.sm,
    },
    ingredient: {
      gap: 2,
      paddingVertical: spacing.xs,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: colors.border,
    },
    step: {
      flexDirection: 'row',
      gap: spacing.md,
    },
    stepNumber: {
      width: 28,
      height: 28,
      borderRadius: 14,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.accent,
    },
    footer: {
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.md,
    },
  }),
);
