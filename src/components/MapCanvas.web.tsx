import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Pressable, StyleSheet, View } from 'react-native';

import { CATEGORY_ICON } from '@/components/place';
import { Text } from '@/components/ui';
import type { MapCanvasProps } from './MapCanvas.types';
import { colors } from '@/theme/tokens';

/**
 * Web has no native map, so this draws the places on a plain schematic, positioned by
 * their real coordinates. It exists for development previews; phones get the real map.
 */
export function MapCanvas({ places, onSelect, nameOf }: MapCanvasProps) {
  if (places.length === 0) return <View style={styles.canvas} />;
  const lats = places.map((p) => p.lat);
  const lngs = places.map((p) => p.lng);
  const minLat = Math.min(...lats);
  const minLng = Math.min(...lngs);
  const spanLat = Math.max(Math.max(...lats) - minLat, 0.002);
  const spanLng = Math.max(Math.max(...lngs) - minLng, 0.002);

  return (
    <View style={styles.canvas}>
      {places.map((place) => {
        const left = 12 + ((place.lng - minLng) / spanLng) * 60;
        const top = 12 + (1 - (place.lat - minLat) / spanLat) * 66;
        return (
          <Pressable
            key={place.id}
            accessibilityRole="button"
            accessibilityLabel={nameOf(place)}
            onPress={() => onSelect(place.id)}
            style={[styles.pin, { left: `${left}%`, top: `${top}%` }]}>
            <View style={styles.dot}>
              <MaterialCommunityIcons name={CATEGORY_ICON[place.category]} size={14} color={colors.onGold} />
            </View>
            <Text variant="label" numberOfLines={1} style={styles.label}>
              {nameOf(place)}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  canvas: { position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, backgroundColor: '#0B1122' },
  pin: { position: 'absolute', flexDirection: 'row', alignItems: 'center', gap: 6 },
  dot: { width: 26, height: 26, borderRadius: 13, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.gold },
  label: { maxWidth: 120, backgroundColor: colors.overlay, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6, overflow: 'hidden' },
});
