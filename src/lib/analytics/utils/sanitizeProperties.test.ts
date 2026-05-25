import { REDACTED_VALUE } from '../constants';
import { sanitizeProperties } from './sanitizeProperties';

describe('sanitizeProperties', () => {
  it('returns undefined when given undefined', () => {
    expect(sanitizeProperties(undefined)).toBeUndefined();
  });

  it('passes through safe properties unchanged', () => {
    const props = { menuType: 'cafe', itemCount: 5, isActive: true };

    const result = sanitizeProperties(props);

    expect(result).toEqual({ menuType: 'cafe', itemCount: 5, isActive: true });
  });

  it('redacts password fields', () => {
    const props = { feature: 'login', password: 'secret123', newPassword: 'abc' };

    const result = sanitizeProperties(props);

    expect(result).toEqual({
      feature: 'login',
      password: REDACTED_VALUE,
      newPassword: REDACTED_VALUE,
    });
  });

  it('redacts email fields', () => {
    const props = { email: 'test@example.com', userEmail: 'user@test.com', name: 'John' };

    const result = sanitizeProperties(props);

    expect(result).toEqual({
      email: REDACTED_VALUE,
      userEmail: REDACTED_VALUE,
      name: 'John',
    });
  });

  it('redacts token fields', () => {
    const props = { accessToken: 'abc123', refreshToken: 'xyz', action: 'refresh' };

    const result = sanitizeProperties(props);

    expect(result).toEqual({
      accessToken: REDACTED_VALUE,
      refreshToken: REDACTED_VALUE,
      action: 'refresh',
    });
  });

  it('redacts secret and apikey fields', () => {
    const props = { clientSecret: 'hidden', apikey: 'key-123', region: 'eu' };

    const result = sanitizeProperties(props);

    expect(result).toEqual({
      clientSecret: REDACTED_VALUE,
      apikey: REDACTED_VALUE,
      region: 'eu',
    });
  });

  it('redacts creditcard and phone fields', () => {
    const props = { creditcard: '4111', phone: '+1234567890', plan: 'pro' };

    const result = sanitizeProperties(props);

    expect(result).toEqual({
      creditcard: REDACTED_VALUE,
      phone: REDACTED_VALUE,
      plan: 'pro',
    });
  });

  it('performs case-insensitive matching on keys', () => {
    const props = { PASSWORD: 'secret', Email: 'user@test.com' };

    const result = sanitizeProperties(props);

    expect(result).toEqual({
      PASSWORD: REDACTED_VALUE,
      Email: REDACTED_VALUE,
    });
  });

  it('returns empty object for empty properties', () => {
    const result = sanitizeProperties({});

    expect(result).toEqual({});
  });
});
