/**
 * Types for dietary tag hooks and components.
 *
 * DietaryTagDto matches the backend API response shape from
 * GET /api/dietary-tags and GET /public/dietary-tags.
 */

export interface DietaryTagDto {
  externalId: string;
  key: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  isSystem: boolean;
  displayOrder: number;
}

export interface CreateDietaryTagRequest {
  key: string;
  name: string;
  description?: string;
  icon?: string;
  color?: string;
}
