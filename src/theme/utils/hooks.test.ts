import { renderHook } from '@testing-library/react-native';

import { useThemeColors } from './hooks';
import { themePalette } from './palette';

interface MockRootState {
  ui?: { theme?: 'light' | 'dark' };
}

type Selector = (state: MockRootState) => unknown;

const mockUseSelector = jest.fn<unknown, [Selector]>();

jest.mock('react-redux', () => ({
  useSelector: (selector: Selector) => mockUseSelector(selector),
}));

// Mock ThemeContext as null (no provider) so the hook falls back to Redux
jest.mock('./ThemeContext', () => ({
  ThemeContext: { _currentValue: null, Provider: jest.fn() },
}));

describe('useThemeColors', () => {
  afterEach(() => {
    mockUseSelector.mockReset();
  });

  it('returns dark palette when theme is dark', () => {
    mockUseSelector.mockImplementation((selector) => selector({ ui: { theme: 'dark' } }));

    const { result } = renderHook(() => useThemeColors());
    expect(result.current).toBe(themePalette.dark);
  });

  it('defaults to light palette when theme is missing', () => {
    mockUseSelector.mockImplementation((selector) => selector({ ui: { theme: 'light' } }));

    const { result } = renderHook(() => useThemeColors());
    expect(result.current).toBe(themePalette.light);
  });

  it('returns light palette when theme is light', () => {
    mockUseSelector.mockImplementation((selector) => selector({ ui: { theme: 'light' } }));

    const { result } = renderHook(() => useThemeColors());
    expect(result.current).toBe(themePalette.light);
  });
});
