/**
 * Tests for CSV/Excel file parsing utilities.
 */
import { parseCsvText } from './parseMenuFile';

describe('parseCsvText', () => {
  it('parses a simple CSV with headers and data rows', () => {
    const csv = 'Category,Item,Price\nAppetizers,Salad,9.99\nMains,Steak,24.99';
    const result = parseCsvText(csv);

    expect(result.error).toBeUndefined();
    expect(result.headers).toEqual(['Category', 'Item', 'Price']);
    expect(result.rows).toHaveLength(2);
    expect(result.rows[0]).toEqual(['Appetizers', 'Salad', '9.99']);
    expect(result.rows[1]).toEqual(['Mains', 'Steak', '24.99']);
  });

  it('handles UTF-8 BOM prefix', () => {
    const csv = '\uFEFFCategory,Item,Price\nDesserts,Cake,5.99';
    const result = parseCsvText(csv);

    expect(result.error).toBeUndefined();
    expect(result.headers).toEqual(['Category', 'Item', 'Price']);
    expect(result.rows).toHaveLength(1);
  });

  it('handles Windows-style line endings (CRLF)', () => {
    const csv = 'Category,Item,Price\r\nAppetizers,Salad,9.99\r\nMains,Pasta,12.99';
    const result = parseCsvText(csv);

    expect(result.error).toBeUndefined();
    expect(result.rows).toHaveLength(2);
  });

  it('handles quoted fields with commas inside', () => {
    const csv = 'Category,Item,Description,Price\nMains,"Surf & Turf","Lobster, steak, and sides",39.99';
    const result = parseCsvText(csv);

    expect(result.error).toBeUndefined();
    expect(result.rows[0]).toEqual(['Mains', 'Surf & Turf', 'Lobster, steak, and sides', '39.99']);
  });

  it('handles escaped quotes inside quoted fields', () => {
    const csv = 'Category,Item,Price\nMains,"Chef""s Special",19.99';
    const result = parseCsvText(csv);

    expect(result.error).toBeUndefined();
    expect(result.rows[0][1]).toBe('Chef"s Special');
  });

  it('skips completely empty rows', () => {
    const csv = 'Category,Item,Price\nAppetizers,Salad,9.99\n\n\nMains,Steak,24.99';
    const result = parseCsvText(csv);

    expect(result.error).toBeUndefined();
    expect(result.rows).toHaveLength(2);
  });

  it('returns error for empty input', () => {
    const result = parseCsvText('');
    expect(result.error).toBe('emptyFile');
  });

  it('returns error for header-only CSV', () => {
    const result = parseCsvText('Category,Item,Price');
    expect(result.error).toBe('emptyFile');
  });

  it('returns error when whitespace-only data rows exist', () => {
    const result = parseCsvText('Category,Item,Price\n  ,  ,  ');
    expect(result.error).toBe('emptyFile');
  });

  it('trims whitespace from cell values', () => {
    const csv = 'Category , Item , Price \n Appetizers , Salad , 9.99 ';
    const result = parseCsvText(csv);

    expect(result.headers).toEqual(['Category', 'Item', 'Price']);
    expect(result.rows[0]).toEqual(['Appetizers', 'Salad', '9.99']);
  });

  it('handles single-column CSV', () => {
    const csv = 'Items\nBurger\nFries\nShake';
    const result = parseCsvText(csv);

    expect(result.error).toBeUndefined();
    expect(result.headers).toEqual(['Items']);
    expect(result.rows).toHaveLength(3);
  });
});
