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
  name?: string | null;
  logoUrl?: string | null;
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

/** Type guard for a plain object record. */
function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && isValueDefined(value);
}

/** Check if a string value is non-empty. */
function isNonEmpty(value: string | null | undefined): value is string {
  return isValueDefined(value) && value !== '';
}

/** Type guard: validate an unknown value is a valid hours entry with required fields. */
function isValidHoursEntry(value: unknown): value is OperatingHoursEntry {
  if (!isRecord(value)) return false;
  return typeof value.day === 'number'
    && typeof value.open === 'string'
    && typeof value.close === 'string'
    && value.isClosed !== true;
}

/** Safely extract the hours array from parsed JSON. */
function extractHoursArray(parsed: unknown): unknown[] | null {
  if (!isRecord(parsed)) return null;
  return Array.isArray(parsed.hours) ? parsed.hours : null;
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
