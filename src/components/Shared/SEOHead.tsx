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
  title?: string;
  description?: string;
  url?: string;
  image?: string;
  noIndex?: boolean;
}

/** SEO Head component for managing meta tags across pages. */
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
  const fullTitle = isValueDefined(title) ? `${title} | ${MARKETING_SITE_NAME}` : defaultTitle;

  const absoluteImageUrl = image.startsWith('http') ? image : `${MARKETING_CANONICAL_URL}${image}`;

  return (
    <Head>
      <title>{fullTitle}</title>
      <meta content={resolvedDescription} name="description" />
      <meta content={noIndex ? ROBOTS_NO_INDEX : ROBOTS_INDEX} name="robots" />

      <link href={url} rel="canonical" />

      <meta content={fullTitle} property="og:title" />
      <meta content={resolvedDescription} property="og:description" />
      <meta content="website" property="og:type" />
      <meta content={url} property="og:url" />
      <meta content={absoluteImageUrl} property="og:image" />
      <meta content={MARKETING_SITE_NAME} property="og:site_name" />
      <meta content={DEFAULT_LOCALE} property="og:locale" />

      <meta content={TWITTER_CARD} name="twitter:card" />
      <meta content={fullTitle} name="twitter:title" />
      <meta content={resolvedDescription} name="twitter:description" />
      <meta content={absoluteImageUrl} name="twitter:image" />
    </Head>
  );
};
