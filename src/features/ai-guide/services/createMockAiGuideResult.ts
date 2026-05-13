import type { AiGuideResult, GeoCoordinates } from '@/types';

interface CreateMockAiGuideResultParams {
  coordinates: GeoCoordinates;
  photoUri?: string;
  generatedAt?: string;
}

export function createMockAiGuideResult({ coordinates, photoUri, generatedAt = new Date().toISOString() }: CreateMockAiGuideResultParams): AiGuideResult {
  return {
    id: `mock-scan-${Date.now()}`,
    landmarkId: 'mock-nearby-landmark',
    title: 'Mock landmark scan result',
    summary:
      'This is a local MVP result generated on device after capturing a photo and reading your current location. No backend, AI provider, API key, or Supabase project is connected yet.',
    highlights: [
      'Photo capture completed with Expo Camera.',
      `Current position attached: ${coordinates.latitude.toFixed(5)}, ${coordinates.longitude.toFixed(5)}.`,
      'Future versions can send this scan to a secure backend for verified landmark identification.',
    ],
    recommendedQuestions: [
      'What is the history of this place?',
      'What details should I look at first?',
      'What nearby stop should I visit next?',
    ],
    confidence: 'low',
    citations: [{ label: 'Local mock data — replace with trusted backend sources before production AI responses.' }],
    generatedAt,
    scan: {
      source: 'camera',
      coordinates,
      capturedAt: generatedAt,
      ...(photoUri ? { photoUri } : {}),
    },
  };
}
