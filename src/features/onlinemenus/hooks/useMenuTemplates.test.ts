/**
 * Tests for useMenuTemplates hook.
 * Focuses on data transformation and loading state logic.
 */
import { renderHook, waitFor } from '@testing-library/react-native';

import { useMenuTemplates } from './useMenuTemplates';


const MOCK_TEMPLATES = [
  { externalId: '1', slug: 'cafe', displayName: 'Cafe', description: 'Coffee shop menu', previewIcon: 'coffee' },
  { externalId: '2', slug: 'fine-dining', displayName: 'Fine Dining', description: 'Upscale restaurant', previewIcon: 'star' },
];

jest.mock('@/server/mutators/onlineMenuMutator', () => ({
  customInstance: jest.fn(),
}));

jest.mock('@tanstack/react-query', () => {
  const actual = jest.requireActual('@tanstack/react-query');
  return {
    ...actual,
    useQuery: jest.fn(),
  };
});

const { useQuery } = jest.requireMock('@tanstack/react-query');

describe('useMenuTemplates', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns empty array and isLoading true when loading', () => {
    useQuery.mockReturnValue({ data: undefined, isLoading: true, error: null });

    const { result } = renderHook(() => useMenuTemplates());

    expect(result.current.templates).toEqual([]);
    expect(result.current.isLoading).toBe(true);
    expect(result.current.error).toBeNull();
  });

  it('returns templates when data is loaded', async () => {
    useQuery.mockReturnValue({ data: MOCK_TEMPLATES, isLoading: false, error: null });

    const { result } = renderHook(() => useMenuTemplates());

    await waitFor(() => {
      expect(result.current.templates).toEqual(MOCK_TEMPLATES);
      expect(result.current.isLoading).toBe(false);
    });
  });

  it('returns error when query fails', () => {
    const mockError = new Error('Network error');
    useQuery.mockReturnValue({ data: undefined, isLoading: false, error: mockError });

    const { result } = renderHook(() => useMenuTemplates());

    expect(result.current.error).toBe(mockError);
    expect(result.current.templates).toEqual([]);
  });

  it('degrades to an empty array when data is a non-array (e.g. SPA HTML)', () => {
    // Regression for the P1-08 wizard crash: a 308 redirect out of the BFF
    // returned the SPA's index.html as a string; `templates.map` then threw
    // "x.map is not a function". The hook must never expose a non-array.
    useQuery.mockReturnValue({ data: '<!DOCTYPE html>...', isLoading: false, error: null });

    const { result } = renderHook(() => useMenuTemplates());

    expect(result.current.templates).toEqual([]);
    expect(Array.isArray(result.current.templates)).toBe(true);
  });

  it('passes the versioned query key and function to useQuery', () => {
    useQuery.mockReturnValue({ data: [], isLoading: false, error: null });

    renderHook(() => useMenuTemplates());

    expect(useQuery).toHaveBeenCalledWith(
      expect.objectContaining({
        queryKey: ['/api/v1/menu-templates'],
        queryFn: expect.any(Function),
      }),
    );
  });
});
