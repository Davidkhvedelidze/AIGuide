import type { ReactNode } from 'react';
import { ActivityIndicator, Pressable, Text, type PressableProps } from 'react-native';

type AppButtonVariant = 'primary' | 'secondary' | 'ghost';

interface AppButtonProps extends Omit<PressableProps, 'children'> {
  title: string;
  variant?: AppButtonVariant;
  isLoading?: boolean;
  leftIcon?: ReactNode;
}

const buttonStyles: Record<AppButtonVariant, string> = {
  primary: 'bg-brand-600 active:bg-brand-700',
  secondary: 'bg-slate-100 active:bg-slate-200',
  ghost: 'bg-transparent active:bg-slate-100',
};

const textStyles: Record<AppButtonVariant, string> = {
  primary: 'text-white',
  secondary: 'text-slate-900',
  ghost: 'text-brand-700',
};

export function AppButton({
  title,
  variant = 'primary',
  isLoading = false,
  leftIcon,
  disabled,
  className,
  accessibilityLabel,
  ...props
}: AppButtonProps): JSX.Element {
  const isDisabled = disabled || isLoading;

  return (
    <Pressable
      accessibilityLabel={accessibilityLabel ?? title}
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled, busy: isLoading }}
      className={`min-h-12 flex-row items-center justify-center gap-2 rounded-2xl px-5 ${buttonStyles[variant]} ${
        isDisabled ? 'opacity-60' : 'opacity-100'
      } ${className ?? ''}`}
      disabled={isDisabled}
      {...props}
    >
      {isLoading ? <ActivityIndicator color={variant === 'primary' ? '#FFFFFF' : '#1D4ED8'} /> : leftIcon}
      <Text className={`text-base font-semibold ${textStyles[variant]}`}>{title}</Text>
    </Pressable>
  );
}
