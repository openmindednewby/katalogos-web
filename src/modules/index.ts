/**
 * Module Registration
 *
 * This file registers micro-frontend modules based on feature flags.
 * Feature flags are configured in:
 * - .env.dev / .env.test / .env.prod files
 * - src/config/environment.ts
 *
 * To create a different client variant (e.g., "survey-only"):
 * Set EXPO_PUBLIC_FEATURE_ONLINEMENU_MODULE=false in your .env file
 */

import { moduleRegistry } from '@baseclient/core';
import { identityModule } from '@baseclient/identity-module';
import { onlinemenuModule } from '@baseclient/onlinemenu-module';
import { questionerModule } from '@baseclient/questioner-module';
import { tenantThemeEditorModule } from '@baseclient/tenant-theme-editor-module';

import { featureFlags, getServiceConfig } from '../config/featureFlags';
import { logger } from '../utils/logger';

// Configure which services are enabled based on feature flags
moduleRegistry.configure({
  services: getServiceConfig(),
});

// Log feature flag status in development
if (__DEV__) {
  logger.debug('modules', 'Feature Flags:', featureFlags);
  logger.debug('modules', 'Service Config:', getServiceConfig());
}

// Register modules based on feature flags
// Each module will only register if its required service is enabled
if (featureFlags.identityModule) 
  moduleRegistry.register(identityModule);


if (featureFlags.questionerModule) 
  moduleRegistry.register(questionerModule);


if (featureFlags.onlineMenuModule)
  moduleRegistry.register(onlinemenuModule);


if (featureFlags.tenantThemeEditorModule)
  moduleRegistry.register(tenantThemeEditorModule);


export { moduleRegistry };

// Re-export feature flags for use in components
export { featureFlags, isModuleEnabled } from '../config/featureFlags';

// Re-export module names for convenience
export { IDENTITY_MODULE_NAME } from '@baseclient/identity-module';
export { QUESTIONER_MODULE_NAME } from '@baseclient/questioner-module';
export { ONLINEMENU_MODULE_NAME } from '@baseclient/onlinemenu-module';
export { TENANT_THEME_EDITOR_MODULE_NAME } from '@baseclient/tenant-theme-editor-module';
