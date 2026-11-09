import { StyleSheet, View } from 'react-native';

import { Mascot } from '@/features/mascot/Mascot';
import type { MascotState } from '@/features/mascot/types';
import { colors, spacing, themedStyles } from '@/theme';

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
  /** Show the mascot in this state instead of the icon (friendly empty views). */
  mascot?: MascotState;
};

/** Explains why a view is empty (or failed) and offers one clear next step. */
export function EmptyState({ icon, title, body, action, tone = 'accent', mascot }: EmptyStateProps) {
  return (
    <View style={styles.container}>
      {mascot ? (
        <Mascot state={mascot} size={112} />
      ) : (
        <View style={[styles.badge, tone === 'danger' && styles.badgeDanger]}>
          <Icon name={icon} size={32} color={tone === 'danger' ? 'danger' : 'accentText'} />
        </View>
      )}
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

const styles = themedStyles(() =>
  StyleSheet.create({
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
  }),
);
