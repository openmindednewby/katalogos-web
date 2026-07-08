/** Analytics event names used across the application. */
const enum AnalyticsEventName {
  // Core business
  MenuCreated = 'menu_created',
  MenuUpdated = 'menu_updated',
  MenuDeleted = 'menu_deleted',
  MenuDuplicated = 'menu_duplicated',
  MenuActivated = 'menu_activated',
  MenuDeactivated = 'menu_deactivated',
  MenuPublished = 'menu_published',
  MenuViewedPublic = 'menu_viewed_public',
  MenuShared = 'menu_shared',
  QrCodeDownloaded = 'qr_code_downloaded',
  QuizTemplateCreated = 'quiz_template_created',
  QuizCompleted = 'quiz_completed',
  NotificationReceived = 'notification_received',
  NotificationClicked = 'notification_clicked',
  UserInvited = 'user_invited',
  // Item popularity
  MenuItemViewed = 'menu_item_viewed',
  MenuItemClicked = 'menu_item_clicked',
  // Conversion funnel (UX Move 5) — consistent names + { product } across erevna/kefi/katalogos
  SignupStarted = 'signup_started',
  SignupCompleted = 'signup_completed',
  FirstValue = 'first_value',
  UpgradeViewed = 'upgrade_viewed',
  // Engagement
  PageViewed = 'page_viewed',
  FeatureUsed = 'feature_used',
  SearchPerformed = 'search_performed',
  ErrorEncountered = 'error_encountered',
  ThemeChanged = 'theme_changed',
  // Performance (Core Web Vitals)
  WebVital = 'web_vital',
}

export default AnalyticsEventName;
