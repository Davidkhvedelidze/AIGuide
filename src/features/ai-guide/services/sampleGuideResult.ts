import type { AiGuideResult } from '@/types/domain';

export const sampleGuideResult: AiGuideResult = {
  id: 'guide-eiffel-intro',
  landmarkId: 'eiffel-tower',
  answer:
    'The Eiffel Tower was designed as a temporary centerpiece for the 1889 Paris exposition, but its engineering value and public appeal helped it become a permanent symbol of the city.',
  locale: 'en-US',
  confidence: 'high',
  citations: [
    {
      title: 'Trusted Landmark Catalog',
      sourceId: 'trusted-landmark-catalog',
    },
  ],
  generatedAt: new Date().toISOString(),
};
