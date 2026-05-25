import { groupSidebarItems } from './groupSidebarItems';

import type { SidebarItem } from '@baseclient/core';

function makeItem(overrides: Partial<SidebarItem> & { key: string }): SidebarItem {
  return {
    labelKey: `menu.${overrides.key}`,
    route: `/${overrides.key}`,
    order: 0,
    ...overrides,
  };
}

describe('groupSidebarItems', () => {
  it('groups menus item under menus group', () => {
    const items = [makeItem({ key: 'menus', order: 60 })];
    const result = groupSidebarItems(items);

    expect(result).toHaveLength(1);
    expect(result[0].key).toBe('nav-group-menus');
    expect(result[0].children).toHaveLength(1);
    expect(result[0].children?.[0].key).toBe('menus');
  });

  it('groups questioner items under feedback group', () => {
    const items = [
      makeItem({ key: 'quiz-templates', order: 30 }),
      makeItem({ key: 'quiz-answers', order: 40 }),
      makeItem({ key: 'quiz-active', order: 50 }),
    ];
    const result = groupSidebarItems(items);

    expect(result).toHaveLength(1);
    expect(result[0].key).toBe('nav-group-feedback');
    expect(result[0].children).toHaveLength(3);
    expect(result[0].children?.map((c) => c.key)).toEqual([
      'quiz-templates',
      'quiz-answers',
      'quiz-active',
    ]);
  });

  it('groups admin items under admin group', () => {
    const items = [
      makeItem({ key: 'tenants', order: 10 }),
      makeItem({ key: 'users', order: 20 }),
    ];
    const result = groupSidebarItems(items);

    expect(result).toHaveLength(1);
    expect(result[0].key).toBe('nav-group-admin');
    expect(result[0].children).toHaveLength(2);
  });

  it('groups tenant-themes under settings group', () => {
    const items = [makeItem({ key: 'tenant-themes', order: 70 })];
    const result = groupSidebarItems(items);

    expect(result).toHaveLength(1);
    expect(result[0].key).toBe('nav-group-settings');
    expect(result[0].children).toHaveLength(1);
    expect(result[0].children?.[0].key).toBe('tenant-themes');
  });

  it('keeps unknown items as top-level', () => {
    const items = [makeItem({ key: 'some-unknown', order: 5 })];
    const result = groupSidebarItems(items);

    expect(result).toHaveLength(1);
    expect(result[0].key).toBe('some-unknown');
    expect(result[0].children).toBeUndefined();
  });

  it('sorts groups by group order', () => {
    const items = [
      makeItem({ key: 'tenants', order: 10 }),
      makeItem({ key: 'menus', order: 60 }),
      makeItem({ key: 'quiz-templates', order: 30 }),
      makeItem({ key: 'tenant-themes', order: 70 }),
    ];
    const result = groupSidebarItems(items);

    expect(result.map((r) => r.key)).toEqual([
      'nav-group-menus',
      'nav-group-feedback',
      'nav-group-settings',
      'nav-group-admin',
    ]);
  });

  it('sorts children within a group by their original order', () => {
    const items = [
      makeItem({ key: 'quiz-active', order: 50 }),
      makeItem({ key: 'quiz-templates', order: 30 }),
      makeItem({ key: 'quiz-answers', order: 40 }),
    ];
    const result = groupSidebarItems(items);

    const children = result[0].children;
    expect(children?.map((c) => c.key)).toEqual([
      'quiz-templates',
      'quiz-answers',
      'quiz-active',
    ]);
  });

  it('returns empty array for empty input', () => {
    const result = groupSidebarItems([]);
    expect(result).toEqual([]);
  });

  it('handles mix of grouped and ungrouped items', () => {
    const items = [
      makeItem({ key: 'some-custom', order: 5 }),
      makeItem({ key: 'menus', order: 60 }),
      makeItem({ key: 'tenants', order: 10 }),
    ];
    const result = groupSidebarItems(items);

    expect(result).toHaveLength(3);
    expect(result[0].key).toBe('some-custom');
    expect(result[1].key).toBe('nav-group-menus');
    expect(result[2].key).toBe('nav-group-admin');
  });

  it('assigns correct label keys and icons to groups', () => {
    const items = [
      makeItem({ key: 'menus', order: 60 }),
      makeItem({ key: 'quiz-templates', order: 30 }),
      makeItem({ key: 'tenant-themes', order: 70 }),
      makeItem({ key: 'tenants', order: 10 }),
    ];
    const result = groupSidebarItems(items);

    const menusGroup = result.find((r) => r.key === 'nav-group-menus');
    expect(menusGroup?.labelKey).toBe('menu.menusGroup');
    expect(menusGroup?.icon).toBe('forkKnife');

    const feedbackGroup = result.find((r) => r.key === 'nav-group-feedback');
    expect(feedbackGroup?.labelKey).toBe('menu.feedbackGroup');
    expect(feedbackGroup?.icon).toBe('memo');

    const settingsGroup = result.find((r) => r.key === 'nav-group-settings');
    expect(settingsGroup?.labelKey).toBe('menu.settingsGroup');
    expect(settingsGroup?.icon).toBe('settings');

    const adminGroup = result.find((r) => r.key === 'nav-group-admin');
    expect(adminGroup?.labelKey).toBe('menu.adminGroup');
    expect(adminGroup?.icon).toBe('shield');
  });
});
