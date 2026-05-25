/**
 * Shared mock setup for MenuContentEditor tests.
 * Import this file at the top of test files to apply all necessary mocks.
 */

// Mock react-redux (for OnlineMenus components that still use Redux for theme)
jest.mock('react-redux', () => ({
  useSelector: () => 'light',
}));

// Mock useTheme (for Content components migrated to new theme system)
jest.mock('../../theme/hooks/useTheme', () => ({
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

// File size constants
const BYTES_PER_KB = 1024;
const BYTES_PER_MB = BYTES_PER_KB * BYTES_PER_KB;
const MAX_IMAGE_SIZE_MB = 10;
const MAX_VIDEO_SIZE_MB = 500;
const MAX_DOCUMENT_SIZE_MB = 50;

// Mock content hooks
jest.mock('../../lib/hooks/content', () => ({
  useContent: () => ({ data: null }),
  useContentUrl: () => ({ data: null }),
  usePublicContentUrl: () => ({ data: null }),
  useUploadContent: () => ({
    upload: jest.fn(),
    cancel: jest.fn(),
    state: { isUploading: false, progress: 0, error: null, contentId: null },
    reset: jest.fn(),
  }),
  MAX_FILE_SIZES: {
    Image: MAX_IMAGE_SIZE_MB * BYTES_PER_MB,
    Video: MAX_VIDEO_SIZE_MB * BYTES_PER_MB,
    Document: MAX_DOCUMENT_SIZE_MB * BYTES_PER_MB,
  },
  ALLOWED_MIME_TYPES: {
    Image: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    Video: ['video/mp4', 'video/quicktime', 'video/x-msvideo', 'video/webm'],
    Document: ['application/pdf', 'application/msword'],
  },
}));

// Mock TouchableOpacity to avoid React version mismatch
// (react 19.2.4 vs react-native-renderer 19.1.0) during rerender
/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-return */
jest.mock('react-native/Libraries/Components/Touchable/TouchableOpacity', () => {
  const React = require('react');
  const { View } = require('react-native');

  const MockTouchableOpacity = React.forwardRef((props: Record<string, unknown>, ref: unknown) => {
    const { children, onPress, testID, accessibilityLabel, accessibilityHint, accessibilityRole, accessibilityState, disabled, style } = props;
    return React.createElement(
      View,
      { ref, testID, accessibilityLabel, accessibilityHint, accessibilityRole, accessibilityState, disabled, style, onPress, accessible: true },
      children,
    );
  });
  MockTouchableOpacity.displayName = 'MockTouchableOpacity';

  return { default: MockTouchableOpacity, __esModule: true };
});
/* eslint-enable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-return */

// Mock expo-image-picker
jest.mock('expo-image-picker', () => ({
  requestMediaLibraryPermissionsAsync: jest.fn(),
  launchImageLibraryAsync: jest.fn(),
  PermissionStatus: { GRANTED: 'granted' },
}));

// Mock expo-document-picker
jest.mock('expo-document-picker', () => ({
  getDocumentAsync: jest.fn(),
}));
