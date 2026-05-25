import { renderHook } from '@testing-library/react-native';

import { useEditorKeyboardShortcuts } from './useEditorKeyboardShortcuts';

jest.mock('react-native', () => ({ Platform: { OS: 'web' } }));

function fireKey(key: string, modifiers: Partial<KeyboardEventInit> = {}): void {
  const event = new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true, ...modifiers });
  document.dispatchEvent(event);
}

describe('useEditorKeyboardShortcuts', () => {
  let onUndo: jest.Mock;
  let onRedo: jest.Mock;

  beforeEach(() => {
    onUndo = jest.fn();
    onRedo = jest.fn();
  });

  it('calls onUndo when Ctrl+Z is pressed', () => {
    renderHook(() => useEditorKeyboardShortcuts({ onUndo, onRedo, enabled: true }));
    fireKey('z', { ctrlKey: true });
    expect(onUndo).toHaveBeenCalledTimes(1);
  });

  it('calls onRedo when Ctrl+Y is pressed', () => {
    renderHook(() => useEditorKeyboardShortcuts({ onUndo, onRedo, enabled: true }));
    fireKey('y', { ctrlKey: true });
    expect(onRedo).toHaveBeenCalledTimes(1);
  });

  it('calls onRedo when Ctrl+Shift+Z is pressed', () => {
    renderHook(() => useEditorKeyboardShortcuts({ onUndo, onRedo, enabled: true }));
    fireKey('z', { ctrlKey: true, shiftKey: true });
    expect(onRedo).toHaveBeenCalledTimes(1);
  });

  it('calls onUndo when Meta+Z is pressed', () => {
    renderHook(() => useEditorKeyboardShortcuts({ onUndo, onRedo, enabled: true }));
    fireKey('z', { metaKey: true });
    expect(onUndo).toHaveBeenCalledTimes(1);
  });

  it('does not fire when enabled is false', () => {
    renderHook(() => useEditorKeyboardShortcuts({ onUndo, onRedo, enabled: false }));
    fireKey('z', { ctrlKey: true });
    expect(onUndo).not.toHaveBeenCalled();
  });

  it('does not fire when an input element is focused', () => {
    const input = document.createElement('input');
    document.body.appendChild(input);
    input.focus();

    renderHook(() => useEditorKeyboardShortcuts({ onUndo, onRedo, enabled: true }));
    fireKey('z', { ctrlKey: true });
    expect(onUndo).not.toHaveBeenCalled();

    document.body.removeChild(input);
  });

  it('does not fire for unrelated key presses', () => {
    renderHook(() => useEditorKeyboardShortcuts({ onUndo, onRedo, enabled: true }));
    fireKey('a', { ctrlKey: true });
    fireKey('z', {});
    expect(onUndo).not.toHaveBeenCalled();
    expect(onRedo).not.toHaveBeenCalled();
  });
});
