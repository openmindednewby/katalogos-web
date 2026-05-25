/**
 * Constants for the ColorSchemeEditor component.
 */

const HEX_COLOR_REGEX = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;

/**
 * ColorScheme interface for menu styling.
 */
export interface ColorScheme {
  background?: string;
  surface?: string;
  text?: string;
  textSecondary?: string;
  accent?: string;
  price?: string;
  border?: string;
  divider?: string;
  unavailable?: string;
}

export interface ColorPreset {
  name: string;
  key: string;
  scheme: ColorScheme;
}

export const COLOR_PRESETS: ColorPreset[] = [
  {
    name: 'Light',
    key: 'light',
    scheme: {
      background: '#FFFFFF',
      surface: '#F5F5F5',
      text: '#000000',
      textSecondary: '#666666',
      accent: '#007AFF',
      price: '#000000',
      border: '#E0E0E0',
      divider: '#EEEEEE',
      unavailable: '#999999',
    },
  },
  {
    name: 'Dark',
    key: 'dark',
    scheme: {
      background: '#1C1C1E',
      surface: '#2C2C2E',
      text: '#FFFFFF',
      textSecondary: '#ABABAB',
      accent: '#0A84FF',
      price: '#FFFFFF',
      border: '#3A3A3C',
      divider: '#3A3A3C',
      unavailable: '#8E8E93',
    },
  },
  {
    name: 'Warm',
    key: 'warm',
    scheme: {
      background: '#FFF8F0',
      surface: '#FFF0E0',
      text: '#3D2914',
      textSecondary: '#8B6914',
      accent: '#D97706',
      price: '#B45309',
      border: '#FCD9B6',
      divider: '#FDE68A',
      unavailable: '#9CA3AF',
    },
  },
  {
    name: 'Ocean',
    key: 'ocean',
    scheme: {
      background: '#F0F9FF',
      surface: '#E0F2FE',
      text: '#0C4A6E',
      textSecondary: '#0369A1',
      accent: '#0284C7',
      price: '#0369A1',
      border: '#BAE6FD',
      divider: '#E0F2FE',
      unavailable: '#94A3B8',
    },
  },
];

export const COLOR_PROPERTY_KEYS: Array<keyof ColorScheme> = [
  'background',
  'surface',
  'text',
  'textSecondary',
  'accent',
  'price',
  'border',
  'divider',
  'unavailable',
];

/** Opacity for disabled elements */
export { DISABLED_OPACITY } from '../../../../shared/constants';

/** Default gray swatch color for invalid colors */
export const INVALID_COLOR_SWATCH = '#CCCCCC';

/**
 * Validates if a string is a valid hex color.
 */
export function isValidHexColor(color: string): boolean {
  return HEX_COLOR_REGEX.test(color);
}
