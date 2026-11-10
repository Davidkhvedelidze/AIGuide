import { Link, useLocalSearchParams } from 'expo-router';
import { Text, View } from 'react-native';
import { ScreenContainer } from '@/components/layout';
import { AppButton, AppCard, ErrorState } from '@/components/ui';
import { createMockAiGuideResult } from '@/features/ai-guide';
import type { AiGuideResult } from '@/types';

const fallbackResult: AiGuideResult = createMockAiGuideResult({
  coordinates: {
    latitude: 40.75801,
    longitude: -73.9855,
  },
});

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === 'string');
}

function isAiGuideResult(value: unknown): value is AiGuideResult {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const candidate = value as Partial<AiGuideResult>;

  return (
    (typeof candidate.detectedLandmarkId === 'string' || candidate.detectedLandmarkId === null) &&
    (typeof candidate.detectedLandmarkName === 'string' || candidate.detectedLandmarkName === null) &&
    typeof candidate.confidence === 'number' &&
    typeof candidate.isUncertain === 'boolean' &&
    typeof candidate.shortExplanation === 'string' &&
    typeof candidate.localGuideStory === 'string' &&
    isStringArray(candidate.interestingFacts) &&
    typeof candidate.bestTimeToVisit === 'string' &&
    Array.isArray(candidate.nearbyPlaces) &&
    isStringArray(candidate.followUpSuggestions) &&
    !!candidate.cta &&
    typeof candidate.cta.title === 'string' &&
    typeof candidate.cta.message === 'string'
  );
}

function parseResultParam(param: string | string[] | undefined): AiGuideResult | null {
  if (!param || Array.isArray(param)) {
    return null;
  }

  try {
    const parsed = JSON.parse(decodeURIComponent(param)) as unknown;
    return isAiGuideResult(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

function formatConfidence(confidence: number): string {
  return `${Math.round(confidence * 100)}%`;
}

export default function ResultScreen() {
  const params = useLocalSearchParams<{ result?: string }>();
  const scanResult = parseResultParam(params.result);
  const result = scanResult ?? fallbackResult;

  return (
    <ScreenContainer>
      {!scanResult ? (
        <ErrorState
          title="Showing sample result"
          message="No backend scan result was passed to this screen. Start from the camera scan flow to upload a real photo and receive the secure AI guide result."
        />
      ) : null}

      <Text className="mt-6 text-sm font-semibold uppercase tracking-[3px] text-brand-700">
        Confidence: {formatConfidence(result.confidence)} {result.isUncertain ? '• Uncertain' : ''}
      </Text>
      <Text className="mt-3 text-3xl font-bold text-slate-950">{result.detectedLandmarkName ?? 'Landmark not detected'}</Text>
      <Text className="mt-4 text-base leading-7 text-slate-600">{result.shortExplanation}</Text>

      {result.isUncertain ? (
        <AppCard className="mt-5 border border-amber-200 bg-amber-50">
          <Text className="text-base font-semibold text-amber-950">Uncertain result</Text>
          <Text className="mt-2 text-sm leading-6 text-amber-900">
            This scan may need confirmation. Try another angle, move closer to the landmark, or ask a local guide before relying on this match.
          </Text>
        </AppCard>
      ) : null}

      <View className="mt-6 gap-4">
        <AppCard>
          <Text className="text-lg font-semibold text-slate-950">Local guide story</Text>
          <Text className="mt-3 text-base leading-7 text-slate-700">{result.localGuideStory}</Text>
        </AppCard>

        <AppCard>
          <Text className="text-lg font-semibold text-slate-950">Interesting facts</Text>
          {result.interestingFacts.map((fact) => (
            <Text key={fact} className="mt-3 text-base leading-6 text-slate-700">
              • {fact}
            </Text>
          ))}
        </AppCard>

        <AppCard>
          <Text className="text-lg font-semibold text-slate-950">Best time to visit</Text>
          <Text className="mt-3 text-base leading-6 text-slate-700">{result.bestTimeToVisit}</Text>
        </AppCard>

        {result.nearbyPlaces.length > 0 ? (
          <AppCard>
            <Text className="text-lg font-semibold text-slate-950">Nearby places</Text>
            {result.nearbyPlaces.map((place) => (
              <Text key={place.id} className="mt-3 text-base leading-6 text-slate-700">
                • {place.name} — {Math.round(place.distanceMeters)} m away
              </Text>
            ))}
          </AppCard>
        ) : null}

        <AppCard>
          <Text className="text-lg font-semibold text-slate-950">Questions to ask next</Text>
          {result.followUpSuggestions.map((suggestion) => (
            <Text key={suggestion} className="mt-3 text-base leading-6 text-slate-700">
              • {suggestion}
            </Text>
          ))}
        </AppCard>

        <AppCard>
          <Text className="text-lg font-semibold text-slate-950">{result.cta.title}</Text>
          <Text className="mt-3 text-base leading-6 text-slate-700">{result.cta.message}</Text>
        </AppCard>
      </View>

      <View className="mt-6 gap-3">
        <Link asChild href="/camera-scan">
          <AppButton title="Scan again" />
        </Link>
        <Link asChild href="/ask-guide">
          <AppButton title="Ask the guide" variant="secondary" />
        </Link>
      </View>
    </ScreenContainer>
  );
}
