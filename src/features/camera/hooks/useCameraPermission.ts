import { useCallback } from 'react';
import { useCameraPermissions } from 'expo-camera';

interface UseCameraPermissionResult {
  isCheckingCameraPermission: boolean;
  hasCameraPermission: boolean;
  isCameraPermissionDenied: boolean;
  requestCameraPermission: () => Promise<boolean>;
}

export function useCameraPermission(): UseCameraPermissionResult {
  const [permission, requestPermission] = useCameraPermissions();

  const requestCameraPermission = useCallback(async () => {
    const response = await requestPermission();
    return response.granted;
  }, [requestPermission]);

  return {
    isCheckingCameraPermission: permission === null,
    hasCameraPermission: permission?.granted ?? false,
    isCameraPermissionDenied: permission !== null && !permission.granted && permission.status !== 'undetermined',
    requestCameraPermission,
  };
}
