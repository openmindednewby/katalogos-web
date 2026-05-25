/**
 * Shared test utilities for useMenuPageHandlers tests.
 */
import type { TenantMenusDto } from '../types/menuTypes';

/** Mock translation function for tests - returns the key resolved to its en.json value */
export function mockT(key: string): string {
  const translations: Record<string, string> = {
    'onlineMenus.errors.deleteFailed': 'Failed to delete menu',
    'onlineMenus.errors.activateFailed': 'Failed to activate menu',
    'onlineMenus.errors.deactivateFailed': 'Failed to deactivate menu',
    'onlineMenus.errors.openExternalFailed': 'Failed to open external link',
    'onlineMenus.errors.saveFailed': 'Failed to save menu',
    'onlineMenus.errors.duplicateName': 'A menu with this name already exists',
    'onlineMenus.messages.deleteSuccess': 'Menu deleted successfully',
    'onlineMenus.messages.activateSuccess': 'Menu activated',
    'onlineMenus.messages.deactivateSuccess': 'Menu deactivated',
    'onlineMenus.messages.createSuccess': 'Menu created successfully',
    'onlineMenus.messages.updateSuccess': 'Menu updated successfully',
  };
  return translations[key] ?? key;
}

/** Interface for mock mutation object */
export interface MockMutation {
  mutate: jest.Mock;
  isLoading?: boolean;
}

/** Creates a mock mutation object with optional mutate implementation */
export function createMockMutation(mutateImpl?: jest.Mock): MockMutation {
  return {
    mutate: mutateImpl ?? jest.fn(),
    isLoading: false,
  };
}

/** Creates a mock TenantMenusDto for testing */
export function createMockItem(overrides: Partial<TenantMenusDto> = {}): TenantMenusDto {
  return {
    externalId: 'menu-123',
    name: 'Test Menu',
    isActive: false,
    ...overrides,
  };
}

/** Interface for menu save callbacks */
export interface MockSaveCallbacks {
  onCloseModal: jest.Mock;
  refetchMenusSoon: jest.Mock;
}

/** Creates mock callbacks for useMenuSave */
export function createMockSaveCallbacks(): MockSaveCallbacks {
  return {
    onCloseModal: jest.fn(),
    refetchMenusSoon: jest.fn(),
  };
}

/** Sets up common mocks used across tests */
export function setupCommonMocks(): void {
  jest.clearAllMocks();
  // Mock window.location for web platform tests
  Object.defineProperty(global, 'window', {
    value: { location: { origin: 'https://test.com' } },
    writable: true,
  });
}
