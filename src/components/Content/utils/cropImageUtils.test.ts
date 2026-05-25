/**
 * Unit tests for cropImageUtils.
 * Tests logic: aspect ratio mapping, blob-to-FileInfo conversion, crop flow.
 */
import { blobToFileInfo, getAspectRatioValue } from './cropImageUtils';
import AspectRatioPreset from '../../../shared/enums/AspectRatioPreset';


// ---------------------------------------------------------------------------
// getAspectRatioValue
// ---------------------------------------------------------------------------

describe('getAspectRatioValue', () => {
  it('returns 1 for Square', () => {
    expect(getAspectRatioValue(AspectRatioPreset.Square)).toBe(1);
  });

  it('returns 16/9 for Landscape', () => {
    expect(getAspectRatioValue(AspectRatioPreset.Landscape)).toBeCloseTo(16 / 9);
  });

  it('returns 4/3 for Classic', () => {
    expect(getAspectRatioValue(AspectRatioPreset.Classic)).toBeCloseTo(4 / 3);
  });

  it('returns undefined for Free', () => {
    expect(getAspectRatioValue(AspectRatioPreset.Free)).toBeUndefined();
  });
});

// ---------------------------------------------------------------------------
// blobToFileInfo
// ---------------------------------------------------------------------------

describe('blobToFileInfo', () => {
  const MOCK_BLOB_URL = 'blob:http://localhost/test-blob-id';

  beforeEach(() => {
    global.URL.createObjectURL = jest.fn().mockReturnValue(MOCK_BLOB_URL);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('creates FileInfo with correct uri from blob URL', () => {
    const blob = new Blob(['test'], { type: 'image/jpeg' });
    const result = blobToFileInfo(blob, 'photo.jpg', 'image/jpeg');

    expect(result.uri).toBe(MOCK_BLOB_URL);
    expect(URL.createObjectURL).toHaveBeenCalledWith(blob);
  });

  it('sets name and type from parameters', () => {
    const blob = new Blob(['test'], { type: 'image/png' });
    const result = blobToFileInfo(blob, 'cropped.png', 'image/png');

    expect(result.name).toBe('cropped.png');
    expect(result.type).toBe('image/png');
  });

  it('sets size from blob size', () => {
    const content = 'a'.repeat(256);
    const blob = new Blob([content], { type: 'image/jpeg' });
    const result = blobToFileInfo(blob, 'image.jpg', 'image/jpeg');

    expect(result.size).toBe(blob.size);
  });
});
