import { isPaidFeatureError } from './isPaidFeatureError';

describe('isPaidFeatureError', () => {
  it('returns true for a 403 axios-shaped error', () => {
    expect(isPaidFeatureError({ response: { status: 403 } })).toBe(true);
  });

  it('returns false for other statuses', () => {
    expect(isPaidFeatureError({ response: { status: 404 } })).toBe(false);
    expect(isPaidFeatureError({ response: { status: 500 } })).toBe(false);
  });

  it('returns false for non-response errors', () => {
    expect(isPaidFeatureError(new Error('boom'))).toBe(false);
    expect(isPaidFeatureError(null)).toBe(false);
    expect(isPaidFeatureError(undefined)).toBe(false);
    expect(isPaidFeatureError('nope')).toBe(false);
  });
});
