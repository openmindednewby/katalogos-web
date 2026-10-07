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
    USE_DIRECT_KC_AUTH: true,
    APP_BASE_URL: 'http://localhost:8084',
    API_URL: 'https://localhost:5006',
    IDENTITY_API_URL: 'http://localhost:5002',
    QUESTIONER_API_URL: 'https://localhost:5004',
    CONTENT_API_URL: 'http://localhost:5009',
    NOTIFICATION_API_URL: 'http://localhost:5015',
    NOTIFICATION_HUB_URL: 'http://localhost:5015/hubs/notifications',
    PAYMENT_API_URL: 'http://localhost:5018',
    VITE_VERSION: '1.0.0',
    FEATURE_IDENTITY_MODULE: true,
    FEATURE_QUESTIONER_MODULE: true,
    FEATURE_ONLINEMENU_MODULE: true,
    FEATURE_TENANT_THEME_EDITOR_MODULE: true,
    FEATURE_ENABLE_THEME_EDITOR: true,
    FEATURE_ENABLE_INSTALL_PROMPT: true,
    FEATURE_ANALYTICS_ENABLED: true,
    FEATURE_UNIFIED_AUTH_WEB: true,
    THEME_EDITOR_URL: 'http://localhost:4446/',
    ANALYTICS_UMAMI_URL: 'http://localhost:3001',
    ANALYTICS_UMAMI_WEBSITE_ID: '',
    ANALYTICS_POSTHOG_KEY: '',
    ANALYTICS_POSTHOG_HOST: '',
    ANALYTICS_POSTHOG_ENABLED: false,
    SENTRY_DSN: '',
    SENTRY_ENVIRONMENT: 'development',
    SENTRY_TRACES_SAMPLE_RATE: 0,
  },
  test: {
    EXPO_PUBLIC_ENABLE_PWA_PROMPTS: true,
    EXPO_PUBLIC_IS_TAG_HEURE_QUIZZ_FILLER: true,
    KEYCLOAK_ISSUER: 'https://identity.dloizides.com/realms/onlinemenu',
    KEYCLOAK_CLIENT_ID: 'online-menu-client',
    KEYCLOAK_REDIRECT_URI: 'https://katalogos.dloizides.com',
    KEYCLOAK_SCOPES: 'openid profile email offline_access',
    USE_DIRECT_KC_AUTH: true,
    APP_BASE_URL: 'https://katalogos.dloizides.com',
    API_URL: 'https://katalogos-api.dloizides.com',
    IDENTITY_API_URL: 'https://identity-api.dloizides.com',
    QUESTIONER_API_URL: 'https://questioner-api.dloizides.com',
    CONTENT_API_URL: 'https://content-api.dloizides.com',
    NOTIFICATION_API_URL: 'https://notification-api.dloizides.com',
    NOTIFICATION_HUB_URL: 'https://notification-api.dloizides.com/hubs/notifications',
    PAYMENT_API_URL: 'https://payment-api.dloizides.com',
    VITE_VERSION: '1.0.0',
    FEATURE_IDENTITY_MODULE: true,
    FEATURE_QUESTIONER_MODULE: true,
    FEATURE_ONLINEMENU_MODULE: true,
    FEATURE_TENANT_THEME_EDITOR_MODULE: true,
    FEATURE_ENABLE_THEME_EDITOR: true,
    FEATURE_ENABLE_INSTALL_PROMPT: true,
    FEATURE_ANALYTICS_ENABLED: true,
    FEATURE_UNIFIED_AUTH_WEB: true,
    THEME_EDITOR_URL: 'https://theme-studio.dloizides.com/',
    ANALYTICS_UMAMI_URL: '',
    ANALYTICS_UMAMI_WEBSITE_ID: '',
    ANALYTICS_POSTHOG_KEY: '',
    ANALYTICS_POSTHOG_HOST: '',
    ANALYTICS_POSTHOG_ENABLED: false,
    SENTRY_DSN: '',
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
    USE_DIRECT_KC_AUTH: true,
    APP_BASE_URL: 'https://katalogos.dloizides.com',
    API_URL: 'https://katalogos-api.dloizides.com',
    IDENTITY_API_URL: 'https://identity-api.dloizides.com',
    QUESTIONER_API_URL: 'https://questioner-api.dloizides.com',
    CONTENT_API_URL: 'https://content-api.dloizides.com',
    NOTIFICATION_API_URL: 'https://notification-api.dloizides.com',
    NOTIFICATION_HUB_URL: 'https://notification-api.dloizides.com/hubs/notifications',
    PAYMENT_API_URL: 'https://payment-api.dloizides.com',
    VITE_VERSION: '1.0.0',
    FEATURE_IDENTITY_MODULE: true,
    FEATURE_QUESTIONER_MODULE: true,
    FEATURE_ONLINEMENU_MODULE: true,
    FEATURE_TENANT_THEME_EDITOR_MODULE: false,
    FEATURE_ENABLE_THEME_EDITOR: false,
    FEATURE_ENABLE_INSTALL_PROMPT: true,
    FEATURE_ANALYTICS_ENABLED: true,
    FEATURE_UNIFIED_AUTH_WEB: true,
    THEME_EDITOR_URL: 'https://theme-studio.menuflow.com/',
    ANALYTICS_UMAMI_URL: '',
    ANALYTICS_UMAMI_WEBSITE_ID: '',
    ANALYTICS_POSTHOG_KEY: '',
    ANALYTICS_POSTHOG_HOST: '',
    ANALYTICS_POSTHOG_ENABLED: false,
    SENTRY_DSN: '',
    SENTRY_ENVIRONMENT: 'production',
    SENTRY_TRACES_SAMPLE_RATE: 0,
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
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const value: string | undefined = process.env.EXPO_PUBLIC_USE_DIRECT_KC_AUTH;
  if (value === 'true') return true;
  if (value === 'false') return false;
  return undefined;
}

function getEnvVars(): AppEnv {
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
