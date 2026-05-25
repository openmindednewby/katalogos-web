import TenantStatusEnum, {
  TenantStatusEnum as NamedTenantStatusEnum,
  tenantStatusToColorKey,
  tenantStatusToLabelKey,
} from "./TenantStatus";

describe("TenantStatus", () => {
  it("exports expected enum values", () => {
    expect(TenantStatusEnum.Enabled).toBe(1);
    expect(TenantStatusEnum.Disabled).toBe(0);
    expect(NamedTenantStatusEnum).toBe(TenantStatusEnum);
  });

  it("tenantStatusToLabelKey maps enabled/disabled across input types", () => {
    expect(tenantStatusToLabelKey(TenantStatusEnum.Enabled)).toBe("tenants.status.enabled");
    expect(tenantStatusToLabelKey(TenantStatusEnum.Disabled)).toBe("tenants.status.disabled");
    expect(tenantStatusToLabelKey(true)).toBe("tenants.status.enabled");
    expect(tenantStatusToLabelKey(false)).toBe("tenants.status.disabled");
    expect(tenantStatusToLabelKey(1)).toBe("tenants.status.enabled");
    expect(tenantStatusToLabelKey(0)).toBe("tenants.status.disabled");
    expect(tenantStatusToLabelKey(undefined)).toBe("tenants.status.disabled");
    expect(tenantStatusToLabelKey(999)).toBe("tenants.status.disabled");
  });

  it("tenantStatusToColorKey maps enabled to success and others to subtext", () => {
    expect(tenantStatusToColorKey(TenantStatusEnum.Enabled)).toBe("success");
    expect(tenantStatusToColorKey(true)).toBe("success");
    expect(tenantStatusToColorKey(1)).toBe("success");

    expect(tenantStatusToColorKey(TenantStatusEnum.Disabled)).toBe("subtext");
    expect(tenantStatusToColorKey(false)).toBe("subtext");
    expect(tenantStatusToColorKey(0)).toBe("subtext");
    expect(tenantStatusToColorKey(undefined)).toBe("subtext");
    expect(tenantStatusToColorKey(999)).toBe("subtext");
  });
});
