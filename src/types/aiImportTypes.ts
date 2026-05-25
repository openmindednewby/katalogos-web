/**
 * Types for the AI menu import feature.
 * These represent the response from the backend AI extraction endpoint.
 */

/** A single menu item extracted by AI from an image or PDF. */
export interface ImportedItem {
  name: string;
  description?: string | null;
  price?: number | null;
  confidence?: number | null;
}

/** A category of items extracted by AI from an image or PDF. */
export interface ImportedCategory {
  name: string;
  items: ImportedItem[];
}

/** The complete extraction result from the AI import endpoint. */
export interface ImportedMenuData {
  categories: ImportedCategory[];
}

/** Request body for applying AI-imported data to a menu. */
export interface ApplyImportRequest {
  importedData: ImportedMenuData;
  mergeStrategy: string;
}
