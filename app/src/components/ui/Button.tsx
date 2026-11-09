import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { buttonHeight, colors, fixed, radii, shadows, spacing, themedStyles, touchTarget } from '@/theme';

import { PressableScale, type PressableScaleProps } from './PressableScale';
import { Text } from './Text';

type Variant = 'primary' | 'secondary' | 'ghost';

export type ButtonProps = Omit<PressableScaleProps, 'children'> & {
  label: string;
  variant?: Variant;
  icon?: ReactNode;
  /** Compact buttons for secondary actions inside cards. */
  size?: 'large' | 'compact';
};

/**
 * Primary is the single main call to action of a view (one per screen).
 * Secondary and ghost are for everything else.
 */
export function Button({
  label,
  variant = 'primary',
  size = 'large',
  icon,
  style,
  ...rest
}: ButtonProps) {
  const isPrimary = variant === 'primary';

  return (
    <PressableScale
      accessibilityRole="button"
      accessibilityLabel={label}
      {...rest}
      style={[
        styles.base,
        size === 'compact' && styles.compact,
        variantStyles[variant],
        isPrimary && shadows.glow,
        style,
      ]}
    >
      <View style={styles.content}>
        {icon}
        <Text
          variant={size === 'compact' ? 'label' : 'bodyStrong'}
          color={isPrimary ? 'textOnAccent' : variant === 'ghost' ? 'accentText' : 'text'}
          numberOfLines={2}
        >
          {label}
        </Text>
      </View>
    </PressableScale>
  );
}

const styles = themedStyles(() =>
  StyleSheet.create({
    base: {
      minHeight: buttonHeight,
      paddingHorizontal: spacing.xl,
      borderRadius: radii.pill,
      alignItems: 'center',
      justifyContent: 'center',
    },
    compact: {
      minHeight: touchTarget,
      paddingHorizontal: spacing.lg,
    },
    content: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
    },
  }),
);

const variantStyles = themedStyles(() =>
  StyleSheet.create({
    primary: {
      backgroundColor: colors.accent,
      borderWidth: 1,
      borderColor: fixed.buttonHighlight,
    },
    secondary: {
      backgroundColor: colors.surfaceRaised,
      borderWidth: 1,
      borderColor: colors.border,
    },
    ghost: {
      backgroundColor: 'transparent',
    },
  }),
);
