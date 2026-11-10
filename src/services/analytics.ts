/**
 * One place for product events. It logs in development and forwards to a sink in
 * production; plug PostHog/Amplitude/Sentry in with `setAnalyticsSink` at startup.
 */
export type AnalyticsEvent =
  | 'onboarding_completed'
  | 'scan_started'
  | 'scan_recognized'
  | 'scan_candidates'
  | 'scan_failed'
  | 'scan_limit_reached'
  | 'place_viewed'
  | 'place_saved'
  | 'audio_started'
  | 'audio_completed'
  | 'paywall_viewed'
  | 'purchase_completed'
  | 'error';

type Props = Record<string, string | number | boolean | null | undefined>;
type Sink = (event: AnalyticsEvent, props: Props) => void;

let sink: Sink | null = null;

export function setAnalyticsSink(next: Sink | null) {
  sink = next;
}

export function track(event: AnalyticsEvent, props: Props = {}) {
  try {
    if (sink) sink(event, props);
    else if (__DEV__) console.log(`[analytics] ${event}`, props);
  } catch {
    // Analytics must never break the app.
  }
}
