/**
 * Unit tests for variantModifierHelpers.
 *
 * Tests LOGIC only — pure function inputs/outputs for:
 * - Creating variant/modifier groups and items
 * - CRUD operations on groups and items
 * - Price calculation (min variant price, price adjustment formatting)
 * - Edge cases (empty arrays, undefined, null maxSelections)
 */
import {
  createVariantGroup,
  createVariant,
  addVariantGroup,
  removeVariantGroup,
  updateVariantGroup,
  addVariantToGroup,
  removeVariantFromGroup,
  updateVariantInGroup,
  createModifierGroup,
  createModifier,
  addModifierGroup,
  removeModifierGroup,
  updateModifierGroup,
  addModifierToGroup,
  removeModifierFromGroup,
  updateModifierInGroup,
  getMinVariantPrice,
  hasVariants,
  hasModifiers,
  formatPriceAdjustment,
} from './variantModifierHelpers';

import type { MenuItem, VariantGroup, ModifierGroup } from '../../../types/menuTypes';

// =============================================================================
// Factory Helpers
// =============================================================================

function createMenuItem(overrides: Partial<MenuItem> = {}): MenuItem {
  return {
    id: 'item-1',
    name: 'Burger',
    price: 10,
    isAvailable: true,
    displayOrder: 0,
    ...overrides,
  };
}

// =============================================================================
// Variant Group CRUD Tests
// =============================================================================

describe('Variant Group CRUD', () => {
  it('creates a variant group with default required=true', () => {
    const group = createVariantGroup('Size');
    expect(group.name).toBe('Size');
    expect(group.isRequired).toBe(true);
    expect(group.minSelections).toBe(1);
    expect(group.maxSelections).toBe(1);
    expect(group.variants).toEqual([]);
  });

  it('creates a variant with name and price', () => {
    const variant = createVariant('Small', 12);
    expect(variant.name).toBe('Small');
    expect(variant.price).toBe(12);
    expect(variant.isAvailable).toBe(true);
  });

  it('creates a variant with default price 0', () => {
    const variant = createVariant('Custom');
    expect(variant.price).toBe(0);
  });

  it('adds a variant group to empty array', () => {
    const group = createVariantGroup('Size');
    const result = addVariantGroup(undefined, group);
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('Size');
    expect(result[0].displayOrder).toBe(0);
  });

  it('adds a variant group to existing array with correct displayOrder', () => {
    const existing: VariantGroup[] = [createVariantGroup('Size')];
    const group = createVariantGroup('Crust');
    const result = addVariantGroup(existing, group);
    expect(result).toHaveLength(2);
    expect(result[1].displayOrder).toBe(1);
  });

  it('removes a variant group by index', () => {
    const groups: VariantGroup[] = [
      createVariantGroup('Size'),
      createVariantGroup('Crust'),
    ];
    const result = removeVariantGroup(groups, 0);
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('Crust');
  });

  it('returns empty array when removing from undefined', () => {
    expect(removeVariantGroup(undefined, 0)).toEqual([]);
  });

  it('updates a variant group name', () => {
    const groups: VariantGroup[] = [createVariantGroup('Size')];
    const result = updateVariantGroup(groups, 0, { name: 'Portion' });
    expect(result[0].name).toBe('Portion');
    expect(result[0].isRequired).toBe(true);
  });

  it('returns empty array when updating undefined groups', () => {
    expect(updateVariantGroup(undefined, 0, { name: 'X' })).toEqual([]);
  });
});

// =============================================================================
// Variant Item CRUD Tests
// =============================================================================

describe('Variant Item CRUD', () => {
  const baseGroups: VariantGroup[] = [
    { ...createVariantGroup('Size'), variants: [createVariant('Small', 12)] },
  ];

  it('adds a variant to a group', () => {
    const result = addVariantToGroup(baseGroups, 0, createVariant('Large', 20));
    const variants = result[0].variants ?? [];
    expect(variants).toHaveLength(2);
    expect(variants[1].name).toBe('Large');
    expect(variants[1].displayOrder).toBe(1);
  });

  it('returns empty when adding to undefined groups', () => {
    expect(addVariantToGroup(undefined, 0, createVariant('X'))).toEqual([]);
  });

  it('removes a variant from a group', () => {
    const groups: VariantGroup[] = [
      {
        ...createVariantGroup('Size'),
        variants: [createVariant('Small', 12), createVariant('Large', 20)],
      },
    ];
    const result = removeVariantFromGroup(groups, 0, 0);
    expect(result[0].variants).toHaveLength(1);
    expect(result[0].variants?.[0].name).toBe('Large');
  });

  it('updates a variant name and price', () => {
    const result = updateVariantInGroup(baseGroups, 0, 0, { name: 'Tiny', price: 8 });
    expect(result[0].variants?.[0].name).toBe('Tiny');
    expect(result[0].variants?.[0].price).toBe(8);
  });

  it('returns empty when updating variant in undefined groups', () => {
    expect(updateVariantInGroup(undefined, 0, 0, { name: 'X' })).toEqual([]);
  });
});

// =============================================================================
// Modifier Group CRUD Tests
// =============================================================================

describe('Modifier Group CRUD', () => {
  it('creates a modifier group with default required=false', () => {
    const group = createModifierGroup('Extras');
    expect(group.name).toBe('Extras');
    expect(group.isRequired).toBe(false);
    expect(group.minSelections).toBe(0);
    expect(group.maxSelections).toBe(3);
    expect(group.modifiers).toEqual([]);
  });

  it('creates a modifier with name and price adjustment', () => {
    const modifier = createModifier('Cheese', 1.5);
    expect(modifier.name).toBe('Cheese');
    expect(modifier.priceAdjustment).toBe(1.5);
    expect(modifier.isAvailable).toBe(true);
  });

  it('creates a modifier with default price 0', () => {
    const modifier = createModifier('Plain');
    expect(modifier.priceAdjustment).toBe(0);
  });

  it('adds a modifier group to empty array', () => {
    const result = addModifierGroup(undefined, createModifierGroup('Extras'));
    expect(result).toHaveLength(1);
    expect(result[0].displayOrder).toBe(0);
  });

  it('removes a modifier group by index', () => {
    const groups: ModifierGroup[] = [
      createModifierGroup('Extras'),
      createModifierGroup('Toppings'),
    ];
    const result = removeModifierGroup(groups, 1);
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('Extras');
  });

  it('updates a modifier group', () => {
    const groups: ModifierGroup[] = [createModifierGroup('Extras')];
    const result = updateModifierGroup(groups, 0, { isRequired: true });
    expect(result[0].isRequired).toBe(true);
  });
});

// =============================================================================
// Modifier Item CRUD Tests
// =============================================================================

describe('Modifier Item CRUD', () => {
  const baseGroups: ModifierGroup[] = [
    {
      ...createModifierGroup('Extras'),
      modifiers: [createModifier('Cheese', 1)],
    },
  ];

  it('adds a modifier to a group', () => {
    const result = addModifierToGroup(baseGroups, 0, createModifier('Bacon', 2));
    const modifiers = result[0].modifiers ?? [];
    expect(modifiers).toHaveLength(2);
    expect(modifiers[1].name).toBe('Bacon');
    expect(modifiers[1].displayOrder).toBe(1);
  });

  it('removes a modifier from a group', () => {
    const groups: ModifierGroup[] = [
      {
        ...createModifierGroup('Extras'),
        modifiers: [createModifier('Cheese', 1), createModifier('Bacon', 2)],
      },
    ];
    const result = removeModifierFromGroup(groups, 0, 0);
    expect(result[0].modifiers).toHaveLength(1);
    expect(result[0].modifiers?.[0].name).toBe('Bacon');
  });

  it('updates a modifier price adjustment', () => {
    const result = updateModifierInGroup(baseGroups, 0, 0, { priceAdjustment: 2.5 });
    expect(result[0].modifiers?.[0].priceAdjustment).toBe(2.5);
  });

  it('returns empty when operating on undefined modifier groups', () => {
    expect(addModifierToGroup(undefined, 0, createModifier('X'))).toEqual([]);
    expect(removeModifierFromGroup(undefined, 0, 0)).toEqual([]);
    expect(updateModifierInGroup(undefined, 0, 0, { name: 'X' })).toEqual([]);
  });
});

// =============================================================================
// Price Calculation Tests
// =============================================================================

describe('getMinVariantPrice', () => {
  it('returns undefined when no variant groups exist', () => {
    const item = createMenuItem();
    expect(getMinVariantPrice(item)).toBeUndefined();
  });

  it('returns undefined when variant groups is empty array', () => {
    const item = createMenuItem({ variantGroups: [] });
    expect(getMinVariantPrice(item)).toBeUndefined();
  });

  it('returns undefined when all variants are unavailable', () => {
    const item = createMenuItem({
      variantGroups: [
        {
          name: 'Size',
          variants: [
            { name: 'Small', price: 12, isAvailable: false },
            { name: 'Large', price: 20, isAvailable: false },
          ],
        },
      ],
    });
    expect(getMinVariantPrice(item)).toBeUndefined();
  });

  it('returns the minimum price from available variants', () => {
    const item = createMenuItem({
      variantGroups: [
        {
          name: 'Size',
          variants: [
            { name: 'Small', price: 12, isAvailable: true },
            { name: 'Medium', price: 16, isAvailable: true },
            { name: 'Large', price: 20, isAvailable: true },
          ],
        },
      ],
    });
    expect(getMinVariantPrice(item)).toBe(12);
  });

  it('skips unavailable variants when computing minimum', () => {
    const item = createMenuItem({
      variantGroups: [
        {
          name: 'Size',
          variants: [
            { name: 'Small', price: 8, isAvailable: false },
            { name: 'Medium', price: 16, isAvailable: true },
            { name: 'Large', price: 20, isAvailable: true },
          ],
        },
      ],
    });
    expect(getMinVariantPrice(item)).toBe(16);
  });

  it('considers variants across multiple groups', () => {
    const item = createMenuItem({
      variantGroups: [
        {
          name: 'Size',
          variants: [
            { name: 'Small', price: 12, isAvailable: true },
            { name: 'Large', price: 20, isAvailable: true },
          ],
        },
        {
          name: 'Crust',
          variants: [
            { name: 'Thin', price: 10, isAvailable: true },
            { name: 'Thick', price: 14, isAvailable: true },
          ],
        },
      ],
    });
    expect(getMinVariantPrice(item)).toBe(10);
  });

  it('handles variants without isAvailable (defaults to available)', () => {
    const item = createMenuItem({
      variantGroups: [
        {
          name: 'Size',
          variants: [{ name: 'Small', price: 12 }, { name: 'Large', price: 20 }],
        },
      ],
    });
    expect(getMinVariantPrice(item)).toBe(12);
  });
});

// =============================================================================
// hasVariants / hasModifiers Tests
// =============================================================================

describe('hasVariants', () => {
  it('returns false when no variant groups', () => {
    expect(hasVariants(createMenuItem())).toBe(false);
  });

  it('returns false when variant groups is empty', () => {
    expect(hasVariants(createMenuItem({ variantGroups: [] }))).toBe(false);
  });

  it('returns false when groups have no variants', () => {
    expect(
      hasVariants(createMenuItem({ variantGroups: [{ name: 'Size', variants: [] }] })),
    ).toBe(false);
  });

  it('returns true when at least one group has variants', () => {
    expect(
      hasVariants(
        createMenuItem({
          variantGroups: [
            { name: 'Size', variants: [{ name: 'S', price: 10 }] },
          ],
        }),
      ),
    ).toBe(true);
  });
});

describe('hasModifiers', () => {
  it('returns false when no modifier groups', () => {
    expect(hasModifiers(createMenuItem())).toBe(false);
  });

  it('returns true when at least one group has modifiers', () => {
    expect(
      hasModifiers(
        createMenuItem({
          modifierGroups: [
            { name: 'Extras', modifiers: [{ name: 'Cheese', priceAdjustment: 1 }] },
          ],
        }),
      ),
    ).toBe(true);
  });
});

// =============================================================================
// formatPriceAdjustment Tests
// =============================================================================

describe('formatPriceAdjustment', () => {
  it('formats positive adjustment with + prefix', () => {
    expect(formatPriceAdjustment(1)).toBe('+$1.00');
  });

  it('formats zero adjustment with + prefix', () => {
    expect(formatPriceAdjustment(0)).toBe('+$0.00');
  });

  it('formats fractional adjustment', () => {
    expect(formatPriceAdjustment(1.5)).toBe('+$1.50');
  });

  it('formats negative adjustment without double negative', () => {
    expect(formatPriceAdjustment(-0.5)).toBe('-$0.50');
  });
});
