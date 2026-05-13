export interface GeoCoordinates {
  latitude: number;
  longitude: number;
}

export interface AiGuideResult {
  id: string;
  title: string;
  summary: string;
  highlights: string[];
  location: GeoCoordinates;
  photoUri: string;
  confidenceLabel: 'Mock preview';
  createdAt: string;
}

export function isAiGuideResult(value: unknown): value is AiGuideResult {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const result = value as Partial<AiGuideResult>;

  return (
    typeof result.id === 'string' &&
    typeof result.title === 'string' &&
    typeof result.summary === 'string' &&
    Array.isArray(result.highlights) &&
    result.highlights.every((highlight) => typeof highlight === 'string') &&
    typeof result.photoUri === 'string' &&
    result.confidenceLabel === 'Mock preview' &&
    typeof result.createdAt === 'string' &&
    Boolean(result.location) &&
    typeof result.location?.latitude === 'number' &&
    typeof result.location?.longitude === 'number'
  );
}
