import { useCallback, useState, type RefObject } from 'react';
import type { CameraView } from 'expo-camera';
import { createMockAiGuideResult } from '@/features/ai-guide/services/createMockAiGuideResult';
import { useCurrentLocation } from '@/features/location/hooks/useCurrentLocation';
import type { AiGuideResult } from '@/types';

export type CameraScanStatus = 'idle' | 'capturing' | 'locating' | 'completed' | 'error';

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

        const nextResult = createMockAiGuideResult({ coordinates: scanCoordinates, photoUri: photo.uri });
        setResult(nextResult);
        setStatus('completed');
        return nextResult;
      } catch {
        setStatus('error');
        setErrorMessage('The scan could not be completed. Please try again.');
        return null;
      }
    },
    [coordinates, getCurrentLocation, locationErrorMessage],
  );

  return {
    status,
    result,
    errorMessage,
    isScanning: status === 'capturing' || status === 'locating' || isLocationLoading,
    locationStatus,
    locationErrorMessage,
    hasLocation: coordinates !== null,
    requestCurrentLocation,
    scanCurrentView,
    resetScan,
  };
}
