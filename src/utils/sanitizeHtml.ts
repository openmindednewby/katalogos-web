import DOMPurify from 'dompurify';

/** Sanitizes an HTML string, stripping script tags, event handlers, */
export function sanitizeHtml(html: string): string {
  return DOMPurify.sanitize(html);
}
