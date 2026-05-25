/**
 * Tests for useImportMenuFromImage hook.
 * Focuses on mutation behavior and callback invocation.
 */
import { useMutation } from '@tanstack/react-query';
import { renderHook } from '@testing-library/react-native';

import { useImportMenuFromImage } from './useImportMenuFromImage';

jest.mock('@tanstack/react-query', () => ({
  ...jest.requireActual('@tanstack/react-query'),
  useMutation: jest.fn(),
}));

const mockUseMutation = useMutation as jest.Mock;

describe('useImportMenuFromImage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseMutation.mockReturnValue({ mutate: jest.fn(), isPending: false });
  });

  it('calls useMutation with correct mutationKey', () => {
    renderHook(() => useImportMenuFromImage());

    expect(mockUseMutation).toHaveBeenCalledWith(
      expect.objectContaining({
        mutationKey: ['importMenuFromImage'],
        mutationFn: expect.any(Function),
      }),
    );
  });

  it('passes onSuccess callback to useMutation', () => {
    const onSuccess = jest.fn();
    renderHook(() => useImportMenuFromImage({ onSuccess }));

    const mutationConfig = mockUseMutation.mock.calls[0][0];
    const mockData = { categories: [] };
    mutationConfig.onSuccess(mockData);

    expect(onSuccess).toHaveBeenCalledWith(mockData);
  });

  it('passes onError callback to useMutation', () => {
    const onError = jest.fn();
    renderHook(() => useImportMenuFromImage({ onError }));

    const mutationConfig = mockUseMutation.mock.calls[0][0];
    const mockError = new Error('upload failed');
    mutationConfig.onError(mockError);

    expect(onError).toHaveBeenCalledWith(mockError);
  });

  it('works without options', () => {
    renderHook(() => useImportMenuFromImage());

    const mutationConfig = mockUseMutation.mock.calls[0][0];
    expect(mutationConfig.onSuccess).toBeUndefined();
    expect(mutationConfig.onError).toBeUndefined();
  });
});
