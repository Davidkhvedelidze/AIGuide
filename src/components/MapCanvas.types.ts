import type { Coords, Place } from '@/data/types';

export interface MapCanvasProps {
  places: Place[];
  center: Coords;
  userCoords: Coords | null;
  onSelect: (placeId: string) => void;
  nameOf: (place: Place) => string;
  /** Change this value to re-centre the map on `center`. */
  recenterToken: number;
}
