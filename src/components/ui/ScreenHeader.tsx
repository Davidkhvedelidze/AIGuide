import type { ReactNode } from 'react';
import { Text, View } from 'react-native';

interface ScreenHeaderProps {
  title: string;
  subtitle?: string;
  eyebrow?: string;
  trailing?: ReactNode;
}

export function ScreenHeader({ title, subtitle, eyebrow, trailing }: ScreenHeaderProps) {
  return (
    <View className="flex-row items-start justify-between gap-4">
      <View className="flex-1">
        {eyebrow ? <Text className="text-xs font-bold uppercase tracking-[2px] text-tour-gold">{eyebrow}</Text> : null}
        <Text className="mt-2 text-3xl font-bold leading-tight text-tour-text">{title}</Text>
        {subtitle ? <Text className="mt-2 text-base leading-6 text-tour-muted">{subtitle}</Text> : null}
      </View>
      {trailing}
    </View>
  );
}
