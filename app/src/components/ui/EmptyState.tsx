import { StyleSheet, View } from 'react-native';

import { colors, spacing } from '@/theme';

import { Button } from './Button';
import { Icon, type IconName } from './Icon';
import { Text } from './Text';

export type EmptyStateProps = {
  icon: IconName;
  title: string;
  body: string;
  /** The single call to action of the empty view. */
  action?: { label: string; onPress: () => void; variant?: 'primary' | 'secondary' };
  tone?: 'accent' | 'danger';
};

/** Explains why a view is empty (or failed) and offers one clear next step. */
export function EmptyState({ icon, title, body, action, tone = 'accent' }: EmptyStateProps) {
  return (
    <View style={styles.container}>
      <View style={[styles.badge, tone === 'danger' && styles.badgeDanger]}>
        <Icon name={icon} size={32} color={tone === 'danger' ? 'danger' : 'accentText'} />
      </View>
      <View style={styles.texts}>
        <Text variant="title" style={styles.centered} accessibilityRole="header">
          {title}
        </Text>
        <Text variant="body" color="textMuted" style={styles.centered}>
          {body}
        </Text>
      </View>
      {action ? (
        <Button
          label={action.label}
          variant={action.variant ?? 'primary'}
          onPress={action.onPress}
          style={styles.action}
        />
      ) : null}
    </View>
  );
}

const BADGE = 72;

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: spacing.lg,
    paddingVertical: spacing.xxl,
    paddingHorizontal: spacing.lg,
  },
  badge: {
    width: BADGE,
    height: BADGE,
    borderRadius: BADGE / 2,
    backgroundColor: colors.accentSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeDanger: {
    backgroundColor: colors.dangerSoft,
  },
  texts: {
    gap: spacing.sm,
    maxWidth: 340,
  },
  centered: {
    textAlign: 'center',
  },
  action: {
    alignSelf: 'stretch',
  },
});
