/**
 * Unit tests for generateNutrition API function.
 * Tests request construction and response mapping.
 */
import { generateNutrition } from './useGenerateNutrition';

import type { GenerateNutritionRequest } from './useGenerateNutrition';

jest.mock('../server/httpClient', () => ({
  customInstance: jest.fn(),
}));

const { customInstance } = jest.requireMock('../server/httpClient');

const SAMPLE_RESPONSE = {
  calories: 450,
  proteinGrams: 35,
  carbsGrams: 20,
  fatGrams: 18,
  fiberGrams: 3,
  sodiumMg: 650,
  servingSize: '1 plate (300g)',
  detectedAllergens: ['gluten', 'dairy'],
};

describe('generateNutrition', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('sends correct URL with menu external ID', async () => {
    customInstance.mockResolvedValue(SAMPLE_RESPONSE);
    const request: GenerateNutritionRequest = {
      menuExternalId: 'menu-abc-123',
      itemName: 'Grilled Chicken',
      ingredients: 'chicken breast, olive oil, garlic',
    };

    await generateNutrition(request);

    expect(customInstance).toHaveBeenCalledWith({
      url: '/api/v1/TenantMenus/menu-abc-123/generate-nutrition',
      method: 'POST',
      data: {
        itemName: 'Grilled Chicken',
        ingredients: 'chicken breast, olive oil, garlic',
      },
    });
  });

  it('returns the response from the API', async () => {
    customInstance.mockResolvedValue(SAMPLE_RESPONSE);
    const request: GenerateNutritionRequest = {
      menuExternalId: 'menu-xyz',
      itemName: 'Pasta',
      ingredients: 'flour, eggs, tomato sauce',
    };

    const result = await generateNutrition(request);

    expect(result.calories).toBe(450);
    expect(result.proteinGrams).toBe(35);
    expect(result.detectedAllergens).toEqual(['gluten', 'dairy']);
    expect(result.servingSize).toBe('1 plate (300g)');
  });

  it('excludes menuExternalId from the request body', async () => {
    customInstance.mockResolvedValue(SAMPLE_RESPONSE);
    const request: GenerateNutritionRequest = {
      menuExternalId: 'menu-id',
      itemName: 'Salad',
      ingredients: 'lettuce, tomato',
    };

    await generateNutrition(request);

    const callArgs = customInstance.mock.calls[0][0] as { data: Record<string, unknown> };
    expect(callArgs.data).not.toHaveProperty('menuExternalId');
  });

  it('propagates API errors', async () => {
    const apiError = new Error('Network failure');
    customInstance.mockRejectedValue(apiError);
    const request: GenerateNutritionRequest = {
      menuExternalId: 'menu-id',
      itemName: 'Test',
      ingredients: 'test',
    };

    await expect(generateNutrition(request)).rejects.toThrow('Network failure');
  });
});
