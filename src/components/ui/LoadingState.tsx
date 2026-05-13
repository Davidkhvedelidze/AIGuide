import { ActivityIndicator, Text, View } from 'react-native';

interface LoadingStateProps {
  title?: string;
  message?: string;
}

export function LoadingState({ title = 'Loading', message = 'Preparing your tour guide experience.' }: LoadingStateProps) {
  return (
    <View accessibilityRole="progressbar" className="items-center justify-center rounded-card bg-slate-50 p-8">
      <ActivityIndicator color="#175cd3" size="large" />
      <Text className="mt-4 text-lg font-semibold text-slate-900">{title}</Text>
      <Text className="mt-2 text-center text-sm leading-5 text-slate-600">{message}</Text>
    </View>
  );
}
