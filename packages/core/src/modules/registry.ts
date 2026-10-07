import type { Module, SidebarItem, ModuleRoute, ModuleConfig } from './types';

class ModuleRegistry {
  private modules = new Map<string, Module>();
  private config: ModuleConfig = {
    enabledModules: [],
    services: {
      identity: true,
      onlinemenu: true,
      questioner: true,
    },
  };

  configure(config: Partial<ModuleConfig>): void {
    this.config = { ...this.config, ...config };
  }

  register(module: Module): void {
    if (!this.config.services[module.requiredService]) {
      console.warn(`Module ${module.name} skipped - service ${module.requiredService} is disabled`);
      return;
    }

    if (this.modules.has(module.name)) return;

    this.modules.set(module.name, module);
  }

  unregister(moduleName: string): void {
    this.modules.delete(moduleName);
  }

  getModule(name: string): Module | undefined {
    return this.modules.get(name);
  }

  getModules(): Module[] {
    return Array.from(this.modules.values());
  }

  getSidebarItems(): SidebarItem[] {
    const items = Array.from(this.modules.values())
      .flatMap((m) => m.sidebarItems)
      .sort((a, b) => a.order - b.order);
    return items;
  }

  getSidebarItemsForRoles(userRoles: string[]): SidebarItem[] {
    return this.getSidebarItems().filter((item) => {
      if (!item.requiredRoles || item.requiredRoles.length === 0) 
        return true;
      
      return item.requiredRoles.some((role) => userRoles.includes(role));
    });
  }

  getRoutes(): ModuleRoute[] {
    return Array.from(this.modules.values()).flatMap((m) => m.routes);
  }

  hasModule(name: string): boolean {
    return this.modules.has(name);
  }

  getConfig(): ModuleConfig {
    return { ...this.config };
  }

  isServiceEnabled(service: 'identity' | 'onlinemenu' | 'questioner'): boolean {
    return this.config.services[service];
  }

  clear(): void {
    this.modules.clear();
  }
}

export const moduleRegistry = new ModuleRegistry();

export default moduleRegistry;
