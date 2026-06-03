/**
 * Menu Configuration Export Utility
 *
 * Provides functionality to export menu configurations as JSON files
 * for backup and sharing purposes.
 *
 * @see BaseClient/docs/Tasks/IN_PROGRESS/menu-config-import-export.md
 */

import type { MenuContents } from '../types/menuTypes';

// =============================================================================
// Constants
// =============================================================================

/**
 * Current export format version for backwards compatibility.
 */
const EXPORT_FORMAT_VERSION = 1;

/**
 * Application version for tracking exports.
 */
const APP_VERSION = '1.0.0';

/**
 * Default filename for exported configurations.
 */
const DEFAULT_EXPORT_FILENAME = 'menu-config';

/**
 * File extension for exported configurations.
 */
const EXPORT_FILE_EXTENSION = '.json';

/**
 * MIME type for JSON downloads.
 */
const JSON_MIME_TYPE = 'application/json';

/**
 * Timestamp slice end index for YYYY-MM-DD format.
 */
const DATE_SLICE_END = 10;

// =============================================================================
// Types
// =============================================================================

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

// =============================================================================
// Export Functions
// =============================================================================

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

/**
 * Exports menu contents to a JSON string with metadata.
 *
 * The exported JSON includes:
 * - metadata: version info and export timestamp
 * - contents: the actual MenuContents object
 *
 * @param contents - The menu contents to export
 * @returns JSON string representation of the exported configuration
 */
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

/**
 * Triggers a browser download of the menu configuration as a JSON file.
 *
 * Creates a temporary anchor element, triggers the download, and cleans up.
 * This function is designed for web browser environments.
 *
 * @param contents - The menu contents to download
 * @param filename - Optional custom filename (extension will be added if missing)
 */
export function downloadMenuConfig(contents: MenuContents, filename?: string): void {
  const jsonString = exportMenuConfig(contents);
  const exportFilename = generateExportFilename(filename);

  // Create blob from JSON string
  const blob = new Blob([jsonString], { type: JSON_MIME_TYPE });

  // Create download URL
  const url = URL.createObjectURL(blob);

  // Create temporary anchor element for download
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = exportFilename;

  // Trigger download
  document.body.appendChild(anchor);
  anchor.click();

  // Cleanup
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}

/**
 * Converts menu contents to a Blob for download.
 * Useful for platforms that need manual blob handling.
 *
 * @param contents - The menu contents to convert
 * @returns Blob containing the JSON configuration
 */
export function createMenuConfigBlob(contents: MenuContents): Blob {
  const jsonString = exportMenuConfig(contents);
  return new Blob([jsonString], { type: JSON_MIME_TYPE });
}

export { EXPORT_FORMAT_VERSION, APP_VERSION };
