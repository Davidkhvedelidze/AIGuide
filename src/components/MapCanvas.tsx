import { useEffect, useRef } from 'react';
import { StyleSheet } from 'react-native';
import MapView, { Marker } from 'react-native-maps';

import type { MapCanvasProps } from './MapCanvas.types';
import { colors } from '@/theme/tokens';

const DELTA = { latitudeDelta: 0.03, longitudeDelta: 0.03 };

/** Native map. Android release builds need a Google Maps key (docs/SETUP.md). */
export function MapCanvas({ places, center, userCoords, onSelect, nameOf, recenterToken }: MapCanvasProps) {
  const map = useRef<MapView>(null);

  useEffect(() => {
    map.current?.animateToRegion({ latitude: center.lat, longitude: center.lng, ...DELTA }, 400);
  }, [center.lat, center.lng, recenterToken]);

  return (
    <MapView
      ref={map}
      style={StyleSheet.absoluteFill}
      userInterfaceStyle="dark"
      showsUserLocation={userCoords !== null}
      showsMyLocationButton={false}
      toolbarEnabled={false}
      initialRegion={{ latitude: center.lat, longitude: center.lng, ...DELTA }}>
      {places.map((place) => (
        <Marker
          key={place.id}
          identifier={place.id}
          coordinate={{ latitude: place.lat, longitude: place.lng }}
          title={nameOf(place)}
          pinColor={colors.gold}
          tracksViewChanges={false}
          onCalloutPress={() => onSelect(place.id)}
        />
      ))}
    </MapView>
  );
}
