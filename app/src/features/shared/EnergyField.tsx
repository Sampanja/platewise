import { useState } from 'react';

import { Text, TextField } from '@/components/ui';
import { energyFromInput, energyToInput, energyUnitLabel } from '@/lib/amounts';

type Props = {
  /** Kilocalories; 0 shows an empty field. */
  value: number;
  onChange: (kcal: number) => void;
  max: number;
  accessibilityLabel: string;
  large?: boolean;
};

/**
 * Energy typed in the user's unit (kcal or kJ) and kept in kcal. The field
 * keeps its own text so kilojoules survive the round trip while typing
 * ("1" kJ is 0 kcal), and follows the value when it changes from outside
 * (a preset chip).
 */
export function EnergyField({ value, onChange, max, accessibilityLabel, large }: Props) {
  const [text, setText] = useState(value > 0 ? String(energyToInput(value)) : '');
  const typedKcal = Math.min(max, energyFromInput(Number(text || '0')));
  const shown = typedKcal === value ? text : value > 0 ? String(energyToInput(value)) : '';
  return (
    <TextField
      large={large}
      value={shown}
      onChangeText={(next) => {
        const clean = next.replace(/\D/g, '');
        setText(clean);
        onChange(Math.min(max, energyFromInput(Number(clean || '0'))));
      }}
      keyboardType="number-pad"
      maxLength={5}
      accessibilityLabel={accessibilityLabel}
      trailing={
        <Text variant="title" color="textMuted">
          {energyUnitLabel()}
        </Text>
      }
    />
  );
}
