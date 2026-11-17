import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ScreenHeader } from '@/components/ScreenHeader';
import { Button, Card, Chip, FadeInView, haptics, Icon, SelectChip, Skeleton, Text, TextField } from '@/components/ui';
import { findCustomFood, useCustomFoodsStore } from '@/data/stores/customFoods';
import type { Food, FoodCategory, FoodSource, Macros } from '@/data/types';
import { foodIdForBarcode } from '@/domain/openFoodFacts';
import { energyMismatch, parseAmount } from '@/domain/nutrition';
import { format, formatInteger, strings } from '@/i18n';
import {
  energyFromInput,
  energyToInput,
  energyUnitLabel,
  foodInputText,
  foodUnitLabel,
  formatEnergy,
  formatNutrientGrams,
  gramsFromInput,
} from '@/lib/amounts';
import { newId } from '@/lib/id';
import { showToast } from '@/lib/toast';
import { nutritionLabel } from '@/services/nutritionLabel';
import { colors, radii, spacing, themedStyles } from '@/theme';

const t = strings.customFood;
const n = strings.nutrients;

type Mode = 'own' | 'label' | 'barcode';
const CATEGORIES: readonly FoodCategory[] = ['meal', 'bread', 'dairy', 'meat', 'produce', 'fruit', 'drink', 'snack', 'fat'];
type FieldKey = 'kcal' | 'proteinG' | 'carbsG' | 'sugarG' | 'fatG' | 'fiberG' | 'saltG';
const FIELDS: readonly { key: FieldKey; label: string; required?: boolean }[] = [
  { key: 'kcal', label: n.energy, required: true },
  { key: 'proteinG', label: n.protein },
  { key: 'carbsG', label: n.carbs },
  { key: 'sugarG', label: n.sugar },
  { key: 'fatG', label: n.fat },
  { key: 'fiberG', label: n.fiber },
  { key: 'saltG', label: n.salt },
];

/** Energy is typed in the user's unit (kcal or kJ, both are on labels); nutrients in grams. */
const fieldUnit = (key: FieldKey) => (key === 'kcal' ? energyUnitLabel() : strings.unitNames.g);

function toText(value: number | undefined): string {
  return value === undefined ? '' : String(value).replace('.', ',');
}

/** Energy per 100 g as the text of the energy field, in kcal or kJ. */
function energyText(kcal: number | undefined): string {
  return kcal === undefined ? '' : String(energyToInput(kcal));
}

/**
 * Own food, a product that Open Food Facts does not know, or a nutrition
 * label read from a photo (test data behind services/nutritionLabel.ts).
 * Values are per 100 g. The user always sees and can fix every number.
 */
export default function CustomFoodScreen() {
  const params = useLocalSearchParams<{
    mode?: Mode;
    id?: string;
    uri?: string;
    barcode?: string;
    name?: string;
    brand?: string;
    meal?: string;
    date?: string;
  }>();
  const mode: Mode = params.mode ?? 'own';
  const existing = params.id ? findCustomFood(params.id) : undefined;
  const upsert = useCustomFoodsStore((s) => s.upsert);

  const [name, setName] = useState(existing?.name ?? params.name ?? '');
  const [brand, setBrand] = useState(existing?.brand ?? params.brand ?? '');
  const [category, setCategory] = useState<FoodCategory>(existing?.category ?? 'meal');
  const [values, setValues] = useState<Record<FieldKey, string>>(() => ({
    kcal: energyText(existing?.per100g.kcal),
    proteinG: toText(existing?.per100g.proteinG),
    carbsG: toText(existing?.per100g.carbsG),
    sugarG: toText(existing?.per100g.sugarG),
    fatG: toText(existing?.per100g.fatG),
    fiberG: toText(existing?.per100g.fiberG),
    saltG: toText(existing?.per100g.saltG),
  }));
  const [serving, setServing] = useState(existing?.portions[0] ? foodInputText(existing.portions[0].grams) : '');
  const [reading, setReading] = useState(mode === 'label' && Boolean(params.uri) && !existing);
  const [confidence, setConfidence] = useState<number | null>(null);

  useEffect(() => {
    if (!reading || !params.uri) return;
    let cancelled = false;
    void nutritionLabel.read(params.uri).then((label) => {
      if (cancelled) return;
      setValues({
        kcal: energyText(label.per100g.kcal),
        proteinG: toText(label.per100g.proteinG),
        carbsG: toText(label.per100g.carbsG),
        sugarG: toText(label.per100g.sugarG),
        fatG: toText(label.per100g.fatG),
        fiberG: toText(label.per100g.fiberG),
        saltG: toText(label.per100g.saltG),
      });
      if (label.servingG) setServing(foodInputText(label.servingG));
      setConfidence(label.confidence);
      haptics.success();
      setReading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [reading, params.uri]);

  const num = (key: FieldKey) => {
    const value = parseAmount(values[key]);
    return key === 'kcal' && value !== undefined ? energyFromInput(value) : value;
  };
  const per100g: Macros = {
    kcal: num('kcal') ?? 0,
    proteinG: num('proteinG') ?? 0,
    carbsG: num('carbsG') ?? 0,
    fatG: num('fatG') ?? 0,
  };
  for (const key of ['fiberG', 'sugarG', 'saltG'] as const) {
    const value = num(key);
    if (value !== undefined) per100g[key] = value;
  }
  const mismatch = num('kcal') !== undefined ? energyMismatch(per100g) : null;
  const valid = name.trim().length > 0 && num('kcal') !== undefined;
  const servingTyped = parseAmount(serving);
  const servingG = servingTyped !== undefined ? gramsFromInput(servingTyped) : undefined;

  const save = () => {
    if (!valid) return;
    const source: FoodSource = existing?.source ?? (mode === 'barcode' ? 'barcode' : mode === 'label' ? 'label' : 'own');
    const barcode = existing?.barcode ?? params.barcode;
    const food: Food = {
      id: existing?.id ?? (barcode ? foodIdForBarcode(barcode) : `own:${newId()}`),
      name: name.trim(),
      brand: brand.trim() || undefined,
      category,
      per100g,
      portions: servingG && servingG > 0 ? [{ label: format(t.servingLabel, { grams: formatInteger(servingG) }), grams: servingG }] : [],
      source,
      barcode,
      imageUrl: existing?.imageUrl,
    };
    upsert(food);
    haptics.success();
    showToast(format(t.saved, { name: food.name }));
    if (existing) router.back();
    else router.replace({ pathname: '/food/[id]', params: { id: food.id, meal: params.meal ?? '', date: params.date ?? '' } });
  };

  const title = existing ? strings.common.edit : mode === 'label' ? t.titleLabel : mode === 'barcode' ? t.titleBarcode : t.titleNew;

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <ScreenHeader variant="close" title={title} />
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          {mode === 'label' && params.uri ? (
            <View style={styles.labelPhoto}>
              <Image source={params.uri} style={StyleSheet.absoluteFill} contentFit="cover" accessibilityIgnoresInvertColors />
            </View>
          ) : null}

          {reading ? (
            <View style={styles.gap} accessible accessibilityLabel={t.labelReading} accessibilityLiveRegion="polite">
              <View style={styles.row}>
                <Icon name="label" size={22} color="accentText" />
                <Text variant="heading">{t.labelReading}</Text>
              </View>
              {[0, 1, 2, 3].map((i) => (
                <Skeleton key={i} height={48} radius={radii.md} />
              ))}
            </View>
          ) : (
            <FadeInView style={styles.gap}>
              {confidence !== null ? (
                <Card style={styles.note}>
                  <View style={styles.row}>
                    <Text variant="heading" style={styles.flex}>
                      {t.labelReady}
                    </Text>
                    <Chip tone="accent" label={strings.common.estimate} />
                  </View>
                  <Text variant="caption" color="textMuted">
                    {t.labelNote}
                  </Text>
                </Card>
              ) : (
                <Text variant="body" color="textMuted">
                  {t.body}
                </Text>
              )}
              {params.barcode ? (
                <Text variant="caption" color="textSubtle">
                  {format(t.barcode, { code: params.barcode })}
                </Text>
              ) : null}

              <TextField
                value={name}
                onChangeText={setName}
                placeholder={t.namePlaceholder}
                accessibilityLabel={t.name}
                maxLength={60}
                autoFocus={mode === 'own' && !existing}
              />
              <TextField value={brand} onChangeText={setBrand} placeholder={t.brand} accessibilityLabel={t.brand} maxLength={40} />

              <Text variant="overline" color="textSubtle">
                {t.category}
              </Text>
              <View style={styles.chips}>
                {CATEGORIES.map((value) => (
                  <SelectChip
                    key={value}
                    label={strings.categories[value]}
                    selected={category === value}
                    role="radio"
                    onPress={() => setCategory(value)}
                  />
                ))}
              </View>

              <Text variant="overline" color="textSubtle">
                {t.per100}
              </Text>
              <Card padding="flush">
                {FIELDS.map((field, i) => (
                  <View key={field.key} style={[styles.fieldRow, i < FIELDS.length - 1 && styles.divider]}>
                    <Text
                      variant={field.key === 'sugarG' ? 'label' : 'body'}
                      color={field.key === 'sugarG' ? 'textMuted' : 'text'}
                      style={[styles.flex, field.key === 'sugarG' && styles.indent]}
                    >
                      {field.label}
                    </Text>
                    <TextField
                      value={values[field.key]}
                      onChangeText={(text) => setValues((v) => ({ ...v, [field.key]: text.replace(/[^\d.,]/g, '') }))}
                      keyboardType="decimal-pad"
                      accessibilityLabel={format(t.fieldA11y, { label: field.label, unit: fieldUnit(field.key), base: formatNutrientGrams(100) })}
                      placeholder={field.required ? '0' : n.unknown}
                      style={styles.numberField}
                      maxLength={6}
                    />
                    <Text variant="label" color="textSubtle" style={styles.unit}>
                      {fieldUnit(field.key)}
                    </Text>
                  </View>
                ))}
              </Card>
              {mismatch !== null ? (
                <Text variant="caption" color="textMuted">
                  {format(t.mismatch, { kcal: formatEnergy(mismatch) })}
                </Text>
              ) : null}

              <TextField
                value={serving}
                onChangeText={(text) => setServing(text.replace(/[^\d.,]/g, ''))}
                keyboardType="decimal-pad"
                placeholder={t.serving}
                accessibilityLabel={t.serving}
                maxLength={5}
                trailing={
                  <Text variant="label" color="textSubtle">
                    {foodUnitLabel()}
                  </Text>
                }
              />
            </FadeInView>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
      <View style={styles.footer}>
        {!valid && !reading ? (
          <Text variant="caption" color="textSubtle" style={styles.center}>
            {t.required}
          </Text>
        ) : null}
        <Button label={existing ? t.saveOnly : t.save} onPress={save} disabled={!valid || reading} haptic="none" />
      </View>
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
      gap: spacing.md,
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
    },
    center: {
      textAlign: 'center',
    },
    labelPhoto: {
      height: 160,
      borderRadius: radii.card,
      overflow: 'hidden',
      backgroundColor: colors.surfaceRaised,
    },
    note: {
      gap: spacing.xs,
      borderColor: colors.accent,
      borderWidth: 1,
    },
    chips: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: spacing.sm,
    },
    fieldRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.xs,
      minHeight: 60,
    },
    divider: {
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: colors.border,
    },
    indent: {
      paddingLeft: spacing.md,
    },
    numberField: {
      width: 104,
    },
    unit: {
      width: 34,
    },
    footer: {
      paddingHorizontal: spacing.lg,
      paddingTop: spacing.sm,
      paddingBottom: spacing.md,
      gap: spacing.xs,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: colors.border,
    },
  }),
);
