import { useCallback, useRef, useState, type RefObject } from 'react';
import type { CameraView } from 'expo-camera';

import { useCameraPermission } from '@/features/camera/hooks/useCameraPermission';
import { createMockAiGuideResult } from '@/features/guide/services/createMockAiGuideResult';
import type { AiGuideResult } from '@/features/guide/types/AiGuideResult';
import { useCurrentLocation } from '@/features/location/hooks/useCurrentLocation';

type CameraScanStatus = 'idle' | 'requesting-permissions' | 'capturing-photo' | 'building-result' | 'complete' | 'error';

interface UseCameraScanResult {
  cameraRef: RefObject<CameraView | null>;
  status: CameraScanStatus;
  errorMessage: string | null;
  isPreparing: boolean;
  isScanning: boolean;
  hasCameraPermission: boolean;
  isCameraPermissionDenied: boolean;
  isLocationPermissionDenied: boolean;
  requestRequiredPermissions: () => Promise<boolean>;
  scanCurrentView: () => Promise<AiGuideResult | null>;
  clearError: () => void;
}

const CAMERA_NOT_READY_MESSAGE = 'The camera is still getting ready. Please try again in a moment.';
const PHOTO_CAPTURE_ERROR_MESSAGE = 'We could not capture a photo. Please try again.';

export function useCameraScan(): UseCameraScanResult {
  const cameraRef = useRef<CameraView | null>(null);
  const [status, setStatus] = useState<CameraScanStatus>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const {
    hasCameraPermission,
    isCameraPermissionDenied,
    requestCameraPermission,
    isCheckingCameraPermission,
  } = useCameraPermission();
  const {
    requestCurrentLocation,
    isLocationPermissionDenied,
    isLoadingLocation,
    errorMessage: locationErrorMessage,
    resetLocationError,
  } = useCurrentLocation();

  const clearError = useCallback(() => {
    setErrorMessage(null);
    resetLocationError();
    setStatus((currentStatus) => (currentStatus === 'error' ? 'idle' : currentStatus));
  }, [resetLocationError]);

  const requestRequiredPermissions = useCallback(async () => {
    setErrorMessage(null);
    setStatus('requesting-permissions');

    const cameraGranted = hasCameraPermission || (await requestCameraPermission());

    if (!cameraGranted) {
      setStatus('idle');
      return false;
    }

    const coordinates = await requestCurrentLocation();
    setStatus('idle');

    return coordinates !== null;
  }, [hasCameraPermission, requestCameraPermission, requestCurrentLocation]);

  const scanCurrentView = useCallback(async () => {
    setErrorMessage(null);

    const permissionsGranted = await requestRequiredPermissions();

    if (!permissionsGranted) {
      return null;
    }

    if (!cameraRef.current) {
      setErrorMessage(CAMERA_NOT_READY_MESSAGE);
      setStatus('error');
      return null;
    }

    try {
      setStatus('capturing-photo');
      const photo = await cameraRef.current.takePictureAsync({ quality: 0.82 });

      if (!photo?.uri) {
        throw new Error('Camera returned an empty photo URI.');
      }

      setStatus('building-result');
      const coordinates = await requestCurrentLocation();

      if (!coordinates) {
        setStatus('idle');
        return null;
      }

      const result = createMockAiGuideResult({ photoUri: photo.uri, location: coordinates });
      setStatus('complete');
      return result;
    } catch {
      setErrorMessage(PHOTO_CAPTURE_ERROR_MESSAGE);
      setStatus('error');
      return null;
    }
  }, [requestCurrentLocation, requestRequiredPermissions]);

  return {
    cameraRef,
    status,
    errorMessage: errorMessage ?? locationErrorMessage,
    isPreparing: status === 'requesting-permissions' || isCheckingCameraPermission || isLoadingLocation,
    isScanning: status === 'capturing-photo' || status === 'building-result',
    hasCameraPermission,
    isCameraPermissionDenied,
    isLocationPermissionDenied,
    requestRequiredPermissions,
    scanCurrentView,
    clearError,
  };
}
