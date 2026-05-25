import { buildOpeningHours, buildPostalAddress } from './businessProfileSchema';
import { isValueDefined } from '../../../utils/is';

import type { BusinessProfileData, SchemaOpeningHours, SchemaPostalAddress } from './businessProfileSchema';
import type { Category } from '../../../types/menuTypes';

export type { BusinessProfileData } from './businessProfileSchema';
export { buildOpeningHours, buildPostalAddress } from './businessProfileSchema';

const SCHEMA_CONTEXT = 'https://schema.org';
const PRICE_DECIMALS = 2;
const DEFAULT_CURRENCY = 'USD';

interface StructuredDataOptions {
  menuName: string;
  menuDescription?: string;
  restaurantName?: string;
  publicUrl: string;
  categories: Category[];
  logoUrl?: string;
  lastUpdated?: string;
  priceCurrency?: string;
  businessProfile?: BusinessProfileData;
}

interface SchemaOffer {
  '@type': 'Offer';
  price: string;
  priceCurrency: string;
}

interface SchemaMenuItem {
  '@type': 'MenuItem';
  name: string;
  description?: string;
  offers?: SchemaOffer;
}

interface SchemaMenuSection {
  '@type': 'MenuSection';
  name: string;
  hasMenuItem: SchemaMenuItem[];
}

interface SchemaMenu {
  '@type': 'Menu';
  name: string;
  description?: string;
  hasMenuSection: SchemaMenuSection[];
}

interface SchemaRestaurant {
  '@context': typeof SCHEMA_CONTEXT;
  '@type': 'Restaurant';
  name: string;
  url: string;
  logo?: string;
  telephone?: string;
  email?: string;
  address?: SchemaPostalAddress;
  servesCuisine?: string;
  openingHoursSpecification?: SchemaOpeningHours[];
  hasMenu: SchemaMenu;
}

/** Check if a string value is non-empty. */
function isNonEmpty(value: string | null | undefined): value is string {
  return isValueDefined(value) && value !== '';
}

/** Build a schema.org MenuItem from domain data. */
function buildSchemaMenuItem(
  item: { name?: string; description?: string | null; price?: number },
  currency: string,
): SchemaMenuItem | null {
  if (!isValueDefined(item.name) || item.name === '') return null;

  const schemaItem: SchemaMenuItem = {
    '@type': 'MenuItem',
    name: item.name,
  };

  if (isValueDefined(item.description) && item.description !== '')
    schemaItem.description = item.description;

  if (typeof item.price === 'number')
    schemaItem.offers = {
      '@type': 'Offer',
      price: item.price.toFixed(PRICE_DECIMALS),
      priceCurrency: currency,
    };

  return schemaItem;
}

/** Build a schema.org MenuSection from a category. */
function buildMenuSection(cat: Category, currency: string): SchemaMenuSection | null {
  const categoryName = cat.name ?? '';
  if (categoryName === '') return null;

  const menuItems = (cat.items ?? [])
    .map((item) => buildSchemaMenuItem(item, currency))
    .filter((item): item is SchemaMenuItem => isValueDefined(item));

  return { '@type': 'MenuSection', name: categoryName, hasMenuItem: menuItems };
}

/** Build optional restaurant fields from a business profile. */
function buildProfileFields(bp: BusinessProfileData): Partial<SchemaRestaurant> {
  const fields: Partial<SchemaRestaurant> = {};

  if (isNonEmpty(bp.phone)) fields.telephone = bp.phone;
  if (isNonEmpty(bp.email)) fields.email = bp.email;

  const address = buildPostalAddress(bp);
  if (isValueDefined(address)) fields.address = address;

  if (isNonEmpty(bp.cuisineType)) fields.servesCuisine = bp.cuisineType;

  const hours = buildOpeningHours(bp.operatingHoursJson);
  if (hours.length > 0) fields.openingHoursSpecification = hours;

  return fields;
}

/**
 * Generates schema.org JSON-LD structured data for a restaurant menu.
 *
 * Produces a Restaurant entity containing a Menu with MenuSection
 * and MenuItem children. Skips categories with no name and items
 * with no name so the output stays clean.
 */
export function generateMenuJsonLd(options: StructuredDataOptions): SchemaRestaurant {
  const currency = options.priceCurrency ?? DEFAULT_CURRENCY;

  const sections = options.categories
    .map((cat) => buildMenuSection(cat, currency))
    .filter((s): s is SchemaMenuSection => isValueDefined(s));

  const menu: SchemaMenu = { '@type': 'Menu', name: options.menuName, hasMenuSection: sections };

  if (isValueDefined(options.menuDescription) && options.menuDescription !== '')
    menu.description = options.menuDescription;

  const profileFields = isValueDefined(options.businessProfile)
    ? buildProfileFields(options.businessProfile)
    : {};

  const logo = isValueDefined(options.logoUrl) && options.logoUrl !== ''
    ? options.logoUrl
    : undefined;

  return {
    '@context': SCHEMA_CONTEXT,
    '@type': 'Restaurant',
    name: options.restaurantName ?? options.menuName,
    url: options.publicUrl,
    ...(isValueDefined(logo) ? { logo } : {}),
    ...profileFields,
    hasMenu: menu,
  };
}
