/**
 * Renders menu data into a jsPDF document with print-friendly formatting.
 * Separated from helpers to keep files under 300 lines and isolate jsPDF dependency.
 */
import { FM } from '@/localization/helpers';

import type { PdfMenuData, PdfCategorySection, PdfItemRow } from './menuPdfHelpers';

// =============================================================================
// Layout Constants (mm)
// =============================================================================

const PAGE_WIDTH = 210;
const PAGE_HEIGHT = 297;
const MARGIN_X = 20;
const MARGIN_TOP = 20;
const MARGIN_BOTTOM = 25;
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN_X * 2;
const HEADER_FONT_SIZE = 22;
const MENU_NAME_FONT_SIZE = 16;
const CATEGORY_FONT_SIZE = 14;
const ITEM_NAME_FONT_SIZE = 11;
const BODY_FONT_SIZE = 9;
const TAG_FONT_SIZE = 8;
const LINE_HEIGHT = 5;
const SECTION_GAP = 10;
const ITEM_GAP = 6;
const FEATURED_STAR = '\u2605 ';
const DIVIDER_HEIGHT = 0.3;
const FOOTER_Y_OFFSET = 10;
const TAG_INDENT = 4;
const DRAW_COLOR_GRAY = 180;
const HEADER_LINE_MULTIPLIER = 2;

// =============================================================================
// PDF Wrapper Interface
// =============================================================================

/** Minimal interface for jsPDF methods used by the renderer. */
export interface PdfDocument {
  setFontSize: (size: number) => void;
  setFont: (name: string, style: string) => void;
  setDrawColor: (color: number) => void;
  setLineWidth: (width: number) => void;
  text: (text: string | string[], x: number, y: number, options?: { align?: 'left' | 'center' | 'right' | 'justify' }) => void;
  line: (x1: number, y1: number, x2: number, y2: number) => void;
  splitTextToSize: (text: string, maxWidth: number) => string[];
  addPage: () => void;
}

// =============================================================================
// Cursor Tracking
// =============================================================================

interface Cursor {
  y: number;
  pageNumber: number;
}

function newPage(pdf: PdfDocument, cursor: Cursor): Cursor {
  writePageFooter(pdf, cursor.pageNumber);
  pdf.addPage();
  return { y: MARGIN_TOP, pageNumber: cursor.pageNumber + 1 };
}

function ensureSpace(pdf: PdfDocument, cursor: Cursor, spaceNeeded: number): Cursor {
  if (cursor.y + spaceNeeded <= PAGE_HEIGHT - MARGIN_BOTTOM) return cursor;
  return newPage(pdf, cursor);
}

// =============================================================================
// Page Footer
// =============================================================================

function writePageFooter(pdf: PdfDocument, pageNumber: number): void {
  pdf.setFontSize(TAG_FONT_SIZE);
  pdf.setFont('helvetica', 'normal');
  const footerText = FM('onlineMenus.pdfExport.pageFooter', String(pageNumber));
  pdf.text(footerText, PAGE_WIDTH / 2, PAGE_HEIGHT - FOOTER_Y_OFFSET, { align: 'center' });
}

// =============================================================================
// Section Renderers
// =============================================================================

function renderHeader(pdf: PdfDocument, cursor: Cursor, data: PdfMenuData): Cursor {
  let y = cursor.y;

  if (data.restaurantName !== '') {
    pdf.setFontSize(HEADER_FONT_SIZE);
    pdf.setFont('helvetica', 'bold');
    pdf.text(data.restaurantName, PAGE_WIDTH / 2, y, { align: 'center' });
    y += LINE_HEIGHT * HEADER_LINE_MULTIPLIER;
  }

  if (data.menuName !== '') {
    pdf.setFontSize(MENU_NAME_FONT_SIZE);
    pdf.setFont('helvetica', 'normal');
    pdf.text(data.menuName, PAGE_WIDTH / 2, y, { align: 'center' });
    y += LINE_HEIGHT * HEADER_LINE_MULTIPLIER;
  }

  pdf.setDrawColor(DRAW_COLOR_GRAY);
  pdf.setLineWidth(DIVIDER_HEIGHT);
  pdf.line(MARGIN_X, y, PAGE_WIDTH - MARGIN_X, y);
  y += SECTION_GAP;

  return { ...cursor, y };
}

function renderCategoryHeader(pdf: PdfDocument, cursor: Cursor, section: PdfCategorySection): Cursor {
  const safe = ensureSpace(pdf, cursor, SECTION_GAP * 2);
  let y = safe.y;

  pdf.setFontSize(CATEGORY_FONT_SIZE);
  pdf.setFont('helvetica', 'bold');
  pdf.text(section.title, MARGIN_X, y);
  y += LINE_HEIGHT;

  if (section.description !== '') {
    pdf.setFontSize(BODY_FONT_SIZE);
    pdf.setFont('helvetica', 'italic');
    const lines: string[] = pdf.splitTextToSize(section.description, CONTENT_WIDTH);
    pdf.text(lines, MARGIN_X, y);
    y += lines.length * LINE_HEIGHT;
  }

  y += LINE_HEIGHT;
  return { ...safe, y };
}

function renderVariants(pdf: PdfDocument, cursor: Cursor, item: PdfItemRow): Cursor {
  if (item.variants.length === 0) return cursor;

  let current = cursor;
  pdf.setFontSize(TAG_FONT_SIZE);
  pdf.setFont('helvetica', 'normal');

  for (const variant of item.variants) {
    current = ensureSpace(pdf, current, LINE_HEIGHT);
    const text = `${variant.groupName}: ${variant.options}`;
    pdf.text(text, MARGIN_X + TAG_INDENT, current.y);
    current = { ...current, y: current.y + LINE_HEIGHT };
  }

  return current;
}

function renderTags(pdf: PdfDocument, cursor: Cursor, item: PdfItemRow): Cursor {
  if (item.tags.length === 0) return cursor;

  const safe = ensureSpace(pdf, cursor, LINE_HEIGHT);
  pdf.setFontSize(TAG_FONT_SIZE);
  pdf.setFont('helvetica', 'italic');
  const tagLine = item.tags.join(' \u2022 ');
  pdf.text(tagLine, MARGIN_X + TAG_INDENT, safe.y);
  return { ...safe, y: safe.y + LINE_HEIGHT };
}

function renderItem(pdf: PdfDocument, cursor: Cursor, item: PdfItemRow): Cursor {
  const estimatedHeight = ITEM_GAP + LINE_HEIGHT * 2 + item.variants.length * LINE_HEIGHT;
  let current = ensureSpace(pdf, cursor, estimatedHeight);
  let y = current.y;

  const namePrefix = item.isFeatured ? FEATURED_STAR : '';
  const itemLabel = `${namePrefix}${item.name}`;

  pdf.setFontSize(ITEM_NAME_FONT_SIZE);
  pdf.setFont('helvetica', 'bold');
  pdf.text(itemLabel, MARGIN_X, y);

  if (item.price !== '')
    pdf.text(item.price, PAGE_WIDTH - MARGIN_X, y, { align: 'right' });

  y += LINE_HEIGHT;

  if (item.description !== '') {
    pdf.setFontSize(BODY_FONT_SIZE);
    pdf.setFont('helvetica', 'normal');
    const descLines: string[] = pdf.splitTextToSize(item.description, CONTENT_WIDTH);
    pdf.text(descLines, MARGIN_X, y);
    y += descLines.length * LINE_HEIGHT;
  }

  current = renderVariants(pdf, { ...current, y }, item);
  current = renderTags(pdf, current, item);

  return { ...current, y: current.y + ITEM_GAP };
}

// =============================================================================
// Public API
// =============================================================================

/**
 * Renders menu data into an existing jsPDF document.
 * The caller is responsible for creating the jsPDF instance and saving it.
 */
export function renderMenuPdf(pdf: PdfDocument, data: PdfMenuData): void {
  let cursor: Cursor = { y: MARGIN_TOP, pageNumber: 1 };

  cursor = renderHeader(pdf, cursor, data);

  for (const section of data.categories) {
    cursor = renderCategoryHeader(pdf, cursor, section);
    for (const item of section.items)
      cursor = renderItem(pdf, cursor, item);

    cursor = { ...cursor, y: cursor.y + SECTION_GAP };
  }

  writePageFooter(pdf, cursor.pageNumber);
}
