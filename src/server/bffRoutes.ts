/**
 * BFF downstream route table (Phase 2 — Step 3 cutover).
 *
 * After the cutover, katalogos-web no longer talks to backend services
 * directly. Every API call goes same-origin to `bff-katalogos`, which
 * reverse-proxies `/bff/api/{segment}/*` to the matching downstream service
 * with the `Authorization: Bearer` attached server-side from its Redis token
 * vault. The SPA never sees a token.
 *
 * These segment paths MUST match the `Bff.Proxy.Downstreams[].Segment`
 * entries in `Services/Bff.Katalogos/src/Bff.Katalogos/appsettings.json`.
 * The BFF strips the `/bff/api/{segment}` prefix, so a generated hook's
 * `/api/v1/...` URL still arrives at the downstream unchanged.
 *
 * All values are root-relative (same-origin) — no host, no scheme.
 */

/** Base prefix every BFF-proxied API call shares. */
const BFF_API_PREFIX = '/bff/api';

/**
 * Per-service BFF base URLs, keyed by the orval mutator they back. Each is
 * used as the `baseURL` of the corresponding HTTP client.
 */
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
