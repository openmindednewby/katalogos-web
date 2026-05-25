/**
 * Tests for column detection utilities.
 */
import { detectColumnMappings, getValueByField } from './columnDetection';
import MenuField from '../../../../shared/enums/MenuField';


describe('detectColumnMappings', () => {
  it('detects standard column names', () => {
    const headers = ['Category', 'Item Name', 'Description', 'Price'];
    const mappings = detectColumnMappings(headers);

    expect(mappings[0].field).toBe(MenuField.Category);
    expect(mappings[1].field).toBe(MenuField.ItemName);
    expect(mappings[2].field).toBe(MenuField.Description);
    expect(mappings[3].field).toBe(MenuField.Price);
  });

  it('detects alternative column names (case-insensitive)', () => {
    const headers = ['CATEGORY', 'dish', 'desc', 'cost'];
    const mappings = detectColumnMappings(headers);

    expect(mappings[0].field).toBe(MenuField.Category);
    expect(mappings[1].field).toBe(MenuField.ItemName);
    expect(mappings[2].field).toBe(MenuField.Description);
    expect(mappings[3].field).toBe(MenuField.Price);
  });

  it('detects group/section aliases for category', () => {
    const headers = ['Section', 'Food Name', 'Notes', 'Amount'];
    const mappings = detectColumnMappings(headers);

    expect(mappings[0].field).toBe(MenuField.Category);
    expect(mappings[1].field).toBe(MenuField.ItemName);
    expect(mappings[2].field).toBe(MenuField.Description);
    expect(mappings[3].field).toBe(MenuField.Price);
  });

  it('leaves unrecognized columns as Unmapped', () => {
    const headers = ['Category', 'Item Name', 'Allergens', 'Price'];
    const mappings = detectColumnMappings(headers);

    expect(mappings[2].field).toBe(MenuField.Unmapped);
  });

  it('does not assign the same field twice', () => {
    const headers = ['Category', 'Name', 'Item Name', 'Price'];
    const mappings = detectColumnMappings(headers);

    const itemNameMappings = mappings.filter((m) => m.field === MenuField.ItemName);
    expect(itemNameMappings).toHaveLength(1);
    expect(itemNameMappings[0].columnIndex).toBe(1);
  });

  it('handles empty headers', () => {
    const headers = ['', 'Name', '', 'Price'];
    const mappings = detectColumnMappings(headers);

    expect(mappings[0].field).toBe(MenuField.Unmapped);
    expect(mappings[1].field).toBe(MenuField.ItemName);
    expect(mappings[2].field).toBe(MenuField.Unmapped);
    expect(mappings[3].field).toBe(MenuField.Price);
  });

  it('preserves column headers in mapping results', () => {
    const headers = ['My Category', 'Dish Name'];
    const mappings = detectColumnMappings(headers);

    expect(mappings[0].columnHeader).toBe('My Category');
    expect(mappings[1].columnHeader).toBe('Dish Name');
  });
});

describe('getValueByField', () => {
  it('extracts value from a row by field', () => {
    const row = ['Appetizers', 'Salad', 'Fresh greens', '9.99'];
    const mappings = detectColumnMappings(['Category', 'Item Name', 'Description', 'Price']);

    expect(getValueByField(row, mappings, MenuField.Category)).toBe('Appetizers');
    expect(getValueByField(row, mappings, MenuField.ItemName)).toBe('Salad');
    expect(getValueByField(row, mappings, MenuField.Description)).toBe('Fresh greens');
    expect(getValueByField(row, mappings, MenuField.Price)).toBe('9.99');
  });

  it('returns undefined for unmapped fields', () => {
    const row = ['Salad', '9.99'];
    const mappings = detectColumnMappings(['Item', 'Price']);

    expect(getValueByField(row, mappings, MenuField.Description)).toBeUndefined();
  });

  it('trims whitespace from values', () => {
    const row = ['  Appetizers  ', '  Salad  '];
    const mappings = detectColumnMappings(['Category', 'Name']);

    expect(getValueByField(row, mappings, MenuField.Category)).toBe('Appetizers');
    expect(getValueByField(row, mappings, MenuField.ItemName)).toBe('Salad');
  });
});
