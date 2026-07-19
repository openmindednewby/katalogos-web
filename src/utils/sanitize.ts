/**
 * Re-export shim over the shared `@dloizides/utils` package (de-fork Wave 1).
 *
 * Only `sanitizeText` is re-exported because only `sanitizeText` is used here.
 * `sanitizeHtml`, `removeControlCharacters`, `sanitizeNotificationMessage` and
 * `sanitizeUrl` still ship from the package (with their tests) — import them from
 * `@dloizides/utils` directly if a caller ever needs them, rather than widening
 * this shim back into a set of dead exports.
 *
 * NOTE: the `sanitizeHtml` used across this app is the DOMPurify scrubber in
 * `./sanitizeHtml`, NOT the entity-escaper of the same name in `@dloizides/utils`.
 */
export { sanitizeText } from '@dloizides/utils';
