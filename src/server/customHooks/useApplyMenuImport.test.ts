/**
 * Tests for useApplyMenuImport hook.
 * Focuses on mutation behavior and cache invalidation.
 */
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { renderHook } from '@testing-library/react-native';

import { useApplyMenuImport } from './useApplyMenuImport';

const mockInvalidateQueries = jest.fn().mockResolvedValue(undefined);
const mockQueryClient = { invalidateQueries: mockInvalidateQueries };

jest.mock('@tanstack/react-query', () => ({
  ...jest.requireActual('@tanstack/react-query'),
  useMutation: jest.fn(),
  useQueryClient: jest.fn(),
}));

const mockUseMutation = useMutation as jest.Mock;
const mockUseQueryClient = useQueryClient as jest.Mock;

describe('useApplyMenuImport', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseQueryClient.mockReturnValue(mockQueryClient);
    mockUseMutation.mockReturnValue({ mutate: jest.fn(), isPending: false });
  });

  it('calls useMutation with correct mutationKey', () => {
    renderHook(() => useApplyMenuImport());

    expect(mockUseMutation).toHaveBeenCalledWith(
      expect.objectContaining({
        mutationKey: ['applyMenuImport'],
        mutationFn: expect.any(Function),
      }),
    );
  });

  it('invalidates menu queries on success', async () => {
    const onSuccess = jest.fn();
    renderHook(() => useApplyMenuImport({ onSuccess }));

    const mutationConfig = mockUseMutation.mock.calls[0][0];
    await mutationConfig.onSuccess();

    expect(mockInvalidateQueries).toHaveBeenCalledWith(
      expect.objectContaining({ queryKey: ['onlineMenuWebMenuList'] }),
    );
    expect(onSuccess).toHaveBeenCalled();
  });

  it('calls onError callback on failure', () => {
    const onError = jest.fn();
    renderHook(() => useApplyMenuImport({ onError }));

    const mutationConfig = mockUseMutation.mock.calls[0][0];
    const mockError = new Error('apply failed');
    mutationConfig.onError(mockError);

    expect(onError).toHaveBeenCalledWith(mockError);
  });
});
