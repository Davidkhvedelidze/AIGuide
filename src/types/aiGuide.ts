export type AiGuideCtaAction = 'whatsapp' | 'book_private_guide' | 'custom_itinerary';

export interface AiGuideNearbyPlace {
  id: string;
  name: string;
  distanceMeters: number;
}

export interface AiGuideCta {
  title: string;
  message: string;
  action: AiGuideCtaAction;
}

export interface AiGuideResult {
  detectedLandmarkId: string | null;
  detectedLandmarkName: string | null;
  confidence: number;
  isUncertain: boolean;
  shortExplanation: string;
  localGuideStory: string;
  interestingFacts: string[];
  bestTimeToVisit: string;
  nearbyPlaces: AiGuideNearbyPlace[];
  followUpSuggestions: string[];
  cta: AiGuideCta;
}
