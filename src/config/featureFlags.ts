/**
 * Feature Flags Configuration
 *
 * Controls which micro-frontend modules are enabled in the application.
 * Flags can be set via:
 * 1. Environment variables (EXPO_PUBLIC_FEATURE_*)
 * 2. Environment config (src/config/environment.ts)
 *
 * To create a different client variant (e.g., survey-only),
 * set the corresponding feature flags to false in .env files.
 */

import env from './environment';
import { isValueDefined } from '../utils/is';

/**
 * Parse a boolean value from environment variable or config
 */
function parseBoolean(value: string | boolean | undefined, defaultValue: boolean): boolean {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string')
    return value.toLowerCase() === 'true' || value === '1';

  return defaultValue;
}

/**
 * Get feature flag value, preferring process.env over config
 */
function getFeatureFlag(
  envKey: string,
  configValue: boolean | undefined,
  defaultValue: boolean
): boolean {
  // Check process.env first (allows runtime override)
  const processEnv: Record<string, string | undefined> = process.env;
  const envValue = processEnv[envKey];
  if (isValueDefined(envValue))
    return parseBoolean(envValue, defaultValue);

  // Fall back to config value
  if (isValueDefined(configValue))
    return configValue;

  return defaultValue;
}

export interface FeatureFlags {
  /** Identity module - users and tenants management (always enabled) */
  identityModule: boolean;
  /** Questioner module - quiz templates, answers, active quizzes */
  questionerModule: boolean;
  /** OnlineMenu module - menu and category management */
  onlineMenuModule: boolean;
  /** Tenant Theme Editor module - theme CRUD management */
  tenantThemeEditorModule: boolean;
  /** Theme editor section - customization UI (showcase/native-forms) */
  enableThemeEditor: boolean;
  /** PWA install prompt for Theme Studio */
  enableInstallPrompt: boolean;
  /** Analytics tracking (Umami + PostHog) */
  analyticsEnabled: boolean;
  /**
   * Unified-auth: route login / forgot-password / reset-password through the
   * shared `@dloizides/auth-web` package instead of the local `src/auth/*`
   * code. Toggle off to fall back to the legacy local auth path.
   */
  unifiedAuthWeb: boolean;
}

/**
 * Safely get a boolean value from the environment config
 */
function getEnvBoolean(key: 'FEATURE_IDENTITY_MODULE' | 'FEATURE_QUESTIONER_MODULE' | 'FEATURE_ONLINEMENU_MODULE' | 'FEATURE_TENANT_THEME_EDITOR_MODULE' | 'FEATURE_ENABLE_THEME_EDITOR' | 'FEATURE_ENABLE_INSTALL_PROMPT' | 'FEATURE_ANALYTICS_ENABLED' | 'FEATURE_UNIFIED_AUTH_WEB'): boolean | undefined {
  const value = env[key];
  if (typeof value === 'boolean') return value;
  return undefined;
}

/**
 * Current feature flags based on environment configuration
 */
export const featureFlags: FeatureFlags = {
  // Identity is always enabled as it's required for authentication
  identityModule: getFeatureFlag(
    'EXPO_PUBLIC_FEATURE_IDENTITY_MODULE',
    getEnvBoolean('FEATURE_IDENTITY_MODULE'),
    true
  ),
  questionerModule: getFeatureFlag(
    'EXPO_PUBLIC_FEATURE_QUESTIONER_MODULE',
    getEnvBoolean('FEATURE_QUESTIONER_MODULE'),
    true
  ),
  onlineMenuModule: getFeatureFlag(
    'EXPO_PUBLIC_FEATURE_ONLINEMENU_MODULE',
    getEnvBoolean('FEATURE_ONLINEMENU_MODULE'),
    true
  ),
  tenantThemeEditorModule: getFeatureFlag(
    'EXPO_PUBLIC_FEATURE_TENANT_THEME_EDITOR_MODULE',
    getEnvBoolean('FEATURE_TENANT_THEME_EDITOR_MODULE'),
    true
  ),
  enableThemeEditor: getFeatureFlag(
    'EXPO_PUBLIC_ENABLE_THEME_EDITOR',
    getEnvBoolean('FEATURE_ENABLE_THEME_EDITOR'),
    true
  ),
  enableInstallPrompt: getFeatureFlag(
    'EXPO_PUBLIC_ENABLE_INSTALL_PROMPT',
    getEnvBoolean('FEATURE_ENABLE_INSTALL_PROMPT'),
    true
  ),
  analyticsEnabled: getFeatureFlag(
    'EXPO_PUBLIC_FEATURE_ANALYTICS_ENABLED',
    getEnvBoolean('FEATURE_ANALYTICS_ENABLED'),
    true
  ),
  unifiedAuthWeb: getFeatureFlag(
    'EXPO_PUBLIC_FEATURE_UNIFIED_AUTH_WEB',
    getEnvBoolean('FEATURE_UNIFIED_AUTH_WEB'),
    true
  ),
};

/**
 * Check if a specific module is enabled
 */
export function isModuleEnabled(module: keyof FeatureFlags): boolean {
  return featureFlags[module];
}

/**
 * Get service configuration based on feature flags
 * Maps feature flags to service enablement for moduleRegistry.configure()
 * Note: tenant-theme-editor uses requiredService 'identity' (no separate service needed)
 */
export const getServiceConfig = (): { identity: boolean; questioner: boolean; onlinemenu: boolean } => ({
  identity: featureFlags.identityModule,
  questioner: featureFlags.questionerModule,
  onlinemenu: featureFlags.onlineMenuModule,
});

export default featureFlags;
