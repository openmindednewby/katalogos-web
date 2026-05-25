/**
 * Tests for sanitizeHtml utility.
 * Verifies that dangerous HTML is stripped while safe content is preserved.
 */
import { sanitizeHtml } from './sanitizeHtml';

describe('sanitizeHtml', () => {
  it('preserves safe HTML tags', () => {
    const input = '<p>Hello <strong>world</strong></p>';
    expect(sanitizeHtml(input)).toBe(input);
  });

  it('strips script tags', () => {
    const input = '<p>Hello</p><script>alert("xss")</script>';
    expect(sanitizeHtml(input)).toBe('<p>Hello</p>');
  });

  it('strips event handler attributes', () => {
    const input = '<div onmouseover="alert(1)">hover</div>';
    const result = sanitizeHtml(input);
    expect(result).not.toContain('onmouseover');
    expect(result).toContain('hover');
  });

  it('strips javascript: protocol in href', () => {
    const input = '<a href="javascript:alert(1)">click</a>';
    const result = sanitizeHtml(input);
    expect(result).not.toContain('javascript:');
  });

  it('returns empty string for empty input', () => {
    expect(sanitizeHtml('')).toBe('');
  });
});
