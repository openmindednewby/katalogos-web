import { buildPublicMenuUrl } from './buildPublicMenuUrl';

jest.mock('react-native', () => ({
  Platform: { OS: 'web' },
}));

describe('buildPublicMenuUrl', () => {
  const originalLocation = window.location;

  beforeEach(() => {
    Object.defineProperty(window, 'location', {
      value: { origin: 'https://example.com' },
      writable: true,
    });
  });

  afterEach(() => {
    Object.defineProperty(window, 'location', {
      value: originalLocation,
      writable: true,
    });
  });

  it('constructs URL with origin and menu ID', () => {
    const result = buildPublicMenuUrl('abc-123');
    expect(result).toBe('https://example.com/public/menu/abc-123');
  });

  it('handles empty ID gracefully', () => {
    const result = buildPublicMenuUrl('');
    expect(result).toBe('https://example.com/public/menu/');
  });
});
