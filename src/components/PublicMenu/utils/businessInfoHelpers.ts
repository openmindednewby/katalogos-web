import { isValueDefined } from '../../../utils/is';

import type { BusinessProfileData } from './businessProfileSchema';

interface OperatingHoursEntry {
  day: number;
  open: string;
  close: string;
  isClosed?: boolean;
}

/** Check if a string value is present and non-empty. */
function isNonEmpty(value: string | null | undefined): value is string {
  return isValueDefined(value) && value !== '';
}

/** Type guard for a valid hours entry. */
function isValidEntry(value: unknown): value is OperatingHoursEntry {
  if (typeof value !== 'object' || !isValueDefined(value)) return false;
  const entry: Record<string, unknown> = value;
  return typeof entry.day === 'number' && typeof entry.open === 'string' && typeof entry.close === 'string';
}

/** Format address lines into a single display string. */
export function formatAddress(profile: BusinessProfileData): string | null {
  const parts: string[] = [];

  const street = [profile.addressLine1, profile.addressLine2]
    .filter(isNonEmpty)
    .join(', ');

  if (street !== '') parts.push(street);

  const cityState = [profile.city, profile.state].filter(isNonEmpty).join(', ');
  if (cityState !== '') parts.push(cityState);

  if (isNonEmpty(profile.postalCode)) parts.push(profile.postalCode);
  if (isNonEmpty(profile.country)) parts.push(profile.country);

  return parts.length > 0 ? parts.join('\n') : null;
}

/** Parse operating hours JSON into display-ready entries. */
export function parseOperatingHours(json: string | null | undefined): OperatingHoursEntry[] {
  if (!isNonEmpty(json)) return [];

  try {
    const parsed: unknown = JSON.parse(json);
    if (typeof parsed !== 'object' || !isValueDefined(parsed)) return [];
    const obj: Record<string, unknown> = parsed;
    if (!Array.isArray(obj.hours)) return [];
    return obj.hours.filter(isValidEntry);
  } catch {
    return [];
  }
}

/** Check whether the profile has any displayable information. */
export function hasDisplayableInfo(profile: BusinessProfileData): boolean {
  return isNonEmpty(profile.phone)
    || isNonEmpty(profile.email)
    || isNonEmpty(profile.website)
    || isValueDefined(formatAddress(profile))
    || parseOperatingHours(profile.operatingHoursJson).length > 0;
}

/** Check if a string value is present and non-empty (exported for the component). */
export { isNonEmpty };

export type { OperatingHoursEntry };
