/**
 * Registers keyboard shortcuts on the document.
 * Web-only -- no-op on native platforms.
 * Automatically suppresses shortcuts flagged with suppressInInput
 * when focus is inside a text input, textarea, select, or contentEditable.
 */
import { useEffect } from 'react';

import { Platform } from 'react-native';

import type { KeyboardShortcut } from '../components/KeyboardShortcuts/keyboardShortcutTypes';

const INPUT_TAG_NAMES = new Set(['INPUT', 'TEXTAREA', 'SELECT']);

function isTextInputFocused(): boolean {
  const active = document.activeElement;
  if (!(active instanceof HTMLElement)) return false;
  const isEditable = active.isContentEditable || active.contentEditable === 'true';
  return INPUT_TAG_NAMES.has(active.tagName) || isEditable;
}

function matchesShortcut(event: KeyboardEvent, shortcut: KeyboardShortcut): boolean {
  const wantsCtrlOrMeta = shortcut.ctrlOrMeta === true;
  const hasCtrlOrMeta = event.ctrlKey || event.metaKey;
  if (wantsCtrlOrMeta !== hasCtrlOrMeta) return false;

  const wantsAlt = shortcut.alt === true;
  if (wantsAlt !== event.altKey) return false;

  const wantsShift = shortcut.shift === true;
  if (wantsShift !== event.shiftKey) return false;

  return event.key.toLowerCase() === shortcut.key.toLowerCase();
}

export function useKeyboardShortcuts(
  shortcuts: KeyboardShortcut[],
  enabled = true,
): void {
  useEffect(() => {
    const isNotWebOrDisabled = Platform.OS !== 'web' || !enabled;
    if (isNotWebOrDisabled || shortcuts.length === 0) return;

    function handleKeyDown(event: KeyboardEvent): void {
      const inputFocused = isTextInputFocused();

      for (const shortcut of shortcuts) {
        if (shortcut.suppressInInput === true && inputFocused) continue;
        if (!matchesShortcut(event, shortcut)) continue;

        event.preventDefault();
        shortcut.handler();
        return;
      }
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => { document.removeEventListener('keydown', handleKeyDown); };
  }, [shortcuts, enabled]);
}
