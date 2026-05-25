import { isValueDefined } from '../../../utils/is';

import type { SidebarItem } from '@baseclient/core';

/**
 * Maps individual sidebar item keys to their parent group key.
 * Items not listed here remain as top-level items.
 */
const ITEM_TO_GROUP: Record<string, string> = {
  menus: 'nav-group-menus',
  'quiz-templates': 'nav-group-feedback',
  'quiz-answers': 'nav-group-feedback',
  'quiz-active': 'nav-group-feedback',
  'tenant-themes': 'nav-group-settings',
  'nav-account-settings': 'nav-group-settings',
  'nav-white-label': 'nav-group-settings',
  'nav-team': 'nav-group-settings',
  tenants: 'nav-group-admin',
  users: 'nav-group-admin',
};

const GROUP_ORDER_MENUS = 100;
const GROUP_ORDER_FEEDBACK = 200;
const GROUP_ORDER_SETTINGS = 300;
const GROUP_ORDER_ADMIN = 400;

interface GroupDefinition {
  key: string;
  labelKey: string;
  icon: string;
  order: number;
}

const GROUP_DEFINITIONS: Record<string, GroupDefinition> = {
  'nav-group-menus': {
    key: 'nav-group-menus',
    labelKey: 'menu.menusGroup',
    icon: 'forkKnife',
    order: GROUP_ORDER_MENUS,
  },
  'nav-group-feedback': {
    key: 'nav-group-feedback',
    labelKey: 'menu.feedbackGroup',
    icon: 'memo',
    order: GROUP_ORDER_FEEDBACK,
  },
  'nav-group-settings': {
    key: 'nav-group-settings',
    labelKey: 'menu.settingsGroup',
    icon: 'settings',
    order: GROUP_ORDER_SETTINGS,
  },
  'nav-group-admin': {
    key: 'nav-group-admin',
    labelKey: 'menu.adminGroup',
    icon: 'shield',
    order: GROUP_ORDER_ADMIN,
  },
};

function buildGroupItem(groupKey: string, children: SidebarItem[]): SidebarItem | undefined {
  const definition = GROUP_DEFINITIONS[groupKey];
  if (!isValueDefined(definition)) return undefined;

  const sorted = [...children].sort((a, b) => a.order - b.order);

  return {
    key: definition.key,
    labelKey: definition.labelKey,
    icon: definition.icon,
    route: sorted[0].route,
    order: definition.order,
    children: sorted,
  };
}

/**
 * Groups flat sidebar items into expandable sections.
 *
 * Takes the flat list of items from the module registry and returns
 * a new list where related items are nested under group parent items.
 * Items not mapped to a group remain as top-level items.
 */
export function groupSidebarItems(items: SidebarItem[]): SidebarItem[] {
  const groups = new Map<string, SidebarItem[]>();
  const topLevel: SidebarItem[] = [];

  for (const item of items) {
    const groupKey = ITEM_TO_GROUP[item.key];

    if (!isValueDefined(groupKey)) {
      topLevel.push(item);
      continue;
    }

    const existing = groups.get(groupKey);
    if (isValueDefined(existing)) existing.push(item);
    else groups.set(groupKey, [item]);
  }

  const groupItems: SidebarItem[] = [];

  for (const [groupKey, children] of groups) {
    const groupItem = buildGroupItem(groupKey, children);
    if (isValueDefined(groupItem)) groupItems.push(groupItem);
  }

  return [...topLevel, ...groupItems].sort((a, b) => a.order - b.order);
}
