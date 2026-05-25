/**
 * Hook that computes breadcrumb items for the FullMenuEditor modal.
 * Breadcrumbs derive from modal-local state (not routes).
 */
import { useMemo } from 'react';

import { FM } from '@/localization/helpers';
import { isValueDefined } from '@/utils/is';

import type { Category } from '../../../types/menuTypes';

export interface BreadcrumbCrumb {
  label: string;
  onPress?: () => void;
}

interface UseBreadcrumbStateParams {
  menuName: string;
  activeTab: string;
  activeCategoryId: string | null;
  categories: Category[];
  onNavigateToMenuList: () => void;
  onNavigateToMetadata: () => void;
  onNavigateToContent: () => void;
}

function findCategoryName(categories: Category[], id: string | null): string | null {
  if (!isValueDefined(id)) return null;
  const cat = categories.find((c) => c.id === id);
  return cat?.name ?? null;
}

export function useBreadcrumbState({
  menuName,
  activeTab,
  activeCategoryId,
  categories,
  onNavigateToMenuList,
  onNavigateToMetadata,
  onNavigateToContent,
}: UseBreadcrumbStateParams): BreadcrumbCrumb[] {
  return useMemo(() => {
    const crumbs: BreadcrumbCrumb[] = [];

    crumbs.push({ label: FM('onlineMenus.breadcrumb.onlineMenus'), onPress: onNavigateToMenuList });

    const displayName = menuName.trim() !== '' ? menuName : FM('onlineMenus.create');
    const isMetadataTab = activeTab === 'metadata';
    crumbs.push({ label: displayName, onPress: isMetadataTab ? undefined : onNavigateToMetadata });

    const isContentTab = activeTab === 'content';
    const categoryName = isContentTab ? findCategoryName(categories, activeCategoryId) : null;
    const tabLabel = resolveTabLabel(activeTab);

    if (isContentTab && isValueDefined(categoryName)) {
      crumbs.push({ label: tabLabel, onPress: onNavigateToContent });
      crumbs.push({ label: categoryName });
    } else 
      crumbs.push({ label: tabLabel });
    

    return crumbs;
  }, [menuName, activeTab, activeCategoryId, categories, onNavigateToMenuList, onNavigateToMetadata, onNavigateToContent]);
}

function resolveTabLabel(activeTab: string): string {
  if (activeTab === 'metadata') return FM('onlineMenus.tab.metadata');
  if (activeTab === 'content') return FM('onlineMenus.tab.content');
  if (activeTab === 'preview') return FM('onlineMenus.tab.preview');
  return FM('translations.tabTitle');
}
