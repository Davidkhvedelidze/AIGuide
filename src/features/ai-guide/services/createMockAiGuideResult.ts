import type { AiGuideResult, GeoCoordinates } from '@/types';

interface CreateMockAiGuideResultParams {
  coordinates: GeoCoordinates;
}

export function createMockAiGuideResult({ coordinates }: CreateMockAiGuideResultParams): AiGuideResult {
  return {
    detectedLandmarkId: null,
    detectedLandmarkName: null,
    confidence: 0,
    isUncertain: true,
    shortExplanation: `This fallback sample was generated locally for coordinates ${coordinates.latitude.toFixed(5)}, ${coordinates.longitude.toFixed(5)} because no backend scan result was provided.`,
    localGuideStory: 'Start from the camera scan screen to upload a real photo to the secure Supabase Edge Function and receive the backend mock response.',
    interestingFacts: ['The production scan contract is already shaped like the future AI response.', 'OpenAI integration is intentionally not connected in this MVP backend flow.'],
    bestTimeToVisit: 'Try scanning during daylight for the clearest photo and best future recognition quality.',
    nearbyPlaces: [],
    followUpSuggestions: ['Scan a landmark nearby', 'Move closer to a known place', 'Try again with a clearer photo'],
    cta: {
      title: 'Plan with a local guide',
      message: 'When you are ready, we can turn this scan into a guided route.',
      action: 'custom_itinerary',
    },
  };
}
