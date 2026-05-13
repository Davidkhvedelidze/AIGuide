import { Text, TextInput, View } from 'react-native';
import { ScreenContainer } from '@/components/layout';
import { AppButton, AppCard } from '@/components/ui';

export default function AskGuideScreen() {
  return (
    <ScreenContainer>
      <Text className="text-3xl font-bold text-slate-950">Ask your guide</Text>
      <Text className="mt-3 text-base leading-7 text-slate-600">
        Questions should be sent to a backend endpoint that validates input, enriches with trusted landmark data, and calls AI providers securely.
      </Text>

      <AppCard className="mt-6">
        <Text className="text-base font-semibold text-slate-950">Your question</Text>
        <TextInput
          accessibilityLabel="Question for AI guide"
          className="mt-3 min-h-28 rounded-2xl border border-slate-200 bg-white p-4 text-base text-slate-950"
          multiline
          placeholder="What should I know before visiting?"
          placeholderTextColor="#64748b"
          textAlignVertical="top"
        />
        <AppButton className="mt-4" title="Send securely" />
      </AppCard>

      <View className="mt-5 rounded-2xl bg-brand-50 p-4">
        <Text className="text-sm font-semibold text-brand-700">Security note</Text>
        <Text className="mt-2 text-sm leading-5 text-brand-700">The mobile app never stores OpenAI or other AI provider API keys.</Text>
      </View>
    </ScreenContainer>
  );
}
