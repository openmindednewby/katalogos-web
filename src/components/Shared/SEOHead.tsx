import type { ReactElement } from 'react';

import Head from 'expo-router/head';

import { FM } from '../../localization/helpers';
import { isValueDefined } from '../../utils/is';
import {
  MARKETING_CANONICAL_URL,
  MARKETING_OG_IMAGE,
  MARKETING_SITE_NAME,
} from '../Landing/utils/brand';

const DEFAULT_LOCALE = 'en_US';
const TWITTER_CARD = 'summary_large_image';
const ROBOTS_INDEX = 'index, follow';
const ROBOTS_NO_INDEX = 'noindex, nofollow';

interface Props {
  /** Page title - will be appended with site name if not default */
  title?: string;
  /** Page description for SEO */
  description?: string;
  /** Canonical URL for the page */
  url?: string;
  /** Image URL for social sharing */
  image?: string;
  /** Whether this page should be indexed by search engines */
  noIndex?: boolean;
}

/**
 * SEO Head component for managing meta tags across pages.
 * Uses expo-router's Head component to inject meta tags into the document head.
 *
 * Default values come from the locked Katalogos marketing brand (apps/katalogos-web/brand/).
 *
 * @example
 * // In a page component:
 * <SEOHead
 *   title={FM('landing.hub.seoTitle')}
 *   description={FM('landing.hub.seoDescription')}
 * />
 */
export const SEOHead = ({
  title,
  description,
  url = MARKETING_CANONICAL_URL,
  image = MARKETING_OG_IMAGE,
  noIndex = false,
}: Props): ReactElement => {
  const defaultDescription = FM('landing.hub.seoDescription');
  const defaultTitle = FM('landing.hub.seoTitle');
  const resolvedDescription = isValueDefined(description) ? description : defaultDescription;
  // Build full title: "Page Title | Site Name" or just site name if default
  const fullTitle = isValueDefined(title) ? `${title} | ${MARKETING_SITE_NAME}` : defaultTitle;

  // Build absolute image URL
  const absoluteImageUrl = image.startsWith('http') ? image : `${MARKETING_CANONICAL_URL}${image}`;

  return (
    <Head>
      {/* Primary Meta Tags */}
      <title>{fullTitle}</title>
      <meta content={resolvedDescription} name="description" />
      <meta content={noIndex ? ROBOTS_NO_INDEX : ROBOTS_INDEX} name="robots" />

      {/* Canonical URL */}
      <link href={url} rel="canonical" />

      {/* Open Graph / Facebook */}
      <meta content={fullTitle} property="og:title" />
      <meta content={resolvedDescription} property="og:description" />
      <meta content="website" property="og:type" />
      <meta content={url} property="og:url" />
      <meta content={absoluteImageUrl} property="og:image" />
      <meta content={MARKETING_SITE_NAME} property="og:site_name" />
      <meta content={DEFAULT_LOCALE} property="og:locale" />

      {/* Twitter */}
      <meta content={TWITTER_CARD} name="twitter:card" />
      <meta content={fullTitle} name="twitter:title" />
      <meta content={resolvedDescription} name="twitter:description" />
      <meta content={absoluteImageUrl} name="twitter:image" />
    </Head>
  );
};

export default SEOHead;
