import { StyleSheet, View } from "react-native";

import {
  Card,
  Icon,
  IconButton,
  OptionRow,
  Segmented,
  SelectChip,
  Stepper,
  SwitchRow,
  Text,
} from "@/components/ui";
import type { Macros } from "@/data/types";
import {
  adjustMacro,
  DIET_STYLES,
  gramsForShare,
  MACRO_KEYS,
  macroShares,
  macroWarnings,
  MEAL_COUNTS,
  MEAL_DISTRIBUTIONS,
  mealTargets,
  PROTEIN_G_PER_KG_LEVEL,
  PROTEIN_LEVELS,
  STYLE_PRESETS,
  type DietStyle,
  type MacroInput,
  type MacroKey,
  type MealPlan,
  type ProteinLevel,
} from "@/domain/macros";
import { format, formatDecimal, formatInteger, strings } from "@/i18n";
import { formatEnergy, formatNutrientGrams } from "@/lib/amounts";
import { colors, radii, spacing, themedStyles } from "@/theme";

const macroLabel = (key: MacroKey) => strings.macroPlan.macroNames[key];

const percentText = (share: number) =>
  format(strings.macroPlan.percentValue, { value: formatInteger(share * 100) });

/** Today's targets for the chosen style: energy, and each macro in grams and percent. */
export function MacroPreview({ macros }: { macros: Macros }) {
  const p = strings.macroPlan;
  const shares = macroShares(macros);
  return (
    <Card style={styles.gapSm}>
      <View style={styles.spread}>
        <Text variant="overline" color="textSubtle">
          {p.previewTitle}
        </Text>
        <Text variant="heading" color="accentText" style={styles.tabular}>
          {formatEnergy(macros.kcal)}
        </Text>
      </View>
      {MACRO_KEYS.map((key) => (
        <View key={key} style={styles.gapXs}>
          <View style={styles.spread}>
            <Text variant="body">{macroLabel(key)}</Text>
            <Text variant="bodyStrong" style={styles.tabular}>
              {format(p.previewValue, {
                grams: formatNutrientGrams(macros[key]),
                percent: percentText(shares[key]),
              })}
            </Text>
          </View>
          <View
            style={styles.track}
            accessibilityElementsHidden
            importantForAccessibility="no-hide-descendants"
          >
            <View
              style={[
                styles.fill,
                { width: `${Math.min(100, Math.round(shares[key] * 100))}%` },
              ]}
            />
          </View>
        </View>
      ))}
    </Card>
  );
}

type StyleStepProps = {
  style: DietStyle;
  onStyle: (style: DietStyle) => void;
  /** The level in use (chosen or suggested). */
  proteinLevel: ProteinLevel;
  suggestedLevel: ProteinLevel;
  onProteinLevel: (level: ProteinLevel) => void;
  macros: Macros;
  weightKg: number;
  input: MacroInput;
  onInput: (input: MacroInput) => void;
  locked: readonly MacroKey[];
  onLocked: (locked: MacroKey[]) => void;
  /** New hand-set macros (the style becomes custom). */
  onMacros: (macros: Macros) => void;
};

/**
 * Eating style (each with "who it suits"), protein level in g/kg with the
 * goal's suggestion, a live preview, and hand adjustment in percent or grams
 * where the other macros adapt to keep the energy (locked ones stay).
 */
export function StyleStep(props: StyleStepProps) {
  const p = strings.macroPlan;
  const g = strings.goals2;
  const { style, macros } = props;
  const custom = style === "custom";
  const plant = !custom && STYLE_PRESETS[style].plant === true;
  const warnings = macroWarnings(macros, props.weightKg, style);
  const shares = macroShares(macros);

  const setGrams = (key: MacroKey, grams: number) =>
    props.onMacros(adjustMacro(macros, key, grams, props.locked));
  const toggleLock = (key: MacroKey) =>
    props.onLocked(
      props.locked.includes(key)
        ? props.locked.filter((k) => k !== key)
        : [...props.locked, key],
    );

  return (
    <View style={styles.gap}>
      <View style={styles.gapSm} accessibilityRole="radiogroup">
        {DIET_STYLES.map((value) => (
          <OptionRow
            key={value}
            title={g.styles[value].title}
            // The chosen style explains itself fully; the others say who they suit.
            hint={
              style === value
                ? `${g.styles[value].what} ${g.styles[value].who}`
                : g.styles[value].who
            }
            selected={style === value}
            onPress={() => props.onStyle(value)}
          />
        ))}
      </View>

      {warnings.includes("keto") ? <Warning text={p.warnings.keto} /> : null}

      {!custom ? (
        <View style={styles.gapSm}>
          <Text
            variant="overline"
            color="textSubtle"
            accessibilityRole="header"
          >
            {p.proteinTitle}
          </Text>
          <Text variant="caption" color="textSubtle">
            {p.proteinBody}
          </Text>
          <View style={styles.gapSm} accessibilityRole="radiogroup">
            {PROTEIN_LEVELS.map((level) => {
              const perKg = PROTEIN_G_PER_KG_LEVEL[level] * (plant ? 1.1 : 1);
              const info = p.proteinLevels[level];
              return (
                <OptionRow
                  key={level}
                  title={`${info.title} · ${format(info.value, { value: formatDecimal(perKg, 1) })}`}
                  hint={info.hint}
                  selected={props.proteinLevel === level}
                  trailing={
                    level === props.suggestedLevel ? (
                      <View style={styles.badge}>
                        <Text variant="caption" color="accentText">
                          {p.suggested}
                        </Text>
                      </View>
                    ) : undefined
                  }
                  onPress={() => props.onProteinLevel(level)}
                />
              );
            })}
          </View>
          <Text variant="caption" color="textMuted">
            {format(p.suggestedWhy, {
              level: p.proteinLevels[props.suggestedLevel].title,
            })}
          </Text>
        </View>
      ) : null}

      <MacroPreview macros={macros} />

      <Card style={styles.gapSm}>
        <SwitchRow
          label={p.adjustSwitch}
          value={custom}
          onValueChange={(on) =>
            on ? props.onMacros(macros) : props.onStyle("balanced")
          }
        />
        {custom ? (
          <View style={styles.gapSm}>
            <Text variant="caption" color="textSubtle">
              {p.adjustBody}
            </Text>
            <Segmented
              value={props.input}
              options={[
                { value: "percent", label: p.inputPercent },
                { value: "grams", label: p.inputGrams },
              ]}
              onChange={props.onInput}
              accessibilityLabel={p.inputA11y}
            />
            {MACRO_KEYS.map((key) => {
              const locked = props.locked.includes(key);
              const label = macroLabel(key);
              return (
                <View key={key} style={styles.adjustBlock}>
                  <View style={styles.spread}>
                    <Text variant="bodyStrong">{label}</Text>
                    <Text
                      variant="caption"
                      color="textSubtle"
                      style={styles.tabular}
                    >
                      {props.input === "percent"
                        ? formatNutrientGrams(macros[key])
                        : percentText(shares[key])}
                    </Text>
                  </View>
                  <View style={styles.adjustRow}>
                    {props.input === "percent" ? (
                      <Stepper
                        value={Math.round(shares[key] * 100)}
                        min={0}
                        max={90}
                        step={1}
                        onChange={(pct) =>
                          setGrams(
                            key,
                            gramsForShare(key, pct / 100, macros.kcal),
                          )
                        }
                        format={(v) => format(p.percentValue, { value: v })}
                        accessibilityLabel={label}
                      />
                    ) : (
                      <Stepper
                        value={macros[key]}
                        min={0}
                        max={600}
                        step={5}
                        onChange={(grams) => setGrams(key, grams)}
                        format={(v) => formatNutrientGrams(v)}
                        accessibilityLabel={label}
                      />
                    )}
                    <IconButton
                      icon={locked ? "lock" : "unlock"}
                      variant={locked ? "accent" : "plain"}
                      size={40}
                      accessibilityLabel={format(locked ? p.unlock : p.lock, {
                        macro: label,
                      })}
                      onPress={() => toggleLock(key)}
                    />
                  </View>
                </View>
              );
            })}
          </View>
        ) : null}
        {warnings.includes("fatLow") ? (
          <Warning text={p.warnings.fatLow} />
        ) : null}
        {warnings.includes("proteinHigh") ? (
          <Warning text={p.warnings.proteinHigh} />
        ) : null}
      </Card>
    </View>
  );
}

function Warning({ text }: { text: string }) {
  return (
    <View style={styles.warning} accessibilityRole="alert">
      <Icon name="info" size={18} color="accentText" />
      <Text variant="caption" color="text" style={styles.flex}>
        {text}
      </Text>
    </View>
  );
}

/** Optional split of the day's energy over 2–6 meals; the diary shows each meal's target. */
export function MealsStep({
  plan,
  onPlan,
  kcal,
}: {
  plan: MealPlan;
  onPlan: (plan: MealPlan) => void;
  kcal: number;
}) {
  const p = strings.macroPlan;
  const targets = mealTargets(kcal, plan);
  return (
    <View style={styles.gap}>
      <Card padding="flush">
        <View style={styles.switchPad}>
          <SwitchRow
            label={p.mealsSwitch}
            value={plan.enabled}
            onValueChange={(enabled) => onPlan({ ...plan, enabled })}
          />
        </View>
      </Card>
      {plan.enabled ? (
        <>
          <View style={styles.gapSm}>
            <Text
              variant="overline"
              color="textSubtle"
              accessibilityRole="header"
            >
              {p.mealsCount}
            </Text>
            <View style={styles.chips} accessibilityRole="radiogroup">
              {MEAL_COUNTS.map((count) => (
                <SelectChip
                  key={count}
                  role="radio"
                  label={format(p.mealsCountValue, { count })}
                  selected={plan.count === count}
                  onPress={() => onPlan({ ...plan, count })}
                />
              ))}
            </View>
          </View>
          <View style={styles.gapSm} accessibilityRole="radiogroup">
            <Text
              variant="overline"
              color="textSubtle"
              accessibilityRole="header"
            >
              {p.distributionTitle}
            </Text>
            {MEAL_DISTRIBUTIONS.map((distribution) => (
              <OptionRow
                key={distribution}
                title={p.distributions[distribution].title}
                hint={p.distributions[distribution].hint}
                selected={plan.distribution === distribution}
                onPress={() => onPlan({ ...plan, distribution })}
              />
            ))}
          </View>
          <Card style={styles.gapSm}>
            {targets.map((target) => (
              <View key={target.meal} style={styles.spread}>
                <Text variant="body">
                  {target.occasions > 1
                    ? format(p.mealOccasions, {
                        meal: strings.diaryMeals[target.meal],
                        count: target.occasions,
                      })
                    : strings.diaryMeals[target.meal]}
                </Text>
                <Text variant="bodyStrong" style={styles.tabular}>
                  {formatEnergy(target.kcal)}
                </Text>
              </View>
            ))}
          </Card>
        </>
      ) : (
        <Text variant="body" color="textMuted">
          {p.mealsOff}
        </Text>
      )}
    </View>
  );
}

const styles = themedStyles(() =>
  StyleSheet.create({
    gap: {
      gap: spacing.lg,
    },
    gapSm: {
      gap: spacing.sm,
    },
    gapXs: {
      gap: spacing.xs,
    },
    flex: {
      flex: 1,
    },
    spread: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: spacing.md,
    },
    tabular: {
      fontVariant: ["tabular-nums"],
    },
    chips: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: spacing.sm,
    },
    track: {
      height: 6,
      borderRadius: radii.pill,
      backgroundColor: colors.surfaceRaised,
      overflow: "hidden",
    },
    fill: {
      height: "100%",
      borderRadius: radii.pill,
      backgroundColor: colors.accent,
    },
    badge: {
      paddingHorizontal: spacing.sm,
      paddingVertical: 2,
      borderRadius: radii.pill,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.accent,
    },
    adjustBlock: {
      gap: spacing.xs,
      paddingTop: spacing.xs,
    },
    adjustRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: spacing.sm,
    },
    warning: {
      flexDirection: "row",
      gap: spacing.sm,
      padding: spacing.md,
      borderRadius: radii.md,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.accent,
      backgroundColor: colors.surface,
    },
    switchPad: {
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.sm,
    },
  }),
);
