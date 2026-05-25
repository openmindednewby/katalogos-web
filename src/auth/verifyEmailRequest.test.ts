import { buildVerifyUrlTemplate } from './verifyEmailRequest';

describe('verifyEmailRequest', () => {
  describe('buildVerifyUrlTemplate', () => {
    it('uses the provided origin when supplied', () => {
      const url = buildVerifyUrlTemplate('https://katalogos.example.com');
      expect(url).toBe('https://katalogos.example.com/verify-email?token={token}');
    });

    it('falls back to a localhost default when no origin supplied and window is unavailable', () => {
      const original = (globalThis as { window?: unknown }).window;
      delete (globalThis as { window?: unknown }).window;
      try {
        const url = buildVerifyUrlTemplate();
        expect(url).toBe('http://localhost:8083/verify-email?token={token}');
      } finally {
        if (original !== undefined) (globalThis as { window?: unknown }).window = original;
      }
    });

    it('embeds the {token} placeholder verbatim for backend substitution', () => {
      const url = buildVerifyUrlTemplate('https://erevna.example.com');
      expect(url).toContain('{token}');
      expect(url.endsWith('?token={token}')).toBe(true);
    });

    it('treats an empty-string origin argument as unset', () => {
      const original = (globalThis as { window?: unknown }).window;
      delete (globalThis as { window?: unknown }).window;
      try {
        const url = buildVerifyUrlTemplate('');
        expect(url).toBe('http://localhost:8083/verify-email?token={token}');
      } finally {
        if (original !== undefined) (globalThis as { window?: unknown }).window = original;
      }
    });
  });
});
