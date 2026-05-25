import { TEMPLATE_DIMENSIONS } from './qrDesignerConstants';
import { TemplateType } from '../enums/TemplateType';


/** Options passed to each template renderer. */
export interface TemplateRenderOptions {
  restaurantName: string;
  tagline: string;
  callToAction: string;
  qrFgColor: string;
  qrBgColor: string;
  accentColor: string;
  qrDataUri: string;
  logoDataUri: string;
}

const DATA_IMAGE_PREFIX = 'data:image/';
const LOGO_FALLBACK_SIZE = 48;
const TENT_QR_SIZE = 160;
const TENT_QR_Y = 340;
const TENT_HEADER_HEIGHT = 280;
const TENT_NAME_Y = 120;
const TENT_TAGLINE_Y = 170;
const TENT_LOGO_Y = 40;
const TENT_CTA_Y = 530;

const STICKER_QR_SIZE = 160;
const STICKER_QR_OFFSET = 64;
const STICKER_NAME_Y = 40;
const STICKER_BORDER_INSET = 8;
const STICKER_BORDER_RADIUS = 12;
const STICKER_STROKE_WIDTH = 3;

const POSTER_HEADER_HEIGHT = 200;
const POSTER_QR_SIZE = 280;
const POSTER_QR_Y = 550;
const POSTER_NAME_Y = 400;
const POSTER_CTA_Y = 900;
const POSTER_LOGO_Y = 60;

const TITLE_FONT_SIZE = 24;
const SUBTITLE_FONT_SIZE = 16;
const CTA_FONT_SIZE = 14;
const STICKER_TITLE_SIZE = 18;
const POSTER_TITLE_SCALE = 2;

const WHITE_COLOR = '#ffffff';

/** XML-entity escapes user strings to prevent SVG injection. */
export function escapeXml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/** Validates that a data URI begins with `data:image/`. */
function isValidImageDataUri(uri: string): boolean {
  return uri.startsWith(DATA_IMAGE_PREFIX);
}

interface TextBlockOptions {
  y: number;
  text: string;
  fontSize: number;
  fill: string;
  containerWidth: number;
  fontWeight?: string;
}

/** Renders a text element centered horizontally. */
function centeredText(opts: TextBlockOptions): string {
  const half = opts.containerWidth / 2;
  const escaped = escapeXml(opts.text);
  const weight = opts.fontWeight ?? 'normal';
  const fillColor = escaped === '' ? 'transparent' : opts.fill;
  return `<text x="${half}" y="${opts.y}" text-anchor="middle" font-family="sans-serif" font-size="${opts.fontSize}" font-weight="${weight}" fill="${fillColor}">${escaped}</text>`;
}

interface RectOptions {
  x: number;
  y: number;
  width: number;
  height: number;
  fill: string;
  rx?: number;
}

/** Renders a rect element. */
function svgRect(opts: RectOptions): string {
  const rxAttr = (opts.rx ?? 0) > 0 ? ` rx="${String(opts.rx)}"` : '';
  return `<rect x="${opts.x}" y="${opts.y}" width="${opts.width}" height="${opts.height}" fill="${escapeXml(opts.fill)}"${rxAttr} />`;
}

/** Renders a centered image element. */
function centeredImage(y: number, size: number, dataUri: string, containerWidth: number): string {
  if (!isValidImageDataUri(dataUri)) return '';
  const x = (containerWidth - size) / 2;
  return `<image x="${x}" y="${y}" width="${size}" height="${size}" href="${dataUri}" />`;
}

/** Renders the Table Tent template (4x6 inches, 384x576px). */
export function renderTableTentTemplate(opts: TemplateRenderOptions): string {
  const { width, height } = TEMPLATE_DIMENSIONS[TemplateType.TableTent];
  const qrX = (width - TENT_QR_SIZE) / 2;

  const logo = opts.logoDataUri !== ''
    ? centeredImage(TENT_LOGO_Y, LOGO_FALLBACK_SIZE, opts.logoDataUri, width)
    : '';

  return [
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">`,
    svgRect({ x: 0, y: 0, width, height, fill: opts.qrBgColor }),
    svgRect({ x: 0, y: 0, width, height: TENT_HEADER_HEIGHT, fill: opts.accentColor }),
    logo,
    centeredText({ y: TENT_NAME_Y, text: opts.restaurantName, fontSize: TITLE_FONT_SIZE, fill: WHITE_COLOR, containerWidth: width, fontWeight: 'bold' }),
    centeredText({ y: TENT_TAGLINE_Y, text: opts.tagline, fontSize: SUBTITLE_FONT_SIZE, fill: WHITE_COLOR, containerWidth: width }),
    `<image x="${qrX}" y="${TENT_QR_Y}" width="${TENT_QR_SIZE}" height="${TENT_QR_SIZE}" href="${opts.qrDataUri}" />`,
    centeredText({ y: TENT_CTA_Y, text: opts.callToAction, fontSize: CTA_FONT_SIZE, fill: opts.accentColor, containerWidth: width, fontWeight: 'bold' }),
    '</svg>',
  ].join('');
}

/** Renders the Sticker template (3x3 inches, 288x288px). */
export function renderStickerTemplate(opts: TemplateRenderOptions): string {
  const { width, height } = TEMPLATE_DIMENSIONS[TemplateType.Sticker];
  const qrX = (width - STICKER_QR_SIZE) / 2;
  const borderW = width - STICKER_BORDER_INSET * 2;
  const borderH = height - STICKER_BORDER_INSET * 2;

  return [
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">`,
    svgRect({ x: 0, y: 0, width, height, fill: opts.qrBgColor }),
    `<rect x="${STICKER_BORDER_INSET}" y="${STICKER_BORDER_INSET}" width="${borderW}" height="${borderH}" rx="${STICKER_BORDER_RADIUS}" fill="none" stroke="${escapeXml(opts.accentColor)}" stroke-width="${STICKER_STROKE_WIDTH}" />`,
    centeredText({ y: STICKER_NAME_Y, text: opts.restaurantName, fontSize: STICKER_TITLE_SIZE, fill: opts.qrFgColor, containerWidth: width, fontWeight: 'bold' }),
    `<image x="${qrX}" y="${STICKER_QR_OFFSET}" width="${STICKER_QR_SIZE}" height="${STICKER_QR_SIZE}" href="${opts.qrDataUri}" />`,
    centeredText({ y: height - STICKER_BORDER_INSET * 2, text: opts.callToAction, fontSize: CTA_FONT_SIZE, fill: opts.accentColor, containerWidth: width }),
    '</svg>',
  ].join('');
}

/** Renders the Poster template (8x11 inches, 768x1056px). */
export function renderPosterTemplate(opts: TemplateRenderOptions): string {
  const { width, height } = TEMPLATE_DIMENSIONS[TemplateType.Poster];
  const qrX = (width - POSTER_QR_SIZE) / 2;

  const logo = opts.logoDataUri !== ''
    ? centeredImage(POSTER_LOGO_Y, LOGO_FALLBACK_SIZE, opts.logoDataUri, width)
    : '';

  return [
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">`,
    svgRect({ x: 0, y: 0, width, height, fill: opts.qrBgColor }),
    svgRect({ x: 0, y: 0, width, height: POSTER_HEADER_HEIGHT, fill: opts.accentColor }),
    logo,
    centeredText({ y: POSTER_HEADER_HEIGHT - SUBTITLE_FONT_SIZE, text: opts.tagline, fontSize: SUBTITLE_FONT_SIZE, fill: WHITE_COLOR, containerWidth: width }),
    centeredText({ y: POSTER_NAME_Y, text: opts.restaurantName, fontSize: TITLE_FONT_SIZE * POSTER_TITLE_SCALE, fill: opts.qrFgColor, containerWidth: width, fontWeight: 'bold' }),
    `<image x="${qrX}" y="${POSTER_QR_Y}" width="${POSTER_QR_SIZE}" height="${POSTER_QR_SIZE}" href="${opts.qrDataUri}" />`,
    centeredText({ y: POSTER_CTA_Y, text: opts.callToAction, fontSize: SUBTITLE_FONT_SIZE, fill: opts.accentColor, containerWidth: width, fontWeight: 'bold' }),
    '</svg>',
  ].join('');
}

/** Dispatches to the correct template renderer. */
export function renderTemplate(type: TemplateType, opts: TemplateRenderOptions): string {
  switch (type) {
    case TemplateType.TableTent:
      return renderTableTentTemplate(opts);
    case TemplateType.Sticker:
      return renderStickerTemplate(opts);
    case TemplateType.Poster:
      return renderPosterTemplate(opts);
    default:
      return renderTableTentTemplate(opts);
  }
}
