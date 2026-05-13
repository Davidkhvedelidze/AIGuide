import type { PropsWithChildren } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, type PressableProps, type ViewStyle } from 'react-native';

import { colors, radius, spacing } from '@/lib/theme/tokens';
import { AppText } from './AppText';

type AppButtonVariant = 'primary' | 'secondary' | 'danger';

interface AppButtonProps extends Omit<PressableProps, 'style'>, PropsWithChildren {
  variant?: AppButtonVariant;
  isLoading?: boolean;
  style?: ViewStyle;
}

export function AppButton({
  variant = 'primary',
  isLoading = false,
  disabled,
  children,
  style,
  accessibilityRole = 'button',
  ...props
}: AppButtonProps) {
  const isDisabled = disabled || isLoading;

  return (
    <Pressable
      accessibilityRole={accessibilityRole}
      disabled={isDisabled}
      style={({ pressed }: { pressed: boolean }) => [
        styles.base,
        styles[variant],
        pressed && !isDisabled ? styles.pressed : null,
        isDisabled ? styles.disabled : null,
        style,
      ]}
      {...props}
    >
      {isLoading ? (
        <ActivityIndicator color={variant === 'primary' ? colors.background : colors.text} />
      ) : (
        <AppText variant="label" color={variant === 'primary' ? colors.background : colors.text}>
          {children}
        </AppText>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 52,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.pill,
  },
  primary: {
    backgroundColor: colors.primary,
  },
  secondary: {
    backgroundColor: colors.surfaceMuted,
    borderWidth: 1,
    borderColor: colors.border,
  },
  danger: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.danger,
  },
  pressed: {
    opacity: 0.82,
    transform: [{ scale: 0.99 }],
  },
  disabled: {
    opacity: 0.55,
  },
});
