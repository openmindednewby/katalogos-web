
const BFF_API_PREFIX = '/bff/api';

/** Per-service BFF base URLs, keyed by the orval mutator they back. Each is */
export const BFF_API_BASE = {
  /** OnlineMenu API — core menu CRUD. */
  menus: `${BFF_API_PREFIX}/menus`,
  /** ContentService — image / content uploads. */
  content: `${BFF_API_PREFIX}/content`,
  /** TenantService — users, tenants (formerly identity-api). */
  tenants: `${BFF_API_PREFIX}/tenants`,
  /** NotificationService — SMS / email. */
  notifications: `${BFF_API_PREFIX}/notifications`,
  /** PaymentService — billing / subscriptions. */
  payments: `${BFF_API_PREFIX}/payments`,
  /** QuestionerService — quiz templates / answers (questioner feature module). */
  questioner: `${BFF_API_PREFIX}/questioner`,
} as const;
