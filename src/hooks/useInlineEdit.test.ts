/**
 * Unit tests for useInlineEdit hook.
 * Tests logic: state transitions, commit, cancel, validation, key handling.
 */
import { act, renderHook } from '@testing-library/react-native';


import { useInlineEdit } from './useInlineEdit';

import type { UseInlineEditResult } from './useInlineEdit';
import type { RenderHookResult } from '@testing-library/react-native';

interface SetupResult extends RenderHookResult<UseInlineEditResult, unknown> {
  onCommit: jest.Mock;
}

describe('useInlineEdit', () => {
  const DEFAULT_VALUE = 'Appetizers';

  function setup(overrides?: { value?: string; validate?: (v: string) => boolean }): SetupResult {
    const onCommit = jest.fn();
    const result = renderHook(() =>
      useInlineEdit({
        value: overrides?.value ?? DEFAULT_VALUE,
        onCommit,
        validate: overrides?.validate,
      }),
    );
    return { ...result, onCommit };
  }

  it('starts in display mode', () => {
    const { result } = setup();
    expect(result.current.isEditing).toBe(false);
  });

  it('initializes draftValue from value prop', () => {
    const { result } = setup();
    expect(result.current.draftValue).toBe(DEFAULT_VALUE);
  });

  it('enters editing mode on startEditing', () => {
    const { result } = setup();
    act(() => { result.current.startEditing(); });
    expect(result.current.isEditing).toBe(true);
    expect(result.current.draftValue).toBe(DEFAULT_VALUE);
  });

  it('updates draftValue on handleChange', () => {
    const { result } = setup();
    act(() => { result.current.startEditing(); });
    act(() => { result.current.handleChange('Main Course'); });
    expect(result.current.draftValue).toBe('Main Course');
  });

  it('commits edit and calls onCommit when value changed', () => {
    const { result, onCommit } = setup();
    act(() => { result.current.startEditing(); });
    act(() => { result.current.handleChange('Main Course'); });
    act(() => { result.current.commitEdit(); });
    expect(onCommit).toHaveBeenCalledWith('Main Course');
    expect(result.current.isEditing).toBe(false);
  });

  it('does not call onCommit when value is unchanged', () => {
    const { result, onCommit } = setup();
    act(() => { result.current.startEditing(); });
    act(() => { result.current.commitEdit(); });
    expect(onCommit).not.toHaveBeenCalled();
    expect(result.current.isEditing).toBe(false);
  });

  it('trims whitespace before committing', () => {
    const { result, onCommit } = setup();
    act(() => { result.current.startEditing(); });
    act(() => { result.current.handleChange('  Main Course  '); });
    act(() => { result.current.commitEdit(); });
    expect(onCommit).toHaveBeenCalledWith('Main Course');
  });

  it('rejects empty string by default validation', () => {
    const { result, onCommit } = setup();
    act(() => { result.current.startEditing(); });
    act(() => { result.current.handleChange('   '); });
    act(() => { result.current.commitEdit(); });
    expect(onCommit).not.toHaveBeenCalled();
    expect(result.current.isEditing).toBe(true);
  });

  it('cancels edit and reverts to original value', () => {
    const { result, onCommit } = setup();
    act(() => { result.current.startEditing(); });
    act(() => { result.current.handleChange('Changed'); });
    act(() => { result.current.cancelEdit(); });
    expect(result.current.isEditing).toBe(false);
    expect(result.current.draftValue).toBe(DEFAULT_VALUE);
    expect(onCommit).not.toHaveBeenCalled();
  });

  it('commits on Enter key press', () => {
    const { result, onCommit } = setup();
    act(() => { result.current.startEditing(); });
    act(() => { result.current.handleChange('New Name'); });
    act(() => { result.current.handleKeyPress('Enter'); });
    expect(onCommit).toHaveBeenCalledWith('New Name');
    expect(result.current.isEditing).toBe(false);
  });

  it('cancels on Escape key press', () => {
    const { result, onCommit } = setup();
    act(() => { result.current.startEditing(); });
    act(() => { result.current.handleChange('Temporary'); });
    act(() => { result.current.handleKeyPress('Escape'); });
    expect(result.current.isEditing).toBe(false);
    expect(result.current.draftValue).toBe(DEFAULT_VALUE);
    expect(onCommit).not.toHaveBeenCalled();
  });

  it('ignores unrelated key presses', () => {
    const { result, onCommit } = setup();
    act(() => { result.current.startEditing(); });
    act(() => { result.current.handleChange('Draft'); });
    act(() => { result.current.handleKeyPress('a'); });
    expect(result.current.isEditing).toBe(true);
    expect(onCommit).not.toHaveBeenCalled();
  });

  it('uses custom validate function', () => {
    const customValidate = (v: string): boolean => v.length >= 3;
    const { result, onCommit } = setup({ validate: customValidate });
    act(() => { result.current.startEditing(); });
    act(() => { result.current.handleChange('AB'); });
    act(() => { result.current.commitEdit(); });
    expect(onCommit).not.toHaveBeenCalled();
    expect(result.current.isEditing).toBe(true);
  });

  it('syncs draftValue when value prop changes while not editing', () => {
    const onCommit = jest.fn();
    const { result, rerender } = renderHook(
      ({ value }) => useInlineEdit({ value, onCommit }),
      { initialProps: { value: 'Original' } },
    );
    expect(result.current.draftValue).toBe('Original');
    rerender({ value: 'Updated' });
    expect(result.current.draftValue).toBe('Updated');
  });

  it('does not sync draftValue when value prop changes while editing', () => {
    const onCommit = jest.fn();
    const { result, rerender } = renderHook(
      ({ value }) => useInlineEdit({ value, onCommit }),
      { initialProps: { value: 'Original' } },
    );
    act(() => { result.current.startEditing(); });
    act(() => { result.current.handleChange('My Edit'); });
    rerender({ value: 'External Change' });
    expect(result.current.draftValue).toBe('My Edit');
  });
});
