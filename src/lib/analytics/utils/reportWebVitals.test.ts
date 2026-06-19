import { reportWebVitals } from './reportWebVitals';
import AnalyticsEventName from '../../../shared/enums/AnalyticsEventName';


import type { Metric } from 'web-vitals';

type MetricHandler = (metric: Metric) => void;

const handlers: Record<string, MetricHandler> = {};

jest.mock('web-vitals', () => ({
  onCLS: (cb: MetricHandler) => { handlers.CLS = cb; },
  onINP: (cb: MetricHandler) => { handlers.INP = cb; },
  onLCP: (cb: MetricHandler) => { handlers.LCP = cb; },
  onFCP: (cb: MetricHandler) => { handlers.FCP = cb; },
  onTTFB: (cb: MetricHandler) => { handlers.TTFB = cb; },
}));

function makeMetric(name: string, value: number, rating: string, id: string): Metric {
  return { name, value, rating, id } as unknown as Metric;
}

describe('reportWebVitals', () => {
  beforeEach(() => {
    Object.keys(handlers).forEach((key) => delete handlers[key]);
  });

  it('subscribes to all five Core Web Vitals', () => {
    reportWebVitals(jest.fn());

    expect(Object.keys(handlers).sort()).toEqual(['CLS', 'FCP', 'INP', 'LCP', 'TTFB']);
  });

  it('forwards a single web_vital event per metric with the right shape', () => {
    const track = jest.fn();
    reportWebVitals(track);

    handlers.LCP(makeMetric('LCP', 2345.6, 'good', 'v3-lcp-1'));

    expect(track).toHaveBeenCalledTimes(1);
    expect(track).toHaveBeenCalledWith(AnalyticsEventName.WebVital, {
      metric: 'LCP',
      value: 2346,
      rating: 'good',
      id: 'v3-lcp-1',
    });
  });

  it('rounds millisecond metrics to whole numbers', () => {
    const track = jest.fn();
    reportWebVitals(track);

    handlers.INP(makeMetric('INP', 187.49, 'needs-improvement', 'inp-1'));

    expect(track).toHaveBeenCalledWith(
      AnalyticsEventName.WebVital,
      expect.objectContaining({ metric: 'INP', value: 187 }),
    );
  });

  it('keeps CLS precision (4 decimals) since it is a unitless ratio', () => {
    const track = jest.fn();
    reportWebVitals(track);

    handlers.CLS(makeMetric('CLS', 0.123456, 'poor', 'cls-1'));

    expect(track).toHaveBeenCalledWith(
      AnalyticsEventName.WebVital,
      expect.objectContaining({ metric: 'CLS', value: 0.1235 }),
    );
  });

  it('forwards each metric independently as one event', () => {
    const track = jest.fn();
    reportWebVitals(track);

    handlers.FCP(makeMetric('FCP', 900.2, 'good', 'fcp-1'));
    handlers.TTFB(makeMetric('TTFB', 120.8, 'good', 'ttfb-1'));

    expect(track).toHaveBeenCalledTimes(2);
    expect(track).toHaveBeenNthCalledWith(
      1,
      AnalyticsEventName.WebVital,
      expect.objectContaining({ metric: 'FCP', value: 900 }),
    );
    expect(track).toHaveBeenNthCalledWith(
      2,
      AnalyticsEventName.WebVital,
      expect.objectContaining({ metric: 'TTFB', value: 121 }),
    );
  });
});
