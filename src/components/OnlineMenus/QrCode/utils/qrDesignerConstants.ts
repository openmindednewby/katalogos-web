import { TemplateType } from '../enums/TemplateType';

/** Pixel dimensions for each template type at 96 DPI. */
interface TemplateDimensions {
  width: number;
  height: number;
}

const TABLE_TENT_WIDTH = 384;
const TABLE_TENT_HEIGHT = 576;
const STICKER_SIZE = 288;
const POSTER_WIDTH = 768;
const POSTER_HEIGHT = 1056;

/** Maps template types to their pixel dimensions. */
export const TEMPLATE_DIMENSIONS: Record<TemplateType, TemplateDimensions> = {
  [TemplateType.TableTent]: { width: TABLE_TENT_WIDTH, height: TABLE_TENT_HEIGHT },
  [TemplateType.Sticker]: { width: STICKER_SIZE, height: STICKER_SIZE },
  [TemplateType.Poster]: { width: POSTER_WIDTH, height: POSTER_HEIGHT },
};

/** DOM ID for the hidden QR code source element. */
export const DESIGNER_QR_SOURCE_ID = 'qr-designer-source';

/** Default accent color for templates. */
export const DEFAULT_ACCENT_COLOR = '#1a73e8';

/** Default call-to-action text translation key. */
export const DEFAULT_CTA_KEY = 'onlineMenus.qrCode.designer.defaultCta';

/** Scale factor for PNG export quality. */
export const DESIGNER_PNG_EXPORT_SCALE = 3;
