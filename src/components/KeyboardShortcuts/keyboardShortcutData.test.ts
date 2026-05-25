import { buildShortcutCategories } from './keyboardShortcutData';

jest.mock('react-native', () => ({ Platform: { OS: 'web' } }));

describe('buildShortcutCategories', () => {
  it('returns three categories', () => {
    const categories = buildShortcutCategories();
    expect(categories).toHaveLength(3);
  });

  it('has Global, Editor, and Navigation title keys', () => {
    const categories = buildShortcutCategories();
    const titleKeys = categories.map((c) => c.titleKey);
    expect(titleKeys).toEqual([
      'keyboardShortcuts.categoryGlobal',
      'keyboardShortcuts.categoryEditor',
      'keyboardShortcuts.categoryNavigation',
    ]);
  });

  it('includes save shortcut in Global category', () => {
    const categories = buildShortcutCategories();
    const global = categories[0];
    const saveShortcut = global.shortcuts.find((s) => s.labelKey === 'keyboardShortcuts.save');
    expect(saveShortcut).toBeDefined();
    expect(saveShortcut?.keyCombinations[0]).toContain('+S');
  });

  it('includes undo/redo in Editor category', () => {
    const categories = buildShortcutCategories();
    const editor = categories[1];
    const labelKeys = editor.shortcuts.map((s) => s.labelKey);
    expect(labelKeys).toContain('keyboardShortcuts.undo');
    expect(labelKeys).toContain('keyboardShortcuts.redo');
  });

  it('navigation shortcuts use Alt modifier', () => {
    const categories = buildShortcutCategories();
    const nav = categories[2];
    for (const shortcut of nav.shortcuts) 
      expect(shortcut.keyCombinations[0]).toMatch(/^Alt\+/);
    
  });

  it('redo shortcut has two key combinations', () => {
    const categories = buildShortcutCategories();
    const editor = categories[1];
    const redo = editor.shortcuts.find((s) => s.labelKey === 'keyboardShortcuts.redo');
    expect(redo?.keyCombinations).toHaveLength(2);
  });
});
