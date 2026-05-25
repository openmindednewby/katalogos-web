/**
 * Tests for building MenuContents from validated import rows.
 */
import { buildMenuContents } from './buildMenuContents';
import ValidationSeverity from '../../../../shared/enums/ValidationSeverity';


import type { ValidatedRow } from './validateMenuRows';

function createValidRow(overrides: Partial<ValidatedRow> = {}): ValidatedRow {
  return {
    rowIndex: 0,
    category: 'Appetizers',
    itemName: 'Salad',
    description: 'Fresh greens',
    price: 9.99,
    rawPrice: '9.99',
    issues: [],
    isValid: true,
    ...overrides,
  };
}

describe('buildMenuContents', () => {
  it('creates categories from unique category names', () => {
    const rows: ValidatedRow[] = [
      createValidRow({ rowIndex: 0, category: 'Appetizers', itemName: 'Salad', price: 9.99 }),
      createValidRow({ rowIndex: 1, category: 'Appetizers', itemName: 'Soup', price: 7.99 }),
      createValidRow({ rowIndex: 2, category: 'Mains', itemName: 'Steak', price: 24.99 }),
    ];

    const { contents, summary } = buildMenuContents(rows);

    expect(contents.categories).toHaveLength(2);
    expect(contents.categories?.[0].name).toBe('Appetizers');
    expect(contents.categories?.[1].name).toBe('Mains');
    expect(summary.categoryCount).toBe(2);
  });

  it('places items under their respective categories', () => {
    const rows: ValidatedRow[] = [
      createValidRow({ rowIndex: 0, category: 'Appetizers', itemName: 'Salad', price: 9.99 }),
      createValidRow({ rowIndex: 1, category: 'Appetizers', itemName: 'Soup', price: 7.99 }),
    ];

    const { contents } = buildMenuContents(rows);

    const appetizers = contents.categories?.[0];
    expect(appetizers?.items).toHaveLength(2);
    expect(appetizers?.items?.[0].name).toBe('Salad');
    expect(appetizers?.items?.[1].name).toBe('Soup');
  });

  it('sets correct display orders on categories and items', () => {
    const rows: ValidatedRow[] = [
      createValidRow({ rowIndex: 0, category: 'A', itemName: 'Item 1' }),
      createValidRow({ rowIndex: 1, category: 'A', itemName: 'Item 2' }),
      createValidRow({ rowIndex: 2, category: 'B', itemName: 'Item 3' }),
    ];

    const { contents } = buildMenuContents(rows);

    expect(contents.categories?.[0].displayOrder).toBe(0);
    expect(contents.categories?.[1].displayOrder).toBe(1);
    expect(contents.categories?.[0].items?.[0].displayOrder).toBe(0);
    expect(contents.categories?.[0].items?.[1].displayOrder).toBe(1);
  });

  it('skips invalid rows', () => {
    const rows: ValidatedRow[] = [
      createValidRow({ rowIndex: 0, category: 'Appetizers', itemName: 'Salad', isValid: true }),
      createValidRow({
        rowIndex: 1,
        category: '',
        itemName: '',
        isValid: false,
        issues: [{ severity: ValidationSeverity.Error, messageKey: 'menuImport.validation.emptyItemName' }],
      }),
      createValidRow({ rowIndex: 2, category: 'Mains', itemName: 'Steak', isValid: true }),
    ];

    const { summary } = buildMenuContents(rows);

    expect(summary.itemCount).toBe(2);
    expect(summary.skippedCount).toBe(1);
  });

  it('merges with existing contents preserving existing categories', () => {
    const existingContents = {
      categories: [
        {
          id: 'existing-cat',
          name: 'Drinks',
          items: [{ name: 'Water', price: 1.99, isAvailable: true }],
          displayOrder: 0,
          imageContentId: null,
          videoContentId: null,
        },
      ],
    };

    const rows: ValidatedRow[] = [
      createValidRow({ rowIndex: 0, category: 'Appetizers', itemName: 'Salad', price: 9.99 }),
    ];

    const { contents, summary } = buildMenuContents(rows, existingContents);

    expect(contents.categories).toHaveLength(2);
    expect(contents.categories?.[0].name).toBe('Drinks');
    expect(contents.categories?.[1].name).toBe('Appetizers');
    expect(summary.categoryCount).toBe(1);
  });

  it('does not duplicate existing categories when merging', () => {
    const existingContents = {
      categories: [
        {
          id: 'existing-cat',
          name: 'Appetizers',
          items: [],
          displayOrder: 0,
          imageContentId: null,
          videoContentId: null,
        },
      ],
    };

    const rows: ValidatedRow[] = [
      createValidRow({ rowIndex: 0, category: 'Appetizers', itemName: 'Salad', price: 9.99 }),
    ];

    const { contents, summary } = buildMenuContents(rows, existingContents);

    // Should keep existing category and skip the imported one with same name
    expect(contents.categories).toHaveLength(1);
    expect(summary.categoryCount).toBe(0);
  });

  it('assigns unique IDs to new categories and items', () => {
    const rows: ValidatedRow[] = [
      createValidRow({ rowIndex: 0, category: 'A', itemName: 'Item 1' }),
      createValidRow({ rowIndex: 1, category: 'A', itemName: 'Item 2' }),
    ];

    const { contents } = buildMenuContents(rows);

    const cat = contents.categories?.[0];
    expect(cat?.id).toBeDefined();
    expect(cat?.items?.[0].id).toBeDefined();
    expect(cat?.items?.[1].id).toBeDefined();
    expect(cat?.items?.[0].id).not.toBe(cat?.items?.[1].id);
  });

  it('sets all new items as available by default', () => {
    const rows: ValidatedRow[] = [
      createValidRow({ rowIndex: 0, category: 'A', itemName: 'Item 1' }),
    ];

    const { contents } = buildMenuContents(rows);
    expect(contents.categories?.[0].items?.[0].isAvailable).toBe(true);
  });

  it('handles empty validated rows gracefully', () => {
    const { contents, summary } = buildMenuContents([]);

    expect(contents.categories).toEqual([]);
    expect(summary.itemCount).toBe(0);
    expect(summary.categoryCount).toBe(0);
    expect(summary.skippedCount).toBe(0);
  });

  it('handles description being set when present', () => {
    const rows: ValidatedRow[] = [
      createValidRow({ rowIndex: 0, description: 'A tasty dish' }),
    ];

    const { contents } = buildMenuContents(rows);
    expect(contents.categories?.[0].items?.[0].description).toBe('A tasty dish');
  });

  it('sets description to undefined when empty', () => {
    const rows: ValidatedRow[] = [
      createValidRow({ rowIndex: 0, description: '' }),
    ];

    const { contents } = buildMenuContents(rows);
    expect(contents.categories?.[0].items?.[0].description).toBeUndefined();
  });
});
