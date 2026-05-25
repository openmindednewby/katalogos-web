import type { Module } from '@baseclient/core';

export const ONLINEMENU_MODULE_NAME = 'onlinemenu';

/**
 * OnlineMenu Module - Menu Management
 *
 * Required service: OnlineMenuService (port 5006)
 *
 * Features:
 * - Restaurant menu management
 * - Categories and items
 */
export const onlinemenuModule: Module = {
  name: ONLINEMENU_MODULE_NAME,
  displayName: 'Online Menu',
  requiredService: 'onlinemenu',
  sidebarItems: [
    {
      key: 'menus',
      labelKey: 'menu.onlineMenus',
      route: '/menus',
      icon: 'forkKnife',
      requiredRoles: ['admin', 'superUser'],
      order: 60,
    },
    {
      key: 'nav-analytics',
      labelKey: 'menu.analytics',
      route: '/analytics',
      icon: 'chart',
      requiredRoles: ['admin', 'superUser'],
      order: 65,
    },
  ],
  routes: [],
};

export default onlinemenuModule;
