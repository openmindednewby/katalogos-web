/**
 * Constants for the Business Profile settings screen.
 * Form field limits, spacing, and styling values.
 */

/** Re-export shared settings constants. */
export {
  SECTION_SPACING,
  SMALL_SPACING,
  MEDIUM_SPACING,
  TITLE_GAP,
  TITLE_FONT_SIZE,
  BODY_FONT_SIZE,
  DESCRIPTION_FONT_SIZE,
  INPUT_BORDER_RADIUS,
  INPUT_PADDING,
  INPUT_BORDER_WIDTH,
  ERROR_TEXT_MARGIN_TOP,
} from '../constants';

/** Height for single-line text inputs. */
export const INPUT_HEIGHT = 40;

/** Height for multiline text inputs (description). */
export const MULTILINE_INPUT_HEIGHT = 100;

/** Maximum character length for business name. */
export const MAX_NAME_LENGTH = 200;

/** Maximum character length for business description. */
export const MAX_DESCRIPTION_LENGTH = 2000;

/** Maximum character length for cuisine type. */
export const MAX_CUISINE_TYPE_LENGTH = 100;

/** Maximum character length for phone number. */
export const MAX_PHONE_LENGTH = 20;

/** Maximum character length for email. */
export const MAX_EMAIL_LENGTH = 254;

/** Maximum character length for website URL. */
export const MAX_WEBSITE_LENGTH = 2048;

/** Maximum character length for address line. */
export const MAX_ADDRESS_LENGTH = 200;

/** Maximum character length for city. */
export const MAX_CITY_LENGTH = 100;

/** Maximum character length for state. */
export const MAX_STATE_LENGTH = 100;

/** Maximum character length for postal code. */
export const MAX_POSTAL_CODE_LENGTH = 20;

/** Maximum character length for country. */
export const MAX_COUNTRY_LENGTH = 100;

/** Font weight for section titles. */
export const TITLE_FONT_WEIGHT = '600' as const;

/** Number of lines for multiline description input. */
export const DESCRIPTION_NUMBER_OF_LINES = 4;

/** Width of the time input field. */
export const TIME_INPUT_WIDTH = 90;

/** Default opening time for new operating hours entries. */
export const DEFAULT_OPEN_TIME = '09:00';

/** Default closing time for new operating hours entries. */
export const DEFAULT_CLOSE_TIME = '22:00';
