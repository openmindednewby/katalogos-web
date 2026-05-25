import { buildCsvContent, escapeCsvValue } from './exportUtils';

import type { TableColumn } from '../types';

// =============================================================================
// Test Data
// =============================================================================

const MOCK_COLUMNS: TableColumn[] = [
  { field: 'id', headerText: 'ID' },
  { field: 'name', headerText: 'Name' },
  { field: 'email', headerText: 'Email' },
];

const MOCK_DATA: Array<Record<string, unknown>> = [
  { id: 1, name: 'Alice', email: 'alice@example.com' },
  { id: 2, name: 'Bob', email: 'bob@example.com' },
  { id: 3, name: 'Charlie', email: 'charlie@example.com' },
];

// =============================================================================
// escapeCsvValue Tests
// =============================================================================

describe('escapeCsvValue', () => {
  it('returns plain value unchanged', () => {
    expect(escapeCsvValue('hello')).toBe('hello');
  });

  it('wraps value containing comma in quotes', () => {
    expect(escapeCsvValue('hello, world')).toBe('"hello, world"');
  });

  it('wraps value containing double quote and escapes quotes', () => {
    expect(escapeCsvValue('say "hi"')).toBe('"say ""hi"""');
  });

  it('wraps value containing newline in quotes', () => {
    expect(escapeCsvValue('line1\nline2')).toBe('"line1\nline2"');
  });

  it('handles empty string', () => {
    expect(escapeCsvValue('')).toBe('');
  });

  it('handles value with all special characters', () => {
    const value = 'test, "quoted", \nnewline';
    const result = escapeCsvValue(value);
    expect(result).toBe('"test, ""quoted"", \nnewline"');
  });
});

// =============================================================================
// buildCsvContent Tests
// =============================================================================

describe('buildCsvContent', () => {
  it('generates correct header row', () => {
    const csv = buildCsvContent([], MOCK_COLUMNS);
    const lines = csv.split('\n');

    expect(lines[0]).toBe('ID,Name,Email');
  });

  it('generates correct data rows', () => {
    const csv = buildCsvContent(MOCK_DATA, MOCK_COLUMNS);
    const lines = csv.split('\n');

    expect(lines).toHaveLength(MOCK_DATA.length + 1); // header + data
    expect(lines[1]).toBe('1,Alice,alice@example.com');
    expect(lines[2]).toBe('2,Bob,bob@example.com');
    expect(lines[3]).toBe('3,Charlie,charlie@example.com');
  });

  it('handles empty data array', () => {
    const csv = buildCsvContent([], MOCK_COLUMNS);
    const lines = csv.split('\n');

    expect(lines).toHaveLength(1); // header only
    expect(lines[0]).toBe('ID,Name,Email');
  });

  it('excludes hidden columns', () => {
    const columnsWithHidden: TableColumn[] = [
      { field: 'id', headerText: 'ID', visible: true },
      { field: 'name', headerText: 'Name', visible: false },
      { field: 'email', headerText: 'Email', visible: true },
    ];

    const csv = buildCsvContent(MOCK_DATA, columnsWithHidden);
    const lines = csv.split('\n');

    expect(lines[0]).toBe('ID,Email');
    expect(lines[1]).toBe('1,alice@example.com');
  });

  it('handles null and undefined values in data', () => {
    const dataWithNulls: Array<Record<string, unknown>> = [
      { id: 1, name: null, email: undefined },
    ];

    const csv = buildCsvContent(dataWithNulls, MOCK_COLUMNS);
    const lines = csv.split('\n');

    expect(lines[1]).toBe('1,,');
  });

  it('escapes special characters in data', () => {
    const dataWithSpecials: Array<Record<string, unknown>> = [
      { id: 1, name: 'O\'Brien, Jr.', email: 'test@test.com' },
    ];

    const csv = buildCsvContent(dataWithSpecials, MOCK_COLUMNS);
    const lines = csv.split('\n');

    expect(lines[1]).toBe('1,"O\'Brien, Jr.",test@test.com');
  });

  it('includes all columns when visible is undefined', () => {
    const columnsNoVisibility: TableColumn[] = [
      { field: 'id', headerText: 'ID' },
      { field: 'name', headerText: 'Name' },
    ];

    const csv = buildCsvContent(MOCK_DATA, columnsNoVisibility);
    const lines = csv.split('\n');

    expect(lines[0]).toBe('ID,Name');
  });

  it('handles large dataset without error', () => {
    const largeData = Array.from({ length: 1000 }, (_, i) => ({
      id: i,
      name: `User ${i}`,
      email: `user${i}@example.com`,
    }));

    const csv = buildCsvContent(largeData, MOCK_COLUMNS);
    const lines = csv.split('\n');

    expect(lines).toHaveLength(1001);
  });
});
