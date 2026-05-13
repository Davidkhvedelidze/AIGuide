import { Image, SafeAreaView, ScrollView, StyleSheet, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';

import { AppButton } from '@/components/ui/AppButton';
import { AppCard } from '@/components/ui/AppCard';
import { AppText } from '@/components/ui/AppText';
import { ErrorState } from '@/components/ui/ErrorState';
import { isAiGuideResult, type AiGuideResult } from '@/features/guide/types/AiGuideResult';
import { colors, radius, spacing } from '@/lib/theme/tokens';

function parseResultParam(resultParam: string | string[] | undefined): AiGuideResult | null {
  if (typeof resultParam !== 'string') {
    return null;
  }

  try {
    const parsed: unknown = JSON.parse(decodeURIComponent(resultParam));
    return isAiGuideResult(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

export default function ResultScreen() {
  const params = useLocalSearchParams<{ result?: string }>();
  const result = parseResultParam(params.result);

  if (!result) {
    return (
      <SafeAreaView style={[styles.safeArea, styles.centered]}>
        <ErrorState
          title="Result unavailable"
          message="We could not open this scan result. Please start a new scan from the home screen."
          actionLabel="Start over"
          onAction={() => router.replace('/')}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content}>
        <Image source={{ uri: result.photoUri }} style={styles.image} accessibilityLabel="Captured scan preview" />

        <AppCard>
          <View style={styles.badge}>
            <AppText variant="caption" color={colors.background}>
              {result.confidenceLabel}
            </AppText>
          </View>
          <AppText variant="title">{result.title}</AppText>
          <AppText color={colors.textMuted}>{result.summary}</AppText>
        </AppCard>

        <AppCard>
          <AppText variant="subtitle">What happened</AppText>
          {result.highlights.map((highlight) => (
            <View key={highlight} style={styles.highlightRow}>
              <View style={styles.dot} />
              <AppText color={colors.textMuted} style={styles.highlightText}>
                {highlight}
              </AppText>
            </View>
          ))}
        </AppCard>

        <AppCard>
          <AppText variant="subtitle">Location attached</AppText>
          <AppText color={colors.textMuted}>
            Latitude {result.location.latitude.toFixed(6)}, Longitude {result.location.longitude.toFixed(6)}
          </AppText>
        </AppCard>

        <AppButton onPress={() => router.replace('/')}>Back to home</AppButton>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  centered: {
    justifyContent: 'center',
  },
  content: {
    gap: spacing.lg,
    padding: spacing.lg,
    paddingBottom: spacing.xl,
  },
  image: {
    width: '100%',
    height: 280,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
  },
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
    backgroundColor: colors.primary,
  },
  highlightRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  dot: {
    width: 8,
    height: 8,
    marginTop: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
  },
  highlightText: {
    flex: 1,
  },
});
