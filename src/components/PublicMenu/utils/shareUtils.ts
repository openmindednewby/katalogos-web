import SharePlatform from '../../../shared/enums/SharePlatform';

const WHATSAPP_BASE_URL = 'https://wa.me/';
const FACEBOOK_SHARE_URL = 'https://www.facebook.com/sharer/sharer.php';
const TWITTER_INTENT_URL = 'https://twitter.com/intent/tweet';
const COPIED_FEEDBACK_DURATION_MS = 2000;

/**
 * Builds a WhatsApp share URL with the given text.
 * Uses the wa.me deep link which works on both mobile and desktop.
 */
export function buildWhatsAppUrl(shareText: string): string {
  return `${WHATSAPP_BASE_URL}?text=${encodeURIComponent(shareText)}`;
}

/** Builds a Facebook sharer URL for the given page URL. */
export function buildFacebookUrl(pageUrl: string): string {
  return `${FACEBOOK_SHARE_URL}?u=${encodeURIComponent(pageUrl)}`;
}

/** Builds a Twitter intent URL with the given text and URL. */
export function buildTwitterUrl(shareText: string, pageUrl: string): string {
  return `${TWITTER_INTENT_URL}?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(pageUrl)}`;
}

/** Returns the share URL for the given platform. */
export function getShareUrl(
  platform: SharePlatform,
  pageUrl: string,
  shareText: string,
): string {
  if (platform === SharePlatform.WhatsApp)
    return buildWhatsAppUrl(`${shareText} ${pageUrl}`);

  if (platform === SharePlatform.Facebook)
    return buildFacebookUrl(pageUrl);

  if (platform === SharePlatform.Twitter)
    return buildTwitterUrl(shareText, pageUrl);

  return pageUrl;
}

/** Detects whether the Web Share API is available. */
export function isNativeShareSupported(): boolean {
  return typeof navigator !== 'undefined' && typeof navigator.share === 'function';
}

/** Invokes the Web Share API with the given title, text, and URL. */
export async function triggerNativeShare(
  title: string,
  text: string,
  url: string,
): Promise<boolean> {
  if (!isNativeShareSupported()) return false;

  try {
    await navigator.share({ title, text, url });
    return true;
  } catch {
    return false;
  }
}

/**
 * Copies text to clipboard and returns true on success.
 * Uses the Clipboard API with a fallback to execCommand for older browsers.
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

/** Duration in ms to show the "Copied!" feedback indicator. */
export { COPIED_FEEDBACK_DURATION_MS };
