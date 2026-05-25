import { isValueDefined } from '../../../utils/is';

/** Day names for schema.org OpeningHoursSpecification (ISO 8601: 0=Monday). */
const SCHEMA_DAY_NAMES: readonly string[] = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
];

export interface BusinessProfileData {
  phone?: string | null;
  email?: string | null;
  website?: string | null;
  addressLine1?: string | null;
  addressLine2?: string | null;
  city?: string | null;
  state?: string | null;
  postalCode?: string | null;
  country?: string | null;
  cuisineType?: string | null;
  operatingHoursJson?: string | null;
}

export interface SchemaPostalAddress {
  '@type': 'PostalAddress';
  streetAddress?: string;
  addressLocality?: string;
  addressRegion?: string;
  postalCode?: string;
  addressCountry?: string;
}

export interface SchemaOpeningHours {
  '@type': 'OpeningHoursSpecification';
  dayOfWeek: string;
  opens: string;
  closes: string;
}

interface OperatingHoursEntry {
  day: number;
  open: string;
  close: string;
  isClosed?: boolean;
}

/** Check if a string value is non-empty. */
function isNonEmpty(value: string | null | undefined): value is string {
  return isValueDefined(value) && value !== '';
}

/** Type guard: validate an unknown value is a valid hours entry with required fields. */
function isValidHoursEntry(value: unknown): value is OperatingHoursEntry {
  if (typeof value !== 'object' || !isValueDefined(value)) return false;
  const entry: Record<string, unknown> = value;
  return typeof entry.day === 'number'
    && typeof entry.open === 'string'
    && typeof entry.close === 'string'
    && entry.isClosed !== true;
}

/** Safely extract the hours array from parsed JSON. */
function extractHoursArray(parsed: unknown): unknown[] | null {
  if (typeof parsed !== 'object' || !isValueDefined(parsed)) return null;
  const obj: Record<string, unknown> = parsed;
  return Array.isArray(obj.hours) ? obj.hours : null;
}

/** Map a validated hours entry to a schema.org OpeningHoursSpecification. */
function mapEntryToSchema(entry: OperatingHoursEntry): SchemaOpeningHours {
  return {
    '@type': 'OpeningHoursSpecification',
    dayOfWeek: SCHEMA_DAY_NAMES[entry.day] ?? '',
    opens: entry.open,
    closes: entry.close,
  };
}

/** Build a PostalAddress from business profile fields. */
export function buildPostalAddress(
  profile: BusinessProfileData,
): SchemaPostalAddress | null {
  const hasAddress = isNonEmpty(profile.addressLine1)
    || isNonEmpty(profile.city)
    || isNonEmpty(profile.state)
    || isNonEmpty(profile.postalCode)
    || isNonEmpty(profile.country);

  if (!hasAddress) return null;

  const address: SchemaPostalAddress = { '@type': 'PostalAddress' };

  const streetParts = [profile.addressLine1, profile.addressLine2]
    .filter(isNonEmpty);

  if (streetParts.length > 0)
    address.streetAddress = streetParts.join(', ');

  if (isNonEmpty(profile.city))
    address.addressLocality = profile.city;

  if (isNonEmpty(profile.state))
    address.addressRegion = profile.state;

  if (isNonEmpty(profile.postalCode))
    address.postalCode = profile.postalCode;

  if (isNonEmpty(profile.country))
    address.addressCountry = profile.country;

  return address;
}

/** Parse operating hours JSON into OpeningHoursSpecification entries. */
export function buildOpeningHours(
  operatingHoursJson?: string | null,
): SchemaOpeningHours[] {
  if (!isValueDefined(operatingHoursJson) || operatingHoursJson === '')
    return [];

  try {
    const parsed: unknown = JSON.parse(operatingHoursJson);
    const hours = extractHoursArray(parsed);
    if (!isValueDefined(hours)) return [];

    return hours
      .filter(isValidHoursEntry)
      .map(mapEntryToSchema)
      .filter((entry) => entry.dayOfWeek !== '');
  } catch {
    return [];
  }
}
