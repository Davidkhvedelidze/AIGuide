import type { ReactNode } from 'react';
import { ActivityIndicator, Pressable, Text, type PressableProps } from 'react-native';

type AppButtonVariant = 'primary' | 'secondary' | 'ghost';

interface AppButtonProps extends Omit<PressableProps, 'children'> {
  title: string;
  icon?: ReactNode;
  variant?: AppButtonVariant;
  isLoading?: boolean;
  className?: string;
}

const buttonVariantClassNames: Record<AppButtonVariant, string> = {
  primary: 'bg-brand-600 active:bg-brand-700',
  secondary: 'border border-slate-200 bg-white active:bg-slate-50',
  ghost: 'bg-transparent active:bg-slate-100',
};

const textVariantClassNames: Record<AppButtonVariant, string> = {
  primary: 'text-white',
  secondary: 'text-slate-900',
  ghost: 'text-brand-700',
};

export function AppButton({ title, icon, variant = 'primary', isLoading = false, disabled, className, accessibilityLabel, ...props }: AppButtonProps) {
  const isDisabled = disabled || isLoading;

  return (
    <Pressable
      accessibilityLabel={accessibilityLabel ?? title}
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled, busy: isLoading }}
      className={`min-h-12 flex-row items-center justify-center gap-2 rounded-2xl px-5 py-3 ${buttonVariantClassNames[variant]} ${
        isDisabled ? 'opacity-60' : 'opacity-100'
      } ${className ?? ''}`}
      disabled={isDisabled}
      hitSlop={8}
      {...props}
    >
      {isLoading ? <ActivityIndicator color={variant === 'primary' ? '#ffffff' : '#175cd3'} /> : icon}
      <Text className={`text-base font-semibold ${textVariantClassNames[variant]}`}>{title}</Text>
    </Pressable>
  );
}
