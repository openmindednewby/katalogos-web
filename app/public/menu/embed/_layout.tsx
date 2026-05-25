import type { ReactElement } from 'react';

import { Stack } from 'expo-router';

import LazyQueryProvider from '../../../../src/components/Providers/LazyQueryProvider';

/** Minimal layout for embeddable menu — no auth, no Notifier, no analytics. */
const EmbedLayout = (): ReactElement => (
  <LazyQueryProvider>
    <Stack screenOptions={{ headerShown: false }} />
  </LazyQueryProvider>
);

export default EmbedLayout;
