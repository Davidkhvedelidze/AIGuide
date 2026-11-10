import { Text, TextInput, View } from 'react-native';

import { AppButton } from '@/components/ui/AppButton';
import { AppCard } from '@/components/ui/AppCard';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { sampleGuideResult } from '@/features/ai-guide/services/sampleGuideResult';

export default function AskGuideScreen(): JSX.Element {
  return (
    <ScreenContainer>
      <View className="gap-2">
        <Text className="text-3xl font-bold text-slate-950">Ask your guide</Text>
        <Text className="text-base leading-6 text-slate-600">
          Questions should be sent to your backend, where prompts, retrieval, validation, and AI provider keys stay protected.
        </Text>
      </View>

      <AppCard className="gap-3">
        <Text className="text-base font-semibold text-slate-950">Your question</Text>
        <TextInput
          accessibilityLabel="Question for AI guide"
          className="min-h-28 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-base text-slate-950"
          multiline
          placeholder="What should I notice about this landmark?"
          placeholderTextColor="#64748B"
          textAlignVertical="top"
        />
        <AppButton title="Ask securely" />
      </AppCard>

      <AppCard className="gap-3">
        <Text className="text-lg font-semibold text-slate-950">Sample answer</Text>
        <Text className="text-sm leading-6 text-slate-600">{sampleGuideResult.answer}</Text>
        <Text className="text-xs font-semibold uppercase tracking-wide text-brand-700">
          Confidence: {sampleGuideResult.confidence}
        </Text>
      </AppCard>
    </ScreenContainer>
  );
}
