/**
 * Tests for QrCodeModal logic (download and clipboard operations).
 * Focuses on callback behavior, not rendering.
 */
import { buildPublicMenuUrl } from './utils/buildPublicMenuUrl';
import { copyToClipboard, downloadQrAsPng, downloadQrAsSvg } from './utils/qrCodeDownload';

jest.mock('react-native', () => ({
  Platform: { OS: 'web' },
}));

describe('QrCodeModal logic', () => {
  describe('buildPublicMenuUrl', () => {
    beforeEach(() => {
      Object.defineProperty(window, 'location', {
        value: { origin: 'https://app.example.com' },
        writable: true,
      });
    });

    it('builds correct URL for a menu ID', () => {
      const url = buildPublicMenuUrl('menu-abc-123');
      expect(url).toBe('https://app.example.com/public/menu/menu-abc-123');
    });

    it('includes origin in the URL on web platform', () => {
      const url = buildPublicMenuUrl('test-id');
      expect(url).toContain('https://app.example.com');
    });
  });

  describe('downloadQrAsSvg', () => {
    it('returns false when no container element exists', () => {
      const result = downloadQrAsSvg('Test');
      expect(result).toBe(false);
    });
  });

  describe('downloadQrAsPng', () => {
    it('resolves false when no container element exists', async () => {
      const result = await downloadQrAsPng('Test', 256);
      expect(result).toBe(false);
    });
  });

  describe('copyToClipboard', () => {
    it('returns true on successful copy', async () => {
      Object.assign(navigator, {
        clipboard: { writeText: jest.fn().mockResolvedValue(undefined) },
      });
      const result = await copyToClipboard('https://example.com/public/menu/abc');
      expect(result).toBe(true);
    });

    it('returns false when copy fails', async () => {
      Object.assign(navigator, {
        clipboard: { writeText: jest.fn().mockRejectedValue(new Error('blocked')) },
      });
      const result = await copyToClipboard('https://example.com/public/menu/abc');
      expect(result).toBe(false);
    });
  });
});
