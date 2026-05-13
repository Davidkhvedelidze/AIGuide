import { useCallback, useState, type RefObject } from 'react';
import type { CameraView } from 'expo-camera';
import { analyzeScan } from '@/features/ai-guide/api/aiGuideApi';
import { useCurrentLocation } from '@/features/location/hooks/useCurrentLocation';
import type { AiGuideResult } from '@/types';

export type CameraScanStatus = 'idle' | 'capturing' | 'locating' | 'analyzing' | 'completed' | 'error';

export interface UseCameraScanResult {
  status: CameraScanStatus;
  result: AiGuideResult | null;
  errorMessage: string | null;
  isScanning: boolean;
  locationStatus: ReturnType<typeof useCurrentLocation>['status'];
  locationErrorMessage: string | null;
  hasLocation: boolean;
  requestCurrentLocation: () => Promise<boolean>;
  scanCurrentView: (cameraRef: RefObject<CameraView | null>) => Promise<AiGuideResult | null>;
  resetScan: () => void;
}

const CAMERA_UNAVAILABLE_MESSAGE = 'Camera is not ready yet. Please wait a moment and try again.';
const PHOTO_CAPTURE_FAILED_MESSAGE = 'We could not capture a photo. Please try again.';
const LOCATION_REQUIRED_MESSAGE = 'We could not attach your location to this scan.';
const SCAN_FAILED_MESSAGE = 'The scan could not be completed. Please try again.';

function getDeviceLocale(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().locale || 'en';
  } catch {
    return 'en';
  }
}

export function useCameraScan(): UseCameraScanResult {
  const { coordinates, errorMessage: locationErrorMessage, getCurrentLocation, isLoading: isLocationLoading, status: locationStatus } = useCurrentLocation();
  const [status, setStatus] = useState<CameraScanStatus>('idle');
  const [result, setResult] = useState<AiGuideResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const requestCurrentLocation = useCallback(async () => {
    const nextCoordinates = await getCurrentLocation();
    return nextCoordinates !== null;
  }, [getCurrentLocation]);

  const resetScan = useCallback(() => {
    setStatus('idle');
    setResult(null);
    setErrorMessage(null);
  }, []);

  const scanCurrentView = useCallback(
    async (cameraRef: RefObject<CameraView | null>) => {
      setStatus('capturing');
      setResult(null);
      setErrorMessage(null);

      try {
        const camera = cameraRef.current;

        if (!camera) {
          setStatus('error');
          setErrorMessage(CAMERA_UNAVAILABLE_MESSAGE);
          return null;
        }

        const photo = await camera.takePictureAsync({ quality: 0.85, skipProcessing: false });

        if (!photo?.uri) {
          setStatus('error');
          setErrorMessage(PHOTO_CAPTURE_FAILED_MESSAGE);
          return null;
        }

        setStatus('locating');
        const scanCoordinates = coordinates ?? (await getCurrentLocation());

        if (!scanCoordinates) {
          setStatus('error');
          setErrorMessage(locationErrorMessage ?? LOCATION_REQUIRED_MESSAGE);
          return null;
        }

        setStatus('analyzing');
        const scanResponse = await analyzeScan({
          photoUri: photo.uri,
          latitude: scanCoordinates.latitude,
          longitude: scanCoordinates.longitude,
          locale: getDeviceLocale(),
        });

        if (!scanResponse.success) {
          setStatus('error');
          setErrorMessage(scanResponse.error.message);
          return null;
        }

        setResult(scanResponse.data);
        setStatus('completed');
        return scanResponse.data;
      } catch {
        setStatus('error');
        setErrorMessage(SCAN_FAILED_MESSAGE);
        return null;
      }
    },
    [coordinates, getCurrentLocation, locationErrorMessage],
  );

  return {
    status,
    result,
    errorMessage,
    isScanning: status === 'capturing' || status === 'locating' || status === 'analyzing' || isLocationLoading,
    locationStatus,
    locationErrorMessage,
    hasLocation: coordinates !== null,
    requestCurrentLocation,
    scanCurrentView,
    resetScan,
  };
}
