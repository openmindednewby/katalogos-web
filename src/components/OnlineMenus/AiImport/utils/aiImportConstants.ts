/**
 * Constants for the AI menu import feature.
 */

/** Maximum file size in bytes (10 MB) */
export const MAX_FILE_SIZE_BYTES = 10_485_760;

/** Accepted file extensions for AI import */
export const AI_IMPORT_ACCEPTED_FILE_TYPES = '.jpg,.jpeg,.png,.webp,.pdf';

/** Accepted MIME types for AI import */
export const AI_IMPORT_ACCEPTED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'application/pdf',
];

/** Default price for items without a detected price */
export const DEFAULT_ITEM_PRICE = 0;

/** Number of wizard steps */
const AI_IMPORT_STEP_COUNT = 4;

/** Step dot indices for the progress indicator */
export const AI_IMPORT_STEP_INDICES = Array.from({ length: AI_IMPORT_STEP_COUNT }, (_, i) => i);

/** Index of the Review step in the wizard (derived from AiImportStep enum ordering). */
export const REVIEW_STEP_INDEX = 2;

/** Modal overlay color */
export { MODAL_OVERLAY_COLOR as AI_IMPORT_OVERLAY_COLOR } from '../../../../shared/constants';
