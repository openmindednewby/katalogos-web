export enum TenantStatusEnum {
  Disabled = 0,
  Enabled = 1,
}

/**
 * Map tenant status to translation key (use with i18n)
 */
export type TenantStatusInput = TenantStatusEnum | number | boolean | undefined;

function normalizeStatusValue(s: TenantStatusInput): TenantStatusEnum | undefined {
  if (typeof s === 'boolean')
    return s ? TenantStatusEnum.Enabled : TenantStatusEnum.Disabled;

  if (typeof s === 'number')
    return s;

  return undefined;
}

export function tenantStatusToLabelKey(s: TenantStatusInput): string {
  const normalized = normalizeStatusValue(s);
  if (normalized === TenantStatusEnum.Enabled) return 'tenants.status.enabled';
  if (normalized === TenantStatusEnum.Disabled) return 'tenants.status.disabled';
  return 'tenants.status.disabled';
}

/**
 * Map tenant status to a semantic color key used by the theme palette.
 * Caller should resolve the actual color from the palette.
 */
export function tenantStatusToColorKey(s: TenantStatusInput | undefined): string {
  const normalized = normalizeStatusValue(s);
  if (normalized === TenantStatusEnum.Enabled) return 'success';
  return 'subtext';
}

export default TenantStatusEnum;
