import type { ReactNode } from 'react';
import { ActivityIndicator, Pressable, Text, type PressableProps } from 'react-native';
import { colors } from '@/lib/constants/theme';

interface GoldButtonProps extends Omit<PressableProps, 'children'> {
  title: string;
  icon?: ReactNode;
  isLoading?: boolean;
  className?: string;
}

export function GoldButton({ title, icon, isLoading = false, disabled, className, accessibilityLabel, ...props }: GoldButtonProps) {
  const isDisabled = Boolean(disabled || isLoading);

  return (
    <Pressable
      accessibilityLabel={accessibilityLabel ?? title}
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled, busy: isLoading }}
      className={`min-h-14 flex-row items-center justify-center gap-2 rounded-2xl px-6 py-4 ${isDisabled ? 'opacity-60' : 'opacity-100'} ${className ?? ''}`}
      disabled={isDisabled}
      hitSlop={8}
      style={{ backgroundColor: colors.gold }}
      {...props}
    >
      {isLoading ? <ActivityIndicator color={colors.bg} /> : icon}
      <Text className="text-base font-bold text-tour-bg">{title}</Text>
    </Pressable>
  );
}
