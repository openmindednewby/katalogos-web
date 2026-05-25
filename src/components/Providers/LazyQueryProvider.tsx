import type { ReactElement, ReactNode } from 'react';
import React, { Suspense } from 'react';

import { View, ActivityIndicator } from 'react-native';

/**
 * Lazy-loaded React Query provider.
 * Defers @tanstack/react-query + queryClient from the initial bundle
 * so the login page loads without this ~40 KB dependency.
 */
const QueryProvider = React.lazy(async () => {
  const [{ QueryClientProvider }, { queryClient }] = await Promise.all([
    import('@tanstack/react-query'),
    import('../../lib/queryClient'),
  ]);

  const Provider = ({ children }: { readonly children: ReactNode }): ReactElement => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  Provider.displayName = 'QueryProvider';

  return { default: Provider };
});

const fallbackStyle = { flex: 1, justifyContent: 'center' as const, alignItems: 'center' as const };

const LazyQueryProvider = ({ children }: { readonly children: ReactNode }): ReactElement => (
  <Suspense fallback={<View style={fallbackStyle}><ActivityIndicator /></View>}>
    <QueryProvider>{children}</QueryProvider>
  </Suspense>
);

export default LazyQueryProvider;
