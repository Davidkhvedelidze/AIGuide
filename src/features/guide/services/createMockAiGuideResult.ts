import type { AiGuideResult, GeoCoordinates } from '@/features/guide/types/AiGuideResult';

interface CreateMockAiGuideResultInput {
  photoUri: string;
  location: GeoCoordinates;
}

export function createMockAiGuideResult({ photoUri, location }: CreateMockAiGuideResultInput): AiGuideResult {
  const createdAt = new Date().toISOString();

  return {
    id: `mock-scan-${createdAt}`,
    title: 'A nearby point of interest',
    summary:
      'This is a local MVP preview. In the full experience, AI Guide will identify what you scanned and explain its history, design details, and nearby context.',
    highlights: [
      'Photo capture succeeded using Expo Camera.',
      'Foreground coordinates were attached using Expo Location.',
      'No backend, API keys, Supabase, or OpenAI requests were used.',
    ],
    location,
    photoUri,
    confidenceLabel: 'Mock preview',
    createdAt,
  };
}
