/**
 * Unit tests for ContentImage component.
 *
 * Focus on logic: conditional rendering based on contentId, and that the image
 * URI is the same-origin BFF streaming path (Option B, #238B) — authenticated
 * `/download` vs public `/public-download` — instead of a resolved S3 URL.
 */
import React from 'react';

import { render } from '@testing-library/react-native';

import { ContentImage } from './ContentImage';

// Mock theme
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

const CONTENT_BASE = '/bff/api/content/api/v1/content';

/**
 * Extracts the Image source uri from a rendered ContentImage tree.
 */
function getImageUri(json: ReturnType<ReturnType<typeof render>['toJSON']>): string | undefined {
  // The tree is View > Image; find the first node whose props carry a source.uri.
  const stack = Array.isArray(json) ? [...json] : [json];
  while (stack.length > 0) {
    const node = stack.pop();
    if (typeof node !== 'object' || node === null) continue;
    const source = (node.props as { source?: { uri?: string } } | undefined)?.source;
    const uri = source?.uri;
    if (typeof uri === 'string') return uri;
    if (Array.isArray(node.children)) stack.push(...node.children);
  }
  return undefined;
}

describe('ContentImage', () => {
  describe('conditional rendering based on contentId', () => {
    it('returns null when contentId is null', () => {
      const { toJSON } = render(<ContentImage contentId={null} testID="test-image" />);
      expect(toJSON()).toBeNull();
    });

    it('returns null when contentId is undefined', () => {
      const { toJSON } = render(<ContentImage contentId={undefined} testID="test-image" />);
      expect(toJSON()).toBeNull();
    });

    it('returns null when contentId is empty string', () => {
      const { toJSON } = render(<ContentImage contentId="" testID="test-image" />);
      expect(toJSON()).toBeNull();
    });
  });

  describe('successful render', () => {
    it('renders image container when contentId is valid', () => {
      const { getByTestId } = render(
        <ContentImage contentId="content-123" testID="test-image" />,
      );
      expect(getByTestId('test-image')).toBeTruthy();
    });
  });

  describe('same-origin BFF streaming URI', () => {
    it('uses the authenticated /download path by default', () => {
      const { toJSON } = render(<ContentImage contentId="content-123" testID="test-image" />);
      expect(getImageUri(toJSON())).toBe(`${CONTENT_BASE}/content-123/download`);
    });

    it('uses the /public-download path when isPublic is true', () => {
      const { toJSON } = render(
        <ContentImage isPublic contentId="content-123" testID="test-image" />,
      );
      expect(getImageUri(toJSON())).toBe(`${CONTENT_BASE}/content-123/public-download`);
    });

    it('never points the browser at an S3 host', () => {
      const { toJSON } = render(<ContentImage contentId="content-123" testID="test-image" />);
      const uri = getImageUri(toJSON()) ?? '';
      expect(uri.startsWith('/bff/api/content')).toBe(true);
      expect(uri).not.toContain('seaweedfs');
      expect(uri).not.toContain('8333');
    });
  });
});
