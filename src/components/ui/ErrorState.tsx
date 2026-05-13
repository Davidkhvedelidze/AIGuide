import { Text, View } from 'react-native';

import { AppButton } from '@/components/ui/AppButton';

interface ErrorStateProps {
  title?: string;
  message?: string;
  actionLabel?: string;
  onRetry?: () => void;
}

export function ErrorState({
  title = 'Something went wrong',
  message = 'Please try again in a moment.',
  actionLabel = 'Try again',
  onRetry,
}: ErrorStateProps): JSX.Element {
  return (
    <View accessibilityRole="alert" className="gap-4 rounded-2xl border border-red-100 bg-red-50 p-5">
      <View className="gap-2">
        <Text className="text-lg font-semibold text-red-950">{title}</Text>
        <Text className="text-sm leading-5 text-red-800">{message}</Text>
      </View>
      {onRetry ? <AppButton title={actionLabel} variant="secondary" onPress={onRetry} /> : null}
    </View>
  );
}
