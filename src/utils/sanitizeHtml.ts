/** Client-side HTML sanitization via DOMPurify. */
import DOMPurify from 'dompurify';

/**
 * Sanitizes an HTML string, stripping script tags, event handlers,
 * and other potentially dangerous content.
 */
export function sanitizeHtml(html: string): string {
  return DOMPurify.sanitize(html);
}
