import { StyleSheet, View } from 'react-native';

import { OptionRow } from '@/components/ui';
import { CHAINS } from '@/data/catalog';
import type { ChainCode } from '@/data/types';
import { strings } from '@/i18n';
import { spacing, themedStyles } from '@/theme';

/** Friendly price level instead of a raw multiplier. */
export function priceLevelLabel(multiplier: number): string {
  const t = strings.priceLevels;
  if (multiplier <= 0.9) return t.low;
  if (multiplier <= 1.05) return t.mid;
  return t.high;
}

type Props = {
  value: ChainCode;
  onChange: (code: ChainCode) => void;
};

/** Store chain choice with each chain's price level. */
export function ChainPicker({ value, onChange }: Props) {
  return (
    <View style={styles.list} accessibilityRole="radiogroup">
      {CHAINS.map((chain) => (
        <OptionRow
          key={chain.code}
          icon="store"
          title={chain.name}
          hint={priceLevelLabel(chain.priceMultiplier)}
          selected={chain.code === value}
          onPress={() => onChange(chain.code)}
        />
      ))}
    </View>
  );
}

const styles = themedStyles(() =>
  StyleSheet.create({
    list: {
      gap: spacing.sm,
    },
  }),
);
