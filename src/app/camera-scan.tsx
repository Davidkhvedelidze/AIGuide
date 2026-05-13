import { Link } from 'expo-router';
import { Text, View } from 'react-native';
import { ScreenContainer } from '@/components/layout';
import { AppButton, AppCard, ErrorState } from '@/components/ui';

export default function CameraScanScreen() {
  return (
    <ScreenContainer>
      <Text className="text-3xl font-bold text-slate-950">Scan a landmark</Text>
      <Text className="mt-3 text-base leading-7 text-slate-600">
        Camera capture will live in the camera feature module. This placeholder keeps permission UX explicit before adding scanner logic.
      </Text>

      <AppCard className="mt-6 min-h-72 items-center justify-center bg-slate-900">
        <View className="h-40 w-40 rounded-3xl border-2 border-dashed border-white/70" />
        <Text className="mt-5 text-center text-base font-semibold text-white">Camera preview placeholder</Text>
        <Text className="mt-2 text-center text-sm leading-5 text-slate-300">Add Expo Camera here without moving AI secrets into the client.</Text>
      </AppCard>

      <ErrorState
        title="Permission flow pending"
        message="The camera module is scaffolded. Add a feature hook to request and handle camera permission states before enabling scans."
      />

      <Link asChild href="/result">
        <AppButton className="mt-6" title="View sample result" />
      </Link>
    </ScreenContainer>
  );
}
