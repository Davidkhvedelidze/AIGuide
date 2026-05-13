import type { GeoCoordinates } from './landmark';

export type AiGuideConfidence = 'high' | 'medium' | 'low';
export type AiGuideScanSource = 'camera' | 'gallery' | 'nearby';

export interface AiGuideCitation {
  label: string;
  url?: string;
}

export interface AiGuideScanMetadata {
  source: AiGuideScanSource;
  coordinates: GeoCoordinates;
  capturedAt: string;
  photoUri?: string;
}

export interface AiGuideResult {
  id: string;
  landmarkId: string;
  title: string;
  summary: string;
  highlights: string[];
  recommendedQuestions: string[];
  confidence: AiGuideConfidence;
  citations: AiGuideCitation[];
  generatedAt: string;
  scan?: AiGuideScanMetadata;
}
