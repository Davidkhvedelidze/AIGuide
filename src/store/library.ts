import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import type { Collection, HistoryEntry } from '@/data/types';

const HISTORY_LIMIT = 200;
const uid = () => `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

interface LibraryState {
  savedIds: string[];
  collections: Collection[];
  history: HistoryEntry[];

  toggleSaved: (placeId: string) => void;
  createCollection: (name: string) => string | null;
  deleteCollection: (id: string) => void;
  toggleInCollection: (collectionId: string, placeId: string) => void;
  addHistory: (placeId: string, kind: HistoryEntry['kind']) => void;
  clearHistory: () => void;
  clearAll: () => void;
}

/**
 * The user's library lives on the device first, so saving works offline and feels
 * instant. `src/data/sync.ts` mirrors it to Supabase when the user is signed in.
 */
export const useLibrary = create<LibraryState>()(
  persist(
    (set, get) => ({
      savedIds: [],
      collections: [],
      history: [],

      toggleSaved: (placeId) => {
        const { savedIds, collections } = get();
        if (savedIds.includes(placeId)) {
          set({
            savedIds: savedIds.filter((id) => id !== placeId),
            collections: collections.map((c) => ({ ...c, placeIds: c.placeIds.filter((id) => id !== placeId) })),
          });
        } else {
          set({ savedIds: [placeId, ...savedIds] });
        }
      },

      createCollection: (rawName) => {
        const name = rawName.trim().slice(0, 40);
        if (!name) return null;
        const id = uid();
        set({ collections: [{ id, name, placeIds: [], createdAt: new Date().toISOString() }, ...get().collections] });
        return id;
      },

      deleteCollection: (id) => set({ collections: get().collections.filter((c) => c.id !== id) }),

      toggleInCollection: (collectionId, placeId) => {
        const { savedIds } = get();
        set({
          // Adding to a collection implies the place is saved.
          savedIds: savedIds.includes(placeId) ? savedIds : [placeId, ...savedIds],
          collections: get().collections.map((c) =>
            c.id !== collectionId
              ? c
              : {
                  ...c,
                  placeIds: c.placeIds.includes(placeId)
                    ? c.placeIds.filter((id) => id !== placeId)
                    : [...c.placeIds, placeId],
                },
          ),
        });
      },

      addHistory: (placeId, kind) => {
        const entry: HistoryEntry = { id: uid(), placeId, kind, at: new Date().toISOString() };
        set({ history: [entry, ...get().history].slice(0, HISTORY_LIMIT) });
      },

      clearHistory: () => set({ history: [] }),
      clearAll: () => set({ savedIds: [], collections: [], history: [] }),
    }),
    { name: 'library-v1', storage: createJSONStorage(() => AsyncStorage) },
  ),
);

/** Distinct places the user has scanned or listened to. */
export function visitedCount(history: HistoryEntry[]): number {
  return new Set(history.map((h) => h.placeId)).size;
}
