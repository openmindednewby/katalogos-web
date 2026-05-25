import { isValueDefined } from '../../utils/is';

import type { MenuContents, TenantMenusDto } from '../../types/menuTypes';

interface PreviewShape {
  name?: string;
  description?: string | null;
  contents?: MenuContents | null;
}

/** Converts a TenantMenusDto to the shape expected by MenuPreviewModal. */
export function toPreviewItem(item: TenantMenusDto | null): PreviewShape | null {
  if (!isValueDefined(item)) return null;
  if (!item.contents) return { name: item.name, description: item.description, contents: null };
  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions -- auto-gen to local type boundary
  const contents = { ...item.contents, categories: item.contents.categories ?? [] } as MenuContents;
  return { name: item.name, description: item.description, contents };
}

export function isMenuListData(value: unknown): value is { menus?: TenantMenusDto[] } {
  if (typeof value !== 'object' || !isValueDefined(value)) return false;
  return 'menus' in value;
}
