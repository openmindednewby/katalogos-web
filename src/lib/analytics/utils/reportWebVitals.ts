/**
 * Core Web Vitals reporting.
 *
 * Subscribes to the five Core Web Vitals (CLS, INP, LCP, FCP, TTFB) and forwards
 * each one to the app's analytics abstraction as a single `web_vital` event. This
 * goes through the same `track` callback the rest of analytics uses, so it inherits
 * consent gating and provider fan-out (PostHog / Umami / no-op).
 *
 * `web-vitals` is a browser-only API; callers must guard for web before invoking.
 */
import { onCLS, onFCP, onINP, onLCP, onTTFB } from 'web-vitals';

import AnalyticsEventName from '../../../shared/enums/AnalyticsEventName';

import type { AnalyticsTrackFn } from '../types';
import type { Metric } from 'web-vitals';

/** Property keys attached to every `web_vital` event. */
const enum WebVitalProperty {
  Metric = 'metric',
  Value = 'value',
  Rating = 'rating',
  Id = 'id',
}

/**
 * CLS is a unitless ratio reported to a few decimal places; the others are
 * milliseconds. Round CLS to keep its precision, round the rest to whole ms.
 */
const CLS_METRIC_NAME = 'CLS';
const CLS_DECIMAL_PLACES = 4;
const DECIMAL_BASE = 10;

function roundMetricValue(metric: Metric): number {
  if (metric.name === CLS_METRIC_NAME) {
    const factor = DECIMAL_BASE ** CLS_DECIMAL_PLACES;
    return Math.round(metric.value * factor) / factor;
  }
  return Math.round(metric.value);
}

function buildHandler(track: AnalyticsTrackFn): (metric: Metric) => void {
  return (metric: Metric) => {
    track(AnalyticsEventName.WebVital, {
      [WebVitalProperty.Metric]: metric.name,
      [WebVitalProperty.Value]: roundMetricValue(metric),
      [WebVitalProperty.Rating]: metric.rating,
      [WebVitalProperty.Id]: metric.id,
    });
  };
}

/**
 * Begin reporting Core Web Vitals through the provided analytics `track` callback.
 * Safe to call once at startup; each metric library invokes the handler when its
 * value becomes available. Browser-only — do not call on native.
 */
export function reportWebVitals(track: AnalyticsTrackFn): void {
  const handler = buildHandler(track);
  onCLS(handler);
  onINP(handler);
  onLCP(handler);
  onFCP(handler);
  onTTFB(handler);
}
