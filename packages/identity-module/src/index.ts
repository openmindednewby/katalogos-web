import type { Module } from '@baseclient/core';

export const IDENTITY_MODULE_NAME = 'identity';

/**
 * Identity Module - User and Tenant Management
 *
 * Required service: IdentityService (port 5002)
 *
 * Features:
 * - User management (CRUD)
 * - Tenant management (CRUD)
 */
export const identityModule: Module = {
  name: IDENTITY_MODULE_NAME,
  displayName: 'Identity Management',
  requiredService: 'identity',
  sidebarItems: [
    {
      key: 'tenants',
      labelKey: 'menu.tenants',
      route: '/tenants',
      icon: 'building',
      requiredRoles: ['superUser'],
      order: 10,
    },
    {
      key: 'users',
      labelKey: 'menu.users',
      route: '/users',
      icon: 'people',
      requiredRoles: ['superUser'],
      order: 20,
    },
    {
      key: 'nav-account-settings',
      labelKey: 'menu.accountSettings',
      route: '/settings',
      icon: 'person',
      requiredRoles: [],
      order: 80,
    },
    {
      key: 'nav-white-label',
      labelKey: 'settings.whiteLabel.menuLabel',
      route: '/settings/white-label',
      icon: 'brush',
      requiredRoles: ['admin', 'superUser'],
      order: 85,
    },
    {
      key: 'nav-team',
      labelKey: 'settings.team.menuLabel',
      route: '/settings/team',
      icon: 'people',
      requiredRoles: ['admin'],
      order: 82,
    },
  ],
  routes: [],
};

export default identityModule;
