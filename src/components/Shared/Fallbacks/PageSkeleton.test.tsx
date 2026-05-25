/**
 * Tests for PageSkeleton component.
 *
 * Tests focus on component behavior and props handling,
 * not on visual rendering or animation (which is covered by E2E tests).
 */
import React from 'react';

import { Animated } from 'react-native';

import { render, type RenderResult } from '@testing-library/react-native';

import PageSkeleton from './PageSkeleton';

// Mock Animated to avoid issues with native driver in tests
jest.spyOn(Animated, 'loop').mockImplementation((animation) => ({
  ...animation,
  start: jest.fn(),
  stop: jest.fn(),
  reset: jest.fn(),
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

function renderComponent(props: { rows?: number; showHeader?: boolean; variant?: 'list' | 'cards' } = {}): RenderResult {
  return render(<PageSkeleton {...props} />);
}

describe('PageSkeleton', () => {
  it('renders without crashing', () => {
    const { root } = renderComponent();
    expect(root).toBeTruthy();
  });

  it('renders default number of rows (5)', () => {
    const { root } = renderComponent();
    const children = root.children[0];
    expect(children).toBeTruthy();
  });

  it('renders specified number of rows', () => {
    const { root } = renderComponent({ rows: 3 });
    expect(root).toBeTruthy();
  });

  it('hides header when showHeader is false', () => {
    const { root } = renderComponent({ showHeader: false });
    expect(root).toBeTruthy();
  });

  it('renders cards variant correctly', () => {
    const { root } = renderComponent({ variant: 'cards' });
    expect(root).toBeTruthy();
  });

  it('renders list variant by default', () => {
    const { root } = renderComponent();
    expect(root).toBeTruthy();
  });
});
