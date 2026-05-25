/**
 * File parsing utilities for menu import.
 * Supports CSV (native) and Excel via lazy-loaded xlsx library.
 */
import { isValueDefined } from '@dloizides/utils';

import { MAX_IMPORT_ROWS } from './menuImportConstants';

/** Result of parsing a menu import file. */
export interface ParsedFileResult {
  headers: string[];
  rows: string[][];
  error?: string;
}

/**
 * Parse a CSV or XLSX file into headers + rows.
 * Excel support is lazy-loaded to avoid bloating the bundle.
 */
export async function parseMenuFile(file: File): Promise<ParsedFileResult> {
  const name = file.name.toLowerCase();
  if (name.endsWith('.csv')) return parseCsvFile(file);
  if (name.endsWith('.xlsx')) return parseExcelFile(file);
  return { headers: [], rows: [], error: 'unsupportedFormat' };
}

// =============================================================================
// CSV Parsing
// =============================================================================

async function parseCsvFile(file: File): Promise<ParsedFileResult> {
  try { return parseCsvText(await file.text()); }
  catch { return { headers: [], rows: [], error: 'fileReadFailed' }; }
}

/** Parse raw CSV text into headers and rows. Exported for testing. */
export function parseCsvText(text: string): ParsedFileResult {
  const cleaned = stripBom(text);
  if (cleaned.trim() === '') return { headers: [], rows: [], error: 'emptyFile' };

  const allRows = parseCsvRows(cleaned);
  if (allRows.length === 0) return { headers: [], rows: [], error: 'emptyFile' };

  const headers = allRows[0];
  const dataRows = allRows.slice(1).filter((row) => !isEmptyRow(row));

  if (dataRows.length === 0) return { headers, rows: [], error: 'emptyFile' };
  if (dataRows.length > MAX_IMPORT_ROWS) return { headers, rows: [], error: 'tooManyRows' };
  return { headers, rows: dataRows };
}

function stripBom(text: string): string {
  const BOM = '\uFEFF';
  return text.startsWith(BOM) ? text.slice(1) : text;
}

function isEmptyRow(row: string[]): boolean {
  return row.every((cell) => cell.trim() === '');
}

// =============================================================================
// CSV Row Parser (all mutation via class methods to satisfy no-param-reassign)
// =============================================================================

class CsvParser {
  readonly rows: string[][] = [];
  private currentRow: string[] = [];
  private currentField = '';
  private inQuotes = false;

  process(ch: string, nextCh: string, i: number): number {
    return this.inQuotes ? this.quoted(ch, nextCh, i) : this.unquoted(ch, nextCh, i);
  }

  finalize(): void {
    if (this.currentField !== '' || this.currentRow.length > 0) this.endRow();
  }

  private quoted(ch: string, nextCh: string, i: number): number {
    if (ch === '"' && nextCh === '"') { this.currentField += '"'; return i + 1; }
    if (ch === '"') { this.inQuotes = false; return i; }
    this.currentField += ch;
    return i;
  }

  private unquoted(ch: string, nextCh: string, i: number): number {
    if (ch === '"') { this.inQuotes = true; return i; }
    if (ch === ',') { this.endField(); return i; }
    if (ch === '\r' && nextCh === '\n') { this.endRow(); return i + 1; }
    if (ch === '\n' || ch === '\r') { this.endRow(); return i; }
    this.currentField += ch;
    return i;
  }

  private endField(): void {
    this.currentRow.push(this.currentField.trim());
    this.currentField = '';
  }

  private endRow(): void {
    this.endField();
    this.rows.push(this.currentRow);
    this.currentRow = [];
  }
}

function parseCsvRows(text: string): string[][] {
  const parser = new CsvParser();
  const len = text.length;

  for (let i = 0; i < len; i++)
    i = parser.process(text[i], i + 1 < len ? text[i + 1] : '', i);

  parser.finalize();
  return parser.rows;
}

// =============================================================================
// Excel Parsing (lazy-loaded via read-excel-file)
// =============================================================================

async function parseExcelFile(file: File): Promise<ParsedFileResult> {
  try { return await readExcelWorkbook(file); }
  catch { return { headers: [], rows: [], error: 'fileReadFailed' }; }
}

type CellValue = string | number | boolean | Date | null;

async function readExcelWorkbook(file: File): Promise<ParsedFileResult> {
  const readXlsxFile: (f: File) => Promise<CellValue[][]> = (await import('read-excel-file/browser')).default;
  const rawData: CellValue[][] = await readXlsxFile(file);

  if (rawData.length === 0) return { headers: [], rows: [], error: 'emptyFile' };

  const headers: string[] = rawData[0].map(String);
  const dataRows: string[][] = rawData
    .slice(1)
    .map((row: CellValue[]) => row.map((cell: CellValue) => (!isValueDefined(cell) ? '' : String(cell))))
    .filter((row: string[]) => !isEmptyRow(row));

  if (dataRows.length === 0) return { headers, rows: [], error: 'emptyFile' };
  if (dataRows.length > MAX_IMPORT_ROWS) return { headers, rows: [], error: 'tooManyRows' };
  return { headers, rows: dataRows };
}
