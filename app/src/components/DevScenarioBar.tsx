import { StyleSheet, View } from 'react-native';

import { PressableScale, Text } from '@/components/ui';
import { useDevScenario, type DevScenario } from '@/data/devScenario';
import { strings } from '@/i18n';
import { colors, radii, spacing, touchTarget } from '@/theme';

const SCENARIOS: { value: DevScenario; label: string }[] = [
  { value: 'plan', label: strings.dev.scenarioPlan },
  { value: 'ending', label: strings.dev.scenarioEnding },
  { value: 'empty', label: strings.dev.scenarioEmpty },
  { value: 'loading', label: strings.dev.scenarioLoading },
  { value: 'error', label: strings.dev.scenarioError },
];

/**
 * Development-only switch between test-data situations, so empty, loading
 * and error states can be checked on a phone. Not rendered in release builds.
 */
export function DevScenarioBar() {
  const scenario = useDevScenario((state) => state.scenario);
  const setScenario = useDevScenario((state) => state.setScenario);

  if (!__DEV__) return null;

  return (
    <View style={styles.container}>
      <Text variant="overline" color="textSubtle">
        {strings.dev.title}
      </Text>
      <View style={styles.options}>
        {SCENARIOS.map((option) => {
          const selected = option.value === scenario;
          return (
            <PressableScale
              key={option.value}
              haptic="select"
              onPress={() => setScenario(option.value)}
              accessibilityRole="radio"
              accessibilityState={{ selected }}
              style={[styles.option, selected && styles.optionSelected]}
            >
              <Text variant="label" color={selected ? 'accentText' : 'textMuted'}>
                {option.label}
              </Text>
            </PressableScale>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.sm,
    padding: spacing.lg,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.border,
  },
  options: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  option: {
    minHeight: touchTarget - spacing.sm,
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: colors.border,
  },
  optionSelected: {
    backgroundColor: colors.accentSoft,
    borderColor: 'transparent',
  },
});
