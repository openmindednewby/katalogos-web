/**
 * Web-only keyboard shortcut hook for editor undo/redo.
 * Listens for Ctrl+Z (undo), Ctrl+Y / Ctrl+Shift+Z (redo), and Meta variants.
 * No-op on native platforms.
 */
import { useEffect } from 'react';

import { Platform } from 'react-native';

interface UseEditorKeyboardShortcutsParams {
  onUndo: () => void;
  onRedo: () => void;
  enabled: boolean;
}

const INPUT_TAG_NAMES = new Set(['INPUT', 'TEXTAREA', 'SELECT']);

function isInputFocused(): boolean {
  const active = document.activeElement;
  if (!(active instanceof HTMLElement)) return false;
  return INPUT_TAG_NAMES.has(active.tagName) || active.isContentEditable;
}

export function useEditorKeyboardShortcuts({ onUndo, onRedo, enabled }: UseEditorKeyboardShortcutsParams): void {
  useEffect(() => {
    if (Platform.OS !== 'web' || !enabled) return;

    function handleKeyDown(event: KeyboardEvent): void {
      if (isInputFocused()) return;

      const isCtrlOrMeta = event.ctrlKey || event.metaKey;
      if (!isCtrlOrMeta) return;

      const isUndoKey = event.key === 'z' && !event.shiftKey;
      const isRedoByY = event.key === 'y';
      const isRedoByShiftZ = event.key === 'z' && event.shiftKey;
      const isRedoKey = isRedoByY || isRedoByShiftZ;

      if (isUndoKey) {
        event.preventDefault();
        onUndo();
      } else if (isRedoKey) {
        event.preventDefault();
        onRedo();
      }
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => { document.removeEventListener('keydown', handleKeyDown); };
  }, [onUndo, onRedo, enabled]);
}
