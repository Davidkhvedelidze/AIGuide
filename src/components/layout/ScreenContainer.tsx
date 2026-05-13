import type { ReactNode } from 'react';
import { ScrollView, type ScrollViewProps } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface ScreenContainerProps extends ScrollViewProps {
  children: ReactNode;
  className?: string;
}

export function ScreenContainer({ children, contentContainerStyle, className, ...props }: ScreenContainerProps) {
  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <ScrollView
        className={className ?? ''}
        contentContainerStyle={[{ flexGrow: 1, padding: 20 }, contentContainerStyle]}
        keyboardShouldPersistTaps="handled"
        {...props}
      >
        {children}
      </ScrollView>
    </SafeAreaView>
  );
}
