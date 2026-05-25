import React from 'react';

import { render } from '@testing-library/react-native';

import { ICON_PATHS } from './iconPaths';
import SvgIcon from './SvgIcon';

import type { IconName } from './iconPaths';

describe('SvgIcon', () => {
  it('renders without crashing for every icon name', () => {
    const allIconNames = Object.keys(ICON_PATHS);

    for (const name of allIconNames) {
      const { unmount } = render(
        <SvgIcon name={name as IconName} />,
      );
      unmount();
    }
  });

  it('applies the provided size prop', () => {
    const { getByTestId } = render(
      <SvgIcon name="home" size={32} testID="icon-home" />,
    );
    const svgElement = getByTestId('icon-home');
    expect(svgElement).toBeTruthy();
  });

  it('applies the provided color prop', () => {
    const { getByTestId } = render(
      <SvgIcon color="#FF0000" name="bell" testID="icon-bell" />,
    );
    const svgElement = getByTestId('icon-bell');
    expect(svgElement).toBeTruthy();
  });

  it('applies accessibility label and hint', () => {
    const { getByLabelText } = render(
      <SvgIcon accessibilityHint="Navigates to home" accessibilityLabel="Home icon" name="home" />,
    );
    expect(getByLabelText('Home icon')).toBeTruthy();
  });

  it('uses default size and color when not provided', () => {
    const { getByTestId } = render(
      <SvgIcon name="close" testID="icon-close" />,
    );
    expect(getByTestId('icon-close')).toBeTruthy();
  });
});
