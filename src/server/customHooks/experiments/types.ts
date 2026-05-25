/**
 * Types for A/B test experiment API hooks.
 */

export interface ExperimentDto {
  id: string;
  name: string;
  menuId: string;
  menuName: string;
  status: string;
  variantBConfig: VariantBConfig;
  startedAt: string | null;
  stoppedAt: string | null;
  winner: string | null;
  createdAt: string;
}

export interface ExperimentWithMetricsDto extends ExperimentDto {
  metrics: ExperimentMetrics;
}

export interface ExperimentMetrics {
  variantAViews: number;
  variantBViews: number;
  totalViews: number;
}

export interface VariantBConfig {
  themePreset: string | null;
  menuVersionId: string | null;
}

export interface CreateExperimentRequest {
  name: string;
  menuId: string;
  variantBConfig: VariantBConfig;
}

export interface RecordViewRequest {
  variant: string;
}

export interface PaginatedExperimentsDto {
  items: ExperimentDto[];
  totalCount: number;
  page: number;
  pageSize: number;
}
