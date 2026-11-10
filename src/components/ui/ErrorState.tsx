import { Text, View } from 'react-native';
import { SecondaryButton } from './SecondaryButton';

interface ErrorStateProps {
  title?: string;
  message?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function ErrorState({ title = 'Something went wrong', message = 'Please try again in a moment.', actionLabel = 'Try again', onAction }: ErrorStateProps) {
  return (
    <View accessibilityRole="alert" className="rounded-3xl border p-5" style={{ borderColor: 'rgba(248,113,113,0.28)', backgroundColor: 'rgba(127,29,29,0.22)' }}>
      <Text className="text-lg font-semibold text-tour-text">{title}</Text>
      <Text className="mt-2 text-sm leading-5 text-tour-muted">{message}</Text>
      {onAction ? <SecondaryButton className="mt-4" onPress={onAction} title={actionLabel} /> : null}
    </View>
  );
}
