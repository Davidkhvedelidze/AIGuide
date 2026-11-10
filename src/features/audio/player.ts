import { createAudioPlayer, setAudioModeAsync, type AudioPlayer } from 'expo-audio';
import * as Speech from 'expo-speech';
import { create } from 'zustand';

import type { Locale, Place } from '@/data/types';
import { track } from '@/services/analytics';
import { useApp } from '@/store/app';
import { useLibrary } from '@/store/library';
import { buildTimeline, segmentAt, totalDuration, type Segment } from './sentences';

/**
 * - `file`: narrated audio generated on the server (the production path).
 * - `speech`: the phone's own voice reads the transcript. Used until audio has been
 *   generated for a place, so the guide works with no backend at all.
 * - `none`: the phone has no voice for this language; only the transcript is shown.
 */
export type Engine = 'file' | 'speech' | 'none';

interface PlayerState {
  placeId: string | null;
  title: string;
  locale: Locale;
  engine: Engine;
  timeline: Segment[];
  playing: boolean;
  /** Seconds of narration at 1x speed. */
  position: number;
  duration: number;
  rate: number;

  load: (place: Place, locale: Locale, autoplay?: boolean) => Promise<void>;
  toggle: () => void;
  seekBy: (seconds: number) => void;
  setRate: (rate: number) => void;
  stop: () => void;
}

const SPEECH_LANG: Record<Locale, string> = { en: 'en-US', ka: 'ka-GE' };
const TICK_MS = 250;

// Engine internals live outside the store: they are handles, not UI state.
let file: AudioPlayer | null = null;
let ticker: ReturnType<typeof setInterval> | null = null;
/** Bumped on every stop/seek so callbacks from an older utterance are ignored. */
let generation = 0;
const resumeAt: Record<string, number> = {};

async function hasVoice(locale: Locale): Promise<boolean> {
  if (locale === 'en') return true;
  try {
    const voices = await Speech.getAvailableVoicesAsync();
    return voices.some((v) => v.language?.toLowerCase().startsWith(locale));
  } catch {
    return false;
  }
}

export const usePlayer = create<PlayerState>((set, get) => {
  const stopTicker = () => {
    if (ticker) clearInterval(ticker);
    ticker = null;
  };

  const finish = () => {
    stopTicker();
    const { placeId, duration } = get();
    set({ playing: false, position: duration });
    if (placeId) {
      delete resumeAt[placeId];
      track('audio_completed', { place_id: placeId });
    }
  };

  /** Speaks sentence `index` and chains to the next one when it ends. */
  const speakFrom = (index: number) => {
    const { timeline, locale, rate } = get();
    const segment = timeline[index];
    if (!segment) return finish();
    const mine = ++generation;
    set({ playing: true, position: segment.start });
    stopTicker();
    ticker = setInterval(() => {
      const s = get();
      set({ position: Math.min(segment.end, s.position + (TICK_MS / 1000) * s.rate) });
    }, TICK_MS);
    Speech.speak(segment.text, {
      language: SPEECH_LANG[locale],
      rate,
      onDone: () => {
        if (mine === generation) speakFrom(index + 1);
      },
      onError: () => {
        if (mine === generation) {
          stopTicker();
          set({ playing: false });
        }
      },
    });
  };

  const pauseSpeech = () => {
    generation++;
    stopTicker();
    void Speech.stop();
    set({ playing: false });
  };

  const releaseFile = () => {
    if (file) {
      try {
        file.remove();
      } catch {
        // Already released.
      }
      file = null;
    }
  };

  const reset = () => {
    const { placeId, position, duration } = get();
    if (placeId && position < duration - 1) resumeAt[placeId] = position;
    generation++;
    stopTicker();
    void Speech.stop();
    releaseFile();
  };

  return {
    placeId: null,
    title: '',
    locale: 'en',
    engine: 'none',
    timeline: [],
    playing: false,
    position: 0,
    duration: 0,
    rate: 1,

    load: async (place, locale, autoplay = true) => {
      const current = get();
      if (current.placeId === place.id && current.locale === locale) {
        if (autoplay && !current.playing) current.toggle();
        return;
      }
      reset();
      const content = place.content[locale];
      const timeline = buildTimeline(content.story);
      const url = place.audioUrl[locale];
      const rate = useApp.getState().defaultSpeed;
      const position = resumeAt[place.id] ?? 0;
      const engine: Engine = url ? 'file' : (await hasVoice(locale)) ? 'speech' : 'none';

      set({
        placeId: place.id,
        title: content.name,
        locale,
        engine,
        timeline,
        rate,
        position,
        duration: totalDuration(timeline),
        playing: false,
      });

      if (engine === 'file' && url) {
        await setAudioModeAsync({ playsInSilentMode: true, shouldPlayInBackground: true }).catch(() => undefined);
        const player = createAudioPlayer(url);
        file = player;
        player.addListener('playbackStatusUpdate', (status) => {
          if (file !== player) return;
          set({
            playing: status.playing,
            position: status.currentTime,
            duration: status.duration || get().duration,
          });
          if (status.didJustFinish) finish();
        });
        player.setPlaybackRate(rate);
        if (position > 0) void player.seekTo(position);
      }

      if (autoplay && engine !== 'none') {
        get().toggle();
        track('audio_started', { place_id: place.id, engine, locale });
        useLibrary.getState().addHistory(place.id, 'listen');
      }
    },

    toggle: () => {
      const { engine, playing, position, duration, timeline } = get();
      if (engine === 'none') return;
      if (engine === 'file') {
        if (!file) return;
        if (playing) file.pause();
        else {
          if (position >= duration - 0.5) void file.seekTo(0);
          file.play();
        }
        return;
      }
      if (playing) pauseSpeech();
      else speakFrom(position >= duration - 0.1 ? 0 : segmentAt(timeline, position));
    },

    seekBy: (seconds) => {
      const { engine, position, duration, timeline, playing } = get();
      const target = Math.min(Math.max(0, position + seconds), duration);
      if (engine === 'file') {
        void file?.seekTo(target);
        set({ position: target });
        return;
      }
      if (engine === 'none') return;
      // Speech can only start at a sentence boundary, so snap to the sentence at the target.
      const index = segmentAt(timeline, target);
      if (playing) {
        void Speech.stop();
        speakFrom(index);
      } else {
        set({ position: timeline[index]?.start ?? 0 });
      }
    },

    setRate: (rate) => {
      const { engine, playing, timeline, position } = get();
      set({ rate });
      if (engine === 'file') file?.setPlaybackRate(rate);
      else if (engine === 'speech' && playing) {
        void Speech.stop();
        speakFrom(segmentAt(timeline, position));
      }
    },

    stop: () => {
      reset();
      set({ placeId: null, title: '', timeline: [], playing: false, position: 0, duration: 0, engine: 'none' });
    },
  };
});
