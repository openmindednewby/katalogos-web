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

  /**
   * Configure which modules and services are enabled
   */
  configure(config: Partial<ModuleConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Register a module with the registry
   */
  register(module: Module): void {
    // Check if the required service is enabled
    if (!this.config.services[module.requiredService]) {
      console.warn(`Module ${module.name} skipped - service ${module.requiredService} is disabled`);
      return;
    }

    // Skip duplicate registrations (can happen during route transitions)
    if (this.modules.has(module.name)) return;

    this.modules.set(module.name, module);
  }

  /**
   * Unregister a module
   */
  unregister(moduleName: string): void {
    this.modules.delete(moduleName);
  }

  /**
   * Get a specific module by name
   */
  getModule(name: string): Module | undefined {
    return this.modules.get(name);
  }

  /**
   * Get all registered modules
   */
  getModules(): Module[] {
    return Array.from(this.modules.values());
  }

  /**
   * Get all sidebar items from all modules, sorted by order
   */
  getSidebarItems(): SidebarItem[] {
    const items = Array.from(this.modules.values())
      .flatMap((m) => m.sidebarItems)
      .sort((a, b) => a.order - b.order);
    return items;
  }

  /**
   * Get sidebar items filtered by user roles
   */
  getSidebarItemsForRoles(userRoles: string[]): SidebarItem[] {
    return this.getSidebarItems().filter((item) => {
      if (!item.requiredRoles || item.requiredRoles.length === 0) 
        return true;
      
      return item.requiredRoles.some((role) => userRoles.includes(role));
    });
  }

  /**
   * Get all routes from all modules
   */
  getRoutes(): ModuleRoute[] {
    return Array.from(this.modules.values()).flatMap((m) => m.routes);
  }

  /**
   * Check if a module is registered
   */
  hasModule(name: string): boolean {
    return this.modules.has(name);
  }

  /**
   * Get the current configuration
   */
  getConfig(): ModuleConfig {
    return { ...this.config };
  }

  /**
   * Check if a service is enabled
   */
  isServiceEnabled(service: 'identity' | 'onlinemenu' | 'questioner'): boolean {
    return this.config.services[service];
  }

  /**
   * Clear all registered modules
   */
  clear(): void {
    this.modules.clear();
  }
}

// Singleton instance
export const moduleRegistry = new ModuleRegistry();

export default moduleRegistry;
