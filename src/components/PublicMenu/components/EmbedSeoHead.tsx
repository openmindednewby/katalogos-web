import type { ReactElement } from 'react';

import { Platform } from 'react-native';

import Head from 'expo-router/head';

import env from '../../../config/environment';

interface EmbedSeoHeadProps {
  menuId: string;
  menuName: string;
}

/**
 * Head tags for the iframe EMBED variant of a public menu. Embeds must NOT be
 * indexed (they are meant to be framed on a customer's own site) and should
 * canonicalise to the standalone menu page so search engines consolidate ranking
 * signals there rather than treating the embed as duplicate content.
 */
export const EmbedSeoHead = ({ menuId, menuName }: EmbedSeoHeadProps): ReactElement | null => {
  if (Platform.OS !== 'web') return null;

  const canonicalUrl = `${env.APP_BASE_URL}/public/menu/${menuId}`;

  return (
    <Head>
      <title>{menuName}</title>
      <meta content="noindex, follow" name="robots" />
      <link href={canonicalUrl} rel="canonical" />
    </Head>
  );
};
