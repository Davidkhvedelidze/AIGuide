import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { ScrollView, StyleSheet, View } from 'react-native';

import { Button, Card, Chip, ListRow, Screen, Text, type IconName } from '@/components/ui';
import { isBackendConfigured } from '@/data/supabase';
import { useT } from '@/i18n';
import { useApp } from '@/store/app';
import { useLibrary, visitedCount } from '@/store/library';
import { colors, spacing } from '@/theme/tokens';

function Stat({ icon, value, label }: { icon: IconName; value: number; label: string }) {
  return (
    <View style={styles.stat} accessible accessibilityLabel={`${value} ${label}`}>
      <Ionicons name={icon} size={20} color={colors.gold} />
      <Text variant="title">{value}</Text>
      <Text variant="caption" color="textSecondary">
        {label}
      </Text>
    </View>
  );
}

export default function ProfileScreen() {
  const t = useT();
  const email = useApp((s) => s.email);
  const isPro = useApp((s) => s.isPro);
  const savedCount = useLibrary((s) => s.savedIds.length);
  const history = useLibrary((s) => s.history);
  const scans = history.filter((h) => h.kind === 'scan').length;

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.body}>
        <View style={styles.identity}>
          <View style={styles.avatar}>
            <Ionicons name="person" size={32} color={colors.gold} />
          </View>
          <View style={{ flex: 1, gap: 4 }}>
            <Text variant="title" numberOfLines={1} accessibilityRole="header">
              {email ?? t('profile.guest')}
            </Text>
            {isPro && (
              <View style={{ flexDirection: 'row' }}>
                <Chip label="PRO" icon="star" />
              </View>
            )}
          </View>
        </View>

        <Card style={styles.stats}>
          <Stat icon="bookmark-outline" value={savedCount} label={t('profile.statSaved')} />
          <Stat icon="location-outline" value={visitedCount(history)} label={t('profile.statVisited')} />
          <Stat icon="camera-outline" value={scans} label={t('profile.statScans')} />
        </Card>

        <Card accent style={styles.pro}>
          <View style={{ flex: 1 }}>
            <Text variant="bodyStrong">{isPro ? t('profile.proTitle') : t('profile.freeTitle')}</Text>
            <Text variant="caption" color="textSecondary">
              {isPro ? t('profile.proBody') : t('profile.freeBody')}
            </Text>
          </View>
          <Button testID="profile-pro" title={isPro ? t('profile.manage') : t('profile.upgrade')} onPress={() => router.push('/paywall')} />
        </Card>

        <Card style={styles.menu}>
          <ListRow testID="open-saved" icon="bookmark-outline" title={t('saved.title')} subtitle={t('saved.count', { n: savedCount })} onPress={() => router.push('/saved')} />
          {isBackendConfigured && !email && (
            <ListRow icon="log-in-outline" title={t('profile.signIn')} subtitle={t('profile.signInBody')} onPress={() => router.push('/sign-in')} />
          )}
          <ListRow testID="open-settings" icon="settings-outline" title={t('profile.settings')} subtitle={t('profile.settingsBody')} onPress={() => router.push('/settings')} />
        </Card>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  body: { padding: spacing.lg, gap: spacing.lg, paddingBottom: spacing.xxl },
  identity: { flexDirection: 'row', alignItems: 'center', gap: spacing.lg, marginTop: spacing.sm },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.goldSoft,
    borderWidth: 1,
    borderColor: 'rgba(233,180,76,0.4)',
  },
  stats: { flexDirection: 'row' },
  stat: { flex: 1, alignItems: 'center', gap: 2 },
  pro: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  menu: { paddingVertical: spacing.xs },
});
