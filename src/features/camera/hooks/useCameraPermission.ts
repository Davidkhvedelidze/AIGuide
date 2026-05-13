import { useCallback, useMemo, useState } from 'react';
import { useCameraPermissions } from 'expo-camera';

export type CameraPermissionStatus = 'loading' | 'undetermined' | 'granted' | 'denied';

export interface UseCameraPermissionResult {
  status: CameraPermissionStatus;
  isLoading: boolean;
  isGranted: boolean;
  isDenied: boolean;
  errorMessage: string | null;
  requestCameraPermission: () => Promise<boolean>;
}

export function useCameraPermission(): UseCameraPermissionResult {
  const [permission, requestPermission] = useCameraPermissions();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isRequesting, setIsRequesting] = useState(false);

  const status = useMemo<CameraPermissionStatus>(() => {
    if (permission === null) {
      return 'loading';
    }

    if (permission.granted) {
      return 'granted';
    }

    return permission.status === 'denied' ? 'denied' : 'undetermined';
  }, [permission]);

  const requestCameraPermission = useCallback(async () => {
    setIsRequesting(true);
    setErrorMessage(null);

    try {
      const response = await requestPermission();
      return response.granted;
    } catch {
      setErrorMessage('We could not request camera access. Please try again or update permissions in Settings.');
      return false;
    } finally {
      setIsRequesting(false);
    }
  }, [requestPermission]);

  return {
    status,
    isLoading: status === 'loading' || isRequesting,
    isGranted: status === 'granted',
    isDenied: status === 'denied',
    errorMessage,
    requestCameraPermission,
  };
}
