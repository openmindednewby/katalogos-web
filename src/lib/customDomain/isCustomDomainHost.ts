/**
 * Hosts the custom-domain resolve-glue must treat as "NOT a custom domain" (the canonical
 * platform hosts + local dev). On any of these the glue is a no-op; on anything else the
 * visitor reached a tenant's bring-your-own domain (e.g. `menu.acme.com`) and the SPA must
 * resolve it to the tenant's menu.
 *
 * The platform's own zone is `*.dloizides.com` (covers katalogos.dloizides.com,
 * staging.katalogos.dloizides.com, katalogos-api.dloizides.com, …) plus the apex.
 */
import { isNullOrUndefined } from '../../utils/is';

const PLATFORM_ZONE_SUFFIX = '.dloizides.com';
const PLATFORM_APEX = 'dloizides.com';
const LOCAL_HOSTS: readonly string[] = ['localhost', '127.0.0.1', '0.0.0.0', '[::1]'];

/**
 * True when `hostname` is a tenant's custom domain (i.e. NOT a canonical platform host and
 * NOT local dev). `hostname` is `window.location.hostname` — no port, already lower-cased by
 * the browser. An empty/unknown host is treated as non-custom (safe no-op).
 */
export function isCustomDomainHost(hostname: string | undefined | null): boolean {
  if (isNullOrUndefined(hostname)) return false;
  const host = hostname.trim().toLowerCase();
  if (host === '') return false;
  if (LOCAL_HOSTS.includes(host)) return false;
  if (host === PLATFORM_APEX) return false;
  if (host.endsWith(PLATFORM_ZONE_SUFFIX)) return false;
  return true;
}
