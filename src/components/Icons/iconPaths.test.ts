import { ICON_PATHS } from './iconPaths';

import type { IconName } from './iconPaths';

describe('iconPaths', () => {
  const allIconNames = Object.keys(ICON_PATHS);

  it('exports a non-empty icon registry', () => {
    expect(allIconNames.length).toBeGreaterThan(0);
  });

  it.each(allIconNames)('icon "%s" has at least one path', (name) => {
    const icon = ICON_PATHS[name as IconName];
    expect(icon.paths.length).toBeGreaterThan(0);
  });

  it.each(allIconNames)('icon "%s" paths all have non-empty d attribute', (name) => {
    const icon = ICON_PATHS[name as IconName];
    for (const path of icon.paths)
      expect(path.d.length).toBeGreaterThan(0);
  });

  it('contains all expected navigation icons', () => {
    const navigationIcons: IconName[] = ['menu', 'home', 'logout'];
    for (const name of navigationIcons)
      expect(ICON_PATHS[name]).toBeDefined();
  });

  it('contains all expected action icons', () => {
    const actionIcons: IconName[] = ['close', 'edit', 'trash', 'eye', 'link', 'refresh', 'lightning', 'qrCode', 'download', 'copy'];
    for (const name of actionIcons)
      expect(ICON_PATHS[name]).toBeDefined();
  });

  it('contains all expected chevron icons', () => {
    const chevronIcons: IconName[] = ['chevronDown', 'chevronUp', 'chevronLeft', 'chevronRight'];
    for (const name of chevronIcons)
      expect(ICON_PATHS[name]).toBeDefined();
  });

  it('contains all expected module icons', () => {
    const moduleIcons: IconName[] = ['document', 'checkmark', 'memo', 'forkKnife', 'building', 'people'];
    for (const name of moduleIcons)
      expect(ICON_PATHS[name]).toBeDefined();
  });

  it('contains all expected layout template icons', () => {
    const layoutIcons: IconName[] = ['grid', 'list', 'cards', 'compact', 'diamond'];
    for (const name of layoutIcons)
      expect(ICON_PATHS[name]).toBeDefined();
  });
});
