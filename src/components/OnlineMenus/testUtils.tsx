/**
 * Shared test utilities for MenuContentEditor tests.
 */
import React from 'react';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Create a wrapper with QueryClientProvider
export function createWrapper(): React.FC<{ children: React.ReactNode }> {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  const Wrapper = ({ children }: { children: React.ReactNode }): React.ReactElement => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  Wrapper.displayName = 'TestQueryClientWrapper';
  return Wrapper;
}
