import { Text, View } from 'react-native';
import { colors } from '@/lib/constants/theme';

interface EmptyStateProps {
  title: string;
  message: string;
}

export function EmptyState({ title, message }: EmptyStateProps) {
  return (
    <View className="items-center justify-center rounded-3xl border p-6" style={{ borderColor: colors.borderGlass, backgroundColor: 'rgba(255,255,255,0.04)' }}>
      <Text className="text-center text-lg font-bold text-tour-text">{title}</Text>
      <Text className="mt-2 text-center text-sm leading-5 text-tour-muted">{message}</Text>
    </View>
  );
}
