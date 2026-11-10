import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { FlatList, ScrollView, StyleSheet, View } from 'react-native';

import { MapCanvas } from '@/components/MapCanvas';
import { PlaceRow } from '@/components/place';
import { Chip, EmptyState, ErrorState, IconButton, Screen, SkeletonList, Text } from '@/components/ui';
import { useCoords, usePlaces } from '@/data/queries';
import type { PlaceCategory } from '@/data/types';
import { useT } from '@/i18n';
import { sortByDistance, TBILISI_CENTER } from '@/lib/geo';
import { useApp } from '@/store/app';
import { colors, radii, spacing } from '@/theme/tokens';

const CATEGORIES: PlaceCategory[] = ['landmark', 'church', 'museum', 'hidden_gem'];

export default function MapScreen() {
  const t = useT();
  const locale = useApp((s) => s.locale);
  const { data: places, isLoading, isError, refetch } = usePlaces();
  const { coords, granted, request } = useCoords();
  const [category, setCategory] = useState<PlaceCategory | null>(null);
  const [view, setView] = useState<'map' | 'list'>('map');
  const [recenterToken, setRecenterToken] = useState(0);

  const origin = coords ?? TBILISI_CENTER;
  const sorted = useMemo(
    () => sortByDistance((places ?? []).filter((p) => !category || p.category === category), origin),
    [places, category, origin],
  );
  const available = useMemo(() => new Set((places ?? []).map((p) => p.category)), [places]);

  if (isLoading) {
    return (
      <Screen>
        <SkeletonList rows={5} />
      </Screen>
    );
  }
  if (isError) {
    return (
      <Screen>
        <ErrorState title={t('common.errorTitle')} message={t('common.errorBody')} action={t('common.retry')} onAction={() => void refetch()} />
      </Screen>
    );
  }

  const openPlace = (id: string) => router.push({ pathname: '/place/[id]', params: { id } });

  return (
    <Screen>
      <View style={styles.toolbar}>
        <View style={styles.toggle} accessibilityRole="tablist">
          <Chip label={t('map.map')} icon="map-outline" selected={view === 'map'} onPress={() => setView('map')} />
          <Chip label={t('map.list')} icon="list-outline" selected={view === 'list'} onPress={() => setView('list')} />
        </View>
      </View>

      <View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filters}>
          <Chip label={t('map.all')} selected={category === null} onPress={() => setCategory(null)} />
          {CATEGORIES.filter((c) => available.has(c)).map((c) => (
            <Chip key={c} label={t(`category.${c}`)} selected={category === c} onPress={() => setCategory(c)} />
          ))}
        </ScrollView>
      </View>

      {view === 'map' && (
        <View style={styles.map}>
          <MapCanvas
            places={sorted.map((x) => x.place)}
            center={origin}
            userCoords={coords}
            onSelect={openPlace}
            nameOf={(p) => p.content[locale].name}
            recenterToken={recenterToken}
          />
          <View style={styles.mapButton}>
            <IconButton
              icon="locate"
              label={t('map.recenter')}
              onPress={async () => {
                if (!granted) await request();
                setRecenterToken((n) => n + 1);
              }}
            />
          </View>
        </View>
      )}

      <FlatList
        data={sorted}
        keyExtractor={(item) => item.place.id}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          <View style={{ gap: 4, marginBottom: spacing.sm }}>
            <Text variant="heading" accessibilityRole="header">
              {t('map.nearby')}
            </Text>
            {!coords && (
              <Text variant="caption" color="textMuted">
                {t('map.locationOff')}
              </Text>
            )}
          </View>
        }
        ListEmptyComponent={<EmptyState title={t('map.empty')} />}
        renderItem={({ item }) => <PlaceRow place={item.place} meters={item.meters} />}
        ItemSeparatorComponent={() => <View style={{ height: spacing.sm }} />}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  toolbar: { paddingHorizontal: spacing.lg, paddingTop: spacing.sm, alignItems: 'center' },
  toggle: { flexDirection: 'row', gap: spacing.sm },
  filters: { gap: spacing.sm, paddingHorizontal: spacing.lg, paddingVertical: spacing.md },
  map: {
    height: 280,
    marginHorizontal: spacing.lg,
    borderRadius: radii.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
  },
  mapButton: { position: 'absolute', right: spacing.md, bottom: spacing.md },
  list: { padding: spacing.lg, paddingBottom: spacing.xxl },
});
