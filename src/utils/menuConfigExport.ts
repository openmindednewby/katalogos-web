
import type { MenuContents } from '../types/menuTypes';


/**
 * Current export format version for backwards compatibility.
 */
const EXPORT_FORMAT_VERSION = 1;

/**
 * Application version for tracking exports.
 */
const APP_VERSION = '1.0.0';

const DEFAULT_EXPORT_FILENAME = 'menu-config';

const EXPORT_FILE_EXTENSION = '.json';

const JSON_MIME_TYPE = 'application/json';

const DATE_SLICE_END = 10;


/**
 * Metadata included in exported configuration files.
 */
export interface ExportMetadata {
  /** Version of the export format */
  exportFormatVersion: number;
  /** ISO timestamp of when the export was created */
  exportDate: string;
  /** Application version that created the export */
  appVersion: string;
}

/**
 * Complete exported configuration with metadata wrapper.
 */
export interface ExportedMenuConfig {
  /** Metadata about the export */
  metadata: ExportMetadata;
  /** The actual menu contents */
  contents: MenuContents;
}


/**
 * Creates export metadata with current timestamp and version info.
 *
 * @returns Metadata object for the export
 */
export function createExportMetadata(): ExportMetadata {
  return {
    exportFormatVersion: EXPORT_FORMAT_VERSION,
    exportDate: new Date().toISOString(),
    appVersion: APP_VERSION,
  };
}

/** Exports menu contents to a JSON string with metadata. */
export function exportMenuConfig(contents: MenuContents): string {
  const exportData: ExportedMenuConfig = {
    metadata: createExportMetadata(),
    contents,
  };

  const jsonIndentSpaces = 2;
  return JSON.stringify(exportData, null, jsonIndentSpaces);
}

/**
 * Generates a filename for the exported configuration.
 *
 * @param customName - Optional custom name (without extension)
 * @returns Complete filename with extension and timestamp
 */
export function generateExportFilename(customName?: string): string {
  const baseName = customName ?? DEFAULT_EXPORT_FILENAME;
  const timestamp = new Date().toISOString().slice(0, DATE_SLICE_END);
  return `${baseName}-${timestamp}${EXPORT_FILE_EXTENSION}`;
}

/** Triggers a browser download of the menu configuration as a JSON file. */
export function downloadMenuConfig(contents: MenuContents, filename?: string): void {
  const jsonString = exportMenuConfig(contents);
  const exportFilename = generateExportFilename(filename);

  const blob = new Blob([jsonString], { type: JSON_MIME_TYPE });

  const url = URL.createObjectURL(blob);

  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = exportFilename;

  document.body.appendChild(anchor);
  anchor.click();

  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}

/** Converts menu contents to a Blob for download. */
export function createMenuConfigBlob(contents: MenuContents): Blob {
  const jsonString = exportMenuConfig(contents);
  return new Blob([jsonString], { type: JSON_MIME_TYPE });
}

export { EXPORT_FORMAT_VERSION, APP_VERSION };
