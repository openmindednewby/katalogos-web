import type { RefObject } from 'react';

import { Platform } from 'react-native';
import type { View } from 'react-native';

import { renderHook } from '@testing-library/react-native';

import { useFocusTrap } from './useFocusTrap';



// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function createFocusableContainer(): {
  container: HTMLDivElement;
  buttons: HTMLButtonElement[];
} {
  const container = document.createElement('div');
  const btn1 = document.createElement('button');
  btn1.textContent = 'First';
  const btn2 = document.createElement('button');
  btn2.textContent = 'Second';
  const btn3 = document.createElement('button');
  btn3.textContent = 'Third';
  container.append(btn1, btn2, btn3);
  document.body.appendChild(container);
  return { container, buttons: [btn1, btn2, btn3] };
}

function makeRef(node: HTMLElement | null): RefObject<View | null> {
   
  return { current: node as unknown as View | null };
}

function tabKeyEvent(shift = false): KeyboardEvent {
  return new KeyboardEvent('keydown', { key: 'Tab', shiftKey: shift, bubbles: true, cancelable: true });
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('useFocusTrap', () => {
  const originalPlatformOS = Platform.OS;

  afterEach(() => {
     
    (Platform as { OS: string }).OS = originalPlatformOS;
    document.body.innerHTML = '';
  });

  it('is a no-op on non-web platforms', () => {
     
    (Platform as { OS: string }).OS = 'ios';
    const { container, buttons } = createFocusableContainer();
    const ref = makeRef(container);

    renderHook(() => useFocusTrap(ref, true));

    // Focus should NOT have moved to first child
    expect(document.activeElement).not.toBe(buttons[0]);
  });

  it('is a no-op when enabled is false', async () => {
     
    (Platform as { OS: string }).OS = 'web';
    const { container, buttons } = createFocusableContainer();
    const ref = makeRef(container);

    renderHook(() => useFocusTrap(ref, false));
    // Flush microtask
    await Promise.resolve();

    expect(document.activeElement).not.toBe(buttons[0]);
  });

  it('focuses the first focusable child when enabled', async () => {
     
    (Platform as { OS: string }).OS = 'web';
    const { container, buttons } = createFocusableContainer();
    const ref = makeRef(container);

    renderHook(() => useFocusTrap(ref, true));
    await Promise.resolve();

    expect(document.activeElement).toBe(buttons[0]);
  });

  it('wraps focus from last to first on Tab', async () => {
     
    (Platform as { OS: string }).OS = 'web';
    const { container, buttons } = createFocusableContainer();
    const ref = makeRef(container);

    renderHook(() => useFocusTrap(ref, true));
    await Promise.resolve();

    // Move focus to the last button
    buttons[2].focus();
    expect(document.activeElement).toBe(buttons[2]);

    // Press Tab — should wrap to first
    const event = tabKeyEvent(false);
    container.dispatchEvent(event);
    expect(document.activeElement).toBe(buttons[0]);
    expect(event.defaultPrevented).toBe(true);
  });

  it('wraps focus from first to last on Shift+Tab', async () => {
     
    (Platform as { OS: string }).OS = 'web';
    const { container, buttons } = createFocusableContainer();
    const ref = makeRef(container);

    renderHook(() => useFocusTrap(ref, true));
    await Promise.resolve();

    // Focus should be on first
    expect(document.activeElement).toBe(buttons[0]);

    // Press Shift+Tab — should wrap to last
    const event = tabKeyEvent(true);
    container.dispatchEvent(event);
    expect(document.activeElement).toBe(buttons[2]);
    expect(event.defaultPrevented).toBe(true);
  });

  it('restores focus on unmount', async () => {
     
    (Platform as { OS: string }).OS = 'web';
    const outsideButton = document.createElement('button');
    outsideButton.textContent = 'Outside';
    document.body.appendChild(outsideButton);
    outsideButton.focus();

    const { container } = createFocusableContainer();
    const ref = makeRef(container);

    const { unmount } = renderHook(() => useFocusTrap(ref, true));
    await Promise.resolve();

    // Focus moved into the trap
    expect(document.activeElement).not.toBe(outsideButton);

    unmount();

    expect(document.activeElement).toBe(outsideButton);
  });

  it('prevents Tab when container has no focusable children', async () => {
     
    (Platform as { OS: string }).OS = 'web';
    const container = document.createElement('div');
    container.innerHTML = '<span>No focusable children</span>';
    document.body.appendChild(container);
    const ref = makeRef(container);

    renderHook(() => useFocusTrap(ref, true));
    await Promise.resolve();

    const event = tabKeyEvent(false);
    container.dispatchEvent(event);
    expect(event.defaultPrevented).toBe(true);
  });
});
