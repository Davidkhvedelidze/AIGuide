import { router } from 'expo-router';
import { SafeAreaView, ScrollView, StyleSheet, View } from 'react-native';

import { AppButton } from '@/components/ui/AppButton';
import { AppCard } from '@/components/ui/AppCard';
import { AppText } from '@/components/ui/AppText';
import { colors, spacing } from '@/lib/theme/tokens';

export default function HomeScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.hero}>
          <AppText variant="caption" color={colors.primary}>
            LOCAL MVP PREVIEW
          </AppText>
          <AppText variant="title">Explore what is around you.</AppText>
          <AppText color={colors.textMuted}>
            Take a photo, attach your current coordinates, and preview the guide result flow before the AI
            backend is connected.
          </AppText>
        </View>

        <AppCard>
          <AppText variant="subtitle">Scan nearby context</AppText>
          <AppText color={colors.textMuted}>
            The app will request camera and foreground location permission, capture one image, and create a
            mock tour guide result locally on your device.
          </AppText>
          <AppButton onPress={() => router.push('/camera-scan')} accessibilityLabel="Scan what I am seeing">
            Scan what I’m seeing
          </AppButton>
        </AppCard>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flexGrow: 1,
    justifyContent: 'center',
    gap: spacing.xl,
    padding: spacing.lg,
  },
  hero: {
    gap: spacing.md,
  },
});
