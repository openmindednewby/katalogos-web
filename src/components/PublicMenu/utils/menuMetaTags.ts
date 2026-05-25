import { FM } from '../../../localization/helpers';
import { isValueDefined } from '../../../utils/is';

import type { BusinessProfileData } from './menuStructuredData';

const MAX_DESCRIPTION_LENGTH = 160;
const OG_TYPE_WEBSITE = 'website';

interface MetaTagOptions {
  menuName: string;
  restaurantName?: string;
  menuDescription?: string;
  publicUrl: string;
  logoUrl?: string;
  businessProfile?: BusinessProfileData;
}

interface MetaTagData {
  title: string;
  description: string;
  ogTitle: string;
  ogDescription: string;
  ogUrl: string;
  ogType: string;
  ogImage?: string;
}

/** Truncate a string to the given length, appending an ellipsis when cut. */
function truncateDescription(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;

  const ELLIPSIS_LENGTH = 3;
  return `${text.slice(0, maxLength - ELLIPSIS_LENGTH)}...`;
}

/** Build a page title from menu name and optional restaurant name. */
function buildTitle(menuName: string, restaurantName?: string): string {
  if (isValueDefined(restaurantName) && restaurantName !== '')
    return FM('seo.menuTitleFormat', menuName, restaurantName);

  return menuName;
}

/** Build a meta description, enriched with business info when available. */
function buildDescription(
  menuDescription?: string,
  businessProfile?: BusinessProfileData,
): string {
  const parts: string[] = [];

  if (isValueDefined(menuDescription) && menuDescription !== '')
    parts.push(menuDescription);

  if (isValueDefined(businessProfile)) {
    const bp = businessProfile;

    if (isNonEmptyStr(bp.cuisineType))
      parts.push(bp.cuisineType);

    const cityState = [bp.city, bp.state].filter(isNonEmptyStr).join(', ');

    if (cityState !== '')
      parts.push(cityState);
  }

  if (parts.length > 0)
    return truncateDescription(parts.join(' - '), MAX_DESCRIPTION_LENGTH);

  return FM('seo.defaultDescription');
}

/** Check if a string value is non-empty. */
function isNonEmptyStr(value: string | null | undefined): value is string {
  return isValueDefined(value) && value !== '';
}

/**
 * Generates meta tag data for a public menu page.
 *
 * Returns an object with title, description, and Open Graph values
 * suitable for injection into the page head.
 */
export function generateMenuMetaTags(options: MetaTagOptions): MetaTagData {
  const title = buildTitle(options.menuName, options.restaurantName);
  const description = buildDescription(options.menuDescription, options.businessProfile);

  const result: MetaTagData = {
    title,
    description,
    ogTitle: title,
    ogDescription: description,
    ogUrl: options.publicUrl,
    ogType: OG_TYPE_WEBSITE,
  };

  if (isValueDefined(options.logoUrl) && options.logoUrl !== '')
    result.ogImage = options.logoUrl;

  return result;
}
