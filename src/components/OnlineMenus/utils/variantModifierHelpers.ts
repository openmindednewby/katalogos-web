/**
 * Pure helpers for variant/modifier CRUD and price calculations.
 */
import type {
  VariantGroup,
  Variant,
  ModifierGroup,
  Modifier,
  MenuItem,
} from '../../../types/menuTypes';

// =============================================================================
// Constants
// =============================================================================

const DEFAULT_VARIANT_PRICE = 0;
const DEFAULT_MODIFIER_PRICE = 0;
const DEFAULT_MIN_SELECTIONS = 1;
const DEFAULT_MAX_SELECTIONS = 1;
const MODIFIER_DEFAULT_MIN = 0;
const MODIFIER_DEFAULT_MAX = 3;

// =============================================================================
// Variant Group Helpers
// =============================================================================

/**
 * Creates a new empty variant group with sensible defaults.
 */
export function createVariantGroup(name: string): VariantGroup {
  return {
    name,
    displayOrder: 0,
    isRequired: true,
    minSelections: DEFAULT_MIN_SELECTIONS,
    maxSelections: DEFAULT_MAX_SELECTIONS,
    variants: [],
  };
}

/**
 * Creates a new variant with default values.
 */
export function createVariant(name: string, price: number = DEFAULT_VARIANT_PRICE): Variant {
  return {
    name,
    price,
    displayOrder: 0,
    isAvailable: true,
  };
}

/**
 * Adds a variant group to the item's variant groups array.
 */
export function addVariantGroup(
  existingGroups: VariantGroup[] | undefined,
  group: VariantGroup,
): VariantGroup[] {
  const groups = existingGroups ?? [];
  return [...groups, { ...group, displayOrder: groups.length }];
}

/**
 * Removes a variant group by index.
 */
export function removeVariantGroup(
  groups: VariantGroup[] | undefined,
  groupIndex: number,
): VariantGroup[] {
  if (!groups) return [];
  return groups.filter((_, i) => i !== groupIndex);
}

/**
 * Updates a variant group at the given index.
 */
export function updateVariantGroup(
  groups: VariantGroup[] | undefined,
  groupIndex: number,
  updates: Partial<VariantGroup>,
): VariantGroup[] {
  if (!groups) return [];
  return groups.map((g, i) => (i === groupIndex ? { ...g, ...updates } : g));
}

/**
 * Adds a variant to a specific group.
 */
export function addVariantToGroup(
  groups: VariantGroup[] | undefined,
  groupIndex: number,
  variant: Variant,
): VariantGroup[] {
  if (!groups) return [];
  return groups.map((g, i) => {
    if (i !== groupIndex) return g;
    const variants = g.variants ?? [];
    return { ...g, variants: [...variants, { ...variant, displayOrder: variants.length }] };
  });
}

/**
 * Removes a variant from a specific group.
 */
export function removeVariantFromGroup(
  groups: VariantGroup[] | undefined,
  groupIndex: number,
  variantIndex: number,
): VariantGroup[] {
  if (!groups) return [];
  return groups.map((g, i) => {
    if (i !== groupIndex) return g;
    const variants = (g.variants ?? []).filter((_, vi) => vi !== variantIndex);
    return { ...g, variants };
  });
}

/**
 * Updates a variant within a specific group.
 */
export function updateVariantInGroup(
  groups: VariantGroup[] | undefined,
  groupIndex: number,
  variantIndex: number,
  updates: Partial<Variant>,
): VariantGroup[] {
  if (!groups) return [];
  return groups.map((g, i) => {
    if (i !== groupIndex) return g;
    const variants = (g.variants ?? []).map((v, vi) =>
      vi === variantIndex ? { ...v, ...updates } : v,
    );
    return { ...g, variants };
  });
}

// =============================================================================
// Modifier Group Helpers
// =============================================================================

/**
 * Creates a new empty modifier group with sensible defaults.
 */
export function createModifierGroup(name: string): ModifierGroup {
  return {
    name,
    displayOrder: 0,
    isRequired: false,
    minSelections: MODIFIER_DEFAULT_MIN,
    maxSelections: MODIFIER_DEFAULT_MAX,
    modifiers: [],
  };
}

/**
 * Creates a new modifier with default values.
 */
export function createModifier(
  name: string,
  priceAdjustment: number = DEFAULT_MODIFIER_PRICE,
): Modifier {
  return {
    name,
    priceAdjustment,
    displayOrder: 0,
    isAvailable: true,
  };
}

/**
 * Adds a modifier group to the item's modifier groups array.
 */
export function addModifierGroup(
  existingGroups: ModifierGroup[] | undefined,
  group: ModifierGroup,
): ModifierGroup[] {
  const groups = existingGroups ?? [];
  return [...groups, { ...group, displayOrder: groups.length }];
}

/**
 * Removes a modifier group by index.
 */
export function removeModifierGroup(
  groups: ModifierGroup[] | undefined,
  groupIndex: number,
): ModifierGroup[] {
  if (!groups) return [];
  return groups.filter((_, i) => i !== groupIndex);
}

/**
 * Updates a modifier group at the given index.
 */
export function updateModifierGroup(
  groups: ModifierGroup[] | undefined,
  groupIndex: number,
  updates: Partial<ModifierGroup>,
): ModifierGroup[] {
  if (!groups) return [];
  return groups.map((g, i) => (i === groupIndex ? { ...g, ...updates } : g));
}

/**
 * Adds a modifier to a specific group.
 */
export function addModifierToGroup(
  groups: ModifierGroup[] | undefined,
  groupIndex: number,
  modifier: Modifier,
): ModifierGroup[] {
  if (!groups) return [];
  return groups.map((g, i) => {
    if (i !== groupIndex) return g;
    const modifiers = g.modifiers ?? [];
    return { ...g, modifiers: [...modifiers, { ...modifier, displayOrder: modifiers.length }] };
  });
}

/**
 * Removes a modifier from a specific group.
 */
export function removeModifierFromGroup(
  groups: ModifierGroup[] | undefined,
  groupIndex: number,
  modifierIndex: number,
): ModifierGroup[] {
  if (!groups) return [];
  return groups.map((g, i) => {
    if (i !== groupIndex) return g;
    const modifiers = (g.modifiers ?? []).filter((_, mi) => mi !== modifierIndex);
    return { ...g, modifiers };
  });
}

/**
 * Updates a modifier within a specific group.
 */
export function updateModifierInGroup(
  groups: ModifierGroup[] | undefined,
  groupIndex: number,
  modifierIndex: number,
  updates: Partial<Modifier>,
): ModifierGroup[] {
  if (!groups) return [];
  return groups.map((g, i) => {
    if (i !== groupIndex) return g;
    const modifiers = (g.modifiers ?? []).map((m, mi) =>
      mi === modifierIndex ? { ...m, ...updates } : m,
    );
    return { ...g, modifiers };
  });
}

// =============================================================================
// Price Calculation Helpers
// =============================================================================

/**
 * Returns the minimum price across all variants in all groups.
 * Returns undefined if no variants exist.
 */
export function getMinVariantPrice(item: MenuItem): number | undefined {
  const groups = item.variantGroups;
  if (!groups || groups.length === 0) return undefined;

  const allVariants = groups.flatMap((g) => g.variants ?? []);
  const availableVariants = allVariants.filter((v) => v.isAvailable !== false);
  if (availableVariants.length === 0) return undefined;

  return Math.min(...availableVariants.map((v) => v.price));
}

/**
 * Returns true if the item has any variant groups with variants.
 */
export function hasVariants(item: MenuItem): boolean {
  const groups = item.variantGroups;
  if (!groups || groups.length === 0) return false;
  return groups.some((g) => (g.variants ?? []).length > 0);
}

/**
 * Returns true if the item has any modifier groups with modifiers.
 */
export function hasModifiers(item: MenuItem): boolean {
  const groups = item.modifierGroups;
  if (!groups || groups.length === 0) return false;
  return groups.some((g) => (g.modifiers ?? []).length > 0);
}

/**
 * Formats a modifier price adjustment for display (e.g., "+$1.00").
 */
export function formatPriceAdjustment(amount: number): string {
  const prefix = amount >= 0 ? '+' : '-';
  return `${prefix}$${Math.abs(amount).toFixed(2)}`;
}
