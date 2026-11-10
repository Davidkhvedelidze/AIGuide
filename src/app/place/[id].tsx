import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect } from 'react';
import { Linking, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { PlaceImage, SaveButton } from '@/components/place';
import { Button, Card, Chip, EmptyState, ErrorState, Header, IconButton, ListRow, Screen, SectionHeader, SkeletonList, Text } from '@/components/ui';
import { usePlace } from '@/data/queries';
import { usePlayer } from '@/features/audio/player';
import { estimateMinutes } from '@/features/audio/sentences';
import { useT } from '@/i18n';
import { formatDistance, sortByDistance, walkingMinutes } from '@/lib/geo';
import { localizePeriod } from '@/lib/period';
import { track } from '@/services/analytics';
import { useApp } from '@/store/app';
import { useLibrary } from '@/store/library';
import { colors, radii, spacing } from '@/theme/tokens';

function hostOf(url: string): string {
  return url.replace(/^https?:\/\/(www\.)?/, '').split('/')[0];
}

export default function PlaceScreen() {
  const t = useT();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const locale = useApp((s) => s.locale);
  const { place, data: places = [], isLoading, isError, refetch } = usePlace(id);
  const load = usePlayer((s) => s.load);
  const collections = useLibrary((s) => s.collections);
  const toggleInCollection = useLibrary((s) => s.toggleInCollection);

  useEffect(() => {
    if (place) track('place_viewed', { place_id: place.id });
  }, [place]);

  if (isLoading) {
    return (
      <Screen>
        <Header />
        <SkeletonList rows={5} />
      </Screen>
    );
  }
  if (isError) {
    return (
      <Screen>
        <Header />
        <ErrorState title={t('common.errorTitle')} message={t('common.errorBody')} action={t('common.retry')} onAction={() => void refetch()} />
      </Screen>
    );
  }
  if (!place) {
    return (
      <Screen>
        <Header />
        <EmptyState title={t('place.notFoundTitle')} message={t('place.notFoundBody')} />
      </Screen>
    );
  }

  const content = place.content[locale];
  const nearby = sortByDistance(places.filter((p) => p.id !== place.id), place).slice(0, 2);
  const sources = [...new Set(place.facts.map((f) => f.source))];

  const listen = () => {
    void load(place, locale, true);
    router.push('/player');
  };

  return (
    <View style={styles.root}>
      <ScrollView contentContainerStyle={{ paddingBottom: insets.bottom + spacing.xxxl }}>
        <View>
          <PlaceImage place={place} style={styles.hero} iconSize={64} />
          <View style={[styles.heroBar, { top: insets.top + spacing.sm }]}>
            <IconButton icon="chevron-back" label={t('common.back')} onPress={() => (router.canGoBack() ? router.back() : router.replace('/'))} />
            <View style={styles.heroSave}>
              <SaveButton placeId={place.id} />
            </View>
          </View>
        </View>

        <View style={styles.body}>
          <Text variant="display" accessibilityRole="header">
            {content.name}
          </Text>
          <View style={styles.chips}>
            <Chip label={t(`category.${place.category}`)} />
            <Chip icon="calendar-outline" label={localizePeriod(place.period, locale)} />
          </View>
          {!place.verified && (
            <View style={styles.draft}>
              <Ionicons name="alert-circle-outline" size={16} color={colors.gold} />
              <Text variant="caption" color="textSecondary" style={{ flex: 1 }}>
                {t('place.draft')}
              </Text>
            </View>
          )}
          <Text color="textSecondary">{content.summary}</Text>

          <Card accent style={styles.audio}>
            <View style={styles.audioIcon}>
              <Ionicons name="headset" size={24} color={colors.gold} />
            </View>
            <View style={{ flex: 1 }}>
              <Text variant="bodyStrong">{t('place.audioGuide')}</Text>
              <Text variant="caption" color="textSecondary">
                {t('place.minutes', { n: estimateMinutes(content.story) })}
              </Text>
            </View>
            <Button testID="listen-now" title={t('place.listen')} icon="play" onPress={listen} />
          </Card>

          {content.highlights.length > 0 && (
            <>
              <SectionHeader title={t('place.whyVisit')} />
              <Card style={{ gap: spacing.md }}>
                {content.highlights.map((line) => (
                  <View key={line} style={styles.highlight}>
                    <Ionicons name="checkmark-circle" size={18} color={colors.gold} />
                    <Text style={{ flex: 1 }}>{line}</Text>
                  </View>
                ))}
              </Card>
            </>
          )}

          {collections.length > 0 && (
            <>
              <SectionHeader title={t('saved.addTo')} />
              <View style={styles.chips}>
                {collections.map((c) => (
                  <Chip
                    key={c.id}
                    label={c.name}
                    icon="folder-outline"
                    selected={c.placeIds.includes(place.id)}
                    onPress={() => toggleInCollection(c.id, place.id)}
                  />
                ))}
              </View>
            </>
          )}

          {nearby.length > 0 && (
            <>
              <SectionHeader title={t('place.nearby')} />
              <View style={{ gap: spacing.sm }}>
                {nearby.map(({ place: other, meters }) => (
                  <Card key={other.id} style={styles.nearbyCard}>
                    <ListRow
                      testID={`nearby-${other.id}`}
                      left={<PlaceImage place={other} style={styles.nearbyImage} iconSize={22} />}
                      title={other.content[locale].name}
                      subtitle={`${t('place.walk', { n: walkingMinutes(meters) })} · ${formatDistance(meters)}`}
                      onPress={() => router.push({ pathname: '/place/[id]', params: { id: other.id } })}
                    />
                  </Card>
                ))}
              </View>
            </>
          )}

          {sources.length > 0 && (
            <>
              <SectionHeader title={t('place.sources')} />
              <View style={{ gap: spacing.xs }}>
                {sources.map((url) => (
                  <Pressable key={url} accessibilityRole="link" accessibilityLabel={hostOf(url)} onPress={() => void Linking.openURL(url)} style={styles.source}>
                    <Ionicons name="link-outline" size={16} color={colors.gold} />
                    <Text variant="caption" color="textSecondary" numberOfLines={1} style={{ flex: 1 }}>
                      {hostOf(url)}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </>
          )}

          {place.photoCredit && (
            <Text variant="caption" color="textMuted" style={{ marginTop: spacing.lg }}>
              {place.photoCredit}
            </Text>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  hero: { height: 260, width: '100%' },
  heroBar: { position: 'absolute', left: spacing.lg, right: spacing.lg, flexDirection: 'row', justifyContent: 'space-between' },
  heroSave: { backgroundColor: colors.surface, borderRadius: 22, borderWidth: 1, borderColor: colors.border },
  body: { padding: spacing.xl, gap: spacing.md },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  draft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: radii.md,
    backgroundColor: colors.goldSoft,
  },
  audio: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, marginTop: spacing.sm },
  audioIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(233,180,76,0.5)',
  },
  highlight: { flexDirection: 'row', gap: spacing.md, alignItems: 'flex-start' },
  nearbyCard: { paddingVertical: spacing.xs, paddingHorizontal: spacing.md },
  nearbyImage: { width: 52, height: 52, borderRadius: radii.sm },
  source: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, minHeight: 44 },
});
