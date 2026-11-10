import { track } from '@/services/analytics';
import { useApp } from '@/store/app';
import { useLibrary } from '@/store/library';
import { supabase } from './supabase';
import type { Collection } from './types';

/**
 * Mirrors the on-device library to Supabase for signed-in users.
 *
 * On sign-in the remote and local libraries are merged (union). After that the device
 * is the source of truth and every change replaces the remote copy, so two devices
 * edited at the same time resolve as last-writer-wins. That is acceptable for an MVP;
 * revisit if users report lost saves.
 *
 * NOTE: written against the schema in supabase/migrations but not yet exercised
 * against a live project. Test it once the backend is connected (docs/SETUP.md).
 */

const DEBOUNCE_MS = 1500;
let timer: ReturnType<typeof setTimeout> | null = null;
let userId: string | null = null;
let started = false;

async function pull(uid: string) {
  if (!supabase) return;
  const [saved, collections] = await Promise.all([
    supabase.from('saved_places').select('place_id').eq('user_id', uid),
    supabase.from('collections').select('id, name, place_ids, created_at').eq('user_id', uid),
  ]);
  if (saved.error) throw new Error(saved.error.message);
  if (collections.error) throw new Error(collections.error.message);

  const local = useLibrary.getState();
  const remoteIds = (saved.data ?? []).map((r) => r.place_id as string);
  const localCollectionIds = new Set(local.collections.map((c) => c.id));
  const remoteCollections: Collection[] = (collections.data ?? [])
    .filter((c) => !localCollectionIds.has(c.id as string))
    .map((c) => ({
      id: c.id as string,
      name: c.name as string,
      placeIds: (c.place_ids as string[] | null) ?? [],
      createdAt: c.created_at as string,
    }));

  useLibrary.setState({
    savedIds: [...new Set([...local.savedIds, ...remoteIds])],
    collections: [...local.collections, ...remoteCollections],
  });
}

async function push(uid: string) {
  if (!supabase) return;
  const { savedIds, collections } = useLibrary.getState();

  const removeSaved = supabase.from('saved_places').delete().eq('user_id', uid);
  const { error: e1 } = savedIds.length
    ? await removeSaved.not('place_id', 'in', `(${savedIds.map((id) => `"${id}"`).join(',')})`)
    : await removeSaved;
  if (e1) throw new Error(e1.message);
  if (savedIds.length) {
    const { error } = await supabase
      .from('saved_places')
      .upsert(savedIds.map((place_id) => ({ user_id: uid, place_id })), { onConflict: 'user_id,place_id' });
    if (error) throw new Error(error.message);
  }

  const ids = collections.map((c) => c.id);
  const removeCollections = supabase.from('collections').delete().eq('user_id', uid);
  const { error: e2 } = ids.length
    ? await removeCollections.not('id', 'in', `(${ids.map((id) => `"${id}"`).join(',')})`)
    : await removeCollections;
  if (e2) throw new Error(e2.message);
  if (collections.length) {
    const { error } = await supabase.from('collections').upsert(
      collections.map((c) => ({ id: c.id, user_id: uid, name: c.name, place_ids: c.placeIds, created_at: c.createdAt })),
      { onConflict: 'id' },
    );
    if (error) throw new Error(error.message);
  }
}

function report(error: unknown) {
  track('error', { where: 'library_sync', message: error instanceof Error ? error.message : String(error) });
}

/** Call once at app start. Does nothing in demo mode. */
export function startSync() {
  if (!supabase || started) return;
  started = true;

  // Every device gets an anonymous account, so scans can be counted and limited on
  // the server before the user ever signs in. (Enable "Anonymous sign-ins" in Supabase.)
  const client = supabase;
  client.auth
    .getSession()
    .then(({ data }) => (data.session ? null : client.auth.signInAnonymously()))
    .then((result) => {
      if (result?.error) report(result.error);
    })
    .catch(report);

  supabase.auth.onAuthStateChange((_event, session) => {
    const next = session?.user ?? null;
    useApp.getState().setEmail(next?.email ?? null);
    if (next && next.id !== userId) {
      userId = next.id;
      pull(next.id)
        .then(() => push(next.id))
        .catch(report);
    }
    if (!next) userId = null;
  });

  useLibrary.subscribe((state, previous) => {
    if (!userId) return;
    if (state.savedIds === previous.savedIds && state.collections === previous.collections) return;
    if (timer) clearTimeout(timer);
    const uid = userId;
    timer = setTimeout(() => push(uid).catch(report), DEBOUNCE_MS);
  });
}

/** Deletes the account's server data and signs out. Local data is cleared by the caller. */
export async function deleteRemoteAccount(): Promise<void> {
  if (!supabase || !userId) return;
  const { error } = await supabase.rpc('delete_my_account');
  if (error) throw new Error(error.message);
  await supabase.auth.signOut();
}
