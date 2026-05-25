/**
 * Utility functions for formatting and calculating nutritional information.
 */

import type { NutritionalInfo } from '../types/menuTypes';

const CALORIES_PER_GRAM_PROTEIN = 4;
const CALORIES_PER_GRAM_CARBS = 4;
const CALORIES_PER_GRAM_FAT = 9;
const PERCENTAGE_MULTIPLIER = 100;
const PERCENTAGE_DECIMALS = 1;

/** Calculate the percentage of total calories from a macro. */
export function macroPercentage(macroCalories: number, totalCalories: number): number {
  if (totalCalories <= 0) return 0;
  const raw = (macroCalories / totalCalories) * PERCENTAGE_MULTIPLIER;
  return Number(raw.toFixed(PERCENTAGE_DECIMALS));
}

/** Get protein percentage of total calories. */
export function proteinPercentage(info: NutritionalInfo): number {
  return macroPercentage(info.proteinGrams * CALORIES_PER_GRAM_PROTEIN, info.calories);
}

/** Get carbs percentage of total calories. */
export function carbsPercentage(info: NutritionalInfo): number {
  return macroPercentage(info.carbsGrams * CALORIES_PER_GRAM_CARBS, info.calories);
}

/** Get fat percentage of total calories. */
export function fatPercentage(info: NutritionalInfo): number {
  return macroPercentage(info.fatGrams * CALORIES_PER_GRAM_FAT, info.calories);
}

/** Format a calorie value for display (e.g., 1250 -> "1,250"). */
export function formatCalories(calories: number): string {
  return Math.round(calories).toLocaleString('en-US');
}

/** Format grams value for display (e.g., 25.5 -> "25.5"). */
export function formatGrams(grams: number): string {
  const DECIMAL_PLACES = 1;
  const rounded = Number(grams.toFixed(DECIMAL_PLACES));
  return String(rounded);
}

/** Format milligrams value for display. */
export function formatMilligrams(mg: number): string {
  return String(Math.round(mg));
}

/** Check if a NutritionalInfo object has any meaningful data. */
export function hasNutritionData(info: NutritionalInfo | null | undefined): boolean {
  if (!info) return false;
  return info.calories > 0
    || info.proteinGrams > 0
    || info.carbsGrams > 0
    || info.fatGrams > 0;
}

/** Parse a numeric string input, returning 0 for invalid values. */
export function parseNutritionInput(value: string): number {
  const parsed = Number(value);
  if (Number.isNaN(parsed) || parsed < 0) return 0;
  return parsed;
}
