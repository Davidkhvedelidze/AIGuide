import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import type { ComponentProps } from 'react';
import { Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { Chip, Text } from '@/components/ui';
import type { Place, PlaceCategory } from '@/data/types';
import { useT } from '@/i18n';
import { formatDistance } from '@/lib/geo';
import { localizePeriod } from '@/lib/period';
import { track } from '@/services/analytics';
import { useApp } from '@/store/app';
import { useLibrary } from '@/store/library';
import { colors, HIT, radii, spacing } from '@/theme/tokens';

type McIcon = ComponentProps<typeof MaterialCommunityIcons>['name'];

export const CATEGORY_ICON: Record<PlaceCategory, McIcon> = {
  landmark: 'castle',
  church: 'church',
  museum: 'bank',
  hidden_gem: 'diamond-stone',
};

/** Real photo when we have a licensed one; otherwise a neutral placeholder, never an invented image. */
export function PlaceImage({ place, style, iconSize = 28 }: { place: Place; style?: StyleProp<ViewStyle>; iconSize?: number }) {
  if (place.photoUrl) {
    return (
      <View style={[styles.image, style]}>
        <Image source={{ uri: place.photoUrl }} style={StyleSheet.absoluteFill} contentFit="cover" transition={150} />
      </View>
    );
  }
  return (
    <LinearGradient colors={['#1B2440', '#0E1424']} style={[styles.image, styles.placeholder, style]}>
      <MaterialCommunityIcons name={CATEGORY_ICON[place.category]} size={iconSize} color={colors.gold} />
    </LinearGradient>
  );
}

export function SaveButton({ placeId, size = HIT }: { placeId: string; size?: number }) {
  const t = useT();
  const saved = useLibrary((s) => s.savedIds.includes(placeId));
  const toggle = useLibrary((s) => s.toggleSaved);
  return (
    <Pressable
      testID={`save-${placeId}`}
      accessibilityRole="button"
      accessibilityLabel={saved ? t('place.unsave') : t('place.save')}
      accessibilityState={{ selected: saved }}
      hitSlop={8}
      onPress={() => {
        if (!saved) track('place_saved', { place_id: placeId });
        toggle(placeId);
      }}
      style={[styles.saveButton, { width: size, height: size }]}>
      <Ionicons name={saved ? 'bookmark' : 'bookmark-outline'} size={22} color={colors.gold} />
    </Pressable>
  );
}

export function PlaceRow({ place, meters, onPress }: { place: Place; meters?: number; onPress?: () => void }) {
  const t = useT();
  const locale = useApp((s) => s.locale);
  const content = place.content[locale];
  return (
    <Pressable
      testID={`place-${place.id}`}
      accessibilityRole="button"
      accessibilityLabel={`${content.name}, ${t(`category.${place.category}`)}${meters !== undefined ? `, ${formatDistance(meters)}` : ''}`}
      onPress={onPress ?? (() => router.push({ pathname: '/place/[id]', params: { id: place.id } }))}
      style={({ pressed }) => [styles.row, pressed && { opacity: 0.8 }]}>
      <PlaceImage place={place} style={styles.rowImage} />
      <View style={styles.rowBody}>
        <Text variant="bodyStrong" numberOfLines={1}>
          {content.name}
        </Text>
        <Text variant="caption" color="textSecondary" numberOfLines={1}>
          {localizePeriod(place.period, locale)}
          {meters !== undefined ? ` · ${formatDistance(meters)}` : ''}
        </Text>
        <View style={{ flexDirection: 'row' }}>
          <Chip label={t(`category.${place.category}`)} />
        </View>
      </View>
      <SaveButton placeId={place.id} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  image: { overflow: 'hidden', backgroundColor: colors.surfaceRaised },
  placeholder: { alignItems: 'center', justifyContent: 'center' },
  saveButton: { alignItems: 'center', justifyContent: 'center' },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  rowImage: { width: 76, height: 76, borderRadius: radii.md },
  rowBody: { flex: 1, gap: 4 },
});
