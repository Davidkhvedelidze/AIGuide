import type { ReactNode } from 'react';
import { Pressable, Text, type PressableProps } from 'react-native';
import { colors } from '@/lib/constants/theme';

interface SecondaryButtonProps extends Omit<PressableProps, 'children'> {
  title: string;
  icon?: ReactNode;
  className?: string;
}

export function SecondaryButton({ title, icon, disabled, className, accessibilityLabel, ...props }: SecondaryButtonProps) {
  const isDisabled = Boolean(disabled);

  return (
    <Pressable
      accessibilityLabel={accessibilityLabel ?? title}
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled }}
      className={`min-h-12 flex-row items-center justify-center gap-2 rounded-2xl border px-5 py-3 ${isDisabled ? 'opacity-60' : 'opacity-100'} ${className ?? ''}`}
      disabled={isDisabled}
      hitSlop={8}
      style={{ borderColor: colors.borderGlass, backgroundColor: 'rgba(255,255,255,0.04)' }}
      {...props}
    >
      {icon}
      <Text className="text-base font-semibold text-tour-text">{title}</Text>
    </Pressable>
  );
}
