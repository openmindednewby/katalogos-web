import React from 'react';

import { fireEvent, render, screen } from '@testing-library/react-native';

import Breadcrumb from './Breadcrumb';
import { TestIds } from '../../shared/testIds';

let mockPathname = '/settings/profile';
const mockPush = jest.fn();

jest.mock('expo-router', () => ({
  usePathname: () => mockPathname,
  useRouter: () => ({ push: mockPush }),
}));

jest.mock('../../localization/helpers', () => ({
  FM: (key: string) => key,
}));

jest.mock('../../theme/hooks/useTheme', () => ({
  useTheme: () => ({
    theme: {
      colors: { text: '#000', textSecondary: '#666' },
    },
  }),
}));

describe('Breadcrumb', () => {
  beforeEach(() => {
    mockPush.mockClear();
  });

  it('returns null when no crumbs are found', () => {
    mockPathname = '/unknown';
    const { toJSON } = render(<Breadcrumb />);

    expect(toJSON()).toBeNull();
  });

  it('returns null for the settings hub root (no breadcrumb map entry)', () => {
    mockPathname = '/settings';
    const { toJSON } = render(<Breadcrumb />);

    expect(toJSON()).toBeNull();
  });

  it('renders parent and terminal crumbs with separator for settings path', () => {
    mockPathname = '/settings/profile';
    render(<Breadcrumb />);

    const items = screen.getAllByTestId(TestIds.BREADCRUMB_ITEM);
    expect(items).toHaveLength(2);

    const separators = screen.getAllByTestId(TestIds.BREADCRUMB_SEPARATOR);
    expect(separators).toHaveLength(1);
  });

  it('navigates to parent route on parent crumb press', () => {
    mockPathname = '/settings/security';
    render(<Breadcrumb />);

    const items = screen.getAllByTestId(TestIds.BREADCRUMB_ITEM);
    fireEvent.press(items[0]);

    expect(mockPush).toHaveBeenCalledWith('/settings');
  });

  it('renders breadcrumb bar with default testID', () => {
    mockPathname = '/settings/profile';
    render(<Breadcrumb />);

    expect(screen.getByTestId(TestIds.BREADCRUMB_BAR)).toBeTruthy();
  });

  it('renders breadcrumb bar with custom testID when provided', () => {
    mockPathname = '/settings/profile';
    render(<Breadcrumb testID="custom-breadcrumb" />);

    expect(screen.getByTestId('custom-breadcrumb')).toBeTruthy();
  });
});
