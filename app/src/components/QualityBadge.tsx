import { StyleSheet, View } from 'react-native';

import { PressableScale, Text } from '@/components/ui';
import type { QualityGrade } from '@/domain/qualityScore';
import { format, strings } from '@/i18n';
import { colors, radii, themedStyles, type ColorToken } from '@/theme';

/**
 * Grade colours: calm and friendly from green to plum; no red, so a D or an E
 * reads as information, not as a warning. The letter is always in the main
 * text colour for contrast; the colour sits in the frame and background.
 */
const GRADE_COLORS: Record<QualityGrade, { line: ColorToken; fill: ColorToken }> = {
  A: { line: 'success', fill: 'successSoft' },
  B: { line: 'herb', fill: 'herbSoft' },
  C: { line: 'gold', fill: 'goldSoft' },
  D: { line: 'berry', fill: 'berrySoft' },
  E: { line: 'textSubtle', fill: 'surfaceRaised' },
};

export type QualityBadgeProps = {
  grade: QualityGrade;
  size?: 'small' | 'large';
  /** Opens "Miksi tämä arvio?". Without it the badge is decorative. */
  onPress?: () => void;
};

export function QualityBadge({ grade, size = 'small', onPress }: QualityBadgeProps) {
  const tone = GRADE_COLORS[grade];
  const label = format(strings.quality.badgeA11y, { grade });
  const badge = (
    <View
      style={[styles.badge, size === 'large' && styles.large, { backgroundColor: colors[tone.fill], borderColor: colors[tone.line] }]}
      accessible={!onPress}
      accessibilityLabel={onPress ? undefined : label}
    >
      <Text variant={size === 'large' ? 'title' : 'label'} maxFontSizeMultiplier={1.3}>
        {grade}
      </Text>
    </View>
  );
  if (!onPress) return badge;
  return (
    <PressableScale
      haptic="select"
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityHint={strings.quality.why}
      hitSlop={8}
    >
      {badge}
    </PressableScale>
  );
}

const styles = themedStyles(() =>
  StyleSheet.create({
    badge: {
      minWidth: 26,
      height: 26,
      paddingHorizontal: 4,
      borderRadius: radii.sm,
      borderWidth: 1.5,
      alignItems: 'center',
      justifyContent: 'center',
    },
    large: {
      minWidth: 48,
      height: 48,
      borderRadius: radii.md,
      borderWidth: 2,
    },
  }),
);
