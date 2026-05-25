import { resolveSemanticColor } from './StatusBadge';

import type { ResolvedSemanticColors } from '../../theme/types';
import type { ThemeModeColors } from '../../theme/types/themeModeColors';

const mockSemantic: ResolvedSemanticColors = {
  success: { '50': '#e6f7f7', '100': '#b3eded', '200': '#80e3e3', '300': '#4dd9d9', '400': '#26cfcf', '500': '#0a9396', '600': '#097c7f', '700': '#076567', '800': '#054e50', '900': '#033738' },
  warning: { '50': '#fef5e0', '100': '#fde6b3', '200': '#fcd780', '300': '#fbc84d', '400': '#fabb26', '500': '#ee9b00', '600': '#c78300', '700': '#a06b00', '800': '#795200', '900': '#523a00' },
  error: { '50': '#f9e5e3', '100': '#f0bfb9', '200': '#e7998f', '300': '#de7365', '400': '#d75344', '500': '#ae2012', '600': '#931b10', '700': '#78160d', '800': '#5d110a', '900': '#420c07' },
  info: { '50': '#e0f0f3', '100': '#b3d9e0', '200': '#80c2cd', '300': '#4dabba', '400': '#2698ab', '500': '#005f73', '600': '#005061', '700': '#00414f', '800': '#00323d', '900': '#00232b' },
};

const mockModeColors: ThemeModeColors = {
  background: '#ffffff',
  surface: '#f7f7f7',
  surfaceElevated: '#ffffff',
  text: '#001219',
  textSecondary: '#777777',
  border: '#e6e6e6',
  divider: '#e6e6e6',
};

describe('resolveSemanticColor', () => {
  it('returns success color for "success" key', () => {
    const result = resolveSemanticColor(mockSemantic, mockModeColors, 'success');

    expect(result).toBe('#0a9396');
  });

  it('returns error color for "error" key', () => {
    const result = resolveSemanticColor(mockSemantic, mockModeColors, 'error');

    expect(result).toBe('#ae2012');
  });

  it('returns warning color for "warning" key', () => {
    const result = resolveSemanticColor(mockSemantic, mockModeColors, 'warning');

    expect(result).toBe('#ee9b00');
  });

  it('returns info color for "info" key', () => {
    const result = resolveSemanticColor(mockSemantic, mockModeColors, 'info');

    expect(result).toBe('#005f73');
  });

  it('returns textSecondary for "subtext" key', () => {
    const result = resolveSemanticColor(mockSemantic, mockModeColors, 'subtext');

    expect(result).toBe('#777777');
  });

  it('returns textSecondary for unknown key', () => {
    const result = resolveSemanticColor(mockSemantic, mockModeColors, 'unknown');

    expect(result).toBe('#777777');
  });

  it('returns textSecondary for empty string key', () => {
    const result = resolveSemanticColor(mockSemantic, mockModeColors, '');

    expect(result).toBe('#777777');
  });
});
