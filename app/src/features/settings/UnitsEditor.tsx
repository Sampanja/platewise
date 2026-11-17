import { useEffect, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { Icon, OptionRow, SelectChip, Text, type IconName } from '@/components/ui';
import {
  IMPERIAL_UNITS,
  METRIC_UNITS,
  sameUnits,
  UNIT_CHOICES,
  UNIT_KINDS,
  unitPreset,
  type UnitKind,
  type UnitPrefs,
} from '@/domain/units';
import { useUnits } from '@/data/hooks';
import { useProfileStore } from '@/data/stores/profile';
import { format, strings } from '@/i18n';
import {
  formatBodyWeight,
  formatEnergy,
  formatGrams,
  formatHeight,
  formatLiquid,
  formatTemperature,
} from '@/lib/amounts';
import { spacing, themedStyles } from '@/theme';

const KIND_ICONS: Record<UnitKind, IconName> = {
  weight: 'lineChart',
  height: 'ruler',
  food: 'salad',
  liquid: 'water',
  energy: 'flame',
  temperature: 'pot',
};

/** The same everyday amount in each unit, so every choice shows what it looks like. */
const EXAMPLE = { weightKg: 70, heightCm: 175, foodG: 250, liquidMl: 250, kcal: 2000, ovenC: 200 } as const;

/** "70 kg" / "154.3 lb" / "11 st 0.3 lb" … for one choice of one kind. */
export function unitExample<K extends UnitKind>(kind: K, unit: UnitPrefs[K]): string {
  switch (kind) {
    case 'weight':
      return formatBodyWeight(EXAMPLE.weightKg, unit as UnitPrefs['weight']);
    case 'height':
      return formatHeight(EXAMPLE.heightCm, unit as UnitPrefs['height']);
    case 'food':
      return formatGrams(EXAMPLE.foodG, unit as UnitPrefs['food']);
    case 'liquid':
      return formatLiquid(EXAMPLE.liquidMl, unit as UnitPrefs['liquid']);
    case 'energy':
      return formatEnergy(EXAMPLE.kcal, unit as UnitPrefs['energy']);
    default:
      return formatTemperature(EXAMPLE.ovenC, unit as UnitPrefs['temperature']);
  }
}

/** "Metrinen", "Imperiaalinen" or "Mukautettu" for the profile row. */
export function unitsSummary(units: UnitPrefs): string {
  const preset = unitPreset(units);
  return strings.unitSystems[preset];
}

type Props = {
  value: UnitPrefs;
  onChange: (next: UnitPrefs) => void;
};

/**
 * Two quick choices (metric, imperial) and "Customize" for each unit
 * separately. Every choice shows an example in that unit. Used in onboarding
 * and in Profile → Units; the caller saves.
 */
export function UnitsEditor({ value, onChange }: Props) {
  const t = strings.unitSystems;
  const preset = unitPreset(value);
  const [open, setOpen] = useState(preset === 'custom');
  const showCustom = open || preset === 'custom';

  const setKind = <K extends UnitKind>(kind: K, unit: UnitPrefs[K]) => onChange({ ...value, [kind]: unit });

  return (
    <View style={styles.gap}>
      <View style={styles.gapSm} accessibilityRole="radiogroup">
        <OptionRow
          icon="globe"
          title={t.metric}
          hint={`${t.metricHint} · ${format(t.example, { example: unitExample('weight', 'kg') })}`}
          selected={preset === 'metric'}
          onPress={() => onChange({ ...METRIC_UNITS })}
        />
        <OptionRow
          icon="flag"
          title={t.imperial}
          hint={`${t.imperialHint} · ${format(t.example, { example: unitExample('weight', 'lb') })}`}
          selected={preset === 'imperial'}
          onPress={() => onChange({ ...IMPERIAL_UNITS })}
        />
      </View>
      {preset === 'custom' ? (
        <Text variant="caption" color="textSubtle">
          {format(t.current, { summary: t.custom })}
        </Text>
      ) : (
        <OptionRow
          icon="layers"
          title={showCustom ? t.hideCustomize : t.customize}
          hint={showCustom ? undefined : t.customizeHint}
          selected={false}
          action
          onPress={() => setOpen((o) => !o)}
        />
      )}
      {showCustom ? (
        <View style={styles.gap}>
          {UNIT_KINDS.map((kind) => (
            <View key={kind} style={styles.gapSm}>
              <View style={styles.kindHeader}>
                <Icon name={KIND_ICONS[kind]} size={18} color="accentText" />
                <Text variant="overline" color="textSubtle" accessibilityRole="header">
                  {t.kinds[kind]}
                </Text>
              </View>
              <View style={styles.chips} accessibilityRole="radiogroup" accessibilityLabel={t.kinds[kind]}>
                {(UNIT_CHOICES[kind] as readonly UnitPrefs[typeof kind][]).map((unit) => (
                  <SelectChip
                    key={unit}
                    role="radio"
                    label={`${t.choices[unit]} · ${unitExample(kind, unit)}`}
                    selected={value[kind] === unit}
                    onPress={() => setKind(kind, unit)}
                  />
                ))}
              </View>
            </View>
          ))}
        </View>
      ) : null}
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
    kindHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
    },
    chips: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: spacing.sm,
    },
  }),
);

/**
 * Profile → Units. A unit change re-renders the whole app (like a language
 * change), which would also reset this screen and its scroll position after
 * every tap. So the choices are kept here while the screen is open (the
 * examples already show them) and saved when the user leaves it; every other
 * screen shows the new units right away.
 */
export function UnitsSettings() {
  const saved = useUnits();
  const update = useProfileStore((s) => s.update);
  const [draft, setDraft] = useState<UnitPrefs>(saved);
  const latest = useRef({ draft, saved });
  useEffect(() => {
    latest.current = { draft, saved };
  });
  useEffect(
    () => () => {
      const { draft: next, saved: before } = latest.current;
      if (!sameUnits(next, before)) update({ units: next, unitsChosen: true });
    },
    [update],
  );
  return <UnitsEditor value={draft} onChange={setDraft} />;
}
