/**
 * Export utilities for TableNative.
 * Provides CSV generation and table printing.
 */
import { isValueDefined } from '../../../../utils/is';

import type { TableColumn } from '../types';

// =============================================================================
// Constants
// =============================================================================

const CSV_MIME_TYPE = 'text/csv;charset=utf-8;';
const CSV_FILE_EXTENSION = '.csv';
const NEWLINE = '\n';
const COMMA = ',';

// =============================================================================
// CSV Export
// =============================================================================

export function exportToCsv(
  data: Array<Record<string, unknown>>,
  columns: TableColumn[],
  fileName: string,
): void {
  const csvContent = buildCsvContent(data, columns);
  downloadCsvFile(csvContent, ensureCsvExtension(fileName));
}

export function buildCsvContent(
  data: Array<Record<string, unknown>>,
  columns: TableColumn[],
): string {
  const visibleColumns = columns.filter((col) => col.visible !== false);
  const headerRow = visibleColumns.map((col) => escapeCsvValue(col.headerText)).join(COMMA);

  const dataRows = data.map((row) =>
    visibleColumns
      .map((col) => {
        const rawValue = row[col.field];
        const stringValue = isValueDefined(rawValue) ? String(rawValue) : '';
        return escapeCsvValue(stringValue);
      })
      .join(COMMA),
  );

  return [headerRow, ...dataRows].join(NEWLINE);
}

export function escapeCsvValue(value: string): string {
  const needsQuoting = value.includes(COMMA) || value.includes('"') || value.includes(NEWLINE);
  if (needsQuoting)
    return `"${value.replace(/"/g, '""')}"`;

  return value;
}

function downloadCsvFile(content: string, fileName: string): void {
  const blob = new Blob([content], { type: CSV_MIME_TYPE });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  link.style.display = 'none';

  document.body.appendChild(link);
  link.click();

  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function ensureCsvExtension(fileName: string): string {
  if (fileName.endsWith(CSV_FILE_EXTENSION)) return fileName;
  return `${fileName}${CSV_FILE_EXTENSION}`;
}

// =============================================================================
// Print
// =============================================================================

export function printTable(tableRef: React.RefObject<HTMLTableElement | null>): void {
  if (!isValueDefined(tableRef.current)) return;

  const printWindow = window.open('', '_blank');
  if (!isValueDefined(printWindow)) return;

  const tableHtml = tableRef.current.outerHTML;

  printWindow.document.write(buildPrintDocument(tableHtml));
  printWindow.document.close();
  printWindow.focus();
  printWindow.print();
  printWindow.close();
}

function buildPrintDocument(tableHtml: string): string {
  return [
    '<html><head><title>Print</title>',
    '<style>',
    'table { border-collapse: collapse; width: 100%; }',
    'th, td { border: 1px solid #ccc; padding: 8px; text-align: left; }',
    'th { background: #f5f5f5; font-weight: bold; }',
    '</style>',
    '</head><body>',
    tableHtml,
    '</body></html>',
  ].join('');
}
