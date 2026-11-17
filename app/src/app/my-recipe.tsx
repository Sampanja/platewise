import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ScreenHeader } from '@/components/ScreenHeader';
import { Button, Card, haptics, Icon, IconButton, Stepper, Text, TextField } from '@/components/ui';
import { catalogName } from '@/data/catalog';
import { findFood } from '@/data/foods';
import { useMyMealsStore } from '@/data/stores/myMeals';
import type { OwnRecipeIngredient } from '@/data/types';
import { ownRecipePerServing } from '@/domain/diary';
import { parseAmount } from '@/domain/nutrition';
import { FoodPickerSheet } from '@/features/diary/FoodPickerSheet';
import { NutrientTable } from '@/features/diary/NutrientTable';
import { format, strings } from '@/i18n';
import { foodInputText, foodUnitLabel, formatEnergy, gramsFromInput } from '@/lib/amounts';
import { showToast } from '@/lib/toast';
import { colors, spacing, themedStyles } from '@/theme';

const t = strings.recipeEditor;

/** "Oma resepti": ingredients for N servings; the diary logs one serving at a time. */
export default function MyRecipeScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const existing = useMyMealsStore((s) => (id ? s.recipes.find((r) => r.id === id) : undefined));
  const saveRecipe = useMyMealsStore((s) => s.saveRecipe);
  const removeRecipe = useMyMealsStore((s) => s.removeRecipe);
  const [name, setName] = useState(existing?.name ?? '');
  const [servings, setServings] = useState(existing?.servings ?? 4);
  const [ingredients, setIngredients] = useState<OwnRecipeIngredient[]>(existing?.ingredients ?? []);
  const [gramsText, setGramsText] = useState<string[]>(() => (existing?.ingredients ?? []).map((i) => foodInputText(i.grams)));
  const [picking, setPicking] = useState(false);

  const perServing = ownRecipePerServing({ ingredients, servings });
  const valid = name.trim().length > 0 && ingredients.some((i) => i.grams > 0);

  const addIngredient = (foodId: string) => {
    const food = findFood(foodId);
    setPicking(false);
    if (!food) return;
    const grams = food.portions[0]?.grams ?? 100;
    setIngredients((list) => [...list, { foodId, name: food.name, grams, per100g: food.per100g }]);
    setGramsText((list) => [...list, foodInputText(grams)]);
    haptics.select();
  };
  const setGrams = (index: number, text: string) => {
    const clean = text.replace(/[^\d,.]/g, '');
    setGramsText((list) => list.map((value, i) => (i === index ? clean : value)));
    // Typed in the user's food unit (g or oz), kept in grams.
    const grams = gramsFromInput(parseAmount(clean) ?? 0);
    setIngredients((list) => list.map((item, i) => (i === index ? { ...item, grams } : item)));
  };
  const removeIngredient = (index: number) => {
    haptics.tap();
    setIngredients((list) => list.filter((_, i) => i !== index));
    setGramsText((list) => list.filter((_, i) => i !== index));
  };

  const save = () => {
    if (!valid) return;
    const recipe = saveRecipe({
      id: existing?.id,
      name: name.trim(),
      servings,
      ingredients: ingredients.filter((i) => i.grams > 0),
    });
    haptics.success();
    showToast(format(t.saved, { name: recipe.name }));
    router.back();
  };

  const confirmDelete = () =>
    existing &&
    Alert.alert(t.delete, existing.name, [
      { text: strings.common.cancel, style: 'cancel' },
      {
        text: strings.common.delete,
        style: 'destructive',
        onPress: () => {
          removeRecipe(existing.id);
          showToast(t.deleted);
          router.back();
        },
      },
    ]);

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <ScreenHeader variant="close" title={existing ? t.titleEdit : t.titleNew} />
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <TextField
            value={name}
            onChangeText={setName}
            placeholder={t.namePlaceholder}
            accessibilityLabel={t.name}
            maxLength={60}
            autoFocus={!existing}
          />
          <View style={styles.row}>
            <Text variant="bodyStrong" style={styles.flex}>
              {t.servings}
            </Text>
            <Stepper value={servings} onChange={setServings} min={1} max={20} accessibilityLabel={t.servings} />
          </View>

          <Text variant="overline" color="textSubtle" accessibilityRole="header">
            {t.ingredients}
          </Text>
          {ingredients.length === 0 ? (
            <Text variant="body" color="textMuted">
              {t.empty}
            </Text>
          ) : (
            <Card padding="flush">
              {ingredients.map((item, index) => (
                <View key={`${item.foodId}-${index}`} style={[styles.ingredient, index < ingredients.length - 1 && styles.divider]}>
                  <Text variant="body" style={styles.flex} numberOfLines={2}>
                    {catalogName({ kind: 'food', foodId: item.foodId }, item.name)}
                  </Text>
                  <TextField
                    value={gramsText[index] ?? ''}
                    onChangeText={(text) => setGrams(index, text)}
                    keyboardType="decimal-pad"
                    accessibilityLabel={format(t.gramsA11y, { name: catalogName({ kind: 'food', foodId: item.foodId }, item.name) })}
                    style={styles.grams}
                    maxLength={5}
                  />
                  <Text variant="label" color="textSubtle">
                    {foodUnitLabel()}
                  </Text>
                  <IconButton
                    icon="close"
                    variant="plain"
                    size={40}
                    accessibilityLabel={format(t.removeA11y, { name: catalogName({ kind: 'food', foodId: item.foodId }, item.name) })}
                    onPress={() => removeIngredient(index)}
                  />
                </View>
              ))}
            </Card>
          )}
          <Button
            label={t.addIngredient}
            variant="secondary"
            size="compact"
            icon={<Icon name="plus" size={18} />}
            onPress={() => setPicking(true)}
          />

          {ingredients.length > 0 ? (
            <View style={styles.gap}>
              <Text variant="heading">
                {`${t.perServing}: ${formatEnergy(perServing.kcal)}`}
              </Text>
              <NutrientTable values={perServing} title={t.perServing} />
            </View>
          ) : null}
          {existing ? <Button label={t.delete} variant="ghost" size="compact" onPress={confirmDelete} /> : null}
        </ScrollView>
      </KeyboardAvoidingView>
      <View style={styles.footer}>
        <Button label={t.save} onPress={save} disabled={!valid} haptic="none" />
      </View>
      <FoodPickerSheet visible={picking} title={t.pickTitle} onClose={() => setPicking(false)} onPick={addIngredient} includeCustom />
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
      gap: spacing.md,
    },
    gap: {
      gap: spacing.sm,
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
    },
    ingredient: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      paddingLeft: spacing.lg,
      paddingRight: spacing.xs,
      paddingVertical: spacing.xs,
      minHeight: 60,
    },
    divider: {
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: colors.border,
    },
    grams: {
      width: 84,
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
