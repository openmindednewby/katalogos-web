const enum MenuStatusEnum {
  Inactive = 0,
  Active = 1,
}

type MenuStatusInput = MenuStatusEnum | number | boolean | undefined;

function normalizeStatusValue(s: MenuStatusInput): MenuStatusEnum | undefined {
  if (typeof s === 'boolean')
    return s ? MenuStatusEnum.Active : MenuStatusEnum.Inactive;

  if (typeof s === 'number')
    return s;

  return undefined;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function menuStatusToLabelKey(s: MenuStatusInput): string {
  const normalized = normalizeStatusValue(s);
  if (normalized === MenuStatusEnum.Active) return 'onlineMenus.status.active';
  if (normalized === MenuStatusEnum.Inactive) return 'onlineMenus.status.inactive';
  return 'onlineMenus.status.inactive';
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function menuStatusToColorKey(s: MenuStatusInput | undefined): string {
  const normalized = normalizeStatusValue(s);
  if (normalized === MenuStatusEnum.Active) return 'success';
  return 'subtext';
}
