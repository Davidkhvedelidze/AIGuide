import type { CameraView } from 'expo-camera';
import { ImageManipulator, SaveFormat } from 'expo-image-manipulator';
import { useCallback, useState, type RefObject } from 'react';

import { api } from '@/data/api';
import type { Coords, ScanResult } from '@/data/types';
import { track } from '@/services/analytics';
import { useApp } from '@/store/app';

export type ScanState =
  | { phase: 'idle' }
  | { phase: 'analyzing' }
  | { phase: 'result'; result: ScanResult }
  | { phase: 'error'; message: string };

const MAX_SIDE = 1024;

/** Shrinks the photo before upload: recognition does not need more, and it keeps scans fast on mobile data. */
async function toUploadJpeg(uri: string, width: number, height: number): Promise<string> {
  const context = ImageManipulator.manipulate(uri);
  if (Math.max(width, height) > MAX_SIDE) {
    context.resize(width >= height ? { width: MAX_SIDE } : { height: MAX_SIDE });
  }
  const image = await context.renderAsync();
  const saved = await image.saveAsync({ format: SaveFormat.JPEG, compress: 0.7, base64: true });
  if (!saved.base64) throw new Error('Could not encode the photo');
  return saved.base64;
}

export function useScan(camera: RefObject<CameraView | null>, coords: Coords | null) {
  const [state, setState] = useState<ScanState>({ phase: 'idle' });

  const scan = useCallback(async () => {
    setState({ phase: 'analyzing' });
    track('scan_started', { has_location: coords !== null });
    try {
      const photo = await camera.current?.takePictureAsync({ quality: 0.8, skipProcessing: false });
      if (!photo) throw new Error('Camera is not ready');
      const imageBase64 = await toUploadJpeg(photo.uri, photo.width, photo.height);
      const result = await api.scan({ imageBase64, coords, locale: useApp.getState().locale });
      if (result.status === 'recognized') track('scan_recognized', { place_id: result.placeId, confidence: result.confidence });
      else if (result.status === 'candidates') track('scan_candidates', { count: result.placeIds.length });
      else if (result.status === 'limit_reached') track('scan_limit_reached');
      else track('scan_failed', { reason: 'not_recognized' });
      setState({ phase: 'result', result });
      return result;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      track('scan_failed', { reason: message });
      setState({ phase: 'error', message });
      return null;
    }
  }, [camera, coords]);

  const reset = useCallback(() => setState({ phase: 'idle' }), []);

  return { state, scan, reset };
}
