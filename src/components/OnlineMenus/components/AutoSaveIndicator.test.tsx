import React from 'react';

import { render } from '@testing-library/react-native';

import AutoSaveIndicator from './AutoSaveIndicator';

jest.mock('@/localization/helpers', () => ({
  FM: (key: string) => key,
}));

jest.mock('@/shared/testIds', () => ({
  TestIds: {
    AUTO_SAVE_INDICATOR: 'auto-save-indicator',
    AUTO_SAVE_DOT: 'auto-save-dot',
    AUTO_SAVE_STATUS_TEXT: 'auto-save-status-text',
  },
}));

const TEXT_COLOR = '#000';
const ERROR_COLOR = '#f00';
const SUCCESS_COLOR = '#0f0';

describe('AutoSaveIndicator', () => {
  it('renders nothing when status is idle', () => {
    const { queryByTestId } = render(
      <AutoSaveIndicator errorColor={ERROR_COLOR} saveStatus={'idle' as never}
        successColor={SUCCESS_COLOR} textColor={TEXT_COLOR} />,
    );
    expect(queryByTestId('auto-save-indicator')).toBeNull();
  });

  it('renders saving label when status is saving', () => {
    const { getByTestId } = render(
      <AutoSaveIndicator errorColor={ERROR_COLOR} saveStatus={'saving' as never}
        successColor={SUCCESS_COLOR} textColor={TEXT_COLOR} />,
    );
    expect(getByTestId('auto-save-status-text').props.children).toBe('onlineMenus.autoSave.saving');
  });

  it('renders saved label when status is saved', () => {
    const { getByTestId } = render(
      <AutoSaveIndicator errorColor={ERROR_COLOR} saveStatus={'saved' as never}
        successColor={SUCCESS_COLOR} textColor={TEXT_COLOR} />,
    );
    expect(getByTestId('auto-save-status-text').props.children).toBe('onlineMenus.autoSave.saved');
  });

  it('renders error label when status is error', () => {
    const { getByTestId } = render(
      <AutoSaveIndicator errorColor={ERROR_COLOR} saveStatus={'error' as never}
        successColor={SUCCESS_COLOR} textColor={TEXT_COLOR} />,
    );
    expect(getByTestId('auto-save-status-text').props.children).toBe('onlineMenus.autoSave.error');
  });
});
