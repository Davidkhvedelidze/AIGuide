import type { ReactNode } from 'react';
import { View, type ViewProps } from 'react-native';

interface AppCardProps extends ViewProps {
  children: ReactNode;
}

export function AppCard({ children, className, ...props }: AppCardProps): JSX.Element {
  return (
    <View className={`rounded-2xl border border-slate-200 bg-white p-5 shadow-sm ${className ?? ''}`} {...props}>
      {children}
    </View>
  );
}
