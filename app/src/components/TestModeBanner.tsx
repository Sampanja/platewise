import { StyleSheet, View } from 'react-native';

import { Icon, Text } from '@/components/ui';
import { colors, radii, spacing, themedStyles } from '@/theme';

type Props = {
  title: string;
  body: string;
};

/**
 * Clear notice that a feature runs on test data (e.g. photo recognition
 * before the backend phase). Read out by screen readers as one item.
 */
export function TestModeBanner({ title, body }: Props) {
  return (
    <View style={styles.banner} accessible accessibilityRole="alert" accessibilityLabel={`${title}. ${body}`}>
      <Icon name="info" size={20} color="gold" />
      <View style={styles.text}>
        <Text variant="bodyStrong">{title}</Text>
        <Text variant="caption" color="textMuted">
          {body}
        </Text>
      </View>
    </View>
  );
}

const styles = themedStyles(() =>
  StyleSheet.create({
    banner: {
      flexDirection: 'row',
      gap: spacing.md,
      padding: spacing.md,
      borderRadius: radii.md,
      backgroundColor: colors.goldSoft,
      borderWidth: 1,
      borderColor: colors.gold,
    },
    text: {
      flex: 1,
      gap: spacing.xxs,
    },
  }),
);
