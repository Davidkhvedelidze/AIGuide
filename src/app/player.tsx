import { Ionicons } from '@expo/vector-icons';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { Chip, EmptyState, Header, IconButton, Screen, Text } from '@/components/ui';
import { usePlayer } from '@/features/audio/player';
import { segmentAt } from '@/features/audio/sentences';
import { useT } from '@/i18n';
import { formatClock } from '@/lib/geo';
import { SPEEDS } from '@/store/app';
import { colors, radii, spacing } from '@/theme/tokens';

export default function PlayerScreen() {
  const t = useT();
  const { placeId, title, engine, timeline, playing, position, duration, rate, toggle, seekBy, setRate } = usePlayer();

  if (!placeId) {
    return (
      <Screen edges={['top', 'bottom']}>
        <Header title={t('player.title')} />
        <EmptyState icon="headset-outline" title={t('player.nothing')} message={t('player.nothingBody')} />
      </Screen>
    );
  }

  const progress = duration > 0 ? Math.min(1, position / duration) : 0;
  const current = segmentAt(timeline, position);
  const canPlay = engine !== 'none';

  return (
    <Screen edges={['top', 'bottom']}>
      <Header title={t('player.title')} />
      <ScrollView contentContainerStyle={styles.body}>
        <Text variant="title" accessibilityRole="header">
          {title}
        </Text>
        <Text variant="caption" color="textSecondary">
          {engine === 'file' ? t('player.recorded') : engine === 'speech' ? t('player.deviceVoice') : t('player.noVoice')}
        </Text>

        {canPlay && (
          <View style={styles.card}>
            <View
              style={styles.track}
              accessibilityRole="progressbar"
              accessibilityValue={{ min: 0, max: Math.round(duration), now: Math.round(position) }}>
              <View style={[styles.trackFill, { width: `${progress * 100}%` }]} />
            </View>
            <View style={styles.times}>
              <Text variant="caption" color="textSecondary">
                {formatClock(position)}
              </Text>
              <Text variant="caption" color="textSecondary">
                {formatClock(duration)}
              </Text>
            </View>

            <View style={styles.controls}>
              <IconButton icon="play-back" label={t('player.back15')} onPress={() => seekBy(-15)} size={52} />
              <Pressable
                testID="play-toggle"
                accessibilityRole="button"
                accessibilityLabel={playing ? t('player.pause') : t('player.play')}
                onPress={toggle}
                style={({ pressed }) => [styles.play, pressed && { opacity: 0.8 }]}>
                <Ionicons name={playing ? 'pause' : 'play'} size={34} color={colors.onGold} />
              </Pressable>
              <IconButton icon="play-forward" label={t('player.forward15')} onPress={() => seekBy(15)} size={52} />
            </View>

            <View style={styles.speeds} accessibilityLabel={t('player.speed')}>
              {SPEEDS.map((s) => (
                <Chip key={s} label={`${s}x`} selected={rate === s} onPress={() => setRate(s)} />
              ))}
            </View>
          </View>
        )}

        <Text variant="heading" style={{ marginTop: spacing.lg }} accessibilityRole="header">
          {t('player.transcript')}
        </Text>
        <View style={{ gap: spacing.sm }}>
          {timeline.map((segment, index) => (
            <Text key={segment.start} color={canPlay && index === current ? 'text' : 'textSecondary'} style={canPlay && index === current && styles.currentLine}>
              {segment.text}
            </Text>
          ))}
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  body: { padding: spacing.xl, gap: spacing.sm, paddingBottom: spacing.xxxl },
  card: {
    marginTop: spacing.lg,
    padding: spacing.xl,
    gap: spacing.md,
    borderRadius: radii.xl,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  track: { height: 6, borderRadius: 3, backgroundColor: colors.surfaceRaised, overflow: 'hidden' },
  trackFill: { height: 6, borderRadius: 3, backgroundColor: colors.gold },
  times: { flexDirection: 'row', justifyContent: 'space-between' },
  controls: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.xxl },
  play: { width: 76, height: 76, borderRadius: 38, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.gold },
  speeds: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: spacing.sm },
  currentLine: { fontWeight: '600' },
});
