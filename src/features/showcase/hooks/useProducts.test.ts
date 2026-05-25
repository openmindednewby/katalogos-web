import { renderHook, waitFor, act } from '@testing-library/react-native';

import { useProducts } from './useProducts';

const MOCK_PRODUCTS = [
  { id: 1, title: 'Phone', description: 'A phone', category: 'smartphones', price: 549, rating: 4.5, stock: 10, thumbnail: '' },
  { id: 2, title: 'Laptop', description: 'A laptop', category: 'laptops', price: 1249, rating: 4.8, stock: 5, thumbnail: '' },
  { id: 3, title: 'Tablet', description: 'A tablet', category: 'smartphones', price: 399, rating: 4.2, stock: 15, thumbnail: '' },
];

const MOCK_RESPONSE = { products: MOCK_PRODUCTS, total: 3, skip: 0, limit: 30 };

describe('useProducts', () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it('fetches products and extracts sorted categories', async () => {
    global.fetch = jest.fn().mockResolvedValueOnce({
      ok: true,
      json: jest.fn().mockResolvedValueOnce(MOCK_RESPONSE),
    });

    const { result } = renderHook(() => useProducts());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.products).toHaveLength(3);
    expect(result.current.categories).toEqual(['laptops', 'smartphones']);
    expect(result.current.error).toBeNull();
  });

  it('sets error when fetch fails', async () => {
    global.fetch = jest.fn().mockRejectedValueOnce(new Error('Network failure'));

    const { result } = renderHook(() => useProducts());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.error).toBe('Network failure');
    expect(result.current.products).toHaveLength(0);
  });

  it('sets error when response is not ok', async () => {
    global.fetch = jest.fn().mockResolvedValueOnce({ ok: false, status: 500 });

    const { result } = renderHook(() => useProducts());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.error).toBe('HTTP 500');
  });

  it('retries fetch when retry is called', async () => {
    global.fetch = jest.fn()
      .mockRejectedValueOnce(new Error('First failure'))
      .mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValueOnce(MOCK_RESPONSE),
      });

    const { result } = renderHook(() => useProducts());

    await waitFor(() => {
      expect(result.current.error).toBe('First failure');
    });

    act(() => {
      result.current.retry();
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeNull();
    });

    expect(result.current.products).toHaveLength(3);
  });

  it('returns empty products when response has no products array', async () => {
    global.fetch = jest.fn().mockResolvedValueOnce({
      ok: true,
      json: jest.fn().mockResolvedValueOnce({ total: 0 }),
    });

    const { result } = renderHook(() => useProducts());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.products).toHaveLength(0);
    expect(result.current.categories).toHaveLength(0);
  });
});
