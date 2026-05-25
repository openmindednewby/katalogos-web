/**
 * Tests for LoadingFallback component.
 *
 * Tests focus on component behavior and props handling,
 * not on visual rendering (which is covered by E2E tests).
 */
import React from 'react';

import type { ViewStyle } from 'react-native';

import { render, type RenderResult } from '@testing-library/react-native';

import LoadingFallback from './LoadingFallback';

jest.mock('@/localization/helpers', () => ({
  FM: (key: string) => key,
}));

jest.mock('../../../theme/hooks/useTheme', () => ({
  useTheme: () => ({
    theme: {
      colors: { text: '#001219', textSecondary: '#555555', background: '#ffffff', surface: '#f7f7f7', surfaceElevated: '#ffffff', border: '#e6e6e6', divider: '#eeeeee' },
      palette: { primary: { '500': '#005f73' }, secondary: { '500': '#94d2bd' }, accent: { '500': '#ee9b00' } },
      semantic: { success: { '500': '#2d6a4f' }, warning: { '500': '#ee9b00' }, error: { '500': '#ae2012' }, info: { '500': '#005f73' } },
      typography: { fontFamily: 'System', headingScale: 1.25 },
      mode: 'light',
      branding: { logoUrl: null, faviconUrl: null },
    },
    mode: 'light',
    toggleMode: jest.fn(),
    setMode: jest.fn(),
    setTenantConfig: jest.fn(),
  }),
}));

function renderComponent(props: { fullScreen?: boolean } = {}): RenderResult {
  return render(<LoadingFallback {...props} />);
}

function flattenStyles(style: ViewStyle | ViewStyle[] | undefined): ViewStyle {
  if (Array.isArray(style))
    return Object.assign({}, ...style.filter(Boolean)) as ViewStyle;
  return (style ?? {});
}

describe('LoadingFallback', () => {
  it('renders without crashing', () => {
    const { root } = renderComponent();
    expect(root).toBeTruthy();
  });

  it('has correct accessibility attributes', () => {
    const { getByLabelText } = renderComponent();
    const view = getByLabelText('loadingFallback.label');
    expect(view.props.accessibilityLabel).toBe('loadingFallback.label');
    expect(view.props.accessibilityHint).toBe('loadingFallback.hint');
  });

  it('applies fullScreen styles when prop is true', () => {
    const { getByLabelText } = renderComponent({ fullScreen: true });
    const view = getByLabelText('loadingFallback.label');
    const flatStyle = flattenStyles(view.props.style);
    expect(flatStyle.minHeight).toBe(300);
  });

  it('applies default styles when fullScreen is false', () => {
    const { getByLabelText } = renderComponent({ fullScreen: false });
    const view = getByLabelText('loadingFallback.label');
    const flatStyle = flattenStyles(view.props.style);
    expect(flatStyle.minHeight).toBe(100);
  });

  it('has backgroundColor defined from theme', () => {
    const { getByLabelText } = renderComponent();
    const view = getByLabelText('loadingFallback.label');
    const flatStyle = flattenStyles(view.props.style);
    expect(flatStyle.backgroundColor).toBeDefined();
  });
});
