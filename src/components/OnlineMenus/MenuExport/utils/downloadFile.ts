/**
 * Browser file download utility.
 * Creates a Blob and triggers a download via a temporary anchor element.
 */
import ExportFormat from '../../../../shared/enums/ExportFormat';

const MIME_TYPES: Record<ExportFormat, string> = {
  [ExportFormat.Csv]: 'text/csv;charset=utf-8',
  [ExportFormat.Json]: 'application/json;charset=utf-8',
};

const FILE_EXTENSIONS: Record<ExportFormat, string> = {
  [ExportFormat.Csv]: 'csv',
  [ExportFormat.Json]: 'json',
};

/**
 * Build the export filename: `{menuName}-export-{YYYY-MM-DD}.{ext}`
 * Sanitizes the menu name by replacing non-alphanumeric chars with hyphens.
 */
export function buildExportFilename(menuName: string, format: ExportFormat): string {
  const sanitized = menuName.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  const name = sanitized !== '' ? sanitized : 'menu';
  const date = new Date().toISOString().split('T')[0];
  return `${name}-export-${date}.${FILE_EXTENSIONS[format]}`;
}

/**
 * Trigger a browser file download with the given content.
 * Uses the Blob API and a temporary anchor element.
 */
export function downloadFile(content: string, filename: string, format: ExportFormat): void {
  const blob = new Blob([content], { type: MIME_TYPES[format] });
  const url = URL.createObjectURL(blob);

  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.style.display = 'none';
  document.body.appendChild(anchor);
  anchor.click();

  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}
