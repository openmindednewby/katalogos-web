/**
 * Tests for useRestoreMenuVersion hook.
 * Focuses on mutation behavior and cache invalidation.
 */
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { renderHook } from '@testing-library/react-native';

import { useRestoreMenuVersion } from './useRestoreMenuVersion';

const mockInvalidateQueries = jest.fn().mockResolvedValue(undefined);
const mockQueryClient = { invalidateQueries: mockInvalidateQueries };

jest.mock('@tanstack/react-query', () => ({
  ...jest.requireActual('@tanstack/react-query'),
  useMutation: jest.fn(),
  useQueryClient: jest.fn(),
}));

const mockUseMutation = useMutation as jest.Mock;
const mockUseQueryClient = useQueryClient as jest.Mock;

describe('useRestoreMenuVersion', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseQueryClient.mockReturnValue(mockQueryClient);
    mockUseMutation.mockReturnValue({ mutate: jest.fn(), isPending: false });
  });

  it('calls useMutation with a mutationFn', () => {
    renderHook(() => useRestoreMenuVersion());

    expect(mockUseMutation).toHaveBeenCalledWith(
      expect.objectContaining({
        mutationFn: expect.any(Function),
      }),
    );
  });

  it('invalidates version queries on success', () => {
    renderHook(() => useRestoreMenuVersion());

    const mutationConfig = mockUseMutation.mock.calls[0][0];
    const variables = { menuId: 'menu-123', versionId: 'version-456' };

    mutationConfig.onSuccess({ newVersionId: 'new-version-789' }, variables);

    expect(mockInvalidateQueries).toHaveBeenCalledWith(
      expect.objectContaining({ queryKey: ['menu-versions', 'menu-123'] }),
    );
    expect(mockInvalidateQueries).toHaveBeenCalledWith(
      expect.objectContaining({ queryKey: ['menu-version-detail', 'menu-123'] }),
    );
  });
});
