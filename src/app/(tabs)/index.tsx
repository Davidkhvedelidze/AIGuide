import { CameraView, useCameraPermissions } from 'expo-camera';
import { router, useIsFocused } from 'expo-router';
import { useRef } from 'react';
import { ActivityIndicator, Linking, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { PlaceRow } from '@/components/place';
import { Button, Chip, EmptyState, Screen, Text } from '@/components/ui';
import { useCoords, usePlaces } from '@/data/queries';
import { isBackendConfigured } from '@/data/supabase';
import type { Place, ScanResult } from '@/data/types';
import { useScan } from '@/features/scan/useScan';
import { useT } from '@/i18n';
import { scansLeft, useApp } from '@/store/app';
import { useLibrary } from '@/store/library';
import { colors, radii, spacing } from '@/theme/tokens';

export default function GuideScreen() {
  const t = useT();
  const insets = useSafeAreaInsets();
  const focused = useIsFocused();
  const camera = useRef<CameraView>(null);
  const [permission, requestPermission] = useCameraPermissions();
  const { coords } = useCoords();
  const { data: places = [] } = usePlaces();
  const { state, scan, reset } = useScan(camera, coords);
  const left = useApp(scansLeft);
  const addHistory = useLibrary((s) => s.addHistory);

  const open = (placeId: string) => {
    addHistory(placeId, 'scan');
    reset();
    router.push({ pathname: '/place/[id]', params: { id: placeId } });
  };

  const onScan = async () => {
    const result = await scan();
    if (result?.status === 'recognized') open(result.placeId);
  };

  if (!permission) {
    return (
      <Screen style={styles.centered}>
        <ActivityIndicator color={colors.gold} />
      </Screen>
    );
  }

  if (!permission.granted) {
    return (
      <Screen>
        <EmptyState
          icon="camera-outline"
          title={t('guide.noCameraTitle')}
          message={t('guide.noCameraBody')}
          action={t('guide.grant')}
          onAction={() => (permission.canAskAgain ? void requestPermission() : void Linking.openSettings())}
        />
        <View style={{ padding: spacing.xl }}>
          <Button testID="open-map" title={t('guide.openMap')} variant="ghost" icon="map-outline" onPress={() => router.push('/map')} />
        </View>
      </Screen>
    );
  }

  const byId = (ids: string[]) => ids.map((id) => places.find((p) => p.id === id)).filter((p): p is Place => !!p);
  const busy = state.phase === 'analyzing';

  return (
    <View style={styles.root}>
      {/* The camera is unmounted when the tab loses focus so it stops using the sensor. */}
      {focused && <CameraView ref={camera} style={StyleSheet.absoluteFill} facing="back" />}

      <View style={[styles.top, { paddingTop: insets.top + spacing.md }]}>
        <Text variant="heading" accessibilityRole="header">
          {t('guide.title')}
        </Text>
        {Number.isFinite(left) && <Chip icon="scan-outline" label={t('guide.scansLeft', { n: left })} />}
      </View>

      <View style={styles.bottom}>
        {state.phase === 'idle' && (
          <>
            <Text variant="caption" center style={styles.hint}>
              {t('guide.hint')}
            </Text>
            <Pressable
              testID="scan-button"
              accessibilityRole="button"
              accessibilityLabel={t('guide.scan')}
              onPress={onScan}
              style={({ pressed }) => [styles.shutter, pressed && { transform: [{ scale: 0.94 }] }]}>
              <View style={styles.shutterInner} />
            </Pressable>
          </>
        )}

        {busy && (
          <View style={styles.panel} accessibilityLiveRegion="polite">
            <ActivityIndicator color={colors.gold} />
            <Text center>{t('guide.analyzing')}</Text>
          </View>
        )}

        {state.phase === 'error' && (
          <View style={styles.panel}>
            <Text variant="heading" center>
              {t('guide.failed')}
            </Text>
            <Text color="textSecondary" center>
              {t('common.errorBody')}
            </Text>
            <Button title={t('common.retry')} onPress={onScan} />
          </View>
        )}

        {state.phase === 'result' && (
          <ResultPanel result={state.result} places={byId} onPick={open} onAgain={reset} />
        )}
      </View>
    </View>
  );
}

function ResultPanel({
  result,
  places,
  onPick,
  onAgain,
}: {
  result: ScanResult;
  places: (ids: string[]) => Place[];
  onPick: (placeId: string) => void;
  onAgain: () => void;
}) {
  const t = useT();

  if (result.status === 'recognized') return null;

  if (result.status === 'limit_reached') {
    return (
      <View style={styles.panel}>
        <Text variant="heading" center>
          {t('guide.limitTitle')}
        </Text>
        <Text color="textSecondary" center>
          {t('guide.limitBody', { n: result.limit })}
        </Text>
        <Button testID="limit-upgrade" title={t('guide.upgrade')} onPress={() => router.push('/paywall')} />
        <Button title={t('common.close')} variant="ghost" onPress={onAgain} />
      </View>
    );
  }

  const candidates = result.status === 'candidates';
  const list = places(candidates ? result.placeIds : result.nearbyIds);
  return (
    <ScrollView style={styles.panelScroll} contentContainerStyle={styles.panelContent}>
      <Text variant="heading">{candidates ? t('guide.pickTitle') : t('guide.notRecognizedTitle')}</Text>
      <Text color="textSecondary">{candidates ? t('guide.pickBody') : t('guide.notRecognizedBody')}</Text>
      {candidates && !isBackendConfigured && (
        <Text variant="caption" color="textMuted">
          {t('guide.demo')}
        </Text>
      )}
      {list.map((place) => (
        <PlaceRow key={place.id} place={place} onPress={() => onPick(place.id)} />
      ))}
      <Button testID="scan-again" title={t('guide.again')} variant="ghost" icon="refresh" onPress={onAgain} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#000' },
  centered: { alignItems: 'center', justifyContent: 'center' },
  top: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
    gap: spacing.sm,
    alignItems: 'center',
    backgroundColor: colors.overlay,
  },
  bottom: { position: 'absolute', left: 0, right: 0, bottom: 0, padding: spacing.lg, alignItems: 'center', gap: spacing.md },
  hint: { backgroundColor: colors.overlay, paddingHorizontal: spacing.md, paddingVertical: 6, borderRadius: radii.pill, overflow: 'hidden' },
  shutter: {
    width: 84,
    height: 84,
    borderRadius: 42,
    borderWidth: 4,
    borderColor: colors.gold,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.25)',
  },
  shutterInner: { width: 64, height: 64, borderRadius: 32, backgroundColor: colors.gold },
  panel: {
    alignSelf: 'stretch',
    gap: spacing.md,
    padding: spacing.xl,
    borderRadius: radii.xl,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.bg,
  },
  panelScroll: {
    alignSelf: 'stretch',
    maxHeight: 460,
    borderRadius: radii.xl,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.bg,
  },
  panelContent: { gap: spacing.md, padding: spacing.lg },
});
