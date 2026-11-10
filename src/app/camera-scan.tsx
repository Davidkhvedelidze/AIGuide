import { router } from 'expo-router';
import { Text, View } from 'react-native';

import { AppButton } from '@/components/ui/AppButton';
import { AppCard } from '@/components/ui/AppCard';
import { ErrorState } from '@/components/ui/ErrorState';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { ROUTES } from '@/lib/constants/routes';

export default function CameraScanScreen(): JSX.Element {
  return (
    <ScreenContainer>
      <View className="gap-2">
        <Text className="text-3xl font-bold text-slate-950">Scan a landmark</Text>
        <Text className="text-base leading-6 text-slate-600">
          Camera integration belongs in the camera feature. This route is ready for Expo Camera permission and capture flows.
        </Text>
      </View>

      <AppCard className="min-h-72 items-center justify-center gap-4 border-dashed bg-slate-100">
        <Text className="text-center text-lg font-semibold text-slate-800">Camera preview placeholder</Text>
        <Text className="text-center text-sm leading-5 text-slate-600">
          Add Expo Camera here and show denied-permission states before starting capture.
        </Text>
      </AppCard>

      <ErrorState
        title="Permission-aware by design"
        message="Request camera access only when the user starts scanning, then provide clear next steps if access is denied."
      />

      <AppButton title="Use sample result" onPress={() => router.push(ROUTES.result)} />
    </ScreenContainer>
  );
}
