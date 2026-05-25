/**
 * Validation utilities for menu import rows.
 * Validates parsed rows and returns structured results with error/warning messages.
 */
import { isValueDefined } from '@dloizides/utils';

import { getValueByField } from './columnDetection';
import MenuField from '../../../../shared/enums/MenuField';
import ValidationSeverity from '../../../../shared/enums/ValidationSeverity';

import type { ColumnMapping } from './columnDetection';

// =============================================================================
// Constants
// =============================================================================

const DEFAULT_PRICE = 0;
const CURRENCY_STRIP_PATTERN = /[^0-9.,-]/g;

// =============================================================================
// Types
// =============================================================================

export interface ValidationIssue {
  severity: ValidationSeverity;
  messageKey: string;
}

export interface ValidatedRow {
  rowIndex: number;
  category: string;
  itemName: string;
  description: string;
  price: number;
  rawPrice: string;
  issues: ValidationIssue[];
  isValid: boolean;
}

export interface ValidationResult {
  rows: ValidatedRow[];
  validCount: number;
  errorCount: number;
  warningCount: number;
}

// =============================================================================
// Price Parsing
// =============================================================================

/**
 * Parse a price string into a number.
 * Handles formats: "12.99", "$12.99", "12,99", "EUR 12.99", etc.
 */
export function parsePrice(raw: string): number | null {
  if (raw.trim() === '') return null;

  const cleaned = raw.replace(CURRENCY_STRIP_PATTERN, '').trim();
  if (cleaned === '') return null;

  // European format: "1.234,56" -> "1234.56"
  const hasCommaDecimal = /,\d{1,2}$/.test(cleaned) && !cleaned.endsWith(',');
  if (hasCommaDecimal) {
    const withDot = cleaned.replace(/\./g, '').replace(',', '.');
    const parsed = Number(withDot);
    return Number.isFinite(parsed) ? parsed : null;
  }

  const withoutThousands = cleaned.replace(/,/g, '');
  const parsed = Number(withoutThousands);
  return Number.isFinite(parsed) ? parsed : null;
}

// =============================================================================
// Row Validation
// =============================================================================

/**
 * Validate all parsed rows against the column mappings.
 */
export function validateRows(
  rows: string[][],
  mappings: ColumnMapping[],
): ValidationResult {
  const seenItems = new Map<string, Set<string>>();
  const validatedRows = rows.map((row, index) => validateSingleRow(row, index, mappings, seenItems));
  return computeSummary(validatedRows);
}

function computeSummary(validatedRows: ValidatedRow[]): ValidationResult {
  let validCount = 0;
  let errorCount = 0;
  let warningCount = 0;

  for (const row of validatedRows) {
    if (row.isValid) validCount += 1;
    if (row.issues.some((i) => i.severity === ValidationSeverity.Error)) errorCount += 1;
    if (row.issues.some((i) => i.severity === ValidationSeverity.Warning)) warningCount += 1;
  }

  return { rows: validatedRows, validCount, errorCount, warningCount };
}

function validateSingleRow(
  row: string[],
  rowIndex: number,
  mappings: ColumnMapping[],
  seenItems: Map<string, Set<string>>,
): ValidatedRow {
  const rawCategory = getValueByField(row, mappings, MenuField.Category) ?? '';
  const rawItemName = getValueByField(row, mappings, MenuField.ItemName) ?? '';
  const rawDescription = getValueByField(row, mappings, MenuField.Description) ?? '';
  const rawPrice = getValueByField(row, mappings, MenuField.Price) ?? '';

  const issues = collectIssues(rawCategory, rawItemName, rawPrice, seenItems);
  const price = extractPrice(rawPrice);
  const hasErrors = issues.some((i) => i.severity === ValidationSeverity.Error);

  return { rowIndex, category: rawCategory, itemName: rawItemName, description: rawDescription, price, rawPrice, issues, isValid: !hasErrors };
}

function collectIssues(
  category: string,
  itemName: string,
  rawPrice: string,
  seenItems: Map<string, Set<string>>,
): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  if (category === '')
    issues.push({ severity: ValidationSeverity.Error, messageKey: 'menuImport.validation.emptyCategoryName' });

  if (itemName === '')
    issues.push({ severity: ValidationSeverity.Error, messageKey: 'menuImport.validation.emptyItemName' });

  validatePriceIssues(rawPrice, issues);
  checkDuplicate(category, itemName, seenItems, issues);

  return issues;
}

function validatePriceIssues(rawPrice: string, issues: ValidationIssue[]): void {
  if (rawPrice === '') return;
  const parsed = parsePrice(rawPrice);
  if (!isValueDefined(parsed))
    issues.push({ severity: ValidationSeverity.Error, messageKey: 'menuImport.validation.invalidPrice' });
  else if (parsed < 0)
    issues.push({ severity: ValidationSeverity.Error, messageKey: 'menuImport.validation.negativePrice' });
}

function checkDuplicate(
  category: string,
  itemName: string,
  seenItems: Map<string, Set<string>>,
  issues: ValidationIssue[],
): void {
  if (category === '' || itemName === '') return;

  const categoryKey = category.toLowerCase();
  const itemKey = itemName.toLowerCase();

  if (!seenItems.has(categoryKey))
    seenItems.set(categoryKey, new Set());

  const categoryItems = seenItems.get(categoryKey);
  if (isValueDefined(categoryItems) && categoryItems.has(itemKey))
    issues.push({ severity: ValidationSeverity.Warning, messageKey: 'menuImport.validation.duplicateItem' });
  else
    categoryItems?.add(itemKey);
}

function extractPrice(rawPrice: string): number {
  if (rawPrice === '') return DEFAULT_PRICE;
  const parsed = parsePrice(rawPrice);
  if (!isValueDefined(parsed) || parsed < 0) return DEFAULT_PRICE;
  return parsed;
}

/**
 * Validate that required fields have mapped columns.
 */
export function validateColumnMappings(mappings: ColumnMapping[]): string[] {
  const errors: string[] = [];
  const hasCategory = mappings.some((m) => m.field === MenuField.Category);
  const hasItemName = mappings.some((m) => m.field === MenuField.ItemName);
  const hasPrice = mappings.some((m) => m.field === MenuField.Price);

  if (!hasCategory) errors.push('menuImport.validation.noCategoryColumn');
  if (!hasItemName) errors.push('menuImport.validation.noItemNameColumn');
  if (!hasPrice) errors.push('menuImport.validation.noPriceColumn');

  return errors;
}
