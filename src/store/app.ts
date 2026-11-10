import AsyncStorage from '@react-native-async-storage/async-storage';
import { getLocales } from 'expo-localization';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import type { Locale } from '@/data/types';
import { canScan, FREE_DAILY_SCANS } from '../../supabase/functions/_shared/decision';

export const SPEEDS = [0.75, 1, 1.25, 1.5, 2] as const;

interface AppState {
  hydrated: boolean;
  onboarded: boolean;
  locale: Locale;
  defaultSpeed: number;
  /** Mirrors the store entitlement. The server re-checks it before every scan. */
  isPro: boolean;
  email: string | null;
  usage: { day: string; count: number };

  completeOnboarding: () => void;
  setLocale: (locale: Locale) => void;
  setDefaultSpeed: (speed: number) => void;
  setPro: (isPro: boolean) => void;
  setEmail: (email: string | null) => void;
  recordScan: () => void;
  reset: () => void;
}

export const today = () => new Date().toISOString().slice(0, 10);

/** First launch follows the phone's language; the user can change it in Settings. */
function deviceLocale(): Locale {
  try {
    return getLocales()[0]?.languageCode === 'ka' ? 'ka' : 'en';
  } catch {
    return 'en';
  }
}

export const useApp = create<AppState>()(
  persist(
    (set, get) => ({
      hydrated: false,
      onboarded: false,
      locale: deviceLocale(),
      defaultSpeed: 1,
      isPro: false,
      email: null,
      usage: { day: today(), count: 0 },

      completeOnboarding: () => set({ onboarded: true }),
      setLocale: (locale) => set({ locale }),
      setDefaultSpeed: (defaultSpeed) => set({ defaultSpeed }),
      setPro: (isPro) => set({ isPro }),
      setEmail: (email) => set({ email }),
      recordScan: () => {
        const { usage } = get();
        const day = today();
        set({ usage: { day, count: usage.day === day ? usage.count + 1 : 1 } });
      },
      reset: () => set({ onboarded: false, isPro: false, email: null, usage: { day: today(), count: 0 } }),
    }),
    {
      name: 'app-v1',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: ({ hydrated: _h, ...rest }) => rest,
      onRehydrateStorage: () => () => useApp.setState({ hydrated: true }),
    },
  ),
);

/** Free scans left today; Infinity for Pro. */
export function scansLeft(state: Pick<AppState, 'isPro' | 'usage'>): number {
  if (state.isPro) return Infinity;
  const used = state.usage.day === today() ? state.usage.count : 0;
  return Math.max(0, FREE_DAILY_SCANS - used);
}

export function mayScan(state: Pick<AppState, 'isPro' | 'usage'>): boolean {
  const used = state.usage.day === today() ? state.usage.count : 0;
  return canScan(state.isPro, used);
}
