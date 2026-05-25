/**
 * Unit tests for InlineEditableText component.
 * Tests logic: edit/display toggle, commit/cancel callbacks, key handling.
 */
import React from 'react';

import { Text } from 'react-native';

import { fireEvent, render } from '@testing-library/react-native';

import InlineEditableText from './InlineEditableText';

import type { RenderAPI } from '@testing-library/react-native';


// Mock FM to return the key
jest.mock('@/localization/helpers', () => ({
  FM: (key: string) => key,
}));

// Mock SvgIcon to avoid SVG rendering in tests
jest.mock('../Icons', () => ({
  SvgIcon: () => null,
}));

interface RenderResult extends RenderAPI {
  onCommit: jest.Mock;
}

describe('InlineEditableText', () => {
  const DEFAULT_VALUE = 'Appetizers';
  const TEST_ID = 'category-name';

  function renderComponent(overrides?: { value?: string; onCommit?: jest.Mock }): RenderResult {
    const onCommit = overrides?.onCommit ?? jest.fn();
    const result = render(
      <InlineEditableText
        editIconColor="#333"
        renderDisplay={(displayValue) => <Text>{displayValue}</Text>}
        testID={TEST_ID}
        value={overrides?.value ?? DEFAULT_VALUE}
        onCommit={onCommit}
      />,
    );
    return { ...result, onCommit };
  }

  it('shows display mode by default with testID suffix', () => {
    const { getByTestId } = renderComponent();
    expect(getByTestId(`${TEST_ID}-display`)).toBeTruthy();
  });

  it('switches to input on press', () => {
    const { getByTestId } = renderComponent();
    fireEvent.press(getByTestId(`${TEST_ID}-display`));
    expect(getByTestId(`${TEST_ID}-input`)).toBeTruthy();
  });

  it('pre-fills input with current value', () => {
    const { getByTestId } = renderComponent();
    fireEvent.press(getByTestId(`${TEST_ID}-display`));
    const input = getByTestId(`${TEST_ID}-input`);
    expect(input.props.value).toBe(DEFAULT_VALUE);
  });

  it('calls onCommit with new value on blur', () => {
    const onCommit = jest.fn();
    const { getByTestId } = renderComponent({ onCommit });
    fireEvent.press(getByTestId(`${TEST_ID}-display`));
    const input = getByTestId(`${TEST_ID}-input`);
    fireEvent.changeText(input, 'Main Course');
    fireEvent(input, 'blur');
    expect(onCommit).toHaveBeenCalledWith('Main Course');
  });

  it('does not call onCommit when value unchanged on blur', () => {
    const onCommit = jest.fn();
    const { getByTestId } = renderComponent({ onCommit });
    fireEvent.press(getByTestId(`${TEST_ID}-display`));
    const input = getByTestId(`${TEST_ID}-input`);
    fireEvent(input, 'blur');
    expect(onCommit).not.toHaveBeenCalled();
  });

  it('commits on Enter key press', () => {
    const onCommit = jest.fn();
    const { getByTestId } = renderComponent({ onCommit });
    fireEvent.press(getByTestId(`${TEST_ID}-display`));
    const input = getByTestId(`${TEST_ID}-input`);
    fireEvent.changeText(input, 'Desserts');
    fireEvent(input, 'keyPress', { nativeEvent: { key: 'Enter' } });
    expect(onCommit).toHaveBeenCalledWith('Desserts');
  });

  it('cancels on Escape key press without calling onCommit', () => {
    const onCommit = jest.fn();
    const { getByTestId, queryByTestId } = renderComponent({ onCommit });
    fireEvent.press(getByTestId(`${TEST_ID}-display`));
    const input = getByTestId(`${TEST_ID}-input`);
    fireEvent.changeText(input, 'Temporary');
    fireEvent(input, 'keyPress', { nativeEvent: { key: 'Escape' } });
    expect(onCommit).not.toHaveBeenCalled();
    expect(queryByTestId(`${TEST_ID}-display`)).toBeTruthy();
  });

  it('rejects empty input on commit', () => {
    const onCommit = jest.fn();
    const { getByTestId, queryByTestId } = renderComponent({ onCommit });
    fireEvent.press(getByTestId(`${TEST_ID}-display`));
    const input = getByTestId(`${TEST_ID}-input`);
    fireEvent.changeText(input, '   ');
    fireEvent(input, 'blur');
    expect(onCommit).not.toHaveBeenCalled();
    // Should stay in edit mode since validation failed
    expect(queryByTestId(`${TEST_ID}-input`)).toBeTruthy();
  });
});
