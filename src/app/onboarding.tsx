import { Ionicons } from '@expo/vector-icons';
import { useCameraPermissions } from 'expo-camera';
import * as Location from 'expo-location';
import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { Button, Screen, Text, type IconName } from '@/components/ui';
import { useT, type StringKey } from '@/i18n';
import { track } from '@/services/analytics';
import { useApp } from '@/store/app';
import { colors, spacing } from '@/theme/tokens';

const SLIDES: { icon: IconName; title: StringKey; body: StringKey }[] = [
  { icon: 'camera', title: 'onboarding.1.title', body: 'onboarding.1.body' },
  { icon: 'shield-checkmark', title: 'onboarding.2.title', body: 'onboarding.2.body' },
  { icon: 'headset', title: 'onboarding.3.title', body: 'onboarding.3.body' },
  { icon: 'location', title: 'onboarding.4.title', body: 'onboarding.4.body' },
];

export default function Onboarding() {
  const t = useT();
  const [index, setIndex] = useState(0);
  const [busy, setBusy] = useState(false);
  const [, requestCamera] = useCameraPermissions();
  const complete = useApp((s) => s.completeOnboarding);
  const slide = SLIDES[index];
  const last = index === SLIDES.length - 1;

  const finish = async (askPermissions: boolean) => {
    if (askPermissions) {
      setBusy(true);
      // Either permission may be declined; the app still works, with clear prompts later.
      await requestCamera().catch(() => undefined);
      await Location.requestForegroundPermissionsAsync().catch(() => undefined);
      setBusy(false);
    }
    track('onboarding_completed', { asked_permissions: askPermissions });
    complete();
    router.replace('/');
  };

  return (
    <Screen edges={['top', 'bottom']} style={styles.screen}>
      <View style={styles.center}>
        <View style={styles.mark}>
          <Ionicons name={slide.icon} size={44} color={colors.gold} />
        </View>
        <Text variant="display" center accessibilityRole="header">
          {t(slide.title)}
        </Text>
        <Text color="textSecondary" center>
          {t(slide.body)}
        </Text>
      </View>

      <View style={styles.dots} accessibilityLabel={`${index + 1} / ${SLIDES.length}`}>
        {SLIDES.map((s, i) => (
          <View key={s.title} style={[styles.dot, i === index && styles.dotActive]} />
        ))}
      </View>

      {last ? (
        <View style={styles.actions}>
          <Button testID="onboarding-allow" title={t('onboarding.allow')} loading={busy} onPress={() => finish(true)} />
          <Button testID="onboarding-skip" title={t('onboarding.skip')} variant="ghost" onPress={() => finish(false)} />
        </View>
      ) : (
        <View style={styles.actions}>
          <Button testID="onboarding-next" title={t('onboarding.next')} icon="arrow-forward" onPress={() => setIndex(index + 1)} />
        </View>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: { padding: spacing.xxl },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.lg },
  mark: {
    width: 104,
    height: 104,
    borderRadius: 52,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.goldSoft,
    borderWidth: 1,
    borderColor: 'rgba(233,180,76,0.4)',
    marginBottom: spacing.md,
  },
  dots: { flexDirection: 'row', justifyContent: 'center', gap: spacing.sm, marginBottom: spacing.xl },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.borderStrong },
  dotActive: { backgroundColor: colors.gold, width: 22 },
  actions: { gap: spacing.md, minHeight: 116, justifyContent: 'flex-end' },
});
