import { StyleSheet, View } from 'react-native';

import { colors, spacing } from '@/lib/theme/tokens';
import { AppButton } from './AppButton';
import { AppText } from './AppText';

interface ErrorStateProps {
  title: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function ErrorState({ title, message, actionLabel, onAction }: ErrorStateProps) {
  return (
    <View style={styles.container} accessibilityRole="alert">
      <AppText variant="subtitle" align="center">
        {title}
      </AppText>
      <AppText color={colors.textMuted} align="center">
        {message}
      </AppText>
      {actionLabel && onAction ? <AppButton onPress={onAction}>{actionLabel}</AppButton> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.md,
    padding: spacing.xl,
  },
});
