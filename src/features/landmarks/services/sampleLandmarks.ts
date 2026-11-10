import type { Landmark } from '@/types/domain';

export const featuredLandmark: Landmark = {
  id: 'eiffel-tower',
  name: 'Eiffel Tower',
  description: 'A wrought-iron landmark in Paris known for its engineering history and city views.',
  coordinates: {
    latitude: 48.8584,
    longitude: 2.2945,
  },
  countryCode: 'FR',
  category: 'monument',
  confidence: 'high',
  sourceIds: ['trusted-landmark-catalog'],
  translations: [
    {
      locale: 'en-US',
      name: 'Eiffel Tower',
      summary: 'Completed in 1889, the Eiffel Tower remains one of the most recognizable landmarks in the world.',
      historicalContext: 'It was originally built for the Exposition Universelle in Paris.',
    },
  ],
  updatedAt: new Date().toISOString(),
};

export const nearbyLandmarks: Landmark[] = [
  featuredLandmark,
  {
    id: 'louvre-museum',
    name: 'Louvre Museum',
    description: 'A historic palace and art museum housing globally significant collections.',
    coordinates: {
      latitude: 48.8606,
      longitude: 2.3376,
    },
    countryCode: 'FR',
    category: 'museum',
    confidence: 'high',
    sourceIds: ['trusted-landmark-catalog'],
    translations: [],
    updatedAt: new Date().toISOString(),
  },
];
