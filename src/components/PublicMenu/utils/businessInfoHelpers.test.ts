import { formatAddress, hasDisplayableInfo, isNonEmpty, parseOperatingHours } from './businessInfoHelpers';

describe('isNonEmpty', () => {
  it('returns true for non-empty strings', () => {
    expect(isNonEmpty('hello')).toBe(true);
  });

  it('returns false for empty string', () => {
    expect(isNonEmpty('')).toBe(false);
  });

  it('returns false for null', () => {
    expect(isNonEmpty(null)).toBe(false);
  });

  it('returns false for undefined', () => {
    expect(isNonEmpty(undefined)).toBe(false);
  });
});

describe('formatAddress', () => {
  it('returns null for profile with no address fields', () => {
    expect(formatAddress({})).toBeNull();
  });

  it('formats a full address with newlines between parts', () => {
    const result = formatAddress({
      addressLine1: '123 Main St',
      addressLine2: 'Suite 4',
      city: 'Springfield',
      state: 'IL',
      postalCode: '62701',
      country: 'US',
    });

    expect(result).toBe('123 Main St, Suite 4\nSpringfield, IL\n62701\nUS');
  });

  it('omits empty address parts', () => {
    const result = formatAddress({
      addressLine1: '123 Main St',
      city: 'Springfield',
      state: null,
      postalCode: '',
    });

    expect(result).toBe('123 Main St\nSpringfield');
  });

  it('handles city and state only', () => {
    const result = formatAddress({ city: 'Austin', state: 'TX' });
    expect(result).toBe('Austin, TX');
  });
});

describe('parseOperatingHours', () => {
  it('returns empty array for null', () => {
    expect(parseOperatingHours(null)).toEqual([]);
  });

  it('returns empty array for empty string', () => {
    expect(parseOperatingHours('')).toEqual([]);
  });

  it('returns empty array for invalid JSON', () => {
    expect(parseOperatingHours('not json')).toEqual([]);
  });

  it('returns empty array when hours key is missing', () => {
    expect(parseOperatingHours(JSON.stringify({ other: 'data' }))).toEqual([]);
  });

  it('parses valid operating hours', () => {
    const json = JSON.stringify({
      hours: [
        { day: 0, open: '09:00', close: '17:00' },
        { day: 1, open: '10:00', close: '18:00' },
      ],
    });

    const result = parseOperatingHours(json);
    expect(result).toHaveLength(2);
    expect(result[0]).toEqual({ day: 0, open: '09:00', close: '17:00' });
  });

  it('filters out invalid entries', () => {
    const json = JSON.stringify({
      hours: [
        { day: 0, open: '09:00', close: '17:00' },
        { day: 'invalid', open: '10:00', close: '18:00' },
        null,
      ],
    });

    const result = parseOperatingHours(json);
    expect(result).toHaveLength(1);
  });
});

describe('hasDisplayableInfo', () => {
  it('returns false for empty profile', () => {
    expect(hasDisplayableInfo({})).toBe(false);
  });

  it('returns true when phone is present', () => {
    expect(hasDisplayableInfo({ phone: '+1234567890' })).toBe(true);
  });

  it('returns true when email is present', () => {
    expect(hasDisplayableInfo({ email: 'test@example.com' })).toBe(true);
  });

  it('returns true when website is present', () => {
    expect(hasDisplayableInfo({ website: 'https://example.com' })).toBe(true);
  });

  it('returns true when address is present', () => {
    expect(hasDisplayableInfo({ city: 'Springfield' })).toBe(true);
  });

  it('returns true when operating hours are present', () => {
    const json = JSON.stringify({ hours: [{ day: 0, open: '09:00', close: '17:00' }] });
    expect(hasDisplayableInfo({ operatingHoursJson: json })).toBe(true);
  });

  it('returns false when all values are null or empty', () => {
    expect(hasDisplayableInfo({
      phone: null,
      email: '',
      website: null,
      addressLine1: null,
      city: null,
      operatingHoursJson: null,
    })).toBe(false);
  });
});
