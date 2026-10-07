import { useEffect } from 'react';
import type { ReactElement } from 'react';

import { Platform } from 'react-native';

import Head from 'expo-router/head';

import { isValueDefined } from '../../../utils/is';
import { generateMenuMetaTags } from '../utils/menuMetaTags';
import { generateMenuJsonLd } from '../utils/menuStructuredData';

import type { Category } from '../../../types/menuTypes';
import type { BusinessProfileData } from '../utils/menuStructuredData';

const JSON_LD_SCRIPT_ID = 'menu-jsonld';

interface SeoHeadProps {
  menuName: string;
  restaurantName?: string;
  menuDescription?: string;
  publicUrl: string;
  categories: Category[];
  logoUrl?: string;
  lastUpdated?: string;
  businessProfile?: BusinessProfileData;
}

function useJsonLdInjection(jsonLd: object): void {
  useEffect(() => {
    if (Platform.OS !== 'web' || typeof document === 'undefined') return;

    const existingScript = document.getElementById(JSON_LD_SCRIPT_ID);
    if (existingScript) existingScript.remove();

    const script = document.createElement('script');
    script.id = JSON_LD_SCRIPT_ID;
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify(jsonLd);
    document.head.appendChild(script);

    return () => {
      script.remove();
    };
  }, [jsonLd]);
}

/** Injects SEO meta tags and JSON-LD structured data for a public menu. */
export const SeoHead = ({
  menuName,
  restaurantName,
  menuDescription,
  publicUrl,
  categories,
  logoUrl,
  lastUpdated,
  businessProfile,
}: SeoHeadProps): ReactElement | null => {
  const jsonLd = generateMenuJsonLd({
    menuName,
    menuDescription,
    restaurantName,
    publicUrl,
    categories,
    logoUrl,
    lastUpdated,
    businessProfile,
  });

  const meta = generateMenuMetaTags({
    menuName,
    restaurantName,
    menuDescription,
    publicUrl,
    logoUrl,
    businessProfile,
  });

  useJsonLdInjection(jsonLd);

  if (Platform.OS !== 'web') return null;

  return (
    <Head>
      <title>{meta.title}</title>
      <meta content={meta.description} name="description" />
      <meta content="index, follow" name="robots" />
      <link href={meta.ogUrl} rel="canonical" />
      <meta content={meta.ogTitle} property="og:title" />
      <meta content={meta.ogDescription} property="og:description" />
      <meta content={meta.ogType} property="og:type" />
      <meta content={meta.ogUrl} property="og:url" />
      {isValueDefined(meta.ogImage) ? <meta content={meta.ogImage} property="og:image" /> : null}
    </Head>
  );
};
