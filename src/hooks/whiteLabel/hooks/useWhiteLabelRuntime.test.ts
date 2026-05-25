/**
 * Unit tests for useWhiteLabelRuntime hook utilities.
 * Tests the CSS injection/removal and favicon injection/removal functions.
 */
import { injectCustomCss, injectFavicon, removeCustomCss, removeFavicon } from './useWhiteLabelRuntime';

// Mock Platform to return 'web'
jest.mock('react-native', () => ({
  Platform: { OS: 'web' },
}));

describe('injectCustomCss', () => {
  let mockElement: HTMLStyleElement | null;

  beforeEach(() => {
    mockElement = null;

    jest.spyOn(document, 'getElementById').mockImplementation((_id: string) => mockElement);
    jest.spyOn(document, 'createElement').mockImplementation(
      (tag: string) => {
        const el = {
          tagName: tag.toUpperCase(),
          id: '',
          textContent: '',
          remove: jest.fn(),
        } as unknown as HTMLStyleElement;
        mockElement = el;
        return el;
      },
    );
    jest.spyOn(document.head, 'appendChild').mockImplementation((node) => node);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('creates a style element when CSS is provided and none exists', () => {
    injectCustomCss('.test { color: red; }');

    expect(document.createElement).toHaveBeenCalledWith('style');
    expect(document.head.appendChild).toHaveBeenCalled();
    expect(mockElement?.textContent).toBe('.test { color: red; }');
    expect(mockElement?.id).toBe('white-label-custom-css');
  });

  it('updates existing style element instead of creating new one', () => {
    const existing = { id: 'white-label-custom-css', textContent: 'old', remove: jest.fn() };
    jest.spyOn(document, 'getElementById').mockReturnValue(existing as unknown as HTMLElement);

    injectCustomCss('.new { color: blue; }');

    expect(existing.textContent).toBe('.new { color: blue; }');
    expect(document.createElement).not.toHaveBeenCalled();
  });

  it('removes style element when CSS is null', () => {
    const existing = { id: 'white-label-custom-css', textContent: 'old', remove: jest.fn() };
    jest.spyOn(document, 'getElementById').mockReturnValue(existing as unknown as HTMLElement);

    injectCustomCss(null);

    expect(existing.remove).toHaveBeenCalled();
  });

  it('removes style element when CSS is empty string', () => {
    const existing = { id: 'white-label-custom-css', textContent: 'old', remove: jest.fn() };
    jest.spyOn(document, 'getElementById').mockReturnValue(existing as unknown as HTMLElement);

    injectCustomCss('');

    expect(existing.remove).toHaveBeenCalled();
  });

  it('removes style element when CSS is whitespace only', () => {
    const existing = { id: 'white-label-custom-css', textContent: 'old', remove: jest.fn() };
    jest.spyOn(document, 'getElementById').mockReturnValue(existing as unknown as HTMLElement);

    injectCustomCss('   ');

    expect(existing.remove).toHaveBeenCalled();
  });

  it('does nothing when CSS is null and no existing element', () => {
    injectCustomCss(null);

    expect(document.createElement).not.toHaveBeenCalled();
  });
});

describe('removeCustomCss', () => {
  it('removes the style element if it exists', () => {
    const existing = { id: 'white-label-custom-css', remove: jest.fn() };
    jest.spyOn(document, 'getElementById').mockReturnValue(existing as unknown as HTMLElement);

    removeCustomCss();

    expect(existing.remove).toHaveBeenCalled();
  });

  it('does nothing if no style element exists', () => {
    jest.spyOn(document, 'getElementById').mockReturnValue(null);

    removeCustomCss();

    // No error thrown
    expect(document.getElementById).toHaveBeenCalledWith('white-label-custom-css');
  });
});

describe('injectFavicon', () => {
  let mockLink: HTMLLinkElement | null;

  beforeEach(() => {
    mockLink = null;

    jest.spyOn(document, 'getElementById').mockImplementation((_id: string) => mockLink);
    jest.spyOn(document, 'createElement').mockImplementation(
      (tag: string) => {
        const el = {
          tagName: tag.toUpperCase(),
          id: '',
          rel: '',
          href: '',
          remove: jest.fn(),
        } as unknown as HTMLLinkElement;
        mockLink = el;
        return el;
      },
    );
    jest.spyOn(document.head, 'appendChild').mockImplementation((node) => node);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('creates a link element when URL is provided and none exists', () => {
    injectFavicon('https://example.com/favicon.ico');

    expect(document.createElement).toHaveBeenCalledWith('link');
    expect(document.head.appendChild).toHaveBeenCalled();
    expect(mockLink?.href).toBe('https://example.com/favicon.ico');
    expect(mockLink?.rel).toBe('icon');
    expect(mockLink?.id).toBe('white-label-favicon');
  });

  it('updates existing link element instead of creating new one', () => {
    const existing = {
      id: 'white-label-favicon',
      href: 'old.ico',
      remove: jest.fn(),
      setAttribute: jest.fn((attr: string, value: string) => {
        if (attr === 'href') existing.href = value;
      }),
    };
    jest.spyOn(document, 'getElementById').mockReturnValue(existing as unknown as HTMLElement);

    injectFavicon('https://example.com/new-favicon.ico');

    expect(existing.setAttribute).toHaveBeenCalledWith('href', 'https://example.com/new-favicon.ico');
    expect(document.createElement).not.toHaveBeenCalled();
  });

  it('removes link element when URL is null', () => {
    const existing = { id: 'white-label-favicon', href: 'old.ico', remove: jest.fn() };
    jest.spyOn(document, 'getElementById').mockReturnValue(existing as unknown as HTMLElement);

    injectFavicon(null);

    expect(existing.remove).toHaveBeenCalled();
  });

  it('removes link element when URL is empty string', () => {
    const existing = { id: 'white-label-favicon', href: 'old.ico', remove: jest.fn() };
    jest.spyOn(document, 'getElementById').mockReturnValue(existing as unknown as HTMLElement);

    injectFavicon('');

    expect(existing.remove).toHaveBeenCalled();
  });

  it('does nothing when URL is null and no existing element', () => {
    injectFavicon(null);

    expect(document.createElement).not.toHaveBeenCalled();
  });
});

describe('removeFavicon', () => {
  it('removes the favicon link element if it exists', () => {
    const existing = { id: 'white-label-favicon', remove: jest.fn() };
    jest.spyOn(document, 'getElementById').mockReturnValue(existing as unknown as HTMLElement);

    removeFavicon();

    expect(existing.remove).toHaveBeenCalled();
  });

  it('does nothing if no favicon element exists', () => {
    jest.spyOn(document, 'getElementById').mockReturnValue(null);

    removeFavicon();

    expect(document.getElementById).toHaveBeenCalledWith('white-label-favicon');
  });
});
