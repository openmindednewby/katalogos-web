/** Types for dietary tag hooks and components. */

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
