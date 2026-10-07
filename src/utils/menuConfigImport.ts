
import { isValueDefined } from '@dloizides/utils';

import { normalizeMenuContents } from './menuDefaults';

import type { ExportedMenuConfig, ExportMetadata } from './menuConfigExport';
import type { MenuContents, Category, MenuItem } from '../types/menuTypes';


/** Current supported export format version. */
const CURRENT_FORMAT_VERSION = 1;

const BYTES_PER_KB = 1024;

const ONE_MB = BYTES_PER_KB * BYTES_PER_KB;

const MAX_FILE_SIZE_MB = 5;

/**
 * Maximum file size allowed for import (5MB).
 */
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * ONE_MB;


interface ImportResult {
  success: boolean;
  contents: MenuContents | null;
  error: string | null;
  metadata: ExportMetadata | null;
}

interface ValidationError {
  field: string;
  message: string;
}


function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && isValueDefined(value) && !Array.isArray(value);
}

function isValidMenuItem(value: unknown): value is MenuItem {
  if (!isPlainObject(value)) return false;

  if (!isValueDefined(value.name) || typeof value.name !== 'string') return false;

  if (isValueDefined(value.displayOrder) && typeof value.displayOrder !== 'number') return false;

  if (isValueDefined(value.price) && typeof value.price !== 'number') return false;

  if (isValueDefined(value.isAvailable) && typeof value.isAvailable !== 'boolean') return false;

  return true;
}

function isValidCategory(value: unknown): value is Category {
  if (!isPlainObject(value)) return false;

  if (!isValueDefined(value.name) || typeof value.name !== 'string') return false;

  if (isValueDefined(value.displayOrder) && typeof value.displayOrder !== 'number') return false;

  if (isValueDefined(value.items)) {
    if (!Array.isArray(value.items)) return false;
    const allItemsValid = value.items.every(isValidMenuItem);
    if (!allItemsValid) return false;
  }

  return true;
}

function isOptionalString(value: unknown): boolean {
  return !isValueDefined(value) || typeof value === 'string';
}

function isOptionalNumber(value: unknown): boolean {
  return !isValueDefined(value) || typeof value === 'number';
}

function isOptionalPlainObject(value: unknown): boolean {
  return !isValueDefined(value) || isPlainObject(value);
}

function validateLegacyFields(config: Record<string, unknown>): boolean {
  if (!isOptionalString(config.titleFont)) return false;
  if (!isOptionalNumber(config.titleFontSize)) return false;
  if (!isOptionalString(config.backgroundColor)) return false;
  if (!isOptionalString(config.textColor)) return false;
  return true;
}

function validateCategoriesField(config: Record<string, unknown>): boolean {
  if (!isValueDefined(config.categories)) return true;
  if (!Array.isArray(config.categories)) return false;
  return config.categories.every(isValidCategory);
}

function validateObjectSubFields(config: Record<string, unknown>): boolean {
  const objectFields = ['typography', 'colorScheme', 'layout', 'header', 'spacing'];
  return objectFields.every((field) => isOptionalPlainObject(config[field]));
}

/** Type guard to validate a MenuContents object structure. */
export function validateMenuConfig(config: unknown): config is MenuContents {
  if (!isPlainObject(config)) return false;
  if (!isOptionalNumber(config.schemaVersion)) return false;
  if (!validateLegacyFields(config)) return false;
  if (!validateCategoriesField(config)) return false;
  if (!validateObjectSubFields(config)) return false;
  return true;
}

function isValidMetadata(value: unknown): value is ExportMetadata {
  if (!isPlainObject(value)) return false;

  if (typeof value.exportFormatVersion !== 'number') return false;
  if (typeof value.exportDate !== 'string') return false;
  if (typeof value.appVersion !== 'string') return false;

  return true;
}

function isValidExportedConfig(value: unknown): value is ExportedMenuConfig {
  if (!isPlainObject(value)) return false;

  if (!isValueDefined(value.metadata)) return false;
  if (!isValidMetadata(value.metadata)) return false;

  if (!isValueDefined(value.contents)) return false;
  if (!validateMenuConfig(value.contents)) return false;

  return true;
}


function createErrorResult(error: string): ImportResult {
  return { success: false, contents: null, error, metadata: null };
}

function createSuccessResult(contents: MenuContents, metadata: ExportMetadata | null): ImportResult {
  return { success: true, contents, error: null, metadata };
}

function safeParseJson(jsonString: string): unknown {
  try {
    return JSON.parse(jsonString);
  } catch {
    return undefined;
  }
}

function handleExportedConfig(parsed: ExportedMenuConfig): ImportResult {
  const migrated = migrateMenuConfig(parsed.contents, parsed.metadata.exportFormatVersion);
  const normalized = normalizeMenuContents(migrated);
  return createSuccessResult(normalized, parsed.metadata);
}

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

/** Migrates menu configuration from older format versions to current. */
export function migrateMenuConfig(contents: MenuContents, fromVersion: number): MenuContents {
  let migrated = { ...contents };

  // eslint-disable-next-line no-empty
  if (fromVersion < CURRENT_FORMAT_VERSION) {
  }

  if (!isValueDefined(migrated.schemaVersion)) migrated = { ...migrated, schemaVersion: 2 };

  return migrated;
}

function validateFileSize(file: File): ImportResult | null {
  if (file.size > MAX_FILE_SIZE_BYTES) return createErrorResult('File too large. Maximum size is 5MB.');
  return null;
}

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

/** Collects validation errors from a menu configuration. */
export function getValidationErrors(config: unknown): ValidationError[] {
  const errors: ValidationError[] = [];

  if (!isPlainObject(config)) {
    errors.push({ field: 'root', message: 'Configuration must be an object' });
    return errors;
  }

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
