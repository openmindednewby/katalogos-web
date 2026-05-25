import Constants from 'expo-constants';

import { isValueDefined } from '../utils/is';

const ENV = {
  dev: {
    EXPO_PUBLIC_ENABLE_PWA_PROMPTS: true,
    EXPO_PUBLIC_IS_TAG_HEURE_QUIZZ_FILLER: true,
    KEYCLOAK_ISSUER: 'https://identity.dloizides.com/realms/onlinemenu',
    KEYCLOAK_CLIENT_ID: 'online-menu-client',
    KEYCLOAK_REDIRECT_URI: 'http://localhost:8084',
    KEYCLOAK_SCOPES: 'openid profile email offline_access',
    USE_DIRECT_KC_AUTH: true,                         // Step 2 cutover — flip false to roll back
    APP_BASE_URL: 'http://localhost:8084',          // Public-facing base URL for menu links
    API_URL: 'https://localhost:5006',              // OnlineMenuSaaS Business API
    IDENTITY_API_URL: 'http://localhost:5002',      // IdentityService API (Auth, Users, Tenants)
    QUESTIONER_API_URL: 'https://localhost:5004',   // QuestionerService API
    CONTENT_API_URL: 'http://localhost:5009',       // ContentService API (Content uploads)
    NOTIFICATION_API_URL: 'http://localhost:5015',  // NotificationService API (SMS, Email)
    NOTIFICATION_HUB_URL: 'http://localhost:5015/hubs/notifications',  // SignalR Hub for real-time notifications
    PAYMENT_API_URL: 'http://localhost:5018',       // PaymentService API (Billing, Subscriptions)
    VITE_VERSION: '1.0.0',
    // Feature Flags - Micro-Frontend Modules
    FEATURE_IDENTITY_MODULE: true,    // Identity module (users, tenants) - always enabled
    FEATURE_QUESTIONER_MODULE: true,  // Questioner module (quiz templates, answers)
    FEATURE_ONLINEMENU_MODULE: true,  // OnlineMenu module (menus, categories)
    FEATURE_TENANT_THEME_EDITOR_MODULE: true,  // Tenant Theme Editor module (theme CRUD)
    // Feature Flags - Granular Features
    FEATURE_ENABLE_THEME_EDITOR: true,     // Theme editor / showcase section
    FEATURE_ENABLE_INSTALL_PROMPT: true,   // PWA install prompt
    FEATURE_ANALYTICS_ENABLED: true,       // Analytics tracking
    FEATURE_UNIFIED_AUTH_WEB: true,        // Route auth through @dloizides/auth-web
    // Theme Editor URL
    THEME_EDITOR_URL: 'http://localhost:4446/',
    // Analytics - Provider Configuration
    ANALYTICS_UMAMI_URL: 'http://localhost:3001',
    ANALYTICS_UMAMI_WEBSITE_ID: '',        // Generated on first Umami run
    ANALYTICS_POSTHOG_KEY: '',
    ANALYTICS_POSTHOG_HOST: '',
    ANALYTICS_POSTHOG_ENABLED: false,
    // Sentry Error Monitoring
    SENTRY_DSN: '',                          // Empty = Sentry disabled in dev
    SENTRY_ENVIRONMENT: 'development',
    SENTRY_TRACES_SAMPLE_RATE: 0,            // No performance tracing in Phase 1
  },
  test: {
    EXPO_PUBLIC_ENABLE_PWA_PROMPTS: true,
    EXPO_PUBLIC_IS_TAG_HEURE_QUIZZ_FILLER: true,
    KEYCLOAK_ISSUER: 'https://identity.dloizides.com/realms/onlinemenu',
    KEYCLOAK_CLIENT_ID: 'online-menu-client',
    KEYCLOAK_REDIRECT_URI: 'https://katalogos.dloizides.com',
    KEYCLOAK_SCOPES: 'openid profile email offline_access',
    USE_DIRECT_KC_AUTH: true,                         // Step 2 cutover — flip false to roll back
    APP_BASE_URL: 'https://katalogos.dloizides.com',  // Public-facing base URL for menu links
    API_URL: 'https://katalogos-api.dloizides.com',
    IDENTITY_API_URL: 'https://identity-api.dloizides.com',  // IdentityService in test
    QUESTIONER_API_URL: 'https://questioner-api.dloizides.com',  // QuestionerService in test
    CONTENT_API_URL: 'https://content-api.dloizides.com',  // ContentService in test
    NOTIFICATION_API_URL: 'https://notification-api.dloizides.com',  // NotificationService in test
    NOTIFICATION_HUB_URL: 'https://notification-api.dloizides.com/hubs/notifications',  // SignalR Hub in test (same host as Notification API)
    PAYMENT_API_URL: 'https://payment-api.dloizides.com',  // PaymentService in test
    VITE_VERSION: '1.0.0',
    // Feature Flags - Micro-Frontend Modules
    FEATURE_IDENTITY_MODULE: true,
    FEATURE_QUESTIONER_MODULE: true,
    FEATURE_ONLINEMENU_MODULE: true,
    FEATURE_TENANT_THEME_EDITOR_MODULE: true,  // Tenant Theme Editor module (theme CRUD)
    // Feature Flags - Granular Features
    FEATURE_ENABLE_THEME_EDITOR: true,     // Theme editor / showcase section
    FEATURE_ENABLE_INSTALL_PROMPT: true,   // PWA install prompt
    FEATURE_ANALYTICS_ENABLED: true,       // Analytics tracking
    FEATURE_UNIFIED_AUTH_WEB: true,        // Route auth through @dloizides/auth-web
    // Theme Editor URL
    THEME_EDITOR_URL: 'https://theme-studio.dloizides.com/',
    // Analytics - Provider Configuration
    ANALYTICS_UMAMI_URL: '',
    ANALYTICS_UMAMI_WEBSITE_ID: '',
    ANALYTICS_POSTHOG_KEY: '',
    ANALYTICS_POSTHOG_HOST: '',
    ANALYTICS_POSTHOG_ENABLED: false,
    // Sentry Error Monitoring
    SENTRY_DSN: '',                          // Empty = Sentry disabled in test
    SENTRY_ENVIRONMENT: 'test',
    SENTRY_TRACES_SAMPLE_RATE: 0,
  },
  prod: {
    EXPO_PUBLIC_ENABLE_PWA_PROMPTS: true,
    EXPO_PUBLIC_IS_TAG_HEURE_QUIZZ_FILLER: true,
    KEYCLOAK_ISSUER: 'https://identity.dloizides.com/realms/onlinemenu',
    KEYCLOAK_CLIENT_ID: 'online-menu-client',
    KEYCLOAK_REDIRECT_URI: 'https://katalogos.dloizides.com',
    KEYCLOAK_SCOPES: 'openid profile email offline_access',
    USE_DIRECT_KC_AUTH: true,                         // Step 2 cutover — flip false to roll back
    APP_BASE_URL: 'https://katalogos.dloizides.com', // Public-facing base URL for menu links
    API_URL: 'https://katalogos-api.dloizides.com',
    IDENTITY_API_URL: 'https://identity-api.dloizides.com',  // IdentityService in prod
    QUESTIONER_API_URL: 'https://questioner-api.dloizides.com',  // QuestionerService in prod
    CONTENT_API_URL: 'https://content-api.dloizides.com',  // ContentService in prod
    NOTIFICATION_API_URL: 'https://notification-api.dloizides.com',  // NotificationService in prod
    NOTIFICATION_HUB_URL: 'https://notification-api.dloizides.com/hubs/notifications',  // SignalR Hub in prod (same host as Notification API)
    PAYMENT_API_URL: 'https://payment-api.dloizides.com',  // PaymentService in prod
    VITE_VERSION: '1.0.0',
    // Feature Flags - Micro-Frontend Modules
    FEATURE_IDENTITY_MODULE: true,
    FEATURE_QUESTIONER_MODULE: true,
    FEATURE_ONLINEMENU_MODULE: true,
    FEATURE_TENANT_THEME_EDITOR_MODULE: false,  // Tenant Theme Editor module (disabled in prod by default)
    // Feature Flags - Granular Features
    FEATURE_ENABLE_THEME_EDITOR: false,     // Theme editor / showcase section (disabled in prod by default)
    FEATURE_ENABLE_INSTALL_PROMPT: true,    // PWA install prompt
    FEATURE_ANALYTICS_ENABLED: true,       // Analytics tracking
    FEATURE_UNIFIED_AUTH_WEB: true,        // Route auth through @dloizides/auth-web
    // Theme Editor URL
    THEME_EDITOR_URL: 'https://theme-studio.menuflow.com/',
    // Analytics - Provider Configuration
    ANALYTICS_UMAMI_URL: '',
    ANALYTICS_UMAMI_WEBSITE_ID: '',
    ANALYTICS_POSTHOG_KEY: '',
    ANALYTICS_POSTHOG_HOST: '',
    ANALYTICS_POSTHOG_ENABLED: false,
    // Sentry Error Monitoring
    SENTRY_DSN: '',                          // Populated via env var in production
    SENTRY_ENVIRONMENT: 'production',
    SENTRY_TRACES_SAMPLE_RATE: 0,            // No performance tracing in Phase 1
  },
};

type EnvType = keyof typeof ENV;
export type AppEnv = (typeof ENV)[EnvType];

function parseEnvType(value: unknown): EnvType {
  const isValidEnvType = value === 'dev' || value === 'test' || value === 'prod';
  if (isValidEnvType) return value;
  return 'dev';
}

function readDirectKcAuthOverride(): boolean | undefined {
  // Per-build override: `EXPO_PUBLIC_USE_DIRECT_KC_AUTH=false` rolls Step 2 back
  // without code changes. Metro inlines the literal at build time.
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const value: string | undefined = process.env.EXPO_PUBLIC_USE_DIRECT_KC_AUTH;
  if (value === 'true') return true;
  if (value === 'false') return false;
  return undefined;
}

function getEnvVars(): AppEnv {
  // Direct literal access so Metro/Babel inlines the value at build time.
  // Indirect access (e.g. `const p = process.env; p.EXPO_PUBLIC_ENV`) is NOT
  // statically analysable and ships an undefined runtime read in the browser.
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const envValue: string | undefined = process.env.EXPO_PUBLIC_ENV;
  const extra: Record<string, unknown> | undefined = Constants.expoConfig?.extra;
  const extraEnvValue = extra?.env;

  const env = parseEnvType(envValue ?? extraEnvValue);
  const base = ENV[env];
  const override = readDirectKcAuthOverride();
  return !isValueDefined(override) ? base : { ...base, USE_DIRECT_KC_AUTH: override };
}

export default getEnvVars();
