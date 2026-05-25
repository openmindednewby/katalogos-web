/** Style constants and data for Preferences Settings components. */
export {
  SECTION_SPACING,
  SMALL_SPACING,
  MEDIUM_SPACING,
  TITLE_FONT_SIZE,
  BODY_FONT_SIZE,
  DESCRIPTION_FONT_SIZE,
  ERROR_TEXT_MARGIN_TOP,
} from '../constants';

/** Border radius for dropdown fields. */
export const DROPDOWN_BORDER_RADIUS = 6;

/** Padding inside dropdown fields. */
export const DROPDOWN_PADDING = 10;

/** Standard border width for dropdown fields. */
export const DROPDOWN_BORDER_WIDTH = 1;

/** Height for dropdown fields. */
export const DROPDOWN_HEIGHT = 40;

/** Available language value codes. Labels are resolved via FM() at render time. */
export const LANGUAGE_CODES = ['en'] as const;

/** Available date format options. */
export const DATE_FORMATS = [
  { label: 'YYYY-MM-DD', value: 'YYYY-MM-DD' },
  { label: 'DD/MM/YYYY', value: 'DD/MM/YYYY' },
  { label: 'MM/DD/YYYY', value: 'MM/DD/YYYY' },
] as const;

/** Common IANA timezones subset. */
export const TIMEZONES = [
  { label: 'UTC', value: 'UTC' },
  { label: 'US/Eastern', value: 'America/New_York' },
  { label: 'US/Central', value: 'America/Chicago' },
  { label: 'US/Mountain', value: 'America/Denver' },
  { label: 'US/Pacific', value: 'America/Los_Angeles' },
  { label: 'Europe/London', value: 'Europe/London' },
  { label: 'Europe/Paris', value: 'Europe/Paris' },
  { label: 'Europe/Berlin', value: 'Europe/Berlin' },
  { label: 'Asia/Tokyo', value: 'Asia/Tokyo' },
  { label: 'Asia/Shanghai', value: 'Asia/Shanghai' },
  { label: 'Asia/Dubai', value: 'Asia/Dubai' },
  { label: 'Australia/Sydney', value: 'Australia/Sydney' },
] as const;
