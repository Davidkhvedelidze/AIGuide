import type { Landmark } from './landmark';

export type ScanSource = 'camera' | 'gallery' | 'nearby';
export type ScanStatus = 'completed' | 'failed' | 'pending';

export interface ScanHistory {
  id: string;
  scannedAt: string;
  source: ScanSource;
  status: ScanStatus;
  landmark?: Landmark;
  userNote?: string;
  errorMessage?: string;
}
