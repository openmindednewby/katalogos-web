/**
 * Notification hooks barrel export
 */
export {
  useGetNotificationPreferences,
  useUpdateNotificationPreferences,
} from './useNotificationPreferences';

export type {
  NotificationPreferences,
  CategoryPreference,
  DisplayPreference,
  NotificationCategoryKey,
} from './types';

export {
  DISPLAY_PREFERENCE_OPTIONS,
  NOTIFICATION_CATEGORIES,
} from './types';
