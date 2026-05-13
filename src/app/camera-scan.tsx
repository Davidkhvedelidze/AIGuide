import { useEffect, useRef, type ReactNode } from 'react';
import { CameraView } from 'expo-camera';
import { router } from 'expo-router';
import { SafeAreaView, StyleSheet, View } from 'react-native';

import { AppButton } from '@/components/ui/AppButton';
import { AppCard } from '@/components/ui/AppCard';
import { AppText } from '@/components/ui/AppText';
import { ErrorState } from '@/components/ui/ErrorState';
import { LoadingState } from '@/components/ui/LoadingState';
import { useCameraScan } from '@/features/camera/hooks/useCameraScan';
import { colors, radius, spacing } from '@/lib/theme/tokens';

export default function CameraScanScreen() {
  const didRequestInitialPermissions = useRef(false);
  const {
    cameraRef,
    errorMessage,
    hasCameraPermission,
    isCameraPermissionDenied,
    isLocationPermissionDenied,
    isPreparing,
    isScanning,
    requestRequiredPermissions,
    scanCurrentView,
    clearError,
  } = useCameraScan();

  useEffect(() => {
    if (didRequestInitialPermissions.current) {
      return;
    }

    didRequestInitialPermissions.current = true;
    void requestRequiredPermissions();
  }, [requestRequiredPermissions]);

  const handleScan = async () => {
    const result = await scanCurrentView();

    if (result) {
      router.push({
        pathname: '/result',
        params: { result: encodeURIComponent(JSON.stringify(result)) },
      });
    }
  };

  if (isCameraPermissionDenied) {
    return (
      <ScreenShell>
        <ErrorState
          title="Camera permission needed"
          message="Enable camera access in your device settings so AI Guide can scan what you are seeing."
          actionLabel="Go back"
          onAction={() => router.back()}
        />
      </ScreenShell>
    );
  }

  if (isLocationPermissionDenied) {
    return (
      <ScreenShell>
        <ErrorState
          title="Location permission needed"
          message="Enable foreground location access so AI Guide can attach nearby context to the scan."
          actionLabel="Try again"
          onAction={() => void requestRequiredPermissions()}
        />
      </ScreenShell>
    );
  }

  if (!hasCameraPermission || isPreparing) {
    return (
      <ScreenShell>
        <LoadingState message="Requesting camera and location permissions…" />
      </ScreenShell>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <CameraView ref={cameraRef} style={styles.camera} facing="back" mode="picture" />

        <AppCard style={styles.panel}>
          <AppText variant="subtitle">Frame the landmark</AppText>
          <AppText color={colors.textMuted}>
            Hold steady and capture what you want AI Guide to explain. This MVP stores only a local photo URI
            and coordinates for the mock result.
          </AppText>

          {errorMessage ? (
            <ErrorState title="Scan failed" message={errorMessage} actionLabel="Dismiss" onAction={clearError} />
          ) : null}

          <AppButton onPress={() => void handleScan()} isLoading={isScanning} accessibilityLabel="Take photo">
            Take photo
          </AppButton>
        </AppCard>
      </View>
    </SafeAreaView>
  );
}

function ScreenShell({ children }: { children: ReactNode }) {
  return <SafeAreaView style={[styles.safeArea, styles.centered]}>{children}</SafeAreaView>;
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  centered: {
    justifyContent: 'center',
  },
  container: {
    flex: 1,
    gap: spacing.lg,
    padding: spacing.lg,
  },
  camera: {
    flex: 1,
    minHeight: 360,
    overflow: 'hidden',
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
  },
  panel: {
    marginBottom: spacing.md,
  },
});
