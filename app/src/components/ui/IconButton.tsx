import { StyleSheet } from 'react-native';

import { colors, touchTarget, type ColorToken } from '@/theme';

import { Icon, type IconName } from './Icon';
import { PressableScale, type PressableScaleProps } from './PressableScale';

export type IconButtonProps = Omit<PressableScaleProps, 'children' | 'accessibilityLabel'> & {
  icon: IconName;
  /** Required: icon-only buttons need a spoken label. */
  accessibilityLabel: string;
  variant?: 'raised' | 'glass' | 'plain' | 'accent';
  size?: number;
  iconColor?: ColorToken;
  fill?: ColorToken;
};

/** Round icon-only button. Smaller sizes keep a 48 dp touch target with hit slop. */
export function IconButton({
  icon,
  variant = 'raised',
  size = touchTarget,
  iconColor,
  fill,
  style,
  ...rest
}: IconButtonProps) {
  const color: ColorToken =
    iconColor ?? (variant === 'accent' ? 'textOnAccent' : variant === 'plain' ? 'textMuted' : 'text');
  return (
    <PressableScale
      accessibilityRole="button"
      hitSlop={size < touchTarget ? (touchTarget - size) / 2 : undefined}
      {...rest}
      style={[
        styles.base,
        { width: size, height: size, borderRadius: size / 2 },
        variantStyles[variant],
        style,
      ]}
    >
      <Icon name={icon} size={Math.round(size * 0.46)} color={color} fill={fill} />
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});

const variantStyles = StyleSheet.create({
  raised: {
    backgroundColor: colors.surfaceRaised,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.glassBorder,
  },
  glass: {
    backgroundColor: colors.glass,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.glassBorder,
  },
  plain: {
    backgroundColor: 'transparent',
  },
  accent: {
    backgroundColor: colors.accent,
  },
});
