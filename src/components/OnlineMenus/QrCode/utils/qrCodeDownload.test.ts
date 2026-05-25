import { QR_CODE_CONTAINER_ID } from './qrCodeConstants';
import { downloadQrAsSvg, copyToClipboard } from './qrCodeDownload';

describe('downloadQrAsSvg', () => {
  afterEach(() => {
    const container = document.getElementById(QR_CODE_CONTAINER_ID);
    if (container) container.remove();
  });

  it('returns false when container element is not found', () => {
    const result = downloadQrAsSvg('Test Menu');
    expect(result).toBe(false);
  });

  it('returns false when container has no SVG child', () => {
    const container = document.createElement('div');
    container.id = QR_CODE_CONTAINER_ID;
    document.body.appendChild(container);

    const result = downloadQrAsSvg('Test Menu');
    expect(result).toBe(false);
  });

  it('returns true and triggers download when SVG is present', () => {
    const container = document.createElement('div');
    container.id = QR_CODE_CONTAINER_ID;
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    container.appendChild(svg);
    document.body.appendChild(container);

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

    const result = downloadQrAsSvg('Test Menu');
    expect(result).toBe(true);
    expect(mockClick).toHaveBeenCalled();

    jest.restoreAllMocks();
  });
});

describe('copyToClipboard', () => {
  it('returns true when clipboard write succeeds', async () => {
    Object.assign(navigator, {
      clipboard: { writeText: jest.fn().mockResolvedValue(undefined) },
    });

    const result = await copyToClipboard('https://example.com');
    expect(result).toBe(true);
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith('https://example.com');
  });

  it('returns false when clipboard write fails', async () => {
    Object.assign(navigator, {
      clipboard: { writeText: jest.fn().mockRejectedValue(new Error('denied')) },
    });

    const result = await copyToClipboard('https://example.com');
    expect(result).toBe(false);
  });
});
