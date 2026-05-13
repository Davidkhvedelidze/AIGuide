export type CtaAction = 'whatsapp' | 'book_private_guide' | 'custom_itinerary';

export interface AiGuideResult {
  detectedLandmarkId: string | null;
  detectedLandmarkName: string | null;
  confidence: number;
  isUncertain: boolean;
  shortExplanation: string;
  localGuideStory: string;
  interestingFacts: string[];
  bestTimeToVisit: string;
  nearbyPlaces: {
    id: string;
    name: string;
    distanceMeters: number;
  }[];
  followUpSuggestions: string[];
  cta: {
    title: string;
    message: string;
    action: CtaAction;
  };
}

export interface NearbyLandmarkRow {
  id: string;
  name: string;
  short_description: string;
  full_story: string;
  interesting_facts: string[] | null;
  best_time_to_visit: string;
  distance_meters: number;
}
