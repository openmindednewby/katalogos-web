/**
 * Constants for the Custom Domain settings screen.
 * Domain-specific styling and configuration values.
 */

/** CNAME target that custom domains should point to. */
export const CNAME_TARGET = 'public.yoursaas.com';

/** Prefix for the TXT verification record. */
export const TXT_RECORD_PREFIX = '_saas-verify.';

/** Font size for DNS record instruction text. */
export const INSTRUCTION_FONT_SIZE = 13;

/** Font size for status badge text. */
export const BADGE_FONT_SIZE = 12;

/** Padding inside status badges. */
export const BADGE_PADDING_H = 10;

/** Vertical padding for badges. */
export const BADGE_PADDING_V = 4;

/** Border radius for status badges. */
export const BADGE_BORDER_RADIUS = 12;

/** Padding for copy buttons. */
export const COPY_BUTTON_PADDING = 6;

/** Border radius for copy buttons. */
export const COPY_BUTTON_BORDER_RADIUS = 4;

/** Gap between DNS instruction rows. */
export const INSTRUCTION_GAP = 12;

/** Opacity for the badge background relative to its text color. */
export const BADGE_BG_OPACITY_SUFFIX = '20';

/** Height of section gap spacers. */
export const SECTION_GAP_HEIGHT = 20;

/** Padding for action buttons. */
export const ACTION_PADDING_V = 10;

/** Horizontal padding for action buttons. */
export const ACTION_PADDING_H = 16;

/** Border radius for action buttons. */
export const ACTION_BORDER_RADIUS = 6;

/** Opacity applied to disabled buttons. */
export { DISABLED_OPACITY } from '../../../shared/constants';

/** Bottom margin for DNS instruction labels. */
export const LABEL_MARGIN_BOTTOM = 2;

/** Left margin for copy buttons in DNS instructions. */
export const COPY_BUTTON_MARGIN_LEFT = 8;
