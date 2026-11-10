import type { ReactNode } from 'react';
import { View, type ViewProps } from 'react-native';
import { premiumTheme } from '@/lib/constants/theme';

interface GlassCardProps extends ViewProps {
  children: ReactNode;
  className?: string;
}

export function GlassCard({ children, className, style, ...props }: GlassCardProps) {
  return (
    <View
      className={`rounded-3xl border p-5 ${className ?? ''}`}
      style={[{ backgroundColor: premiumTheme.colors.cardGlass, borderColor: premiumTheme.colors.borderGlass, ...premiumTheme.shadows.glass }, style]}
      {...props}
    >
      {children}
    </View>
  );
}
