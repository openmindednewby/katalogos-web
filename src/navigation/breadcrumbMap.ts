/**
 * Breadcrumb configuration mapping settings paths to their crumb trails.
 * Each entry defines the full hierarchy from root to the current page.
 */
import { Routes } from './routes';

export interface BreadcrumbItem {
  labelKey: string;
  route?: Routes;
}

/**
 * Maps each settings sub-path to its breadcrumb trail.
 * The last item in each array is the current (terminal) crumb.
 */
export const BREADCRUMB_MAP: Record<string, BreadcrumbItem[]> = {
  [Routes.PROFILE_SETTINGS]: [
    { labelKey: 'settings.hub.title', route: Routes.ACCOUNT_SETTINGS },
    { labelKey: 'settings.profile.title' },
  ],
  [Routes.SECURITY_SETTINGS]: [
    { labelKey: 'settings.hub.title', route: Routes.ACCOUNT_SETTINGS },
    { labelKey: 'settings.security.title' },
  ],
  [Routes.PREFERENCES_SETTINGS]: [
    { labelKey: 'settings.hub.title', route: Routes.ACCOUNT_SETTINGS },
    { labelKey: 'settings.preferences.title' },
  ],
  [Routes.PRIVACY_SETTINGS]: [
    { labelKey: 'settings.hub.title', route: Routes.ACCOUNT_SETTINGS },
    { labelKey: 'settings.privacy.title' },
  ],
  [Routes.BILLING_SETTINGS]: [
    { labelKey: 'settings.hub.title', route: Routes.ACCOUNT_SETTINGS },
    { labelKey: 'settings.billing.title' },
  ],
  [Routes.CUSTOM_DOMAIN_SETTINGS]: [
    { labelKey: 'settings.hub.title', route: Routes.ACCOUNT_SETTINGS },
    { labelKey: 'settings.customDomain.title' },
  ],
  [Routes.BUSINESS_PROFILE_SETTINGS]: [
    { labelKey: 'settings.hub.title', route: Routes.ACCOUNT_SETTINGS },
    { labelKey: 'settings.businessProfile.title' },
  ],
  [Routes.LOCATION_SETTINGS]: [
    { labelKey: 'settings.hub.title', route: Routes.ACCOUNT_SETTINGS },
    { labelKey: 'settings.locations.title' },
  ],
  [Routes.THEME_SETTINGS]: [
    { labelKey: 'settings.hub.title', route: Routes.ACCOUNT_SETTINGS },
    { labelKey: 'settings.themeSettings.title' },
  ],
  [Routes.NOTIFICATION_PREFERENCES]: [
    { labelKey: 'settings.hub.title', route: Routes.ACCOUNT_SETTINGS },
    { labelKey: 'settings.notificationPreferences.title' },
  ],
  [Routes.WHITE_LABEL_SETTINGS]: [
    { labelKey: 'settings.hub.title', route: Routes.ACCOUNT_SETTINGS },
    { labelKey: 'settings.whiteLabel.title' },
  ],
  [Routes.TEAM_SETTINGS]: [
    { labelKey: 'settings.hub.title', route: Routes.ACCOUNT_SETTINGS },
    { labelKey: 'settings.team.title' },
  ],
};
