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
  generatedAt: new Date().toISOString(),
});

function isAiGuideResult(value: unknown): value is AiGuideResult {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const candidate = value as Partial<AiGuideResult>;

  return (
    typeof candidate.id === 'string' &&
    typeof candidate.title === 'string' &&
    typeof candidate.summary === 'string' &&
    Array.isArray(candidate.highlights) &&
    Array.isArray(candidate.recommendedQuestions) &&
    typeof candidate.generatedAt === 'string'
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

export default function ResultScreen() {
  const params = useLocalSearchParams<{ result?: string }>();
  const scanResult = parseResultParam(params.result);
  const result = scanResult ?? fallbackResult;
  const coordinates = result.scan?.coordinates;

  return (
    <ScreenContainer>
      {!scanResult ? (
        <ErrorState
          title="Showing mock sample"
          message="No scan result was passed to this screen, so the app is displaying a local sample result. Start from the camera scan flow for a live photo and current coordinates."
        />
      ) : null}

      <Text className="mt-6 text-sm font-semibold uppercase tracking-[3px] text-brand-700">Confidence: {result.confidence}</Text>
      <Text className="mt-3 text-3xl font-bold text-slate-950">{result.title}</Text>
      <Text className="mt-4 text-base leading-7 text-slate-600">{result.summary}</Text>

      {coordinates ? (
        <AppCard className="mt-6">
          <Text className="text-lg font-semibold text-slate-950">Scan details</Text>
          <Text className="mt-3 text-base leading-6 text-slate-700">Latitude: {coordinates.latitude.toFixed(6)}</Text>
          <Text className="mt-2 text-base leading-6 text-slate-700">Longitude: {coordinates.longitude.toFixed(6)}</Text>
          <Text className="mt-2 text-base leading-6 text-slate-700">Captured: {new Date(result.scan?.capturedAt ?? result.generatedAt).toLocaleString()}</Text>
          {result.scan?.photoUri ? <Text className="mt-2 text-xs leading-5 text-slate-500">Photo URI: {result.scan.photoUri}</Text> : null}
        </AppCard>
      ) : null}

      <View className="mt-6 gap-4">
        <AppCard>
          <Text className="text-lg font-semibold text-slate-950">Highlights</Text>
          {result.highlights.map((highlight) => (
            <Text key={highlight} className="mt-3 text-base leading-6 text-slate-700">
              • {highlight}
            </Text>
          ))}
        </AppCard>

        <AppCard>
          <Text className="text-lg font-semibold text-slate-950">Questions to ask next</Text>
          {result.recommendedQuestions.map((question) => (
            <Text key={question} className="mt-3 text-base leading-6 text-slate-700">
              • {question}
            </Text>
          ))}
        </AppCard>

        <AppCard>
          <Text className="text-lg font-semibold text-slate-950">Sources</Text>
          {result.citations.map((citation) => (
            <Text key={citation.label} className="mt-3 text-sm leading-5 text-slate-600">
              • {citation.label}
            </Text>
          ))}
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
