import {
  buildFacebookUrl,
  buildTwitterUrl,
  buildWhatsAppUrl,
  copyToClipboard,
  getShareUrl,
  isNativeShareSupported,
  triggerNativeShare,
} from './shareUtils';
import SharePlatform from '../../../shared/enums/SharePlatform';

const SAMPLE_URL = 'https://app.menuflow.com/public/menu/abc123';
const SAMPLE_TEXT = 'Check out this menu';

describe('buildWhatsAppUrl', () => {
  it('encodes the share text in a wa.me URL', () => {
    const result = buildWhatsAppUrl(`${SAMPLE_TEXT} ${SAMPLE_URL}`);
    expect(result).toContain('https://wa.me/?text=');
    expect(result).toContain(encodeURIComponent(`${SAMPLE_TEXT} ${SAMPLE_URL}`));
  });
});

describe('buildFacebookUrl', () => {
  it('encodes the page URL in a Facebook sharer URL', () => {
    const result = buildFacebookUrl(SAMPLE_URL);
    expect(result).toBe(
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(SAMPLE_URL)}`,
    );
  });
});

describe('buildTwitterUrl', () => {
  it('encodes both text and URL in a Twitter intent URL', () => {
    const result = buildTwitterUrl(SAMPLE_TEXT, SAMPLE_URL);
    expect(result).toContain('https://twitter.com/intent/tweet?text=');
    expect(result).toContain(encodeURIComponent(SAMPLE_TEXT));
    expect(result).toContain(`&url=${encodeURIComponent(SAMPLE_URL)}`);
  });
});

describe('getShareUrl', () => {
  it('returns WhatsApp URL for WhatsApp platform', () => {
    const result = getShareUrl(SharePlatform.WhatsApp, SAMPLE_URL, SAMPLE_TEXT);
    expect(result).toContain('wa.me');
  });

  it('returns Facebook URL for Facebook platform', () => {
    const result = getShareUrl(SharePlatform.Facebook, SAMPLE_URL, SAMPLE_TEXT);
    expect(result).toContain('facebook.com/sharer');
  });

  it('returns Twitter URL for Twitter platform', () => {
    const result = getShareUrl(SharePlatform.Twitter, SAMPLE_URL, SAMPLE_TEXT);
    expect(result).toContain('twitter.com/intent');
  });

  it('returns the page URL for unsupported platforms', () => {
    const result = getShareUrl(SharePlatform.CopyLink, SAMPLE_URL, SAMPLE_TEXT);
    expect(result).toBe(SAMPLE_URL);
  });
});

describe('isNativeShareSupported', () => {
  const originalNavigator = global.navigator;

  afterEach(() => {
    Object.defineProperty(global, 'navigator', {
      value: originalNavigator,
      writable: true,
    });
  });

  it('returns true when navigator.share is a function', () => {
    Object.defineProperty(global, 'navigator', {
      value: { share: jest.fn() },
      writable: true,
    });
    expect(isNativeShareSupported()).toBe(true);
  });

  it('returns false when navigator.share is undefined', () => {
    Object.defineProperty(global, 'navigator', {
      value: {},
      writable: true,
    });
    expect(isNativeShareSupported()).toBe(false);
  });
});

describe('triggerNativeShare', () => {
  const originalNavigator = global.navigator;

  afterEach(() => {
    Object.defineProperty(global, 'navigator', {
      value: originalNavigator,
      writable: true,
    });
  });

  it('returns true when share succeeds', async () => {
    Object.defineProperty(global, 'navigator', {
      value: { share: jest.fn().mockResolvedValue(undefined) },
      writable: true,
    });
    const result = await triggerNativeShare('Title', 'Text', SAMPLE_URL);
    expect(result).toBe(true);
    expect(navigator.share).toHaveBeenCalledWith({
      title: 'Title',
      text: 'Text',
      url: SAMPLE_URL,
    });
  });

  it('returns false when share throws (user cancels)', async () => {
    Object.defineProperty(global, 'navigator', {
      value: { share: jest.fn().mockRejectedValue(new Error('AbortError')) },
      writable: true,
    });
    const result = await triggerNativeShare('Title', 'Text', SAMPLE_URL);
    expect(result).toBe(false);
  });

  it('returns false when Web Share API is not supported', async () => {
    Object.defineProperty(global, 'navigator', {
      value: {},
      writable: true,
    });
    const result = await triggerNativeShare('Title', 'Text', SAMPLE_URL);
    expect(result).toBe(false);
  });
});

describe('copyToClipboard', () => {
  const originalNavigator = global.navigator;

  afterEach(() => {
    Object.defineProperty(global, 'navigator', {
      value: originalNavigator,
      writable: true,
    });
  });

  it('returns true when clipboard write succeeds', async () => {
    Object.defineProperty(global, 'navigator', {
      value: { clipboard: { writeText: jest.fn().mockResolvedValue(undefined) } },
      writable: true,
    });
    const result = await copyToClipboard(SAMPLE_URL);
    expect(result).toBe(true);
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(SAMPLE_URL);
  });

  it('returns false when clipboard write fails', async () => {
    Object.defineProperty(global, 'navigator', {
      value: { clipboard: { writeText: jest.fn().mockRejectedValue(new Error('fail')) } },
      writable: true,
    });
    const result = await copyToClipboard(SAMPLE_URL);
    expect(result).toBe(false);
  });
});
