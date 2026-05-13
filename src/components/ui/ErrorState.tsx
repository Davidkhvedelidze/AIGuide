import { Text, View } from 'react-native';
import { AppButton } from './AppButton';

interface ErrorStateProps {
  title?: string;
  message?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function ErrorState({ title = 'Something went wrong', message = 'Please try again in a moment.', actionLabel = 'Try again', onAction }: ErrorStateProps) {
  return (
    <View accessibilityRole="alert" className="rounded-card border border-red-100 bg-red-50 p-5">
      <Text className="text-lg font-semibold text-red-950">{title}</Text>
      <Text className="mt-2 text-sm leading-5 text-red-800">{message}</Text>
      {onAction ? <AppButton className="mt-4" onPress={onAction} title={actionLabel} variant="secondary" /> : null}
    </View>
  );
}
