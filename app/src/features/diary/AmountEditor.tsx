import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { Card, IconButton, SelectChip, Stepper, Text, TextField } from '@/components/ui';
import type { DiaryMeal, FoodPortion, Macros } from '@/data/types';
import { DIARY_MEALS } from '@/domain/diary';
import { GRAMS_PER_OUNCE, gToOz } from '@/domain/units';
import { format, formatDecimal, formatInteger, parseDecimal, strings } from '@/i18n';
import { activeUnitSystem } from '@/i18n/locale';
import { formatCount, formatGrams } from '@/lib/amounts';
import { spacing, themedStyles } from '@/theme';

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
const HUNDRED_G = format(strings.units.g, { value: 100 });

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
          <TextField
            large
            value={props.kcal > 0 ? String(props.kcal) : ''}
            onChangeText={(text) => props.onKcalChange(Math.min(5000, Number(text.replace(/\D/g, ''))))}
            keyboardType="number-pad"
            maxLength={4}
            accessibilityLabel={strings.quickAdd.kcal}
            trailing={
              <Text variant="title" color="textMuted">
                {strings.common.kcalUnit}
              </Text>
            }
          />
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
          <MacroCell value={preview.kcal} unit={strings.common.kcalUnit} label={strings.macros.energy} />
          <MacroCell value={preview.proteinG} unit={strings.common.gUnit} label={strings.macros.protein} />
          <MacroCell value={preview.carbsG} unit={strings.common.gUnit} label={strings.macros.carbs} />
          <MacroCell value={preview.fatG} unit={strings.common.gUnit} label={strings.macros.fat} />
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
  const options = [...portions, { label: HUNDRED_G, grams: 100 }];
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
  // Imperial users type ounces (one decimal) and step by 1 oz; the entry is still saved in grams.
  const imperial = activeUnitSystem() === 'imperial';
  const unit = imperial ? 'oz' : strings.common.gUnit;
  const step = imperial ? GRAMS_PER_OUNCE : 10;
  const stepLabel = imperial ? format(strings.units.oz, { value: 1 }) : format(strings.units.g, { value: 10 });
  const shown = grams <= 0 ? '' : imperial ? formatDecimal(gToOz(grams), 1) : String(Math.round(grams));
  const typed = (text: string) => {
    if (!imperial) return setGrams(Number(text.replace(/\D/g, '')));
    const oz = parseDecimal(text);
    setGrams(Number.isFinite(oz) ? oz * GRAMS_PER_OUNCE : 0);
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
              option.label === HUNDRED_G
                ? option.label
                : `${option.label} · ${formatGrams(option.grams)}`
            }
            selected={portion?.label === option.label}
            onPress={() => choose(option)}
          />
        ))}
      </View>
      {portion && portion.label !== HUNDRED_G ? (
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
