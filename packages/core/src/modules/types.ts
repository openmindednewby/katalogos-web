import type { ComponentType } from 'react';

export interface SidebarItem {
  key: string;
  labelKey: string; // i18n key
  route: string;
  icon?: string;
  requiredRoles?: string[];
  order: number;
  /** Nested children for expandable sidebar sections (supports recursive nesting). */
  children?: SidebarItem[];
}

export interface ModuleRoute {
  path: string;
  component: ComponentType;
}

export interface Module {
  name: string;
  displayName: string;
  sidebarItems: SidebarItem[];
  routes: ModuleRoute[];
  requiredService: 'identity' | 'onlinemenu' | 'questioner';
}

export interface ModuleConfig {
  enabledModules: string[];
  services: {
    identity: boolean;
    onlinemenu: boolean;
    questioner: boolean;
  };
}
