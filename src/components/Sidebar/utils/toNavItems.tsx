/**
 * Maps the app's `SidebarItem[]` (from the module registry, grouped by
 * `groupSidebarItems`) into the `NavItem[]` shape consumed by the shared
 * `@dloizides/ui-nav` Sidebar: labels are pre-localized via `FM`, icons become
 * render slots, and `testID` keeps each item's stable key.
 */
import React from 'react';

import { FM } from '../../../localization/helpers';
import { isValueDefined } from '../../../utils/is';
import { ICON_PATHS, SvgIcon } from '../../Icons';

import type { IconName } from '../../Icons';
import type { SidebarItem } from '@baseclient/core';
import type { NavItem } from '@dloizides/ui-nav';

function isValidIconName(name: string): name is IconName {
  return name in ICON_PATHS;
}

function resolveIcon(icon: string | undefined): IconName | undefined {
  if (!isValueDefined(icon) || icon === '') return undefined;
  return isValidIconName(icon) ? icon : undefined;
}

function buildIconRenderer(icon: string | undefined): NavItem['renderIcon'] {
  const name = resolveIcon(icon);
  if (!isValueDefined(name)) return undefined;
  return function renderNavIcon(color: string, size: number): React.ReactNode {
    return <SvgIcon color={color} name={name} size={size} />;
  };
}

/** Recursively convert grouped sidebar items into config-driven nav items. */
export function toNavItems(items: SidebarItem[]): NavItem[] {
  return items.map((item) => {
    const children = isValueDefined(item.children) ? item.children : [];
    return {
      key: item.key,
      label: FM(item.labelKey),
      route: item.route,
      testID: item.key,
      renderIcon: buildIconRenderer(item.icon),
      children: children.length > 0 ? toNavItems(children) : undefined,
    };
  });
}
