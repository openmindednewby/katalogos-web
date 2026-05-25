/**
 * Unit tests for useImageCrop hook.
 * Tests logic: state transitions, promise resolution, aspect ratio switching.
 */
import { Platform } from 'react-native';

import { act, renderHook } from '@testing-library/react-native';

import { useImageCrop } from './useImageCrop';
import AspectRatioPreset from '../../../shared/enums/AspectRatioPreset';

import type { FileInfo } from '../../../lib/hooks/content/types';

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

const MOCK_BLOB_URL = 'blob:http://localhost/mock-cropped';
const MOCK_BLOB_SIZE = 1024;

jest.mock('../utils/cropImageUtils', () => ({
  ...jest.requireActual('../utils/cropImageUtils'),
  cropImageToBlob: jest.fn().mockResolvedValue(new Blob(['x'.repeat(MOCK_BLOB_SIZE)], { type: 'image/jpeg' })),
  blobToFileInfo: jest.fn().mockImplementation((_blob: Blob, name: string, mimeType: string) => ({
    uri: MOCK_BLOB_URL,
    name,
    type: mimeType,
    size: MOCK_BLOB_SIZE,
  })),
}));

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const MOCK_FILE: FileInfo = {
  uri: 'file:///test/photo.jpg',
  name: 'photo.jpg',
  type: 'image/jpeg',
  size: 2048,
};

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('useImageCrop', () => {
  beforeEach(() => {
    Object.defineProperty(Platform, 'OS', { get: () => 'web', configurable: true });
  });

  it('starts with modal hidden', () => {
    const { result } = renderHook(() => useImageCrop());

    expect(result.current.modalState.isVisible).toBe(false);
    expect(result.current.modalState.imageUri).toBe('');
    expect(result.current.modalState.originalFile).toBeNull();
  });

  it('defaults to Square aspect preset', () => {
    const { result } = renderHook(() => useImageCrop());

    expect(result.current.aspectPreset).toBe(AspectRatioPreset.Square);
    expect(result.current.aspectRatio).toBe(1);
  });

  it('uses provided initial preset', () => {
    const { result } = renderHook(() => useImageCrop(AspectRatioPreset.Landscape));

    expect(result.current.aspectPreset).toBe(AspectRatioPreset.Landscape);
    expect(result.current.aspectRatio).toBeCloseTo(16 / 9);
  });

  it('opens modal when requestCrop is called', () => {
    const { result } = renderHook(() => useImageCrop());

    act(() => {
      result.current.requestCrop(MOCK_FILE).catch(() => {});
    });

    expect(result.current.modalState.isVisible).toBe(true);
    expect(result.current.modalState.imageUri).toBe(MOCK_FILE.uri);
    expect(result.current.modalState.originalFile).toBe(MOCK_FILE);
  });

  it('resolves null on cancel', async () => {
    const { result } = renderHook(() => useImageCrop());

    let cropResult: FileInfo | null = MOCK_FILE;

    await act(async () => {
      const promise = result.current.requestCrop(MOCK_FILE);
      result.current.onCancel();
      cropResult = await promise;
    });

    expect(cropResult).toBeNull();
    expect(result.current.modalState.isVisible).toBe(false);
  });

  it('switches aspect ratio preset', () => {
    const { result } = renderHook(() => useImageCrop());

    act(() => {
      result.current.setAspectPreset(AspectRatioPreset.Free);
    });

    expect(result.current.aspectPreset).toBe(AspectRatioPreset.Free);
    expect(result.current.aspectRatio).toBeUndefined();
  });

  it('passes file through on non-web platform', async () => {
    Object.defineProperty(Platform, 'OS', { get: () => 'ios', configurable: true });
    const { result } = renderHook(() => useImageCrop());

    let cropResult: FileInfo | null = null;

    await act(async () => {
      cropResult = await result.current.requestCrop(MOCK_FILE);
    });

    expect(cropResult).toBe(MOCK_FILE);
    expect(result.current.modalState.isVisible).toBe(false);
  });
});
