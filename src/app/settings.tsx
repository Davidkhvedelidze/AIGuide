import { router } from 'expo-router';
import { Alert, Linking, Platform, ScrollView, StyleSheet, View } from 'react-native';

import { Button, Card, Chip, Header, ListRow, Screen, SectionHeader } from '@/components/ui';
import { supabase } from '@/data/supabase';
import { deleteRemoteAccount } from '@/data/sync';
import type { Locale } from '@/data/types';
import { usePlayer } from '@/features/audio/player';
import { useT } from '@/i18n';
import { track } from '@/services/analytics';
import { SPEEDS, useApp } from '@/store/app';
import { useLibrary } from '@/store/library';
import { spacing } from '@/theme/tokens';

const LANGUAGES: { id: Locale; label: string }[] = [
  { id: 'en', label: 'English' },
  { id: 'ka', label: 'ქართული' },
];

const PRIVACY_URL = process.env.EXPO_PUBLIC_PRIVACY_URL;
const SUPPORT_EMAIL = process.env.EXPO_PUBLIC_SUPPORT_EMAIL;

export default function SettingsScreen() {
  const t = useT();
  const { locale, setLocale, defaultSpeed, setDefaultSpeed, email, reset } = useApp();
  const clearAll = useLibrary((s) => s.clearAll);

  const wipe = async () => {
    try {
      await deleteRemoteAccount();
    } catch (error) {
      track('error', { where: 'delete_account', message: error instanceof Error ? error.message : String(error) });
      if (Platform.OS !== 'web') Alert.alert(t('common.errorTitle'), t('common.errorBody'));
      return;
    }
    usePlayer.getState().stop();
    clearAll();
    reset();
    router.replace('/onboarding');
  };

  const confirmWipe = () => {
    if (Platform.OS === 'web') return void wipe();
    Alert.alert(t('settings.deleteTitle'), t('settings.deleteBody'), [
      { text: t('common.cancel'), style: 'cancel' },
      { text: t('common.delete'), style: 'destructive', onPress: () => void wipe() },
    ]);
  };

  return (
    <Screen edges={['top', 'bottom']}>
      <Header title={t('settings.title')} />
      <ScrollView contentContainerStyle={styles.body}>
        <SectionHeader title={t('settings.language')} />
        <View style={styles.chips}>
          {LANGUAGES.map((l) => (
            <Chip key={l.id} label={l.label} selected={locale === l.id} onPress={() => setLocale(l.id)} />
          ))}
        </View>

        <SectionHeader title={t('settings.speed')} />
        <View style={styles.chips}>
          {SPEEDS.map((s) => (
            <Chip key={s} label={`${s}x`} selected={defaultSpeed === s} onPress={() => setDefaultSpeed(s)} />
          ))}
        </View>

        {(PRIVACY_URL || SUPPORT_EMAIL || __DEV__) && (
          <Card style={styles.menu}>
            {PRIVACY_URL && <ListRow icon="document-text-outline" title={t('settings.privacy')} onPress={() => void Linking.openURL(PRIVACY_URL)} />}
            {SUPPORT_EMAIL && <ListRow icon="help-circle-outline" title={t('settings.help')} onPress={() => void Linking.openURL(`mailto:${SUPPORT_EMAIL}`)} />}
            {__DEV__ && <ListRow icon="color-palette-outline" title={t('settings.components')} onPress={() => router.push('/dev/components')} />}
          </Card>
        )}

        <View style={styles.actions}>
          {email && supabase && <Button title={t('settings.signOut')} variant="ghost" onPress={() => void supabase?.auth.signOut()} />}
          <Button testID="delete-data" title={t('settings.delete')} variant="ghost" icon="trash-outline" onPress={confirmWipe} />
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  body: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xxl },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  menu: { marginTop: spacing.xl, paddingVertical: spacing.xs },
  actions: { gap: spacing.md, marginTop: spacing.xxl },
});
