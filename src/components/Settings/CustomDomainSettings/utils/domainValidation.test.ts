/**
 * Unit tests for domain validation logic.
 */
import { isValidDomain } from './domainValidation';

describe('isValidDomain', () => {
  describe('valid domains', () => {
    it('accepts a standard two-level domain', () => {
      expect(isValidDomain('example.com')).toBe(true);
    });

    it('accepts a subdomain', () => {
      expect(isValidDomain('menu.myrestaurant.com')).toBe(true);
    });

    it('accepts a multi-level subdomain', () => {
      expect(isValidDomain('my-menu.restaurant.co.uk')).toBe(true);
    });

    it('accepts domains with hyphens in labels', () => {
      expect(isValidDomain('my-site.my-domain.com')).toBe(true);
    });

    it('accepts domains with numbers', () => {
      expect(isValidDomain('site123.example456.com')).toBe(true);
    });

    it('accepts single-character labels', () => {
      expect(isValidDomain('a.b.com')).toBe(true);
    });
  });

  describe('invalid domains', () => {
    it('rejects empty string', () => {
      expect(isValidDomain('')).toBe(false);
    });

    it('rejects single label without dot', () => {
      expect(isValidDomain('menu')).toBe(false);
    });

    it('rejects leading dot', () => {
      expect(isValidDomain('.com')).toBe(false);
    });

    it('rejects trailing dot', () => {
      expect(isValidDomain('menu.com.')).toBe(false);
    });

    it('rejects consecutive dots', () => {
      expect(isValidDomain('menu..com')).toBe(false);
    });

    it('rejects leading hyphen in label', () => {
      expect(isValidDomain('-menu.com')).toBe(false);
    });

    it('rejects trailing hyphen in label', () => {
      expect(isValidDomain('menu-.com')).toBe(false);
    });

    it('rejects domains with spaces', () => {
      expect(isValidDomain('menu .com')).toBe(false);
    });

    it('rejects domains with underscores', () => {
      expect(isValidDomain('my_menu.com')).toBe(false);
    });

    it('rejects label exceeding 63 characters', () => {
      const longLabel = 'a'.repeat(64);
      expect(isValidDomain(`${longLabel}.com`)).toBe(false);
    });

    it('accepts label at exactly 63 characters', () => {
      const maxLabel = 'a'.repeat(63);
      expect(isValidDomain(`${maxLabel}.com`)).toBe(true);
    });
  });
});
