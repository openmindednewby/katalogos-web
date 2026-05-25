import { buildOpeningHours, buildPostalAddress } from './businessProfileSchema';
import { generateMenuJsonLd } from './menuStructuredData';

import type { BusinessProfileData } from './businessProfileSchema';
import type { Category } from '../../../types/menuTypes';

const SAMPLE_URL = 'https://app.menuflow.com/public/menu/abc123';
const SAMPLE_LOGO = 'https://app.menuflow.com/icons/logo-512.png';

function buildCategory(overrides?: Partial<Category>): Category {
  return {
    name: 'Appetizers',
    items: [
      { name: 'Spring Rolls', description: 'Crispy vegetable rolls', price: 8.99 },
      { name: 'Soup', description: 'Tomato soup', price: 5.5 },
    ],
    ...overrides,
  };
}

function buildBusinessProfile(overrides?: Partial<BusinessProfileData>): BusinessProfileData {
  return {
    phone: '+1-555-0123',
    email: 'info@joesdiner.com',
    website: 'https://joesdiner.com',
    addressLine1: '123 Main St',
    addressLine2: 'Suite 100',
    city: 'Springfield',
    state: 'IL',
    postalCode: '62701',
    country: 'US',
    cuisineType: 'American',
    operatingHoursJson: JSON.stringify({
      hours: [
        { day: 0, open: '09:00', close: '22:00', isClosed: false },
        { day: 1, open: '09:00', close: '22:00', isClosed: false },
        { day: 6, isClosed: true },
      ],
    }),
    ...overrides,
  };
}

describe('generateMenuJsonLd', () => {
  it('generates valid JSON-LD with all fields populated', () => {
    const result = generateMenuJsonLd({
      menuName: 'Lunch Menu',
      menuDescription: 'Our daily lunch specials',
      restaurantName: 'My Restaurant',
      publicUrl: SAMPLE_URL,
      categories: [buildCategory()],
      logoUrl: SAMPLE_LOGO,
      lastUpdated: '2026-03-15',
    });

    expect(result['@context']).toBe('https://schema.org');
    expect(result['@type']).toBe('Restaurant');
    expect(result.name).toBe('My Restaurant');
    expect(result.url).toBe(SAMPLE_URL);
    expect(result.logo).toBe(SAMPLE_LOGO);
    expect(result.hasMenu['@type']).toBe('Menu');
    expect(result.hasMenu.name).toBe('Lunch Menu');
    expect(result.hasMenu.description).toBe('Our daily lunch specials');
  });

  it('uses menuName as restaurant name when restaurantName is not provided', () => {
    const result = generateMenuJsonLd({
      menuName: 'Dinner Menu',
      publicUrl: SAMPLE_URL,
      categories: [],
    });

    expect(result.name).toBe('Dinner Menu');
  });

  it('omits description when not provided', () => {
    const result = generateMenuJsonLd({
      menuName: 'Menu',
      publicUrl: SAMPLE_URL,
      categories: [],
    });

    expect(result.hasMenu.description).toBeUndefined();
  });

  it('omits logo when not provided', () => {
    const result = generateMenuJsonLd({
      menuName: 'Menu',
      publicUrl: SAMPLE_URL,
      categories: [],
    });

    expect(result.logo).toBeUndefined();
  });

  it('omits logo when logoUrl is empty string', () => {
    const result = generateMenuJsonLd({
      menuName: 'Menu',
      publicUrl: SAMPLE_URL,
      categories: [],
      logoUrl: '',
    });

    expect(result.logo).toBeUndefined();
  });

  it('maps categories to MenuSection entries', () => {
    const categories: Category[] = [
      buildCategory({ name: 'Starters' }),
      buildCategory({ name: 'Mains' }),
    ];

    const result = generateMenuJsonLd({
      menuName: 'Menu',
      publicUrl: SAMPLE_URL,
      categories,
    });

    const sections = result.hasMenu.hasMenuSection;
    expect(sections).toHaveLength(2);
    expect(sections[0].name).toBe('Starters');
    expect(sections[1].name).toBe('Mains');
  });

  it('skips categories with no name', () => {
    const categories: Category[] = [
      buildCategory({ name: undefined }),
      buildCategory({ name: 'Valid' }),
    ];

    const result = generateMenuJsonLd({
      menuName: 'Menu',
      publicUrl: SAMPLE_URL,
      categories,
    });

    expect(result.hasMenu.hasMenuSection).toHaveLength(1);
    expect(result.hasMenu.hasMenuSection[0].name).toBe('Valid');
  });

  it('skips categories with empty name', () => {
    const categories: Category[] = [
      buildCategory({ name: '' }),
    ];

    const result = generateMenuJsonLd({
      menuName: 'Menu',
      publicUrl: SAMPLE_URL,
      categories,
    });

    expect(result.hasMenu.hasMenuSection).toHaveLength(0);
  });

  it('skips items with no name', () => {
    const category = buildCategory({
      items: [
        { name: 'Valid Item', price: 10 },
        { name: undefined, price: 5 },
        { name: '', price: 3 },
      ],
    });

    const result = generateMenuJsonLd({
      menuName: 'Menu',
      publicUrl: SAMPLE_URL,
      categories: [category],
    });

    const items = result.hasMenu.hasMenuSection[0].hasMenuItem;
    expect(items).toHaveLength(1);
    expect(items[0].name).toBe('Valid Item');
  });

  it('formats price as string with two decimals', () => {
    const category = buildCategory({
      items: [{ name: 'Item', price: 8.9 }],
    });

    const result = generateMenuJsonLd({
      menuName: 'Menu',
      publicUrl: SAMPLE_URL,
      categories: [category],
    });

    const offer = result.hasMenu.hasMenuSection[0].hasMenuItem[0].offers;
    expect(offer).toBeDefined();
    expect(offer?.price).toBe('8.90');
  });

  it('uses USD as default currency', () => {
    const category = buildCategory({
      items: [{ name: 'Item', price: 10 }],
    });

    const result = generateMenuJsonLd({
      menuName: 'Menu',
      publicUrl: SAMPLE_URL,
      categories: [category],
    });

    expect(result.hasMenu.hasMenuSection[0].hasMenuItem[0].offers?.priceCurrency).toBe('USD');
  });

  it('uses custom currency when provided', () => {
    const category = buildCategory({
      items: [{ name: 'Item', price: 10 }],
    });

    const result = generateMenuJsonLd({
      menuName: 'Menu',
      publicUrl: SAMPLE_URL,
      categories: [category],
      priceCurrency: 'EUR',
    });

    expect(result.hasMenu.hasMenuSection[0].hasMenuItem[0].offers?.priceCurrency).toBe('EUR');
  });

  it('omits offers when price is not set', () => {
    const category = buildCategory({
      items: [{ name: 'Free Item' }],
    });

    const result = generateMenuJsonLd({
      menuName: 'Menu',
      publicUrl: SAMPLE_URL,
      categories: [category],
    });

    expect(result.hasMenu.hasMenuSection[0].hasMenuItem[0].offers).toBeUndefined();
  });

  it('omits item description when not provided', () => {
    const category = buildCategory({
      items: [{ name: 'No Desc', price: 5 }],
    });

    const result = generateMenuJsonLd({
      menuName: 'Menu',
      publicUrl: SAMPLE_URL,
      categories: [category],
    });

    expect(result.hasMenu.hasMenuSection[0].hasMenuItem[0].description).toBeUndefined();
  });

  it('omits item description when it is empty string', () => {
    const category = buildCategory({
      items: [{ name: 'Empty Desc', description: '', price: 5 }],
    });

    const result = generateMenuJsonLd({
      menuName: 'Menu',
      publicUrl: SAMPLE_URL,
      categories: [category],
    });

    expect(result.hasMenu.hasMenuSection[0].hasMenuItem[0].description).toBeUndefined();
  });

  it('handles categories with undefined items array', () => {
    const category = buildCategory({ items: undefined });

    const result = generateMenuJsonLd({
      menuName: 'Menu',
      publicUrl: SAMPLE_URL,
      categories: [category],
    });

    expect(result.hasMenu.hasMenuSection[0].hasMenuItem).toEqual([]);
  });

  it('produces serializable JSON output', () => {
    const result = generateMenuJsonLd({
      menuName: 'Test',
      publicUrl: SAMPLE_URL,
      categories: [buildCategory()],
    });

    const serialized = JSON.stringify(result);
    const parsed = JSON.parse(serialized);
    expect(parsed['@context']).toBe('https://schema.org');
  });

  it('adds telephone from business profile', () => {
    const result = generateMenuJsonLd({
      menuName: 'Menu',
      publicUrl: SAMPLE_URL,
      categories: [],
      businessProfile: buildBusinessProfile(),
    });

    expect(result.telephone).toBe('+1-555-0123');
  });

  it('adds email from business profile', () => {
    const result = generateMenuJsonLd({
      menuName: 'Menu',
      publicUrl: SAMPLE_URL,
      categories: [],
      businessProfile: buildBusinessProfile(),
    });

    expect(result.email).toBe('info@joesdiner.com');
  });

  it('adds servesCuisine from business profile', () => {
    const result = generateMenuJsonLd({
      menuName: 'Menu',
      publicUrl: SAMPLE_URL,
      categories: [],
      businessProfile: buildBusinessProfile(),
    });

    expect(result.servesCuisine).toBe('American');
  });

  it('adds PostalAddress from business profile', () => {
    const result = generateMenuJsonLd({
      menuName: 'Menu',
      publicUrl: SAMPLE_URL,
      categories: [],
      businessProfile: buildBusinessProfile(),
    });

    expect(result.address).toBeDefined();
    expect(result.address?.['@type']).toBe('PostalAddress');
    expect(result.address?.streetAddress).toBe('123 Main St, Suite 100');
    expect(result.address?.addressLocality).toBe('Springfield');
    expect(result.address?.addressRegion).toBe('IL');
    expect(result.address?.postalCode).toBe('62701');
    expect(result.address?.addressCountry).toBe('US');
  });

  it('adds openingHoursSpecification from business profile', () => {
    const result = generateMenuJsonLd({
      menuName: 'Menu',
      publicUrl: SAMPLE_URL,
      categories: [],
      businessProfile: buildBusinessProfile(),
    });

    expect(result.openingHoursSpecification).toBeDefined();
    expect(result.openingHoursSpecification).toHaveLength(2);
    expect(result.openingHoursSpecification?.[0].dayOfWeek).toBe('Monday');
    expect(result.openingHoursSpecification?.[0].opens).toBe('09:00');
    expect(result.openingHoursSpecification?.[0].closes).toBe('22:00');
  });

  it('omits business profile fields when not provided', () => {
    const result = generateMenuJsonLd({
      menuName: 'Menu',
      publicUrl: SAMPLE_URL,
      categories: [],
    });

    expect(result.telephone).toBeUndefined();
    expect(result.email).toBeUndefined();
    expect(result.address).toBeUndefined();
    expect(result.servesCuisine).toBeUndefined();
    expect(result.openingHoursSpecification).toBeUndefined();
  });

  it('omits business profile fields when all values are null', () => {
    const result = generateMenuJsonLd({
      menuName: 'Menu',
      publicUrl: SAMPLE_URL,
      categories: [],
      businessProfile: {
        phone: null,
        email: null,
        cuisineType: null,
        operatingHoursJson: null,
      },
    });

    expect(result.telephone).toBeUndefined();
    expect(result.email).toBeUndefined();
    expect(result.servesCuisine).toBeUndefined();
    expect(result.openingHoursSpecification).toBeUndefined();
  });
});

describe('buildPostalAddress', () => {
  it('returns null when no address fields are provided', () => {
    const result = buildPostalAddress({});
    expect(result).toBeNull();
  });

  it('returns null when all address fields are null', () => {
    const result = buildPostalAddress({
      addressLine1: null,
      city: null,
      state: null,
      postalCode: null,
      country: null,
    });
    expect(result).toBeNull();
  });

  it('returns null when all address fields are empty', () => {
    const result = buildPostalAddress({
      addressLine1: '',
      city: '',
      state: '',
      postalCode: '',
      country: '',
    });
    expect(result).toBeNull();
  });

  it('combines addressLine1 and addressLine2 into streetAddress', () => {
    const result = buildPostalAddress({
      addressLine1: '123 Main St',
      addressLine2: 'Suite 100',
    });

    expect(result?.streetAddress).toBe('123 Main St, Suite 100');
  });

  it('uses only addressLine1 when addressLine2 is empty', () => {
    const result = buildPostalAddress({
      addressLine1: '123 Main St',
      addressLine2: '',
    });

    expect(result?.streetAddress).toBe('123 Main St');
  });
});

describe('buildOpeningHours', () => {
  it('returns empty array for null input', () => {
    expect(buildOpeningHours(null)).toEqual([]);
  });

  it('returns empty array for empty string', () => {
    expect(buildOpeningHours('')).toEqual([]);
  });

  it('returns empty array for invalid JSON', () => {
    expect(buildOpeningHours('not-json')).toEqual([]);
  });

  it('returns empty array when hours is not an array', () => {
    expect(buildOpeningHours(JSON.stringify({ hours: 'invalid' }))).toEqual([]);
  });

  it('excludes closed days', () => {
    const json = JSON.stringify({
      hours: [
        { day: 0, open: '09:00', close: '22:00', isClosed: false },
        { day: 6, isClosed: true },
      ],
    });

    const result = buildOpeningHours(json);
    expect(result).toHaveLength(1);
    expect(result[0].dayOfWeek).toBe('Monday');
  });

  it('maps day numbers to schema.org day names', () => {
    const json = JSON.stringify({
      hours: [
        { day: 0, open: '09:00', close: '22:00', isClosed: false },
        { day: 4, open: '09:00', close: '23:00', isClosed: false },
        { day: 5, open: '10:00', close: '23:00', isClosed: false },
      ],
    });

    const result = buildOpeningHours(json);
    expect(result[0].dayOfWeek).toBe('Monday');
    expect(result[1].dayOfWeek).toBe('Friday');
    expect(result[2].dayOfWeek).toBe('Saturday');
  });

  it('excludes entries missing open or close times', () => {
    const json = JSON.stringify({
      hours: [
        { day: 0, open: '09:00', isClosed: false },
        { day: 1, close: '22:00', isClosed: false },
        { day: 2, open: '09:00', close: '22:00', isClosed: false },
      ],
    });

    const result = buildOpeningHours(json);
    expect(result).toHaveLength(1);
    expect(result[0].dayOfWeek).toBe('Wednesday');
  });
});
