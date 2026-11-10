import { router } from 'expo-router';
import { useMemo } from 'react';
import { SectionList, StyleSheet, View } from 'react-native';

import { PlaceImage } from '@/components/place';
import { Card, EmptyState, IconButton, ListRow, Screen, SkeletonList, Text } from '@/components/ui';
import { usePlaces } from '@/data/queries';
import type { HistoryEntry, Place } from '@/data/types';
import { useT, type Translate } from '@/i18n';
import { useApp } from '@/store/app';
import { useLibrary } from '@/store/library';
import { radii, spacing } from '@/theme/tokens';

const DAY = 24 * 60 * 60 * 1000;

function dayLabel(iso: string, t: Translate, locale: string): string {
  const date = new Date(iso);
  const start = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  const diff = Math.round((start(new Date()) - start(date)) / DAY);
  if (diff === 0) return t('history.today');
  if (diff === 1) return t('history.yesterday');
  return date.toLocaleDateString(locale === 'ka' ? 'ka-GE' : 'en-US', { day: 'numeric', month: 'long', year: 'numeric' });
}

export default function HistoryScreen() {
  const t = useT();
  const locale = useApp((s) => s.locale);
  const history = useLibrary((s) => s.history);
  const clearHistory = useLibrary((s) => s.clearHistory);
  const { data: places, isLoading } = usePlaces();

  const sections = useMemo(() => {
    const byId = new Map<string, Place>((places ?? []).map((p) => [p.id, p]));
    const groups = new Map<string, { entry: HistoryEntry; place: Place }[]>();
    for (const entry of history) {
      const place = byId.get(entry.placeId);
      if (!place) continue;
      const key = dayLabel(entry.at, t, locale);
      groups.set(key, [...(groups.get(key) ?? []), { entry, place }]);
    }
    return [...groups.entries()].map(([title, data]) => ({ title, data }));
  }, [history, places, t, locale]);

  return (
    <Screen>
      <View style={styles.header}>
        <Text variant="title" accessibilityRole="header">
          {t('history.title')}
        </Text>
        {history.length > 0 && <IconButton icon="trash-outline" label={t('history.clear')} onPress={clearHistory} />}
      </View>
      {isLoading ? (
        <SkeletonList />
      ) : (
        <SectionList
          sections={sections}
          keyExtractor={(item) => item.entry.id}
          contentContainerStyle={styles.list}
          stickySectionHeadersEnabled={false}
          ListEmptyComponent={<EmptyState icon="time-outline" title={t('history.emptyTitle')} message={t('history.emptyBody')} />}
          renderSectionHeader={({ section }) => (
            <Text variant="label" color="textMuted" style={styles.section}>
              {section.title.toUpperCase()}
            </Text>
          )}
          renderItem={({ item }) => (
            <Card style={styles.card}>
              <ListRow
                left={<PlaceImage place={item.place} style={styles.thumb} iconSize={20} />}
                title={item.place.content[locale].name}
                subtitle={`${item.entry.kind === 'scan' ? t('history.scanned') : t('history.listened')} · ${new Date(item.entry.at).toLocaleTimeString(locale === 'ka' ? 'ka-GE' : 'en-US', { hour: '2-digit', minute: '2-digit' })}`}
                onPress={() => router.push({ pathname: '/place/[id]', params: { id: item.place.id } })}
              />
            </Card>
          )}
          ItemSeparatorComponent={() => <View style={{ height: spacing.sm }} />}
        />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    minHeight: 60,
  },
  list: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xxl, flexGrow: 1 },
  section: { marginTop: spacing.lg, marginBottom: spacing.sm },
  card: { paddingVertical: spacing.xs, paddingHorizontal: spacing.md },
  thumb: { width: 48, height: 48, borderRadius: radii.sm },
});
