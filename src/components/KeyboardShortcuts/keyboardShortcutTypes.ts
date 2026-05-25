/** Type definitions for the keyboard shortcuts system. */

/** A single keyboard shortcut binding. */
export interface KeyboardShortcut {
  /** Unique identifier for the shortcut. */
  id: string;
  /** Translation key for the shortcut description. */
  labelKey: string;
  /** Primary key to match (e.g. 's', '1', '?', '/'). */
  key: string;
  /** Whether Ctrl (or Cmd on Mac) is required. */
  ctrlOrMeta?: boolean;
  /** Whether Alt is required. */
  alt?: boolean;
  /** Whether Shift is required. */
  shift?: boolean;
  /** Callback when the shortcut fires. */
  handler: () => void;
  /** Whether the shortcut should be suppressed when a text input is focused. */
  suppressInInput?: boolean;
}

/** A category grouping shortcuts for display in the help modal. */
export interface ShortcutCategory {
  /** Translation key for the category title. */
  titleKey: string;
  /** Shortcuts in this category. */
  shortcuts: ShortcutDisplayInfo[];
}

/** Display-only info for a shortcut (no handler). */
export interface ShortcutDisplayInfo {
  /** Translation key for the shortcut description. */
  labelKey: string;
  /** Human-readable key combination strings (e.g. ["Ctrl+S"]). */
  keyCombinations: string[];
}
