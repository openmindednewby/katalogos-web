import { renderHook } from '@testing-library/react-native';

import { useKeyboardShortcuts } from './useKeyboardShortcuts';

import type { KeyboardShortcut } from '../components/KeyboardShortcuts/keyboardShortcutTypes';

jest.mock('react-native', () => ({ Platform: { OS: 'web' } }));

function fireKey(key: string, modifiers: Partial<KeyboardEventInit> = {}): KeyboardEvent {
  const event = new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true, ...modifiers });
  jest.spyOn(event, 'preventDefault');
  document.dispatchEvent(event);
  return event;
}

function makeShortcut(overrides: Partial<KeyboardShortcut> = {}): KeyboardShortcut {
  return {
    id: 'test', labelKey: 'test.label', key: 's',
    ctrlOrMeta: true, handler: jest.fn(), ...overrides,
  };
}

describe('useKeyboardShortcuts', () => {
  it('calls handler and prevents default when shortcut matches', () => {
    const shortcut = makeShortcut();
    renderHook(() => useKeyboardShortcuts([shortcut]));

    const event = fireKey('s', { ctrlKey: true });
    expect(shortcut.handler).toHaveBeenCalledTimes(1);
    expect(event.preventDefault).toHaveBeenCalled();
  });

  it('does not call handler when modifier key is missing', () => {
    const shortcut = makeShortcut({ ctrlOrMeta: true });
    renderHook(() => useKeyboardShortcuts([shortcut]));

    fireKey('s', {});
    expect(shortcut.handler).not.toHaveBeenCalled();
  });

  it('matches metaKey as alternative to ctrlKey', () => {
    const shortcut = makeShortcut({ ctrlOrMeta: true });
    renderHook(() => useKeyboardShortcuts([shortcut]));

    fireKey('s', { metaKey: true });
    expect(shortcut.handler).toHaveBeenCalledTimes(1);
  });

  it('matches alt key shortcuts', () => {
    const shortcut = makeShortcut({ key: '1', alt: true, ctrlOrMeta: false });
    renderHook(() => useKeyboardShortcuts([shortcut]));

    fireKey('1', { altKey: true });
    expect(shortcut.handler).toHaveBeenCalledTimes(1);
  });

  it('does not fire alt shortcut without alt key', () => {
    const shortcut = makeShortcut({ key: '1', alt: true, ctrlOrMeta: false });
    renderHook(() => useKeyboardShortcuts([shortcut]));

    fireKey('1', {});
    expect(shortcut.handler).not.toHaveBeenCalled();
  });

  it('matches shift key shortcuts', () => {
    const shortcut = makeShortcut({ key: 'n', ctrlOrMeta: true, shift: true });
    renderHook(() => useKeyboardShortcuts([shortcut]));

    fireKey('n', { ctrlKey: true, shiftKey: true });
    expect(shortcut.handler).toHaveBeenCalledTimes(1);
  });

  it('does not fire when shift is expected but not pressed', () => {
    const shortcut = makeShortcut({ key: 'n', ctrlOrMeta: true, shift: true });
    renderHook(() => useKeyboardShortcuts([shortcut]));

    fireKey('n', { ctrlKey: true });
    expect(shortcut.handler).not.toHaveBeenCalled();
  });

  it('suppresses shortcut in text input when suppressInInput is true', () => {
    const input = document.createElement('input');
    document.body.appendChild(input);
    input.focus();

    const shortcut = makeShortcut({ key: '?', ctrlOrMeta: false, suppressInInput: true });
    renderHook(() => useKeyboardShortcuts([shortcut]));

    fireKey('?', {});
    expect(shortcut.handler).not.toHaveBeenCalled();

    document.body.removeChild(input);
  });

  it('fires shortcut in text input when suppressInInput is not set', () => {
    const input = document.createElement('input');
    document.body.appendChild(input);
    input.focus();

    const shortcut = makeShortcut({ key: 's', ctrlOrMeta: true });
    renderHook(() => useKeyboardShortcuts([shortcut]));

    fireKey('s', { ctrlKey: true });
    expect(shortcut.handler).toHaveBeenCalledTimes(1);

    document.body.removeChild(input);
  });

  it('suppresses shortcut in textarea', () => {
    const textarea = document.createElement('textarea');
    document.body.appendChild(textarea);
    textarea.focus();

    const shortcut = makeShortcut({ key: '?', ctrlOrMeta: false, suppressInInput: true });
    renderHook(() => useKeyboardShortcuts([shortcut]));

    fireKey('?', {});
    expect(shortcut.handler).not.toHaveBeenCalled();

    document.body.removeChild(textarea);
  });

  it('suppresses shortcut in contentEditable element', () => {
    const div = document.createElement('div');
    document.body.appendChild(div);

    // jsdom does not implement isContentEditable or support focus on
    // contentEditable divs, so we mock both for this test.
    Object.defineProperty(div, 'isContentEditable', { value: true, configurable: true });
    const activeElSpy = jest.spyOn(document, 'activeElement', 'get').mockReturnValue(div);

    const shortcut = makeShortcut({ key: '?', ctrlOrMeta: false, suppressInInput: true });
    renderHook(() => useKeyboardShortcuts([shortcut]));

    fireKey('?', {});
    expect(shortcut.handler).not.toHaveBeenCalled();

    activeElSpy.mockRestore();
    document.body.removeChild(div);
  });

  it('does not register listeners when enabled is false', () => {
    const shortcut = makeShortcut();
    renderHook(() => useKeyboardShortcuts([shortcut], false));

    fireKey('s', { ctrlKey: true });
    expect(shortcut.handler).not.toHaveBeenCalled();
  });

  it('does not register listeners when shortcuts array is empty', () => {
    const addSpy = jest.spyOn(document, 'addEventListener');
    const callCountBefore = addSpy.mock.calls.length;
    renderHook(() => useKeyboardShortcuts([]));
    expect(addSpy.mock.calls.length).toBe(callCountBefore);
    addSpy.mockRestore();
  });

  it('cleans up listener on unmount', () => {
    const shortcut = makeShortcut();
    const { unmount } = renderHook(() => useKeyboardShortcuts([shortcut]));

    unmount();
    fireKey('s', { ctrlKey: true });
    expect(shortcut.handler).not.toHaveBeenCalled();
  });

  it('only fires the first matching shortcut', () => {
    const handler1 = jest.fn();
    const handler2 = jest.fn();
    const shortcut1 = makeShortcut({ id: 's1', handler: handler1 });
    const shortcut2 = makeShortcut({ id: 's2', handler: handler2 });

    renderHook(() => useKeyboardShortcuts([shortcut1, shortcut2]));
    fireKey('s', { ctrlKey: true });

    expect(handler1).toHaveBeenCalledTimes(1);
    expect(handler2).not.toHaveBeenCalled();
  });

  it('is case-insensitive for key matching', () => {
    const shortcut = makeShortcut({ key: 'S' });
    renderHook(() => useKeyboardShortcuts([shortcut]));

    fireKey('s', { ctrlKey: true });
    expect(shortcut.handler).toHaveBeenCalledTimes(1);
  });
});
