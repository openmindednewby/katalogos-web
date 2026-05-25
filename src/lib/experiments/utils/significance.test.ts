/**
 * Tests for significance calculation and metric formatting.
 * Focuses on logic thresholds and edge cases.
 */
import SignificanceResult, {
  calculateSignificance,
  formatMetricPercentage,
} from './significance';

const MIN_SAMPLE_SIZE = 30;

describe('calculateSignificance', () => {
  it('returns NotEnoughData when total views below threshold', () => {
    const belowThreshold = MIN_SAMPLE_SIZE - 1;
    const result = calculateSignificance(belowThreshold, 0);
    expect(result).toBe(SignificanceResult.NotEnoughData);
  });

  it('returns NotEnoughData when both zero', () => {
    expect(calculateSignificance(0, 0)).toBe(SignificanceResult.NotEnoughData);
  });

  it('returns VariantBWinning when B has 60% or more', () => {
    const result = calculateSignificance(12, 18);
    expect(result).toBe(SignificanceResult.VariantBWinning);
  });

  it('returns VariantAWinning when A has 60% or more', () => {
    const result = calculateSignificance(18, 12);
    expect(result).toBe(SignificanceResult.VariantAWinning);
  });

  it('returns NoClearWinner when close to even split', () => {
    const result = calculateSignificance(16, 14);
    expect(result).toBe(SignificanceResult.NoClearWinner);
  });

  it('returns NoClearWinner at exact 50/50 split', () => {
    const result = calculateSignificance(15, 15);
    expect(result).toBe(SignificanceResult.NoClearWinner);
  });

  it('returns VariantBWinning at exact 60% threshold', () => {
    const result = calculateSignificance(20, 30);
    expect(result).toBe(SignificanceResult.VariantBWinning);
  });

  it('returns NoClearWinner just below 60% threshold', () => {
    const aViews = 21;
    const bViews = 29;
    const result = calculateSignificance(aViews, bViews);
    expect(result).toBe(SignificanceResult.NoClearWinner);
  });
});

describe('formatMetricPercentage', () => {
  it('returns "0" when total is zero', () => {
    expect(formatMetricPercentage(0, 0)).toBe('0');
  });

  it('returns correct percentage for half', () => {
    expect(formatMetricPercentage(50, 100)).toBe('50');
  });

  it('returns rounded percentage', () => {
    expect(formatMetricPercentage(1, 3)).toBe('33');
  });

  it('returns "100" when all views are for one variant', () => {
    expect(formatMetricPercentage(30, 30)).toBe('100');
  });

  it('handles large numbers correctly', () => {
    const largeA = 75000;
    const total = 100000;
    expect(formatMetricPercentage(largeA, total)).toBe('75');
  });
});
