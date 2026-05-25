import React from 'react';

import { fireEvent, render, screen } from '@testing-library/react-native';

import BreadcrumbBar from './BreadcrumbBar';
import { TestIds } from '../../shared/testIds';

import type { BreadcrumbCrumb } from '../OnlineMenus/hooks/useBreadcrumbState';

jest.mock('../../localization/helpers', () => ({
  FM: (key: string) => key,
}));

jest.mock('../../theme/hooks/useTheme', () => ({
  useTheme: () => ({
    theme: { colors: { text: '#000', textSecondary: '#666' } },
  }),
}));

const CRUMBS_3: BreadcrumbCrumb[] = [
  { label: 'Online Menus', onPress: jest.fn() },
  { label: 'Lunch Menu', onPress: jest.fn() },
  { label: 'Content' },
];

const CRUMBS_4: BreadcrumbCrumb[] = [
  { label: 'Online Menus', onPress: jest.fn() },
  { label: 'Lunch Menu', onPress: jest.fn() },
  { label: 'Content', onPress: jest.fn() },
  { label: 'Starters' },
];

describe('BreadcrumbBar', () => {
  it('returns null when crumbs array is empty', () => {
    const { toJSON } = render(<BreadcrumbBar crumbs={[]} isPhone={false} />);

    expect(toJSON()).toBeNull();
  });

  it('renders all crumb items on desktop', () => {
    render(<BreadcrumbBar crumbs={CRUMBS_3} isPhone={false} />);

    const items = screen.getAllByTestId(TestIds.BREADCRUMB_ITEM);
    expect(items).toHaveLength(3);
  });

  it('renders separators between crumbs', () => {
    render(<BreadcrumbBar crumbs={CRUMBS_3} isPhone={false} />);

    const separators = screen.getAllByTestId(TestIds.BREADCRUMB_SEPARATOR);
    expect(separators).toHaveLength(2);
  });

  it('fires onPress when parent crumb is tapped', () => {
    render(<BreadcrumbBar crumbs={CRUMBS_3} isPhone={false} />);

    const items = screen.getAllByTestId(TestIds.BREADCRUMB_ITEM);
    fireEvent.press(items[0]);

    expect(CRUMBS_3[0].onPress).toHaveBeenCalledTimes(1);
  });

  it('shows ellipsis and truncates to last 2 items on phone with 3+ crumbs', () => {
    render(<BreadcrumbBar isPhone crumbs={CRUMBS_3} />);

    const items = screen.getAllByTestId(TestIds.BREADCRUMB_ITEM);
    expect(items).toHaveLength(2);
  });

  it('shows all crumbs on phone when 2 or fewer', () => {
    const twoCrumbs: BreadcrumbCrumb[] = [
      { label: 'Online Menus', onPress: jest.fn() },
      { label: 'Metadata' },
    ];
    render(<BreadcrumbBar isPhone crumbs={twoCrumbs} />);

    const items = screen.getAllByTestId(TestIds.BREADCRUMB_ITEM);
    expect(items).toHaveLength(2);
  });

  it('renders 4 crumbs on desktop when category is focused', () => {
    render(<BreadcrumbBar crumbs={CRUMBS_4} isPhone={false} />);

    const items = screen.getAllByTestId(TestIds.BREADCRUMB_ITEM);
    expect(items).toHaveLength(4);
  });

  it('renders breadcrumb bar with correct testID', () => {
    render(<BreadcrumbBar crumbs={CRUMBS_3} isPhone={false} />);

    expect(screen.getByTestId(TestIds.BREADCRUMB_BAR)).toBeTruthy();
  });
});
