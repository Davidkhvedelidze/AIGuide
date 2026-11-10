import type { ReactNode } from 'react';
import { ScrollView, View, type ViewProps } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface ScreenContainerProps extends ViewProps {
  children: ReactNode;
  scrollable?: boolean;
}

export function ScreenContainer({ children, scrollable = true, className, ...props }: ScreenContainerProps): JSX.Element {
  const content = (
    <View className={`flex-1 gap-5 px-5 py-6 ${className ?? ''}`} {...props}>
      {children}
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      {scrollable ? <ScrollView contentContainerClassName="grow">{content}</ScrollView> : content}
    </SafeAreaView>
  );
}
