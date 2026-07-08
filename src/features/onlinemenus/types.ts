/**
 * DTO for menu template data returned from GET /api/v1/menu-templates.
 * Matches the backend MenuTemplateDto record.
 */
export interface MenuTemplateDto {
  externalId: string;
  slug: string;
  displayName: string;
  description: string;
  previewIcon: string;
}

/** Summary DTO for version list display (without full snapshot). */
export interface MenuVersionListDto {
  externalId: string;
  createdDate: string;
  lastUpdatedDate: string;
  menuId: string;
  versionNumber: number;
  createdByUserId: string;
  changeDescription: string | null;
  isCurrent: boolean;
  menuName: string;
  menuDescription: string | null;
}

/** Full DTO including the JSON snapshot. */
export interface MenuVersionDetailDto extends MenuVersionListDto {
  snapshot: string;
}

/** Paginated result of menu versions. */
export interface PaginatedMenuVersionsDto {
  items: MenuVersionListDto[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

/** Represents a single difference between two menu versions. */
export interface MenuVersionDiff {
  path: string;
  changeType: string;
  oldValue: string | null;
  newValue: string | null;
}

/** Comparison between two menu versions. */
export interface MenuVersionComparisonDto {
  version1: MenuVersionListDto;
  version2: MenuVersionListDto;
  snapshot1: string;
  snapshot2: string;
  differences: MenuVersionDiff[];
}

/** Response from the restore endpoint. */
export interface RestoreMenuVersionResponse {
  newVersionId: string;
}

/** Color values derived from the current theme for the menu editor. */
export interface EditorColors {
  borderColor: string;
  textColor: string;
  errorColor: string;
  successColor: string;
  backgroundColor: string;
  primaryColor: string;
  textOnPrimary: string;
  textSecondary: string;
  inactiveTabBg: string;
}
