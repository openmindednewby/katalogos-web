/**
 * Constants for the MediaPositionEditor component.
 */

import { MediaFit, MediaPosition, MediaSize } from '../../../../types/menuStyleTypes';

import type { IconName } from '../../Icons';

export interface PositionOption {
  id: MediaPosition;
  labelKey: string;
  icon: IconName;
}

export interface SizeOption {
  id: MediaSize;
  labelKey: string;
}

export interface FitOption {
  id: MediaFit;
  labelKey: string;
}

export const POSITION_OPTIONS: PositionOption[] = [
  { id: MediaPosition.Left, labelKey: 'mediaPosition.position.left', icon: 'chevronLeft' },
  { id: MediaPosition.Right, labelKey: 'mediaPosition.position.right', icon: 'chevronRight' },
  { id: MediaPosition.Top, labelKey: 'mediaPosition.position.top', icon: 'chevronUp' },
  { id: MediaPosition.Bottom, labelKey: 'mediaPosition.position.bottom', icon: 'chevronDown' },
  { id: MediaPosition.Background, labelKey: 'mediaPosition.position.background', icon: 'squareFill' },
];

export const SIZE_OPTIONS: SizeOption[] = [
  { id: MediaSize.Small, labelKey: 'mediaPosition.size.small' },
  { id: MediaSize.Medium, labelKey: 'mediaPosition.size.medium' },
  { id: MediaSize.Large, labelKey: 'mediaPosition.size.large' },
  { id: MediaSize.Full, labelKey: 'mediaPosition.size.full' },
];

export const FIT_OPTIONS: FitOption[] = [
  { id: MediaFit.Cover, labelKey: 'mediaPosition.fit.cover' },
  { id: MediaFit.Contain, labelKey: 'mediaPosition.fit.contain' },
  { id: MediaFit.Fill, labelKey: 'mediaPosition.fit.fill' },
];

export const MIN_BORDER_RADIUS = 0;
export const MAX_BORDER_RADIUS = 24;
export const BORDER_RADIUS_STEP = 1;

export const POSITION_OPTION_COUNT = 5;
export const SIZE_OPTION_COUNT = 4;
export const FIT_OPTION_COUNT = 3;

// Color constants
export const SELECTED_BUTTON_TEXT_COLOR = '#FFFFFF';
export const SWITCH_THUMB_INACTIVE_COLOR = '#f4f3f4';
export const SWITCH_TRACK_INACTIVE_COLOR = '#767577';
