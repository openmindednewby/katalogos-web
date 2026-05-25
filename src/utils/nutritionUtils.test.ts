import {
  macroPercentage,
  proteinPercentage,
  carbsPercentage,
  fatPercentage,
  formatCalories,
  formatGrams,
  formatMilligrams,
  hasNutritionData,
  parseNutritionInput,
} from './nutritionUtils';

import type { NutritionalInfo } from '../types/menuTypes';

const SAMPLE_INFO: NutritionalInfo = {
  calories: 500,
  proteinGrams: 30,
  carbsGrams: 50,
  fatGrams: 15,
  fiberGrams: 5,
  sodiumMg: 800,
  servingSize: '1 plate (350g)',
};

describe('macroPercentage', () => {
  it('should calculate correct percentage', () => {
    expect(macroPercentage(200, 500)).toBe(40);
  });

  it('should return 0 for zero total calories', () => {
    expect(macroPercentage(200, 0)).toBe(0);
  });

  it('should return 0 for negative total calories', () => {
    expect(macroPercentage(200, -100)).toBe(0);
  });

  it('should round to one decimal place', () => {
    expect(macroPercentage(100, 300)).toBe(33.3);
  });
});

describe('proteinPercentage', () => {
  it('should calculate protein calories as percentage (4 cal/g)', () => {
    // 30g * 4 = 120 cal -> 120/500 = 24%
    expect(proteinPercentage(SAMPLE_INFO)).toBe(24);
  });
});

describe('carbsPercentage', () => {
  it('should calculate carbs calories as percentage (4 cal/g)', () => {
    // 50g * 4 = 200 cal -> 200/500 = 40%
    expect(carbsPercentage(SAMPLE_INFO)).toBe(40);
  });
});

describe('fatPercentage', () => {
  it('should calculate fat calories as percentage (9 cal/g)', () => {
    // 15g * 9 = 135 cal -> 135/500 = 27%
    expect(fatPercentage(SAMPLE_INFO)).toBe(27);
  });
});

describe('formatCalories', () => {
  it('should format with comma separator', () => {
    expect(formatCalories(1250)).toBe('1,250');
  });

  it('should round decimal calories', () => {
    expect(formatCalories(1250.7)).toBe('1,251');
  });

  it('should handle zero', () => {
    expect(formatCalories(0)).toBe('0');
  });
});

describe('formatGrams', () => {
  it('should format to one decimal place', () => {
    expect(formatGrams(25.55)).toBe('25.6');
  });

  it('should remove trailing zeros from whole numbers', () => {
    expect(formatGrams(30)).toBe('30');
  });
});

describe('formatMilligrams', () => {
  it('should round to nearest integer', () => {
    expect(formatMilligrams(800.5)).toBe('801');
  });

  it('should handle zero', () => {
    expect(formatMilligrams(0)).toBe('0');
  });
});

describe('hasNutritionData', () => {
  it('should return true when calories are set', () => {
    expect(hasNutritionData(SAMPLE_INFO)).toBe(true);
  });

  it('should return false for null', () => {
    expect(hasNutritionData(null)).toBe(false);
  });

  it('should return false for undefined', () => {
    expect(hasNutritionData(undefined)).toBe(false);
  });

  it('should return false when all values are zero', () => {
    const empty: NutritionalInfo = {
      calories: 0,
      proteinGrams: 0,
      carbsGrams: 0,
      fatGrams: 0,
      fiberGrams: 0,
      sodiumMg: 0,
      servingSize: '',
    };
    expect(hasNutritionData(empty)).toBe(false);
  });

  it('should return true when only protein has value', () => {
    const partial: NutritionalInfo = {
      calories: 0,
      proteinGrams: 10,
      carbsGrams: 0,
      fatGrams: 0,
      fiberGrams: 0,
      sodiumMg: 0,
      servingSize: '',
    };
    expect(hasNutritionData(partial)).toBe(true);
  });
});

describe('parseNutritionInput', () => {
  it('should parse valid number string', () => {
    expect(parseNutritionInput('42')).toBe(42);
  });

  it('should parse decimal string', () => {
    expect(parseNutritionInput('12.5')).toBe(12.5);
  });

  it('should return 0 for empty string', () => {
    expect(parseNutritionInput('')).toBe(0);
  });

  it('should return 0 for non-numeric string', () => {
    expect(parseNutritionInput('abc')).toBe(0);
  });

  it('should return 0 for negative number', () => {
    expect(parseNutritionInput('-5')).toBe(0);
  });
});
