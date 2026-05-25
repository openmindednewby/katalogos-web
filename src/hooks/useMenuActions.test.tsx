import React, { type ReactNode } from 'react';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react-native';

import { useActivateMenu, useDeactivateMenu, activateMenu, deactivateMenu } from './useMenuActions';
import { customInstance } from '../server/httpClient';

jest.mock('../server/httpClient');

const mockedCustomInstance = customInstance as jest.MockedFunction<typeof customInstance>;

describe('useMenuActions', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
    jest.clearAllMocks();
  });

  const createWrapper = (): React.FC<{ children: ReactNode }> => {
    const Wrapper = ({ children }: { children: ReactNode }): React.JSX.Element => (
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    );
    return Wrapper;
  };

  describe('activateMenu', () => {
    it('calls the correct API endpoint', async () => {
      mockedCustomInstance.mockResolvedValueOnce(undefined);

      await activateMenu('test-menu-id');

      expect(mockedCustomInstance).toHaveBeenCalledWith({
        url: '/api/v1/TenantMenus/test-menu-id/activate',
        method: 'PATCH',
      });
    });
  });

  describe('deactivateMenu', () => {
    it('calls the correct API endpoint', async () => {
      mockedCustomInstance.mockResolvedValueOnce(undefined);

      await deactivateMenu('test-menu-id');

      expect(mockedCustomInstance).toHaveBeenCalledWith({
        url: '/api/v1/TenantMenus/test-menu-id/deactivate',
        method: 'PATCH',
      });
    });
  });

  describe('useActivateMenu', () => {
    it('successfully activates a menu', async () => {
      mockedCustomInstance.mockResolvedValueOnce(undefined);

      const { result } = renderHook(() => useActivateMenu(), {
        wrapper: createWrapper(),
      });

      result.current.mutate({ externalId: 'test-menu-id' });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(mockedCustomInstance).toHaveBeenCalledWith({
        url: '/api/v1/TenantMenus/test-menu-id/activate',
        method: 'PATCH',
      });
      // Response is 204 No Content, so data should be undefined
      expect(result.current.isSuccess).toBe(true);
    });

    it('calls onSuccess callback with correct 3-parameter signature (BUG-MENU-002)', async () => {
      mockedCustomInstance.mockResolvedValueOnce(undefined);
      const onSuccessMock = jest.fn();

      const { result } = renderHook(
        () => useActivateMenu({ onSuccess: onSuccessMock }),
        { wrapper: createWrapper() }
      );

      result.current.mutate({ externalId: 'test-menu-id' });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(onSuccessMock).toHaveBeenCalledTimes(1);
      // Verify it receives exactly 3 args: data, variables, context
      const callArgs = onSuccessMock.mock.calls[0];
      expect(callArgs).toHaveLength(3);
      expect(callArgs[1]).toEqual({ externalId: 'test-menu-id' });
    });

    it('does not let options spread overwrite onSuccess (BUG-MENU-003)', async () => {
      mockedCustomInstance.mockResolvedValueOnce(undefined);
      const externalOnSuccess = jest.fn();

      const { result } = renderHook(
        () => useActivateMenu({ onSuccess: externalOnSuccess }),
        { wrapper: createWrapper() }
      );

      result.current.mutate({ externalId: 'test-menu-id' });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      // Both the internal cache invalidation AND external onSuccess should run
      expect(externalOnSuccess).toHaveBeenCalledTimes(1);
    });

    it('handles error when activation fails', async () => {
      const error = new Error('Activation failed');
      mockedCustomInstance.mockRejectedValueOnce(error);

      const { result } = renderHook(() => useActivateMenu(), {
        wrapper: createWrapper(),
      });

      result.current.mutate({ externalId: 'test-menu-id' });

      await waitFor(() => expect(result.current.isError).toBe(true));

      expect(result.current.error).toEqual(error);
    });

    it('sets isPending to true during mutation', async () => {
      let resolveMutation!: () => void;
      const mutationPromise = new Promise<void>((resolve) => {
        resolveMutation = resolve;
      });
      mockedCustomInstance.mockReturnValueOnce(mutationPromise);

      const { result } = renderHook(() => useActivateMenu(), {
        wrapper: createWrapper(),
      });

      result.current.mutate({ externalId: 'test-menu-id' });

      await waitFor(() => expect(result.current.isPending).toBe(true));

      resolveMutation();

      await waitFor(() => expect(result.current.isPending).toBe(false));
    });
  });

  describe('useDeactivateMenu', () => {
    it('successfully deactivates a menu', async () => {
      mockedCustomInstance.mockResolvedValueOnce(undefined);

      const { result } = renderHook(() => useDeactivateMenu(), {
        wrapper: createWrapper(),
      });

      result.current.mutate({ externalId: 'test-menu-id' });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(mockedCustomInstance).toHaveBeenCalledWith({
        url: '/api/v1/TenantMenus/test-menu-id/deactivate',
        method: 'PATCH',
      });
      // Response is 204 No Content, so data should be undefined
      expect(result.current.isSuccess).toBe(true);
    });

    it('calls onSuccess callback with correct 3-parameter signature (BUG-MENU-002)', async () => {
      mockedCustomInstance.mockResolvedValueOnce(undefined);
      const onSuccessMock = jest.fn();

      const { result } = renderHook(
        () => useDeactivateMenu({ onSuccess: onSuccessMock }),
        { wrapper: createWrapper() }
      );

      result.current.mutate({ externalId: 'test-menu-id' });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(onSuccessMock).toHaveBeenCalledTimes(1);
      // Verify it receives exactly 3 args: data, variables, context
      const callArgs = onSuccessMock.mock.calls[0];
      expect(callArgs).toHaveLength(3);
      expect(callArgs[1]).toEqual({ externalId: 'test-menu-id' });
    });

    it('does not let options spread overwrite onSuccess (BUG-MENU-003)', async () => {
      mockedCustomInstance.mockResolvedValueOnce(undefined);
      const externalOnSuccess = jest.fn();

      const { result } = renderHook(
        () => useDeactivateMenu({ onSuccess: externalOnSuccess }),
        { wrapper: createWrapper() }
      );

      result.current.mutate({ externalId: 'test-menu-id' });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      // Both the internal cache invalidation AND external onSuccess should run
      expect(externalOnSuccess).toHaveBeenCalledTimes(1);
    });

    it('handles error when deactivation fails', async () => {
      const error = new Error('Deactivation failed');
      mockedCustomInstance.mockRejectedValueOnce(error);

      const { result } = renderHook(() => useDeactivateMenu(), {
        wrapper: createWrapper(),
      });

      result.current.mutate({ externalId: 'test-menu-id' });

      await waitFor(() => expect(result.current.isError).toBe(true));

      expect(result.current.error).toEqual(error);
    });

    it('sets isPending to true during mutation', async () => {
      let resolveMutation!: () => void;
      const mutationPromise = new Promise<void>((resolve) => {
        resolveMutation = resolve;
      });
      mockedCustomInstance.mockReturnValueOnce(mutationPromise);

      const { result } = renderHook(() => useDeactivateMenu(), {
        wrapper: createWrapper(),
      });

      result.current.mutate({ externalId: 'test-menu-id' });

      await waitFor(() => expect(result.current.isPending).toBe(true));

      resolveMutation();

      await waitFor(() => expect(result.current.isPending).toBe(false));
    });
  });
});
