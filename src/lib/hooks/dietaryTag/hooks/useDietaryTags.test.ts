/**
 * Unit tests for dietary tag hooks.
 * Tests logic and behavior, not rendering.
 */
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react-native';

import {
  useGetDietaryTags,
  useGetPublicDietaryTags,
  useCreateDietaryTag,
  useDeleteDietaryTag,
  getDietaryTagsQueryKey,
  getPublicDietaryTagsQueryKey,
} from './useDietaryTags';

import type { DietaryTagDto } from '../types';

jest.mock('@tanstack/react-query', () => ({
  ...jest.requireActual('@tanstack/react-query'),
  useQuery: jest.fn(),
  useMutation: jest.fn(),
  useQueryClient: jest.fn(),
}));

const mockUseQuery = useQuery as jest.Mock;
const mockUseMutation = useMutation as jest.Mock;
const mockUseQueryClient = useQueryClient as jest.Mock;

const MOCK_TAG: DietaryTagDto = {
  externalId: 'ext-1',
  key: 'vegan',
  name: 'Vegan',
  description: 'No animal products',
  icon: 'leaf',
  color: '#4CAF50',
  isSystem: true,
  displayOrder: 1,
};

describe('getDietaryTagsQueryKey', () => {
  it('returns the admin query key', () => {
    const key = getDietaryTagsQueryKey();
    expect(key).toEqual(['dietary-tags']);
  });
});

describe('getPublicDietaryTagsQueryKey', () => {
  it('returns the public query key', () => {
    const key = getPublicDietaryTagsQueryKey();
    expect(key).toEqual(['dietary-tags', 'public']);
  });
});

describe('useGetDietaryTags', () => {
  beforeEach(() => jest.clearAllMocks());

  it('returns undefined data when loading', () => {
    mockUseQuery.mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
      error: null,
    });
    const { result } = renderHook(() => useGetDietaryTags());
    expect(result.current.data).toBeUndefined();
    expect(result.current.isLoading).toBe(true);
  });

  it('returns tag data when loaded', () => {
    mockUseQuery.mockReturnValue({
      data: [MOCK_TAG],
      isLoading: false,
      isError: false,
      error: null,
    });
    const { result } = renderHook(() => useGetDietaryTags());
    expect(result.current.data).toEqual([MOCK_TAG]);
    expect(result.current.isLoading).toBe(false);
  });

  it('returns error when query fails', () => {
    const testError = new Error('Network error');
    mockUseQuery.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
      error: testError,
    });
    const { result } = renderHook(() => useGetDietaryTags());
    expect(result.current.isError).toBe(true);
    expect(result.current.error).toBe(testError);
  });

  it('returns null error for non-Error objects', () => {
    mockUseQuery.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
      error: 'string error',
    });
    const { result } = renderHook(() => useGetDietaryTags());
    expect(result.current.error).toBeNull();
  });
});

describe('useGetPublicDietaryTags', () => {
  beforeEach(() => jest.clearAllMocks());

  it('returns tag data for public endpoint', () => {
    mockUseQuery.mockReturnValue({
      data: [MOCK_TAG],
      isLoading: false,
      isError: false,
      error: null,
    });
    const { result } = renderHook(() => useGetPublicDietaryTags());
    expect(result.current.data).toEqual([MOCK_TAG]);
  });
});

describe('useCreateDietaryTag', () => {
  const mockInvalidateQueries = jest.fn().mockResolvedValue(undefined);
  const mockMutate = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseQueryClient.mockReturnValue({ invalidateQueries: mockInvalidateQueries });
  });

  it('calls mutate with request data', () => {
    mockUseMutation.mockImplementation(({ mutationFn: _fn }) => ({
      mutate: mockMutate,
      isPending: false,
      isError: false,
      error: null,
    }));
    const { result } = renderHook(() => useCreateDietaryTag());
    const request = { key: 'custom', name: 'Custom Tag' };
    result.current.createTag(request);
    expect(mockMutate).toHaveBeenCalledWith(request);
  });

  it('returns isPending status', () => {
    mockUseMutation.mockReturnValue({
      mutate: mockMutate,
      isPending: true,
      isError: false,
      error: null,
    });
    const { result } = renderHook(() => useCreateDietaryTag());
    expect(result.current.isPending).toBe(true);
  });

  it('calls onSuccess callback and invalidates queries on success', async () => {
    let capturedOnSuccess: (() => void) | undefined;
    mockUseMutation.mockImplementation((options) => {
      capturedOnSuccess = options.onSuccess;
      return { mutate: mockMutate, isPending: false, isError: false, error: null };
    });
    const onSuccess = jest.fn();
    renderHook(() => useCreateDietaryTag({ onSuccess }));
    if (capturedOnSuccess) capturedOnSuccess();
    await waitFor(() => {
      expect(mockInvalidateQueries).toHaveBeenCalled();
      expect(onSuccess).toHaveBeenCalled();
    });
  });

  it('calls onError callback on failure', async () => {
    const testError = new Error('Create failed');
    let capturedOnError: ((error: unknown) => void) | undefined;
    mockUseMutation.mockImplementation((options) => {
      capturedOnError = options.onError;
      return { mutate: mockMutate, isPending: false, isError: true, error: testError };
    });
    const onError = jest.fn();
    renderHook(() => useCreateDietaryTag({ onError }));
    if (capturedOnError) capturedOnError(testError);
    await waitFor(() => expect(onError).toHaveBeenCalledWith(testError));
  });
});

describe('useDeleteDietaryTag', () => {
  const mockInvalidateQueries = jest.fn().mockResolvedValue(undefined);
  const mockMutate = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseQueryClient.mockReturnValue({ invalidateQueries: mockInvalidateQueries });
  });

  it('calls mutate with externalId', () => {
    mockUseMutation.mockImplementation(({ mutationFn: _fn }) => ({
      mutate: mockMutate,
      isPending: false,
      isError: false,
      error: null,
    }));
    const { result } = renderHook(() => useDeleteDietaryTag());
    result.current.deleteTag('ext-1');
    expect(mockMutate).toHaveBeenCalledWith('ext-1');
  });

  it('calls onSuccess callback and invalidates queries on success', async () => {
    let capturedOnSuccess: (() => void) | undefined;
    mockUseMutation.mockImplementation((options) => {
      capturedOnSuccess = options.onSuccess;
      return { mutate: mockMutate, isPending: false, isError: false, error: null };
    });
    const onSuccess = jest.fn();
    renderHook(() => useDeleteDietaryTag({ onSuccess }));
    if (capturedOnSuccess) capturedOnSuccess();
    await waitFor(() => {
      expect(mockInvalidateQueries).toHaveBeenCalled();
      expect(onSuccess).toHaveBeenCalled();
    });
  });

  it('wraps non-Error objects in Error on failure', async () => {
    let capturedOnError: ((error: unknown) => void) | undefined;
    mockUseMutation.mockImplementation((options) => {
      capturedOnError = options.onError;
      return { mutate: mockMutate, isPending: false, isError: true, error: null };
    });
    const onError = jest.fn();
    renderHook(() => useDeleteDietaryTag({ onError }));
    if (capturedOnError) capturedOnError('string error');
    await waitFor(() => {
      expect(onError).toHaveBeenCalledWith(expect.any(Error));
      expect(onError.mock.calls[0][0].message).toBe('Delete failed');
    });
  });
});
