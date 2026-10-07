import { isNullOrUndefined } from '../../utils/is';

const PLATFORM_ZONE_SUFFIX = '.dloizides.com';
const PLATFORM_APEX = 'dloizides.com';
const LOCAL_HOSTS: readonly string[] = ['localhost', '127.0.0.1', '0.0.0.0', '[::1]'];

/** True when `hostname` is a tenant's custom domain (i.e. NOT a canonical platform host and */
export function isCustomDomainHost(hostname: string | undefined | null): boolean {
  if (isNullOrUndefined(hostname)) return false;
  const host = hostname.trim().toLowerCase();
  if (host === '') return false;
  if (LOCAL_HOSTS.includes(host)) return false;
  if (host === PLATFORM_APEX) return false;
  if (host.endsWith(PLATFORM_ZONE_SUFFIX)) return false;
  return true;
}
