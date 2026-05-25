/**
 * Unit tests for usePublicBusinessProfile hook.
 * Tests logic and behavior, not rendering.
 */
import { useQuery } from '@tanstack/react-query';
import { renderHook } from '@testing-library/react-native';

import { usePublicBusinessProfile, getPublicBusinessProfileQueryKey } from './usePublicBusinessProfile';

jest.mock('@tanstack/react-query', () => ({
  ...jest.requireActual('@tanstack/react-query'),
  useQuery: jest.fn(),
}));

const mockUseQuery = useQuery as jest.Mock;

describe('usePublicBusinessProfile', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseQuery.mockReturnValue({ data: undefined, isLoading: false });
  });

  it('disables query when tenantId is null', () => {
    renderHook(() => usePublicBusinessProfile(null));

    expect(mockUseQuery).toHaveBeenCalledWith(
      expect.objectContaining({ enabled: false }),
    );
  });

  it('disables query when tenantId is undefined', () => {
    renderHook(() => usePublicBusinessProfile(undefined));

    expect(mockUseQuery).toHaveBeenCalledWith(
      expect.objectContaining({ enabled: false }),
    );
  });

  it('disables query when tenantId is empty string', () => {
    renderHook(() => usePublicBusinessProfile(''));

    expect(mockUseQuery).toHaveBeenCalledWith(
      expect.objectContaining({ enabled: false }),
    );
  });

  it('enables query when tenantId is a valid string', () => {
    renderHook(() => usePublicBusinessProfile('tenant-abc'));

    expect(mockUseQuery).toHaveBeenCalledWith(
      expect.objectContaining({ enabled: true }),
    );
  });

  it('uses the correct query key', () => {
    renderHook(() => usePublicBusinessProfile('tenant-123'));

    expect(mockUseQuery).toHaveBeenCalledWith(
      expect.objectContaining({
        queryKey: ['public', 'business-profile', 'tenant-123'],
      }),
    );
  });
});

describe('getPublicBusinessProfileQueryKey', () => {
  it('returns a deterministic query key array', () => {
    expect(getPublicBusinessProfileQueryKey('abc')).toEqual(['public', 'business-profile', 'abc']);
  });

  it('returns different keys for different tenant IDs', () => {
    const key1 = getPublicBusinessProfileQueryKey('tenant-1');
    const key2 = getPublicBusinessProfileQueryKey('tenant-2');
    expect(key1).not.toEqual(key2);
  });
});
