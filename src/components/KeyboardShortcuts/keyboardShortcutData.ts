/**
 * Static shortcut definitions for the help modal.
 * These define what is displayed, not what is registered --
 * registration happens in the provider and consuming components.
 */
import { getModifierLabel } from './utils/platformUtils';

import type { ShortcutCategory } from './keyboardShortcutTypes';

/** Builds the global shortcuts category. */
function buildGlobalCategory(mod: string): ShortcutCategory {
  return {
    titleKey: 'keyboardShortcuts.categoryGlobal',
    shortcuts: [
      { labelKey: 'keyboardShortcuts.save', keyCombinations: [`${mod}+S`] },
      { labelKey: 'keyboardShortcuts.commandPalette', keyCombinations: [`${mod}+K`] },
      { labelKey: 'keyboardShortcuts.closeModal', keyCombinations: ['Esc'] },
      { labelKey: 'keyboardShortcuts.showHelp', keyCombinations: ['?', `${mod}+/`] },
    ],
  };
}

/** Builds the editor shortcuts category. */
function buildEditorCategory(mod: string): ShortcutCategory {
  return {
    titleKey: 'keyboardShortcuts.categoryEditor',
    shortcuts: [
      { labelKey: 'keyboardShortcuts.undo', keyCombinations: [`${mod}+Z`] },
      { labelKey: 'keyboardShortcuts.redo', keyCombinations: [`${mod}+Y`, `${mod}+Shift+Z`] },
      { labelKey: 'keyboardShortcuts.addCategory', keyCombinations: [`${mod}+Shift+N`] },
      { labelKey: 'keyboardShortcuts.duplicateItem', keyCombinations: [`${mod}+D`] },
    ],
  };
}

/** Builds the navigation shortcuts category. */
function buildNavigationCategory(): ShortcutCategory {
  return {
    titleKey: 'keyboardShortcuts.categoryNavigation',
    shortcuts: [
      { labelKey: 'keyboardShortcuts.navDashboard', keyCombinations: ['Alt+1'] },
      { labelKey: 'keyboardShortcuts.navMenus', keyCombinations: ['Alt+2'] },
      { labelKey: 'keyboardShortcuts.navSettings', keyCombinations: ['Alt+3'] },
    ],
  };
}

/** Builds the display data for the keyboard shortcuts help modal. */
export function buildShortcutCategories(): ShortcutCategory[] {
  const mod = getModifierLabel();
  return [buildGlobalCategory(mod), buildEditorCategory(mod), buildNavigationCategory()];
}
