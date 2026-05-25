import i18n from './i18n';
import { isValueDefined } from '../utils/is';

/**
 * Format options for date formatting
 */
interface FormatDateOptions {
  year?: 'numeric' | '2-digit';
  month?: 'numeric' | '2-digit' | 'long' | 'short' | 'narrow';
  day?: 'numeric' | '2-digit';
  hour?: 'numeric' | '2-digit';
  minute?: 'numeric' | '2-digit';
  second?: 'numeric' | '2-digit';
  weekday?: 'long' | 'short' | 'narrow';
  timeZone?: string;
  timeZoneName?: 'long' | 'short';
}

/**
 * FM - Format Message
 *
 * Helper function to format localized messages with parameters.
 * Uses {{p1}}, {{p2}}, {{p3}} convention for parameter placeholders.
 *
 * @param id - The translation key
 * @param p1 - Optional first parameter value
 * @param p2 - Optional second parameter value
 * @param p3 - Optional third parameter value
 * @returns Formatted message string
 *
 * @example
 * // en.json: { "deleteSuccess": "Deleted {{p1}} templates" }
 * FM('deleteSuccess', '5') // Returns: "Deleted 5 templates"
 *
 * @example
 * // en.json: { "moveSuccess": "Moved {{p1}} items to {{p2}}" }
 * FM('moveSuccess', '10', 'archive') // Returns: "Moved 10 items to archive"
 */
export function FM(id: string, p1?: string, p2?: string, p3?: string): string {
  const options: Record<string, string> = {};

  if (isValueDefined(p1))
    options.p1 = p1;

  if (isValueDefined(p2))
    options.p2 = p2;

  if (isValueDefined(p3))
    options.p3 = p3;


  return i18n.t(id, options);
}

/**
 * FD - Format Date
 *
 * Helper function to format dates using the current locale.
 * Returns empty string for null/undefined dates.
 *
 * @param date - The date to format (Date object, null, or undefined)
 * @param options - Optional Intl.DateTimeFormat options
 * @returns Formatted date string or empty string
 *
 * @example
 * FD(new Date()) // Returns: "6/15/2024" (depends on locale)
 *
 * @example
 * FD(new Date(), { year: 'numeric', month: 'long' }) // Returns: "June 2024"
 *
 * @example
 * FD(null) // Returns: ""
 */
export function FD(date?: Date | null, options?: FormatDateOptions): string {
  if (!isValueDefined(date) || !isValueDefined(date)) 
    return '';
  

  const locale = i18n.language !== '' ? i18n.language : 'en';

  try {
    return new Intl.DateTimeFormat(locale, options).format(date);
  } catch {
    // Fallback to ISO string if formatting fails
    return date.toISOString().split('T')[0];
  }
}
