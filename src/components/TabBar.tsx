import { Ionicons } from '@expo/vector-icons';
import type { BottomTabBarProps } from 'expo-router/js-tabs';
import { router } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Text, type IconName } from '@/components/ui';
import { usePlayer } from '@/features/audio/player';
import { useT, type StringKey } from '@/i18n';
import { formatClock } from '@/lib/geo';
import { colors, HIT, radii, spacing } from '@/theme/tokens';

const TABS: Record<string, { label: StringKey; icon: IconName; iconActive: IconName }> = {
  index: { label: 'tabs.guide', icon: 'camera-outline', iconActive: 'camera' },
  history: { label: 'tabs.history', icon: 'time-outline', iconActive: 'time' },
  map: { label: 'tabs.map', icon: 'map-outline', iconActive: 'map' },
  profile: { label: 'tabs.profile', icon: 'person-outline', iconActive: 'person' },
};

/** Shown above the tab bar on every tab while something is loaded in the player. */
export function MiniPlayer() {
  const t = useT();
  const placeId = usePlayer((s) => s.placeId);
  const title = usePlayer((s) => s.title);
  const playing = usePlayer((s) => s.playing);
  const position = usePlayer((s) => s.position);
  const duration = usePlayer((s) => s.duration);
  const engine = usePlayer((s) => s.engine);
  const toggle = usePlayer((s) => s.toggle);
  if (!placeId) return null;
  return (
    <Pressable
      testID="mini-player"
      accessibilityRole="button"
      accessibilityLabel={`${t('player.title')}: ${title}`}
      onPress={() => router.push('/player')}
      style={styles.mini}>
      <View style={styles.miniIcon}>
        <Ionicons name="headset" size={18} color={colors.gold} />
      </View>
      <View style={{ flex: 1 }}>
        <Text variant="bodyStrong" numberOfLines={1}>
          {title}
        </Text>
        <Text variant="caption" color="textSecondary">
          {formatClock(position)} / {formatClock(duration)}
        </Text>
      </View>
      {engine !== 'none' && (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={playing ? t('player.pause') : t('player.play')}
          hitSlop={8}
          onPress={toggle}
          style={styles.miniButton}>
          <Ionicons name={playing ? 'pause' : 'play'} size={20} color={colors.text} />
        </Pressable>
      )}
    </Pressable>
  );
}

export function TabBar({ state, emitter, navigateToTab }: BottomTabBarProps) {
  const t = useT();
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.wrap, { paddingBottom: Math.max(insets.bottom, spacing.sm) }]}>
      <MiniPlayer />
      <View style={styles.bar} accessibilityRole="tablist">
        {state.routes.map((route, index) => {
          const tab = TABS[route.name];
          if (!tab) return null;
          const focused = state.index === index;
          return (
            <Pressable
              key={route.key}
              testID={`tab-${route.name}`}
              accessibilityRole="tab"
              accessibilityLabel={t(tab.label)}
              accessibilityState={{ selected: focused }}
              onPress={() => {
                const event = emitter.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
                if (!focused && !event.defaultPrevented) navigateToTab(route.key);
              }}
              style={styles.tab}>
              <Ionicons name={focused ? tab.iconActive : tab.icon} size={24} color={focused ? colors.gold : colors.textMuted} />
              <Text variant="label" style={{ color: focused ? colors.gold : colors.textMuted }}>
                {t(tab.label)}
              </Text>
              <View style={[styles.indicator, focused && { backgroundColor: colors.gold }]} />
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { backgroundColor: colors.bg, paddingHorizontal: spacing.lg, paddingTop: spacing.sm, gap: spacing.sm },
  bar: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: radii.xl,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.sm,
  },
  tab: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 2, minHeight: 60, paddingTop: spacing.sm },
  indicator: { height: 2, width: 28, borderRadius: 1, marginTop: 4, backgroundColor: 'transparent' },
  mini: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.sm,
    paddingRight: spacing.md,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  miniIcon: {
    width: HIT,
    height: HIT,
    borderRadius: radii.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.goldSoft,
  },
  miniButton: {
    width: HIT,
    height: HIT,
    borderRadius: HIT / 2,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.borderStrong,
  },
});
