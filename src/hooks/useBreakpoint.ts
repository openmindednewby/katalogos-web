import { useWindowDimensions } from 'react-native';

import { PHONE_BREAKPOINT_PX, TABLET_BREAKPOINT_PX } from '../shared/constants';
import Viewport from '../shared/enums/Viewport';

interface BreakpointResult {
  isPhone: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  breakpoint: Viewport;
  width: number;
}

/** Returns current viewport breakpoint flags based on window width. */
export function useBreakpoint(): BreakpointResult {
  const { width } = useWindowDimensions();
  const isPhone = width <= PHONE_BREAKPOINT_PX;
  const isDesktop = width > TABLET_BREAKPOINT_PX;
  const isTablet = !isPhone && !isDesktop;

  let breakpoint: Viewport;
  if (isPhone) breakpoint = Viewport.Mobile;
  else if (isDesktop) breakpoint = Viewport.Desktop;
  else breakpoint = Viewport.Tablet;

  return { isPhone, isTablet, isDesktop, breakpoint, width };
}
