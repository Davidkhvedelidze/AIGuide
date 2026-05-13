import { env } from '@/lib/env';
import { requestFormDataJson, type ApiResult } from '@/lib/services/http';
import type { AiGuideResult } from '@/types';

export interface AnalyzeScanParams {
  photoUri: string;
  latitude: number;
  longitude: number;
  locale: string;
}

interface ReactNativeFormDataFile {
  uri: string;
  name: string;
  type: string;
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === 'string');
}

function isNearbyPlaces(value: unknown): value is AiGuideResult['nearbyPlaces'] {
  return (
    Array.isArray(value) &&
    value.every(
      (item) =>
        item &&
        typeof item === 'object' &&
        typeof (item as { id?: unknown }).id === 'string' &&
        typeof (item as { name?: unknown }).name === 'string' &&
        typeof (item as { distanceMeters?: unknown }).distanceMeters === 'number',
    )
  );
}

function isAiGuideResult(value: unknown): value is AiGuideResult {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const candidate = value as Partial<AiGuideResult>;

  return (
    (typeof candidate.detectedLandmarkId === 'string' || candidate.detectedLandmarkId === null) &&
    (typeof candidate.detectedLandmarkName === 'string' || candidate.detectedLandmarkName === null) &&
    typeof candidate.confidence === 'number' &&
    typeof candidate.isUncertain === 'boolean' &&
    typeof candidate.shortExplanation === 'string' &&
    typeof candidate.localGuideStory === 'string' &&
    isStringArray(candidate.interestingFacts) &&
    typeof candidate.bestTimeToVisit === 'string' &&
    isNearbyPlaces(candidate.nearbyPlaces) &&
    isStringArray(candidate.followUpSuggestions) &&
    !!candidate.cta &&
    typeof candidate.cta.title === 'string' &&
    typeof candidate.cta.message === 'string' &&
    (candidate.cta.action === 'whatsapp' || candidate.cta.action === 'book_private_guide' || candidate.cta.action === 'custom_itinerary')
  );
}

export async function analyzeScan(params: AnalyzeScanParams): Promise<ApiResult<AiGuideResult>> {
  const formData = new FormData();
  const imageFile: ReactNativeFormDataFile = {
    uri: params.photoUri,
    name: 'scan.jpg',
    type: 'image/jpeg',
  };

  formData.append('image', imageFile as unknown as Blob);
  formData.append('latitude', String(params.latitude));
  formData.append('longitude', String(params.longitude));
  formData.append('locale', params.locale);

  const response = await requestFormDataJson<unknown>(env.analyzeScanUrl, formData);

  if (!response.success) {
    return response;
  }

  if (!isAiGuideResult(response.data)) {
    return {
      success: false,
      error: {
        code: 'INVALID_RESPONSE',
        message: 'The scan service returned an unexpected response. Please try again.',
      },
    };
  }

  return { success: true, data: response.data };
}
