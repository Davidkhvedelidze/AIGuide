import { useEffect, useRef } from 'react';
import { CameraView, type CameraType } from 'expo-camera';
import { router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { ScreenContainer } from '@/components/layout';
import { AppButton, AppCard, ErrorState, LoadingState } from '@/components/ui';
import { useCameraPermission, useCameraScan } from '@/features/camera';
import type { AiGuideResult } from '@/types';

function serializeResult(result: AiGuideResult) {
  return encodeURIComponent(JSON.stringify(result));
}

export default function CameraScanScreen() {
  const cameraRef = useRef<CameraView | null>(null);
  const didRequestLocationRef = useRef(false);
  const facing: CameraType = 'back';
  const cameraPermission = useCameraPermission();
  const cameraScan = useCameraScan();

  useEffect(() => {
    if (cameraPermission.status === 'undetermined' && !cameraPermission.isLoading) {
      void cameraPermission.requestCameraPermission();
    }
  }, [cameraPermission.status, cameraPermission.isLoading, cameraPermission.requestCameraPermission]);

  useEffect(() => {
    if (cameraPermission.isGranted && cameraScan.locationStatus === 'idle' && !didRequestLocationRef.current) {
      didRequestLocationRef.current = true;
      void cameraScan.requestCurrentLocation();
    }
  }, [cameraPermission.isGranted, cameraScan.locationStatus, cameraScan.requestCurrentLocation]);

  const handleScan = async () => {
    const result = await cameraScan.scanCurrentView(cameraRef);

    if (!result) {
      return;
    }

    router.push({
      pathname: '/result',
      params: { result: serializeResult(result) },
    });
  };

  const permissionErrorMessage = cameraPermission.errorMessage ?? 'Camera access is required to scan what you are seeing.';
  const locationErrorMessage = cameraScan.locationErrorMessage ?? 'Location access is required before taking a scan photo.';
  const isPreparingCamera = cameraPermission.isLoading || cameraPermission.status === 'undetermined';
  const isPreparingLocation =
    cameraPermission.isGranted &&
    !cameraScan.hasLocation &&
    (cameraScan.locationStatus === 'idle' || cameraScan.locationStatus === 'requesting-permission' || cameraScan.locationStatus === 'locating');
  const isScanDisabled = !cameraPermission.isGranted || !cameraScan.hasLocation || cameraScan.isScanning;

  return (
    <ScreenContainer contentContainerStyle={{ flexGrow: 1 }}>
      <Text className="text-sm font-semibold uppercase tracking-[3px] text-brand-700">MVP scan flow</Text>
      <Text className="mt-3 text-3xl font-bold text-slate-950">Scan what I’m seeing</Text>
      <Text className="mt-3 text-base leading-7 text-slate-600">
        Capture a photo, attach your current coordinates, and preview a mock guide result. No AI provider or backend is called.
      </Text>

      {isPreparingCamera ? <LoadingState title="Requesting camera access" message="We need camera permission before showing the preview." /> : null}

      {cameraPermission.isDenied ? (
        <ErrorState title="Camera permission denied" message={permissionErrorMessage} actionLabel="Request camera access" onAction={cameraPermission.requestCameraPermission} />
      ) : null}

      {cameraPermission.isGranted ? (
        <View className="mt-6 gap-4">
          <AppCard className="overflow-hidden bg-slate-950 p-0">
            <View className="h-96 overflow-hidden rounded-card bg-slate-900">
              <CameraView ref={cameraRef} facing={facing} style={StyleSheet.absoluteFill} />
              <View className="absolute inset-0 justify-between p-5">
                <View className="self-start rounded-full bg-black/50 px-4 py-2">
                  <Text className="text-xs font-semibold uppercase tracking-[2px] text-white">Live camera</Text>
                </View>
                <View className="rounded-3xl border border-white/25 bg-black/45 p-4">
                  <Text className="text-sm font-semibold text-white">Location status</Text>
                  <Text className="mt-1 text-sm leading-5 text-slate-200">
                    {cameraScan.hasLocation ? 'Coordinates ready for this scan.' : 'Requesting foreground location permission…'}
                  </Text>
                </View>
              </View>
            </View>
          </AppCard>

          {isPreparingLocation ? (
            <LoadingState title="Getting current location" message="Please allow foreground location access so the mock result can include latitude and longitude." />
          ) : null}

          {cameraScan.locationStatus === 'denied' ? (
            <ErrorState title="Location permission denied" message={locationErrorMessage} actionLabel="Request location access" onAction={cameraScan.requestCurrentLocation} />
          ) : null}

          {cameraScan.locationStatus === 'error' ? (
            <ErrorState title="Location unavailable" message={locationErrorMessage} actionLabel="Try location again" onAction={cameraScan.requestCurrentLocation} />
          ) : null}

          {cameraScan.status === 'error' ? (
            <ErrorState title="Scan failed" message={cameraScan.errorMessage ?? 'Please try again.'} actionLabel="Reset scan" onAction={cameraScan.resetScan} />
          ) : null}

          <AppButton
            title={cameraScan.status === 'capturing' ? 'Taking photo…' : cameraScan.status === 'locating' ? 'Attaching location…' : 'Take photo and view result'}
            accessibilityLabel="Take a scan photo and view the mock AI guide result"
            disabled={isScanDisabled}
            isLoading={cameraScan.isScanning}
            onPress={handleScan}
          />
        </View>
      ) : null}
    </ScreenContainer>
  );
}
