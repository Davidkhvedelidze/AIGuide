export type AiGuideConfidence = 'high' | 'medium' | 'low';

export interface AiGuideCitation {
  label: string;
  url?: string;
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
}
