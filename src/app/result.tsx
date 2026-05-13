import { Link } from 'expo-router';
import { Text, View } from 'react-native';
import { ScreenContainer } from '@/components/layout';
import { AppButton, AppCard } from '@/components/ui';
import type { AiGuideResult } from '@/types';

const sampleResult: AiGuideResult = {
  id: 'sample-ai-guide-result',
  landmarkId: 'sample-landmark',
  title: 'Sample landmark briefing',
  summary: 'Your backend should return verified context, source citations, and confidence indicators before this screen renders production content.',
  highlights: ['Historically relevant overview', 'Visitor-friendly context', 'Clear confidence labeling'],
  recommendedQuestions: ['What should I notice first?', 'How long should I spend here?', 'What nearby landmark pairs well with this stop?'],
  confidence: 'medium',
  citations: [{ label: 'Backend-supplied trusted source' }],
  generatedAt: new Date().toISOString(),
};

export default function ResultScreen() {
  return (
    <ScreenContainer>
      <Text className="text-sm font-semibold uppercase tracking-[3px] text-brand-700">Confidence: {sampleResult.confidence}</Text>
      <Text className="mt-3 text-3xl font-bold text-slate-950">{sampleResult.title}</Text>
      <Text className="mt-4 text-base leading-7 text-slate-600">{sampleResult.summary}</Text>

      <View className="mt-6 gap-4">
        <AppCard>
          <Text className="text-lg font-semibold text-slate-950">Highlights</Text>
          {sampleResult.highlights.map((highlight) => (
            <Text key={highlight} className="mt-3 text-base leading-6 text-slate-700">• {highlight}</Text>
          ))}
        </AppCard>

        <AppCard>
          <Text className="text-lg font-semibold text-slate-950">Questions to ask next</Text>
          {sampleResult.recommendedQuestions.map((question) => (
            <Text key={question} className="mt-3 text-base leading-6 text-slate-700">• {question}</Text>
          ))}
        </AppCard>
      </View>

      <Link asChild href="/ask-guide">
        <AppButton className="mt-6" title="Ask the guide" />
      </Link>
    </ScreenContainer>
  );
}
