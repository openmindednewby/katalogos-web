/**
 * Menu Configuration Import Utility
 *
 * Provides functionality to import and validate menu configurations
 * from JSON files.
 *
 * @see BaseClient/docs/Tasks/IN_PROGRESS/menu-config-import-export.md
 */

import { isValueDefined } from '@dloizides/utils';

import { normalizeMenuContents } from './menuDefaults';

import type { ExportedMenuConfig, ExportMetadata } from './menuConfigExport';
import type { MenuContents, Category, MenuItem } from '../types/menuTypes';

// =============================================================================
// Constants
// =============================================================================

/**
 * Current supported export format version.
 * Used to determine if migration is needed.
 */
const CURRENT_FORMAT_VERSION = 1;

/**
 * Bytes per kilobyte.
 */
const BYTES_PER_KB = 1024;

/**
 * One megabyte in bytes.
 */
const ONE_MB = BYTES_PER_KB * BYTES_PER_KB;

/**
 * Maximum file size allowed for import in megabytes.
 */
const MAX_FILE_SIZE_MB = 5;

/**
 * Maximum file size allowed for import (5MB).
 */
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * ONE_MB;

// =============================================================================
// Types
// =============================================================================

/**
 * Result of a menu configuration import attempt.
 */
interface ImportResult {
  /** Whether the import was successful */
  success: boolean;
  /** The imported and validated menu contents (if successful) */
  contents: MenuContents | null;
  /** Error message if import failed */
  error: string | null;
  /** Metadata from the exported file (if available) */
  metadata: ExportMetadata | null;
}

/**
 * Validation error details.
 */
interface ValidationError {
  field: string;
  message: string;
}

// =============================================================================
// Type Guards
// =============================================================================

/**
 * Checks if a value is a plain object (not null, not array).
 */
function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && isValueDefined(value) && !Array.isArray(value);
}

/**
 * Validates that a value is a valid MenuItem structure.
 */
function isValidMenuItem(value: unknown): value is MenuItem {
  if (!isPlainObject(value)) return false;

  // Name is required and must be a string
  if (!isValueDefined(value.name) || typeof value.name !== 'string') return false;

  // displayOrder must be a number if present
  if (isValueDefined(value.displayOrder) && typeof value.displayOrder !== 'number') return false;

  // price must be a number if present
  if (isValueDefined(value.price) && typeof value.price !== 'number') return false;

  // isAvailable must be a boolean if present
  if (isValueDefined(value.isAvailable) && typeof value.isAvailable !== 'boolean') return false;

  return true;
}

/**
 * Validates that a value is a valid Category structure.
 */
function isValidCategory(value: unknown): value is Category {
  if (!isPlainObject(value)) return false;

  // Name is required and must be a string
  if (!isValueDefined(value.name) || typeof value.name !== 'string') return false;

  // displayOrder must be a number if present
  if (isValueDefined(value.displayOrder) && typeof value.displayOrder !== 'number') return false;

  // items must be an array of valid MenuItems if present
  if (isValueDefined(value.items)) {
    if (!Array.isArray(value.items)) return false;
    const allItemsValid = value.items.every(isValidMenuItem);
    if (!allItemsValid) return false;
  }

  return true;
}

/**
 * Validates that an optional field is a string if present.
 */
function isOptionalString(value: unknown): boolean {
  return !isValueDefined(value) || typeof value === 'string';
}

/**
 * Validates that an optional field is a number if present.
 */
function isOptionalNumber(value: unknown): boolean {
  return !isValueDefined(value) || typeof value === 'number';
}

/**
 * Validates that an optional field is a plain object if present.
 */
function isOptionalPlainObject(value: unknown): boolean {
  return !isValueDefined(value) || isPlainObject(value);
}

/**
 * Validates legacy fields (titleFont, titleFontSize, backgroundColor, textColor).
 */
function validateLegacyFields(config: Record<string, unknown>): boolean {
  if (!isOptionalString(config.titleFont)) return false;
  if (!isOptionalNumber(config.titleFontSize)) return false;
  if (!isOptionalString(config.backgroundColor)) return false;
  if (!isOptionalString(config.textColor)) return false;
  return true;
}

/**
 * Validates categories array if present.
 */
function validateCategoriesField(config: Record<string, unknown>): boolean {
  if (!isValueDefined(config.categories)) return true;
  if (!Array.isArray(config.categories)) return false;
  return config.categories.every(isValidCategory);
}

/**
 * Validates object-type sub-fields (typography, colorScheme, layout, header, spacing).
 */
function validateObjectSubFields(config: Record<string, unknown>): boolean {
  const objectFields = ['typography', 'colorScheme', 'layout', 'header', 'spacing'];
  return objectFields.every((field) => isOptionalPlainObject(config[field]));
}

/**
 * Type guard to validate a MenuContents object structure.
 * Performs structural validation to ensure the object matches expected shape.
 *
 * @param config - Unknown value to validate
 * @returns True if the value is a valid MenuContents object
 */
export function validateMenuConfig(config: unknown): config is MenuContents {
  if (!isPlainObject(config)) return false;
  if (!isOptionalNumber(config.schemaVersion)) return false;
  if (!validateLegacyFields(config)) return false;
  if (!validateCategoriesField(config)) return false;
  if (!validateObjectSubFields(config)) return false;
  return true;
}

/**
 * Validates the export metadata structure.
 */
function isValidMetadata(value: unknown): value is ExportMetadata {
  if (!isPlainObject(value)) return false;

  if (typeof value.exportFormatVersion !== 'number') return false;
  if (typeof value.exportDate !== 'string') return false;
  if (typeof value.appVersion !== 'string') return false;

  return true;
}

/**
 * Validates the complete exported configuration structure.
 */
function isValidExportedConfig(value: unknown): value is ExportedMenuConfig {
  if (!isPlainObject(value)) return false;

  // Must have metadata
  if (!isValueDefined(value.metadata)) return false;
  if (!isValidMetadata(value.metadata)) return false;

  // Must have contents
  if (!isValueDefined(value.contents)) return false;
  if (!validateMenuConfig(value.contents)) return false;

  return true;
}

// =============================================================================
// Import Functions
// =============================================================================

/**
 * Creates an error result for import operations.
 */
function createErrorResult(error: string): ImportResult {
  return { success: false, contents: null, error, metadata: null };
}

/**
 * Creates a success result for import operations.
 */
function createSuccessResult(contents: MenuContents, metadata: ExportMetadata | null): ImportResult {
  return { success: true, contents, error: null, metadata };
}

/**
 * Safely parses JSON string.
 */
function safeParseJson(jsonString: string): unknown {
  try {
    return JSON.parse(jsonString);
  } catch {
    return undefined;
  }
}

/**
 * Handles full export format with metadata.
 */
function handleExportedConfig(parsed: ExportedMenuConfig): ImportResult {
  const migrated = migrateMenuConfig(parsed.contents, parsed.metadata.exportFormatVersion);
  const normalized = normalizeMenuContents(migrated);
  return createSuccessResult(normalized, parsed.metadata);
}

/**
 * Handles raw MenuContents format.
 */
function handleRawMenuContents(parsed: MenuContents): ImportResult {
  const normalized = normalizeMenuContents(parsed);
  return createSuccessResult(normalized, null);
}

/**
 * Parses a JSON string and validates it as a menu configuration.
 */
export function parseMenuConfig(jsonString: string): ImportResult {
  const trimmedInput = jsonString.trim();
  if (trimmedInput === '') return createErrorResult('Empty configuration file');

  const parsed = safeParseJson(jsonString);
  if (!isValueDefined(parsed)) return createErrorResult('Invalid JSON format');

  if (isValidExportedConfig(parsed)) return handleExportedConfig(parsed);
  if (validateMenuConfig(parsed)) return handleRawMenuContents(parsed);

  return createErrorResult('Invalid menu configuration structure');
}

/**
 * Migrates menu configuration from older format versions to current.
 *
 * @param contents - The menu contents to migrate
 * @param fromVersion - The source format version
 * @returns Migrated menu contents
 */
export function migrateMenuConfig(contents: MenuContents, fromVersion: number): MenuContents {
  let migrated = { ...contents };

  // Currently at version 1, no migrations needed
  // Future migrations would be handled here
  if (fromVersion < CURRENT_FORMAT_VERSION) {
    // Example: if (fromVersion < 2) { migrate v1 to v2 }
  }

  // Ensure schemaVersion is set
  if (!isValueDefined(migrated.schemaVersion)) migrated = { ...migrated, schemaVersion: 2 };

  return migrated;
}

/**
 * Validates file size is within limits.
 */
function validateFileSize(file: File): ImportResult | null {
  if (file.size > MAX_FILE_SIZE_BYTES) return createErrorResult('File too large. Maximum size is 5MB.');
  return null;
}

/**
 * Validates file type is JSON.
 */
function validateFileType(file: File): ImportResult | null {
  const isValidType = file.type === 'application/json' || file.name.endsWith('.json');
  if (!isValidType) return createErrorResult('Invalid file type. Please select a JSON file.');
  return null;
}

/**
 * Reads a File object and parses it as a menu configuration.
 */
export async function importMenuConfigFromFile(file: File): Promise<ImportResult> {
  const sizeError = validateFileSize(file);
  if (sizeError) return sizeError;

  const typeError = validateFileType(file);
  if (typeError) return typeError;

  return new Promise((resolve) => {
    const reader = new FileReader();

    reader.onload = (event) => {
      const content = event.target?.result;
      if (typeof content !== 'string') resolve(createErrorResult('Failed to read file content'));
      else resolve(parseMenuConfig(content));
    };

    reader.onerror = () => resolve(createErrorResult('Failed to read file'));
    reader.readAsText(file);
  });
}

/**
 * Collects validation errors from a menu configuration.
 * Useful for providing detailed feedback to users.
 *
 * @param config - The configuration to validate
 * @returns Array of validation errors (empty if valid)
 */
export function getValidationErrors(config: unknown): ValidationError[] {
  const errors: ValidationError[] = [];

  if (!isPlainObject(config)) {
    errors.push({ field: 'root', message: 'Configuration must be an object' });
    return errors;
  }

  // Check categories
  if (isValueDefined(config.categories)) 
    if (!Array.isArray(config.categories))
      errors.push({ field: 'categories', message: 'Categories must be an array' });
    else 
      config.categories.forEach((cat, index) => {
        if (!isPlainObject(cat))
          errors.push({ field: `categories[${index}]`, message: 'Category must be an object' });
        else if (!isValueDefined(cat.name) || typeof cat.name !== 'string')
          errors.push({
            field: `categories[${index}].name`,
            message: 'Category name is required',
          });
      });
    
  

  return errors;
}

export { CURRENT_FORMAT_VERSION, MAX_FILE_SIZE_BYTES };
