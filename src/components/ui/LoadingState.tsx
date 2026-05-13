import { ActivityIndicator, Text, View } from 'react-native';

interface LoadingStateProps {
  title?: string;
  description?: string;
}

export function LoadingState({
  title = 'Loading',
  description = 'Preparing the best guide experience for you.',
}: LoadingStateProps): JSX.Element {
  return (
    <View className="items-center justify-center gap-3 rounded-2xl bg-white p-6">
      <ActivityIndicator color="#2563EB" size="large" />
      <Text className="text-base font-semibold text-slate-950">{title}</Text>
      <Text className="text-center text-sm leading-5 text-slate-600">{description}</Text>
    </View>
  );
}
