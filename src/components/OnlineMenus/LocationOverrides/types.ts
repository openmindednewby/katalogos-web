/**
 * Types for multi-location override management.
 * Maps to backend Location and MenuItemOverride entities.
 */

/** DTO for a tenant location (matches backend LocationDto). */
export interface LocationDto {
  externalId: string;
  name: string;
  addressLine1?: string | null;
  addressLine2?: string | null;
  city?: string | null;
  state?: string | null;
  postalCode?: string | null;
  country?: string | null;
  phone?: string | null;
  email?: string | null;
  timezone?: string | null;
  isHeadquarters: boolean;
  isActive: boolean;
}

/** DTO for a per-location menu item override (matches backend MenuItemOverride). */
export interface MenuItemOverrideDto {
  categoryIndex: number;
  itemIndex: number;
  priceOverride?: number | null;
  isAvailableOverride?: boolean | null;
  descriptionOverride?: string | null;
}

/** Composite key for looking up an override. */
export interface OverrideKey {
  categoryIndex: number;
  itemIndex: number;
}

/** Props passed down the component tree when a location is selected. */
export interface OverrideContextProps {
  getOverride: (categoryIndex: number, itemIndex: number) => MenuItemOverrideDto | undefined;
  setOverride: (categoryIndex: number, itemIndex: number, updates: Partial<MenuItemOverrideDto>) => void;
  clearOverride: (categoryIndex: number, itemIndex: number) => void;
  hasOverride: (categoryIndex: number, itemIndex: number) => boolean;
}
