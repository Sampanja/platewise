import type { ComponentRef, ReactNode, Ref } from 'react';
import { StyleSheet, TextInput, View, type StyleProp, type TextInputProps, type ViewStyle } from 'react-native';

import { colors, radii, spacing, themedStyles, touchTarget, typography } from '@/theme';

import { Icon, type IconName } from './Icon';

export type TextFieldProps = Omit<TextInputProps, 'style'> & {
  icon?: IconName;
  /** Content at the right edge, e.g. a clear button or a unit. */
  trailing?: ReactNode;
  style?: StyleProp<ViewStyle>;
  /** Larger text for single numeric answers. */
  large?: boolean;
  ref?: Ref<ComponentRef<typeof TextInput>>;
};

/** Themed input: one line (a pill) or, with `multiline`, a text box. */
export function TextField({ icon, trailing, style, large, ref, ...rest }: TextFieldProps) {
  return (
    <View style={[styles.wrap, rest.multiline && styles.multiWrap, style]}>
      {icon ? <Icon name={icon} size={20} color="textSubtle" /> : null}
      <TextInput
        ref={ref}
        placeholderTextColor={colors.textSubtle}
        selectionColor={colors.accent}
        cursorColor={colors.accent}
        maxFontSizeMultiplier={1.6}
        {...rest}
        style={[styles.input, large && styles.large, rest.multiline && styles.multiInput]}
      />
      {trailing}
    </View>
  );
}

const styles = themedStyles(() =>
  StyleSheet.create({
    wrap: {
      minHeight: touchTarget + 4,
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      paddingHorizontal: spacing.lg,
      borderRadius: radii.pill,
      backgroundColor: colors.surfaceRaised,
      borderWidth: 1,
      borderColor: colors.border,
    },
    input: {
      flex: 1,
      ...typography.body,
      color: colors.text,
      paddingVertical: spacing.sm,
    },
    multiWrap: {
      alignItems: 'flex-start',
      borderRadius: radii.lg,
      paddingVertical: spacing.sm,
    },
    multiInput: {
      textAlignVertical: 'top',
      minHeight: 120,
    },
    large: {
      ...typography.display,
      textAlign: 'center',
      fontVariant: ['tabular-nums'],
    },
  }),
);
