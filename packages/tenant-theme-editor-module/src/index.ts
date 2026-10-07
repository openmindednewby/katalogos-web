import type { Module } from '@baseclient/core';

export const TENANT_THEME_EDITOR_MODULE_NAME = 'tenant-theme-editor';

/** Tenant Theme Editor Module - Theme Customization */
export const tenantThemeEditorModule: Module = {
  name: TENANT_THEME_EDITOR_MODULE_NAME,
  displayName: 'Theme Editor',
  requiredService: 'identity',
  sidebarItems: [
    {
      key: 'tenant-themes',
      labelKey: 'menu.tenantThemes',
      route: '/tenant-themes',
      icon: 'edit',
      requiredRoles: ['admin', 'superUser'],
      order: 70,
    },
  ],
  routes: [],
};

export default tenantThemeEditorModule;
