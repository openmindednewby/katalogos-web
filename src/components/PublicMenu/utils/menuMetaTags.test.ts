import { generateMenuMetaTags } from './menuMetaTags';

jest.mock('../../../localization/helpers', () => ({
  FM: jest.fn((id: string, p1?: string, p2?: string) => {
    const messages: Record<string, string | undefined> = {
      'seo.menuTitleFormat': `${p1} - ${p2}`,
      'seo.defaultDescription': 'View our menu online',
    };
    return messages[id] ?? id;
  }),
}));

const SAMPLE_URL = 'https://app.menuflow.com/public/menu/abc123';
const SAMPLE_LOGO = 'https://app.menuflow.com/icons/logo.png';

describe('generateMenuMetaTags', () => {
  it('generates title with restaurant name when provided', () => {
    const result = generateMenuMetaTags({
      menuName: 'Lunch Menu',
      restaurantName: 'Cafe Roma',
      publicUrl: SAMPLE_URL,
    });

    expect(result.title).toBe('Lunch Menu - Cafe Roma');
    expect(result.ogTitle).toBe('Lunch Menu - Cafe Roma');
  });

  it('uses menu name alone when restaurant name is missing', () => {
    const result = generateMenuMetaTags({
      menuName: 'Dinner Menu',
      publicUrl: SAMPLE_URL,
    });

    expect(result.title).toBe('Dinner Menu');
  });

  it('uses menu name alone when restaurant name is empty', () => {
    const result = generateMenuMetaTags({
      menuName: 'Dinner Menu',
      restaurantName: '',
      publicUrl: SAMPLE_URL,
    });

    expect(result.title).toBe('Dinner Menu');
  });

  it('uses provided description for meta and OG description', () => {
    const result = generateMenuMetaTags({
      menuName: 'Menu',
      menuDescription: 'Freshly prepared dishes',
      publicUrl: SAMPLE_URL,
    });

    expect(result.description).toBe('Freshly prepared dishes');
    expect(result.ogDescription).toBe('Freshly prepared dishes');
  });

  it('falls back to default description when none provided', () => {
    const result = generateMenuMetaTags({
      menuName: 'Menu',
      publicUrl: SAMPLE_URL,
    });

    expect(result.description).toBe('View our menu online');
  });

  it('falls back to default description when description is empty', () => {
    const result = generateMenuMetaTags({
      menuName: 'Menu',
      menuDescription: '',
      publicUrl: SAMPLE_URL,
    });

    expect(result.description).toBe('View our menu online');
  });

  it('truncates long descriptions to 160 characters with ellipsis', () => {
    const longDescription = 'A'.repeat(200);

    const result = generateMenuMetaTags({
      menuName: 'Menu',
      menuDescription: longDescription,
      publicUrl: SAMPLE_URL,
    });

    const MAX_LENGTH = 160;
    expect(result.description.length).toBe(MAX_LENGTH);
    expect(result.description.endsWith('...')).toBe(true);
  });

  it('does not truncate descriptions at exactly 160 characters', () => {
    const exactDescription = 'B'.repeat(160);

    const result = generateMenuMetaTags({
      menuName: 'Menu',
      menuDescription: exactDescription,
      publicUrl: SAMPLE_URL,
    });

    expect(result.description).toBe(exactDescription);
    expect(result.description.endsWith('...')).toBe(false);
  });

  it('sets ogUrl to the provided publicUrl', () => {
    const result = generateMenuMetaTags({
      menuName: 'Menu',
      publicUrl: SAMPLE_URL,
    });

    expect(result.ogUrl).toBe(SAMPLE_URL);
  });

  it('sets ogType to website', () => {
    const result = generateMenuMetaTags({
      menuName: 'Menu',
      publicUrl: SAMPLE_URL,
    });

    expect(result.ogType).toBe('website');
  });

  it('includes ogImage when logoUrl is provided', () => {
    const result = generateMenuMetaTags({
      menuName: 'Menu',
      publicUrl: SAMPLE_URL,
      logoUrl: SAMPLE_LOGO,
    });

    expect(result.ogImage).toBe(SAMPLE_LOGO);
  });

  it('omits ogImage when logoUrl is not provided', () => {
    const result = generateMenuMetaTags({
      menuName: 'Menu',
      publicUrl: SAMPLE_URL,
    });

    expect(result.ogImage).toBeUndefined();
  });

  it('omits ogImage when logoUrl is empty string', () => {
    const result = generateMenuMetaTags({
      menuName: 'Menu',
      publicUrl: SAMPLE_URL,
      logoUrl: '',
    });

    expect(result.ogImage).toBeUndefined();
  });

  it('enriches description with cuisine and city/state from business profile', () => {
    const result = generateMenuMetaTags({
      menuName: 'Menu',
      menuDescription: 'Great food',
      publicUrl: SAMPLE_URL,
      businessProfile: {
        cuisineType: 'Italian',
        city: 'Springfield',
        state: 'IL',
      },
    });

    expect(result.description).toBe('Great food - Italian - Springfield, IL');
  });

  it('enriches description with city only when state is missing', () => {
    const result = generateMenuMetaTags({
      menuName: 'Menu',
      menuDescription: 'Great food',
      publicUrl: SAMPLE_URL,
      businessProfile: {
        city: 'Springfield',
        state: null,
      },
    });

    expect(result.description).toBe('Great food - Springfield');
  });

  it('enriches description with cuisine type only', () => {
    const result = generateMenuMetaTags({
      menuName: 'Menu',
      menuDescription: 'Great food',
      publicUrl: SAMPLE_URL,
      businessProfile: {
        cuisineType: 'Mexican',
        city: null,
        state: null,
      },
    });

    expect(result.description).toBe('Great food - Mexican');
  });

  it('does not add location when business profile has no city or state', () => {
    const result = generateMenuMetaTags({
      menuName: 'Menu',
      menuDescription: 'Great food',
      publicUrl: SAMPLE_URL,
      businessProfile: {
        city: null,
        state: null,
      },
    });

    expect(result.description).toBe('Great food');
  });
});
