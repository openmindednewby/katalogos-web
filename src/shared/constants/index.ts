

const MS_PER_SECOND = 1000;
const SECONDS_PER_MINUTE = 60;
const MS_PER_MINUTE = MS_PER_SECOND * SECONDS_PER_MINUTE;


const BYTES_PER_KB = 1024;
const BYTES_PER_MB = BYTES_PER_KB * BYTES_PER_KB;


const TOKEN_REFRESH_MINUTES = 50;

const DEFAULT_API_TIMEOUT_SECONDS = 30;

const TOAST_DURATION_SECONDS = 3;

const TOAST_FADE_IN_DURATION = 200;
const TOAST_FADE_OUT_DURATION = 300;
const SIDEBAR_TRANSITION_DURATION = 300;


const OTP_MIN_LENGTH = 4;
const OTP_MAX_LENGTH = 10;
const OTP_DEFAULT_LENGTH = 6;

const PASSWORD_MIN_LENGTH = 8;
const PASSWORD_MAX_LENGTH = 128;


const PAGE_SIZE_DEFAULT = 20;
const PAGINATION_WARNING_THRESHOLD = 100;


const HTTP_OK = 200;
const HTTP_CREATED = 201;
const HTTP_BAD_REQUEST = 400;
const HTTP_UNAUTHORIZED = 401;
const HTTP_FORBIDDEN = 403;
const HTTP_NOT_FOUND = 404;
const HTTP_INTERNAL_SERVER_ERROR = 500;


const MAX_FILE_SIZE_MB = 10;

/** Token refresh interval in milliseconds. */
export const TOKEN_REFRESH_INTERVAL_MS = TOKEN_REFRESH_MINUTES * MS_PER_MINUTE;

/**
 * Default API request timeout in milliseconds.
 */
export const DEFAULT_API_TIMEOUT_MS = DEFAULT_API_TIMEOUT_SECONDS * MS_PER_SECOND;

/**
 * HTTP request timeout for axios in milliseconds.
 */
export const HTTP_TIMEOUT_MS = DEFAULT_API_TIMEOUT_SECONDS * MS_PER_SECOND;


/**
 * Breakpoint for phone layout switch.
 */
export const PHONE_BREAKPOINT_PX = 480;

/**
 * Breakpoint for tablet/mobile layout switch.
 */
export const TABLET_BREAKPOINT_PX = 768;

/**
 * Breakpoint for desktop layout switch.
 */
export const DESKTOP_BREAKPOINT_PX = 1024;

/** Breakpoint at/above which the menu editor renders its desktop two-pane */
export const EDITOR_TWO_PANE_BREAKPOINT_PX = 1280;

/**
 * Duration for toast notifications in milliseconds.
 */
export const TOAST_DURATION_MS = TOAST_DURATION_SECONDS * MS_PER_SECOND;

/**
 * Animation durations in milliseconds.
 */
export const ANIMATION = {
  TOAST_FADE_IN_MS: TOAST_FADE_IN_DURATION,
  TOAST_FADE_OUT_MS: TOAST_FADE_OUT_DURATION,
  SIDEBAR_TRANSITION_MS: SIDEBAR_TRANSITION_DURATION,
} as const;

/**
 * OTP (One-Time Password) configuration.
 */
export const OTP = {
  MIN_LENGTH: OTP_MIN_LENGTH,
  MAX_LENGTH: OTP_MAX_LENGTH,
  DEFAULT_LENGTH: OTP_DEFAULT_LENGTH,
} as const;

/**
 * Password requirements.
 */
export const PASSWORD = {
  MIN_LENGTH: PASSWORD_MIN_LENGTH,
  MAX_LENGTH: PASSWORD_MAX_LENGTH,
} as const;

/**
 * Default page size for paginated lists.
 */
export const DEFAULT_PAGE_SIZE = PAGE_SIZE_DEFAULT;

/**
 * Maximum items to load without pagination warning.
 */
export const MAX_ITEMS_WITHOUT_PAGINATION = PAGINATION_WARNING_THRESHOLD;

export const HTTP_STATUS = {
  OK: HTTP_OK,
  CREATED: HTTP_CREATED,
  BAD_REQUEST: HTTP_BAD_REQUEST,
  UNAUTHORIZED: HTTP_UNAUTHORIZED,
  FORBIDDEN: HTTP_FORBIDDEN,
  NOT_FOUND: HTTP_NOT_FOUND,
  INTERNAL_SERVER_ERROR: HTTP_INTERNAL_SERVER_ERROR,
} as const;

/** Maximum file size for uploads in bytes. */
export const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * BYTES_PER_MB;

/**
 * Allowed file MIME types for uploads.
 */
export const ALLOWED_FILE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'image/svg+xml',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'text/plain',
  'text/csv',
  'application/json',
] as const;

/** File upload error translation keys. */
export const FILE_UPLOAD_ERROR_KEYS = {
  FILE_TOO_LARGE: 'fileUpload.errors.fileTooLarge',
  INVALID_FILE_TYPE: 'fileUpload.errors.invalidFileType',
  EMPTY_FILE: 'fileUpload.errors.emptyFile',
} as const;


/** Standard modal overlay background color. */
export const MODAL_OVERLAY_COLOR = 'rgba(0, 0, 0, 0.5)';

/** Standard opacity for disabled interactive elements. */
export const DISABLED_OPACITY = 0.5;


export const STORAGE_KEYS = {
  AUTH_PERSIST: 'persist:auth',
  ACCESS_TOKEN: 'accessToken',
  REFRESH_TOKEN: 'refreshToken',
  USER_PROFILE: 'userProfile',
  SESSION_EXPIRED: 'sessionExpired',
  COOKIE_CONSENT: 'COOKIE_CONSENT',
  DARK_MODE_PREFERENCE: 'DARK_MODE_PREFERENCE',
} as const;
