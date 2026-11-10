export interface Segment {
  text: string;
  /** Seconds from the start of the narration at 1x speed. */
  start: number;
  end: number;
}

/** Average speaking pace used to estimate timings for on-device speech. */
export const CHARS_PER_SECOND = 15;

/**
 * Splits narration into sentences. Punctuation that is not followed by whitespace
 * (decimals such as "86.1", abbreviations inside a word) does not end a sentence.
 */
export function splitSentences(text: string): string[] {
  const matches = text.match(/[^.!?…]+(?:[.!?…](?!\s|$)[^.!?…]*)*[.!?…]*\s*/g) ?? [];
  return matches.map((s) => s.trim()).filter(Boolean);
}

export function buildTimeline(text: string, charsPerSecond = CHARS_PER_SECOND): Segment[] {
  let cursor = 0;
  return splitSentences(text).map((sentence) => {
    const length = Math.max(1, sentence.length / charsPerSecond);
    const segment = { text: sentence, start: cursor, end: cursor + length };
    cursor += length;
    return segment;
  });
}

export function totalDuration(timeline: Segment[]): number {
  return timeline.length ? timeline[timeline.length - 1].end : 0;
}

/** Index of the sentence that contains `position`; clamps to the valid range. */
export function segmentAt(timeline: Segment[], position: number): number {
  if (timeline.length === 0) return 0;
  const index = timeline.findIndex((s) => position < s.end);
  return index === -1 ? timeline.length - 1 : index;
}

export function estimateMinutes(text: string): number {
  return Math.max(1, Math.round(totalDuration(buildTimeline(text)) / 60));
}
