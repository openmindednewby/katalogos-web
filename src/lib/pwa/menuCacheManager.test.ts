/**
 * Unit tests for menuCacheManager.
 * Tests cache clearing logic and edge cases.
 */
import { clearAllCaches, clearMenuCache, getManagedCacheNames } from './menuCacheManager';

const mockDelete = jest.fn<Promise<boolean>, [string]>();

beforeEach(() => {
  jest.clearAllMocks();
  mockDelete.mockResolvedValue(true);

  Object.defineProperty(window, 'caches', {
    value: { delete: mockDelete },
    writable: true,
    configurable: true,
  });
});

describe('clearMenuCache', () => {
  it('deletes the menu API cache', async () => {
    const result = await clearMenuCache();

    expect(mockDelete).toHaveBeenCalledWith('public-menu-api-v1');
    expect(result).toBe(true);
  });

  it('returns false when cache does not exist', async () => {
    mockDelete.mockResolvedValue(false);

    const result = await clearMenuCache();

    expect(result).toBe(false);
  });

  it('returns false when caches API throws', async () => {
    mockDelete.mockRejectedValue(new Error('Cache error'));

    const result = await clearMenuCache();

    expect(result).toBe(false);
  });

  it('returns false when caches API is not available', async () => {
    Object.defineProperty(window, 'caches', {
      value: undefined,
      writable: true,
      configurable: true,
    });

    const result = await clearMenuCache();

    expect(result).toBe(false);
  });
});

describe('clearAllCaches', () => {
  it('deletes both menu API and static assets caches', async () => {
    const result = await clearAllCaches();

    expect(mockDelete).toHaveBeenCalledWith('public-menu-api-v1');
    expect(mockDelete).toHaveBeenCalledWith('static-assets-v1');
    expect(result).toBe(true);
  });

  it('returns true when at least one cache was deleted', async () => {
    mockDelete
      .mockResolvedValueOnce(false)
      .mockResolvedValueOnce(true);

    const result = await clearAllCaches();

    expect(result).toBe(true);
  });

  it('returns false when no caches were deleted', async () => {
    mockDelete.mockResolvedValue(false);

    const result = await clearAllCaches();

    expect(result).toBe(false);
  });

  it('returns false when caches API throws', async () => {
    mockDelete.mockRejectedValue(new Error('Cache error'));

    const result = await clearAllCaches();

    expect(result).toBe(false);
  });

  it('returns false when caches API is not available', async () => {
    Object.defineProperty(window, 'caches', {
      value: undefined,
      writable: true,
      configurable: true,
    });

    const result = await clearAllCaches();

    expect(result).toBe(false);
  });
});

describe('getManagedCacheNames', () => {
  it('returns the correct cache names', () => {
    const names = getManagedCacheNames();

    expect(names).toEqual(['public-menu-api-v1', 'static-assets-v1']);
  });
});
