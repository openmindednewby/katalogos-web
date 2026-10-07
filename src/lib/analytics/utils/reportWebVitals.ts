import { onCLS, onFCP, onINP, onLCP, onTTFB } from 'web-vitals';

import AnalyticsEventName from '../../../shared/enums/AnalyticsEventName';

import type { AnalyticsTrackFn } from '../types';
import type { Metric } from 'web-vitals';

const enum WebVitalProperty {
  Metric = 'metric',
  Value = 'value',
  Rating = 'rating',
  Id = 'id',
}

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

/** Begin reporting Core Web Vitals through the provided analytics `track` callback. */
export function reportWebVitals(track: AnalyticsTrackFn): void {
  const handler = buildHandler(track);
  onCLS(handler);
  onINP(handler);
  onLCP(handler);
  onFCP(handler);
  onTTFB(handler);
}
