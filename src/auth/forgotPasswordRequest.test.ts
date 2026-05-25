import { buildResetUrlTemplate } from './forgotPasswordRequest';

describe('forgotPasswordRequest', () => {
  describe('buildResetUrlTemplate', () => {
    it('uses the provided origin when supplied', () => {
      const url = buildResetUrlTemplate('https://erevna.example.com');
      expect(url).toBe('https://erevna.example.com/reset-password?token={token}');
    });

    it('falls back to a localhost default when no origin supplied and window is unavailable', () => {
      const original = (globalThis as { window?: unknown }).window;
      delete (globalThis as { window?: unknown }).window;
      try {
        const url = buildResetUrlTemplate();
        expect(url).toBe('http://localhost:8083/reset-password?token={token}');
      } finally {
        if (original !== undefined) (globalThis as { window?: unknown }).window = original;
      }
    });

    it('embeds the {token} placeholder verbatim for backend substitution', () => {
      const url = buildResetUrlTemplate('https://katalogos.example.com');
      expect(url).toContain('{token}');
      expect(url.endsWith('?token={token}')).toBe(true);
    });
  });
});
