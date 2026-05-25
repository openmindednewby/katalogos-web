/**
 * Tests for menu import validation utilities.
 */
import { detectColumnMappings } from './columnDetection';
import { parsePrice, validateColumnMappings, validateRows } from './validateMenuRows';
import MenuField from '../../../../shared/enums/MenuField';
import ValidationSeverity from '../../../../shared/enums/ValidationSeverity';


describe('parsePrice', () => {
  it('parses standard decimal prices', () => {
    expect(parsePrice('12.99')).toBe(12.99);
    expect(parsePrice('0.50')).toBe(0.5);
    expect(parsePrice('100')).toBe(100);
  });

  it('parses prices with dollar sign', () => {
    expect(parsePrice('$12.99')).toBe(12.99);
    expect(parsePrice('$ 9.99')).toBe(9.99);
  });

  it('parses prices with euro sign', () => {
    expect(parsePrice('\u20AC12.99')).toBe(12.99);
  });

  it('parses European format (comma as decimal)', () => {
    expect(parsePrice('12,99')).toBe(12.99);
    expect(parsePrice('1.234,56')).toBe(1234.56);
  });

  it('parses prices with thousand separators', () => {
    expect(parsePrice('1,234.56')).toBe(1234.56);
  });

  it('returns null for empty string', () => {
    expect(parsePrice('')).toBeNull();
    expect(parsePrice('   ')).toBeNull();
  });

  it('returns null for non-numeric text', () => {
    expect(parsePrice('free')).toBeNull();
    expect(parsePrice('N/A')).toBeNull();
  });

  it('handles zero price', () => {
    expect(parsePrice('0')).toBe(0);
    expect(parsePrice('0.00')).toBe(0);
  });

  it('handles negative prices', () => {
    expect(parsePrice('-5.00')).toBe(-5);
  });
});

describe('validateRows', () => {
  const headers = ['Category', 'Item Name', 'Description', 'Price'];
  const mappings = detectColumnMappings(headers);

  it('validates correct rows as valid', () => {
    const rows = [
      ['Appetizers', 'Salad', 'Fresh greens', '9.99'],
      ['Mains', 'Steak', 'Prime cut', '24.99'],
    ];

    const result = validateRows(rows, mappings);

    expect(result.validCount).toBe(2);
    expect(result.errorCount).toBe(0);
    expect(result.warningCount).toBe(0);
    expect(result.rows[0].isValid).toBe(true);
    expect(result.rows[1].isValid).toBe(true);
  });

  it('flags rows with empty category as errors', () => {
    const rows = [['', 'Salad', 'Fresh greens', '9.99']];
    const result = validateRows(rows, mappings);

    expect(result.errorCount).toBe(1);
    expect(result.rows[0].isValid).toBe(false);
    expect(result.rows[0].issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          severity: ValidationSeverity.Error,
          messageKey: 'menuImport.validation.emptyCategoryName',
        }),
      ]),
    );
  });

  it('flags rows with empty item name as errors', () => {
    const rows = [['Appetizers', '', 'Something', '9.99']];
    const result = validateRows(rows, mappings);

    expect(result.rows[0].isValid).toBe(false);
    expect(result.rows[0].issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ messageKey: 'menuImport.validation.emptyItemName' }),
      ]),
    );
  });

  it('flags rows with invalid price as errors', () => {
    const rows = [['Appetizers', 'Salad', 'Fresh', 'abc']];
    const result = validateRows(rows, mappings);

    expect(result.rows[0].isValid).toBe(false);
    expect(result.rows[0].issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ messageKey: 'menuImport.validation.invalidPrice' }),
      ]),
    );
  });

  it('flags rows with negative price as errors', () => {
    const rows = [['Appetizers', 'Salad', 'Fresh', '-5.00']];
    const result = validateRows(rows, mappings);

    expect(result.rows[0].isValid).toBe(false);
    expect(result.rows[0].issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ messageKey: 'menuImport.validation.negativePrice' }),
      ]),
    );
  });

  it('flags duplicate items in the same category as warnings', () => {
    const rows = [
      ['Appetizers', 'Salad', 'Version 1', '9.99'],
      ['Appetizers', 'Salad', 'Version 2', '10.99'],
    ];

    const result = validateRows(rows, mappings);

    expect(result.warningCount).toBe(1);
    expect(result.rows[1].issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          severity: ValidationSeverity.Warning,
          messageKey: 'menuImport.validation.duplicateItem',
        }),
      ]),
    );
    // Warning does not make the row invalid
    expect(result.rows[1].isValid).toBe(true);
  });

  it('allows same item name in different categories', () => {
    const rows = [
      ['Lunch', 'Salad', '', '9.99'],
      ['Dinner', 'Salad', '', '12.99'],
    ];

    const result = validateRows(rows, mappings);
    expect(result.warningCount).toBe(0);
  });

  it('sets default price of 0 when price field is empty', () => {
    const rows = [['Appetizers', 'Bread', '', '']];
    const result = validateRows(rows, mappings);

    expect(result.rows[0].price).toBe(0);
  });

  it('parses various price formats correctly', () => {
    const rows = [['Appetizers', 'Item', '', '$12.99']];
    const result = validateRows(rows, mappings);

    expect(result.rows[0].price).toBe(12.99);
    expect(result.rows[0].isValid).toBe(true);
  });
});

describe('validateColumnMappings', () => {
  it('returns no errors when all required fields are mapped', () => {
    const mappings = detectColumnMappings(['Category', 'Item Name', 'Price']);
    const errors = validateColumnMappings(mappings);
    expect(errors).toHaveLength(0);
  });

  it('returns error when Category is not mapped', () => {
    const mappings = [
      { columnIndex: 0, columnHeader: 'Name', field: MenuField.ItemName },
      { columnIndex: 1, columnHeader: 'Cost', field: MenuField.Price },
    ];
    const errors = validateColumnMappings(mappings);
    expect(errors).toContain('menuImport.validation.noCategoryColumn');
  });

  it('returns error when Item Name is not mapped', () => {
    const mappings = [
      { columnIndex: 0, columnHeader: 'Category', field: MenuField.Category },
      { columnIndex: 1, columnHeader: 'Cost', field: MenuField.Price },
    ];
    const errors = validateColumnMappings(mappings);
    expect(errors).toContain('menuImport.validation.noItemNameColumn');
  });

  it('returns error when Price is not mapped', () => {
    const mappings = [
      { columnIndex: 0, columnHeader: 'Category', field: MenuField.Category },
      { columnIndex: 1, columnHeader: 'Name', field: MenuField.ItemName },
    ];
    const errors = validateColumnMappings(mappings);
    expect(errors).toContain('menuImport.validation.noPriceColumn');
  });

  it('returns multiple errors when multiple fields are missing', () => {
    const mappings = [
      { columnIndex: 0, columnHeader: 'Notes', field: MenuField.Unmapped },
    ];
    const errors = validateColumnMappings(mappings);
    expect(errors).toHaveLength(3);
  });
});
