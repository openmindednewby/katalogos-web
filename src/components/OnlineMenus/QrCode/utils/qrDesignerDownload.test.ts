/**
 * Tests for QR designer download utilities.
 * Focuses on filename sanitization and data URI extraction logic.
 */
import { DESIGNER_QR_SOURCE_ID } from './qrDesignerConstants';
import { sanitizeFilename, extractQrDataUri, downloadDesignAsSvg } from './qrDesignerDownload';

describe('sanitizeFilename', () => {
  it('replaces special characters with underscores', () => {
    expect(sanitizeFilename('My Restaurant!')).toBe('My_Restaurant_');
  });

  it('preserves alphanumeric, hyphens, and underscores', () => {
    expect(sanitizeFilename('menu-test_123')).toBe('menu-test_123');
  });

  it('truncates at 50 characters', () => {
    const longName = 'a'.repeat(60);
    expect(sanitizeFilename(longName)).toHaveLength(50);
  });

  it('handles empty string', () => {
    expect(sanitizeFilename('')).toBe('');
  });

  it('replaces spaces with underscores', () => {
    expect(sanitizeFilename('Lunch Menu Special')).toBe('Lunch_Menu_Special');
  });
});

describe('extractQrDataUri', () => {
  afterEach(() => {
    const container = document.getElementById(DESIGNER_QR_SOURCE_ID);
    if (container) container.remove();
  });

  it('returns empty string when container not found', () => {
    expect(extractQrDataUri()).toBe('');
  });

  it('returns empty string when container has no SVG', () => {
    const container = document.createElement('div');
    container.id = DESIGNER_QR_SOURCE_ID;
    document.body.appendChild(container);

    expect(extractQrDataUri()).toBe('');
  });

  it('returns data URI when SVG is present', () => {
    const container = document.createElement('div');
    container.id = DESIGNER_QR_SOURCE_ID;
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    container.appendChild(svg);
    document.body.appendChild(container);

    const result = extractQrDataUri();
    expect(result).toContain('data:image/svg+xml;base64,');
  });
});

describe('downloadDesignAsSvg', () => {
  it('returns true when SVG is valid', () => {
    const mockClick = jest.fn();
    const mockCreateObjectURL = jest.fn(() => 'blob:mock-url');
    const mockRevokeObjectURL = jest.fn();
    jest.spyOn(document, 'createElement').mockImplementation((tag: string) => {
      if (tag === 'a') {
        const anchor = { href: '', download: '', click: mockClick } as unknown as HTMLAnchorElement;
        return anchor;
      }
      return document.createElement(tag);
    });
    Object.defineProperty(global, 'URL', {
      value: { createObjectURL: mockCreateObjectURL, revokeObjectURL: mockRevokeObjectURL },
      writable: true,
    });
    jest.spyOn(document.body, 'appendChild').mockImplementation((node) => node);
    jest.spyOn(document.body, 'removeChild').mockImplementation((node) => node);

    const result = downloadDesignAsSvg('<svg></svg>', 'Test Menu');
    expect(result).toBe(true);
    expect(mockClick).toHaveBeenCalled();

    jest.restoreAllMocks();
  });
});
