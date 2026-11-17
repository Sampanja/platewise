import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { Card, IconButton, SelectChip, Stepper, Text, TextField } from '@/components/ui';
import type { DiaryMeal, FoodPortion, Macros } from '@/data/types';
import { DIARY_MEALS } from '@/domain/diary';
import { displayFood, foodToGrams, GRAMS_PER_OUNCE } from '@/domain/units';
import { format, formatDecimal, formatInteger, parseDecimal, strings } from '@/i18n';
import { activeUnits } from '@/i18n/locale';
import { energyToInput, energyUnitLabel, foodUnitLabel, formatCount, formatGrams, formatGramsExact, formatNutrientGrams } from '@/lib/amounts';
import { spacing, themedStyles } from '@/theme';

import { EnergyField } from '../shared/EnergyField';

type FoodProps = {
  kind: 'food';
  grams: number;
  onGramsChange: (grams: number) => void;
  portions: readonly FoodPortion[];
};

type RecipeProps = {
  kind: 'recipe';
  servings: number;
  onServingsChange: (servings: number) => void;
};

type QuickProps = {
  kind: 'quick';
  kcal: number;
  onKcalChange: (kcal: number) => void;
};

type Props = (FoodProps | RecipeProps | QuickProps) & {
  meal: DiaryMeal;
  onMealChange: (meal: DiaryMeal) => void;
  /** Macros for the chosen amount. */
  preview: Macros;
};

const MAX_GRAMS = 2000;
/** The 100 g portion every food has: nutrition labels are per 100 g everywhere. */
const hundredGrams = () => formatNutrientGrams(100);

/** Amount (portions, grams, servings or kcal), meal choice and a macro preview. */
export function AmountEditor(props: Props) {
  const { meal, onMealChange, preview } = props;
  const t = strings.food;

  return (
    <View style={styles.wrap}>
      {props.kind === 'food' ? (
        <FoodAmount grams={props.grams} onGramsChange={props.onGramsChange} portions={props.portions} />
      ) : props.kind === 'recipe' ? (
        <View style={styles.section}>
          <Text variant="overline" color="textSubtle" accessibilityRole="header">
            {t.servings}
          </Text>
          <Stepper
            size="large"
            value={props.servings}
            min={0.5}
            max={6}
            step={0.5}
            onChange={props.onServingsChange}
            format={(v) => formatCount(v)}
            accessibilityLabel={t.servings}
          />
        </View>
      ) : (
        <View style={styles.section}>
          <Text variant="overline" color="textSubtle" accessibilityRole="header">
            {strings.quickAdd.kcal}
          </Text>
          <EnergyField large value={props.kcal} onChange={props.onKcalChange} max={5000} accessibilityLabel={strings.quickAdd.kcal} />
        </View>
      )}

      <View style={styles.section}>
        <Text variant="overline" color="textSubtle" accessibilityRole="header">
          {strings.diaryAdd.meal}
        </Text>
        <View style={styles.chips} accessibilityRole="radiogroup">
          {DIARY_MEALS.map((option) => (
            <SelectChip
              key={option}
              role="radio"
              label={strings.diaryMeals[option]}
              selected={option === meal}
              onPress={() => onMealChange(option)}
            />
          ))}
        </View>
      </View>

      <Card style={styles.preview}>
        <Text variant="overline" color="textSubtle">
          {t.preview}
        </Text>
        <View style={styles.macros}>
          <MacroCell value={energyToInput(preview.kcal)} unit={energyUnitLabel()} label={strings.macros.energy} />
          <MacroCell value={preview.proteinG} unit={strings.unitNames.g} label={strings.macros.protein} />
          <MacroCell value={preview.carbsG} unit={strings.unitNames.g} label={strings.macros.carbs} />
          <MacroCell value={preview.fatG} unit={strings.unitNames.g} label={strings.macros.fat} />
        </View>
      </Card>
    </View>
  );
}

/**
 * Portion chips ("1 dl", "1 kpl", "1 annos" or 100 g), a count for the chosen
 * portion (e.g. 2 × 1 dl) and exact grams. Editing grams by hand clears the portion.
 */
function FoodAmount({ grams, onGramsChange, portions }: Omit<FoodProps, 'kind'>) {
  const t = strings.food;
  const options = [...portions, { label: hundredGrams(), grams: 100 }];
  const initial = options.find((p) => Math.round(p.grams) === Math.round(grams)) ?? null;
  const [portion, setPortion] = useState<FoodPortion | null>(initial);
  const [count, setCount] = useState(1);

  const choose = (next: FoodPortion) => {
    setPortion(next);
    setCount(1);
    onGramsChange(next.grams);
  };
  const changeCount = (next: number) => {
    setCount(next);
    if (portion) onGramsChange(Math.round(portion.grams * next));
  };
  const setGrams = (value: number) => {
    setPortion(null);
    onGramsChange(Math.min(MAX_GRAMS, Math.max(0, value)));
  };
  // Ounce users type ounces (one decimal) and step by 1 oz; the entry is still saved in grams.
  const foodUnit = activeUnits().food;
  const imperial = foodUnit === 'oz';
  const unit = foodUnitLabel(foodUnit);
  const step = imperial ? GRAMS_PER_OUNCE : 10;
  const stepLabel = formatGramsExact(step, foodUnit);
  const shown = grams <= 0 ? '' : imperial ? formatDecimal(displayFood(grams, foodUnit), 1) : String(Math.round(grams));
  const typed = (text: string) => {
    if (!imperial) return setGrams(Number(text.replace(/\D/g, '')));
    const oz = parseDecimal(text);
    setGrams(Number.isFinite(oz) ? foodToGrams(oz, foodUnit) : 0);
  };

  return (
    <View style={styles.section}>
      <Text variant="overline" color="textSubtle" accessibilityRole="header">
        {t.portions}
      </Text>
      <View style={styles.chips} accessibilityRole="radiogroup">
        {options.map((option) => (
          <SelectChip
            key={option.label}
            role="radio"
            label={
              option.label === hundredGrams()
                ? option.label
                : `${option.label} · ${formatGrams(option.grams)}`
            }
            selected={portion?.label === option.label}
            onPress={() => choose(option)}
          />
        ))}
      </View>
      {portion && portion.label !== hundredGrams() ? (
        <View style={styles.countRow}>
          <Text variant="bodyStrong" style={styles.flex}>
            {strings.portionCount.label}
          </Text>
          <Stepper
            value={count}
            min={0.5}
            max={10}
            step={0.5}
            onChange={changeCount}
            format={(v) => `${formatCount(v)} × ${portion.label}`}
            accessibilityLabel={strings.portionCount.a11y}
          />
        </View>
      ) : null}
      <Text variant="overline" color="textSubtle">
        {format(t.grams, { unit })}
      </Text>
      <View style={styles.gramsRow}>
        <IconButton
          icon="minus"
          haptic="select"
          accessibilityLabel={format(t.minus10, { step: stepLabel })}
          disabled={grams <= 0}
          onPress={() => setGrams(grams - step)}
        />
        <TextField
          value={shown}
          onChangeText={typed}
          keyboardType={imperial ? 'decimal-pad' : 'number-pad'}
          accessibilityLabel={format(t.gramsA11y, { unit })}
          maxLength={imperial ? 5 : 4}
          style={styles.flex}
          trailing={
            <Text variant="label" color="textSubtle">
              {unit}
            </Text>
          }
        />
        <IconButton
          icon="plus"
          haptic="select"
          accessibilityLabel={format(t.plus10, { step: stepLabel })}
          disabled={grams >= MAX_GRAMS}
          onPress={() => setGrams(grams + step)}
        />
      </View>
    </View>
  );
}

function MacroCell({ value, unit, label }: { value: number; unit: string; label: string }) {
  return (
    <View
      style={styles.cell}
      accessible
      accessibilityLabel={`${label} ${formatInteger(value)} ${unit}`}
    >
      <Text variant="number">
        {formatInteger(value)}
        <Text variant="caption" color="textSubtle">
          {' '}
          {unit}
        </Text>
      </Text>
      <Text variant="caption" color="textSubtle" numberOfLines={1}>
        {label}
      </Text>
    </View>
  );
}

const styles = themedStyles(() =>
  StyleSheet.create({
    wrap: {
      gap: spacing.xl,
    },
    section: {
      gap: spacing.md,
    },
    chips: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: spacing.sm,
    },
    gramsRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
    },
    flex: {
      flex: 1,
    },
    countRow: {
      flexDirection: 'row',
      alignItems: 'center',
      flexWrap: 'wrap',
      gap: spacing.md,
    },
    preview: {
      gap: spacing.md,
    },
    macros: {
      flexDirection: 'row',
      gap: spacing.sm,
    },
    cell: {
      flex: 1,
      gap: spacing.xxs,
    },
  }),
);
