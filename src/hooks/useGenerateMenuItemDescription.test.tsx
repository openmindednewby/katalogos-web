import React, { type ReactNode } from 'react';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react-native';

import { useGenerateMenuItemDescription, generateMenuItemDescription } from './useGenerateMenuItemDescription';
import { customInstance } from '../server/httpClient';

jest.mock('../server/httpClient');

const mockedCustomInstance = customInstance as jest.MockedFunction<typeof customInstance>;

describe('useGenerateMenuItemDescription', () => {
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

  const defaultRequest = {
    menuExternalId: 'menu-123',
    itemName: 'Grilled Salmon',
    categoryName: 'Main Course',
    price: 24.99,
    existingDescription: undefined,
  };

  describe('generateMenuItemDescription', () => {
    it('calls the correct API endpoint with request body', async () => {
      mockedCustomInstance.mockResolvedValueOnce({ description: 'A delicious grilled salmon.' });

      await generateMenuItemDescription(defaultRequest);

      expect(mockedCustomInstance).toHaveBeenCalledWith({
        url: '/TenantMenus/menu-123/generate-description',
        method: 'POST',
        data: {
          itemName: 'Grilled Salmon',
          categoryName: 'Main Course',
          price: 24.99,
          existingDescription: undefined,
        },
      });
    });

    it('passes existing description when provided', async () => {
      mockedCustomInstance.mockResolvedValueOnce({ description: 'Updated description.' });

      await generateMenuItemDescription({
        ...defaultRequest,
        existingDescription: 'Old description',
      });

      expect(mockedCustomInstance).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            existingDescription: 'Old description',
          }),
        }),
      );
    });
  });

  describe('useGenerateMenuItemDescription hook', () => {
    it('returns generated description on success', async () => {
      const mockResponse = { description: 'Fresh Atlantic salmon, grilled to perfection.' };
      mockedCustomInstance.mockResolvedValueOnce(mockResponse);

      const { result } = renderHook(() => useGenerateMenuItemDescription(), {
        wrapper: createWrapper(),
      });

      result.current.mutate(defaultRequest);

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toEqual(mockResponse);
    });

    it('calls onSuccess callback with response data', async () => {
      const mockResponse = { description: 'A delicious dish.' };
      mockedCustomInstance.mockResolvedValueOnce(mockResponse);
      const onSuccessMock = jest.fn();

      const { result } = renderHook(
        () => useGenerateMenuItemDescription({ onSuccess: onSuccessMock }),
        { wrapper: createWrapper() },
      );

      result.current.mutate(defaultRequest);

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(onSuccessMock).toHaveBeenCalledTimes(1);
      expect(onSuccessMock.mock.calls[0][0]).toEqual(mockResponse);
    });

    it('handles error when generation fails', async () => {
      const error = new Error('AI service unavailable');
      mockedCustomInstance.mockRejectedValueOnce(error);

      const { result } = renderHook(() => useGenerateMenuItemDescription(), {
        wrapper: createWrapper(),
      });

      result.current.mutate(defaultRequest);

      await waitFor(() => expect(result.current.isError).toBe(true));

      expect(result.current.error).toEqual(error);
    });

    it('sets isPending during mutation', async () => {
      let resolveMutation!: () => void;
      const mutationPromise = new Promise<void>((resolve) => {
        resolveMutation = resolve;
      });
      mockedCustomInstance.mockReturnValueOnce(mutationPromise);

      const { result } = renderHook(() => useGenerateMenuItemDescription(), {
        wrapper: createWrapper(),
      });

      result.current.mutate(defaultRequest);

      await waitFor(() => expect(result.current.isPending).toBe(true));

      resolveMutation();

      await waitFor(() => expect(result.current.isPending).toBe(false));
    });
  });
});
