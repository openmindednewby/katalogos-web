import { useWindowDimensions } from 'react-native';

import { useBreakpoint } from './useBreakpoint';
import { PHONE_BREAKPOINT_PX, TABLET_BREAKPOINT_PX } from '../shared/constants';
import Viewport from '../shared/enums/Viewport';

jest.mock('react-native', () => ({
  useWindowDimensions: jest.fn(),
}));

const mockUseWindowDimensions = useWindowDimensions as jest.Mock;

const NARROW_PHONE_WIDTH = 375;
const MID_TABLET_WIDTH = 600;
const WIDE_DESKTOP_WIDTH = 1440;
const VERY_NARROW_WIDTH = 320;

describe('useBreakpoint', () => {
  afterEach(() => {
    mockUseWindowDimensions.mockReset();
  });

  it('returns phone at phone boundary', () => {
    mockUseWindowDimensions.mockReturnValue({ width: PHONE_BREAKPOINT_PX, height: 800 });
    const result = useBreakpoint();
    expect(result).toEqual({
      isPhone: true,
      isTablet: false,
      isDesktop: false,
      breakpoint: Viewport.Mobile,
      width: PHONE_BREAKPOINT_PX,
    });
  });

  it('returns phone for narrow width', () => {
    mockUseWindowDimensions.mockReturnValue({ width: NARROW_PHONE_WIDTH, height: 667 });
    const result = useBreakpoint();
    expect(result.isPhone).toBe(true);
    expect(result.isTablet).toBe(false);
    expect(result.isDesktop).toBe(false);
    expect(result.breakpoint).toBe(Viewport.Mobile);
  });

  it('returns tablet just above phone boundary', () => {
    mockUseWindowDimensions.mockReturnValue({ width: PHONE_BREAKPOINT_PX + 1, height: 800 });
    const result = useBreakpoint();
    expect(result).toEqual({
      isPhone: false,
      isTablet: true,
      isDesktop: false,
      breakpoint: Viewport.Tablet,
      width: PHONE_BREAKPOINT_PX + 1,
    });
  });

  it('returns tablet for mid-range width', () => {
    mockUseWindowDimensions.mockReturnValue({ width: MID_TABLET_WIDTH, height: 800 });
    const result = useBreakpoint();
    expect(result.isPhone).toBe(false);
    expect(result.isTablet).toBe(true);
    expect(result.isDesktop).toBe(false);
    expect(result.breakpoint).toBe(Viewport.Tablet);
  });

  it('returns tablet at upper boundary', () => {
    mockUseWindowDimensions.mockReturnValue({ width: TABLET_BREAKPOINT_PX, height: 1024 });
    const result = useBreakpoint();
    expect(result.isPhone).toBe(false);
    expect(result.isTablet).toBe(true);
    expect(result.isDesktop).toBe(false);
    expect(result.breakpoint).toBe(Viewport.Tablet);
  });

  it('returns desktop just above tablet boundary', () => {
    mockUseWindowDimensions.mockReturnValue({ width: TABLET_BREAKPOINT_PX + 1, height: 1024 });
    const result = useBreakpoint();
    expect(result).toEqual({
      isPhone: false,
      isTablet: false,
      isDesktop: true,
      breakpoint: Viewport.Desktop,
      width: TABLET_BREAKPOINT_PX + 1,
    });
  });

  it('returns desktop for wide width', () => {
    mockUseWindowDimensions.mockReturnValue({ width: WIDE_DESKTOP_WIDTH, height: 900 });
    const result = useBreakpoint();
    expect(result.isPhone).toBe(false);
    expect(result.isTablet).toBe(false);
    expect(result.isDesktop).toBe(true);
    expect(result.breakpoint).toBe(Viewport.Desktop);
  });

  it('includes width in the result', () => {
    mockUseWindowDimensions.mockReturnValue({ width: VERY_NARROW_WIDTH, height: 568 });
    const result = useBreakpoint();
    expect(result.width).toBe(VERY_NARROW_WIDTH);
  });
});
