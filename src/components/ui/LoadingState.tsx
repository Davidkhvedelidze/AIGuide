import { ActivityIndicator, Text, View } from 'react-native';
import { colors } from '@/lib/constants/theme';

interface LoadingStateProps {
  title?: string;
  message?: string;
}

export function LoadingState({ title = 'Loading', message = 'Please wait while this loads.' }: LoadingStateProps) {
  return (
    <View accessibilityRole="progressbar" className="items-center justify-center rounded-3xl border p-8" style={{ borderColor: colors.borderGlass, backgroundColor: colors.cardGlass }}>
      <ActivityIndicator color={colors.gold} size="large" />
      <Text className="mt-4 text-lg font-semibold text-tour-text">{title}</Text>
      <Text className="mt-2 text-center text-sm leading-5 text-tour-muted">{message}</Text>
    </View>
  );
}
