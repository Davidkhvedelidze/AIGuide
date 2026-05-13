import type { ReactNode } from 'react';
import { View, type ViewProps } from 'react-native';

interface AppCardProps extends ViewProps {
  children: ReactNode;
  className?: string;
}

export function AppCard({ children, className, ...props }: AppCardProps) {
  return (
    <View className={`rounded-card border border-slate-200 bg-white p-5 shadow-sm shadow-slate-200 ${className ?? ''}`} {...props}>
      {children}
    </View>
  );
}
