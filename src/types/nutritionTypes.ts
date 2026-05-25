/**
 * Types for nutritional information on menu items.
 */

/**
 * Nutritional information for a menu item.
 * Values are per serving.
 */
export interface NutritionalInfo {
  /** Calories per serving */
  calories: number;
  /** Protein in grams */
  proteinGrams: number;
  /** Carbohydrates in grams */
  carbsGrams: number;
  /** Fat in grams */
  fatGrams: number;
  /** Fiber in grams */
  fiberGrams: number;
  /** Sodium in milligrams */
  sodiumMg: number;
  /** Serving size description (e.g., "1 plate (350g)") */
  servingSize: string;
}
