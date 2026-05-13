import { Link } from 'expo-router';
import { Text, View } from 'react-native';
import { ScreenContainer } from '@/components/layout';
import { AppButton, AppCard } from '@/components/ui';
import { copy } from '@/lib/constants/theme';

export default function HomeScreen() {
  return (
    <ScreenContainer>
      <View className="flex-1 justify-between gap-8">
        <View>
          <Text className="text-sm font-semibold uppercase tracking-[3px] text-brand-700">{copy.appName}</Text>
          <Text className="mt-4 text-4xl font-bold leading-tight text-slate-950">Explore landmarks with trusted AI guidance.</Text>
          <Text className="mt-4 text-base leading-7 text-slate-600">
            Scan a monument, discover nearby places, and ask contextual questions without exposing AI provider secrets in the mobile client.
          </Text>
        </View>

        <AppCard>
          <Text className="text-lg font-semibold text-slate-950">Start your visit</Text>
          <Text className="mt-2 text-sm leading-6 text-slate-600">Use camera and location permissions only when needed. You stay in control.</Text>
          <View className="mt-5 gap-3">
            <Link asChild href="/camera-scan">
              <AppButton title="Scan what I’m seeing" />
            </Link>
            <Link asChild href="/nearby">
              <AppButton title="Places near me" variant="secondary" />
            </Link>
            <Link asChild href="/onboarding">
              <AppButton title="How it works" variant="ghost" />
            </Link>
          </View>
        </AppCard>
      </View>
    </ScreenContainer>
  );
}
