/**
 * Tests for useTooltipTour hook.
 * Focuses on step progression, persistence, dismiss, and reset logic.
 */
import { renderHook, act } from '@testing-library/react-native';

import TooltipTourId from '@/shared/enums/TooltipTourId';

import { TOUR_SEEN_KEY_PREFIX } from '../constants';
import { useTooltipTour, isTourSeen, resetTour, resetAllTours } from './useTooltipTour';

const DASHBOARD_STEPS = 3;
const EDITOR_STEPS = 3;

describe('useTooltipTour', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('starts inactive with no tour', () => {
    const { result } = renderHook(() => useTooltipTour());
    expect(result.current.isActive).toBe(false);
    expect(result.current.activeTourId).toBeNull();
    expect(result.current.currentStep).toBeNull();
    expect(result.current.totalSteps).toBe(0);
  });

  it('starts a tour and sets first step', () => {
    const { result } = renderHook(() => useTooltipTour());
    act(() => { result.current.startTour(TooltipTourId.Dashboard); });
    expect(result.current.isActive).toBe(true);
    expect(result.current.activeTourId).toBe(TooltipTourId.Dashboard);
    expect(result.current.currentStepIndex).toBe(0);
    expect(result.current.currentStep).not.toBeNull();
    expect(result.current.totalSteps).toBe(DASHBOARD_STEPS);
  });

  it('advances to the next step on handleNext', () => {
    const { result } = renderHook(() => useTooltipTour());
    act(() => { result.current.startTour(TooltipTourId.Dashboard); });
    act(() => { result.current.handleNext(); });
    expect(result.current.currentStepIndex).toBe(1);
    expect(result.current.currentStep?.id).toBe('dashboard-quick-actions');
  });

  it('finishes tour and marks seen when advancing past last step', () => {
    const { result } = renderHook(() => useTooltipTour());
    act(() => { result.current.startTour(TooltipTourId.Dashboard); });

    for (let i = 0; i < DASHBOARD_STEPS; i++) 
      act(() => { result.current.handleNext(); });
    

    expect(result.current.isActive).toBe(false);
    expect(result.current.activeTourId).toBeNull();
    const key = `${TOUR_SEEN_KEY_PREFIX}${TooltipTourId.Dashboard}`;
    expect(localStorage.getItem(key)).toBe('true');
  });

  it('dismisses tour and marks as seen', () => {
    const { result } = renderHook(() => useTooltipTour());
    act(() => { result.current.startTour(TooltipTourId.Editor); });
    act(() => { result.current.handleDismiss(); });
    expect(result.current.isActive).toBe(false);
    expect(isTourSeen(TooltipTourId.Editor)).toBe(true);
  });

  it('hasSeenTour returns false for unseen tours', () => {
    const { result } = renderHook(() => useTooltipTour());
    expect(result.current.hasSeenTour(TooltipTourId.Dashboard)).toBe(false);
  });

  it('hasSeenTour returns true after tour is completed', () => {
    const { result } = renderHook(() => useTooltipTour());
    act(() => { result.current.startTour(TooltipTourId.Editor); });

    for (let i = 0; i < EDITOR_STEPS; i++) 
      act(() => { result.current.handleNext(); });
    

    expect(result.current.hasSeenTour(TooltipTourId.Editor)).toBe(true);
  });

  it('does not start a tour with invalid ID', () => {
    const { result } = renderHook(() => useTooltipTour());
    act(() => { result.current.startTour('nonexistent' as TooltipTourId); });
    expect(result.current.isActive).toBe(false);
  });

  it('handleNext is a no-op when no tour is active', () => {
    const { result } = renderHook(() => useTooltipTour());
    act(() => { result.current.handleNext(); });
    expect(result.current.isActive).toBe(false);
    expect(result.current.currentStepIndex).toBe(0);
  });

  it('resets step index when starting a new tour', () => {
    const { result } = renderHook(() => useTooltipTour());
    act(() => { result.current.startTour(TooltipTourId.Dashboard); });
    act(() => { result.current.handleNext(); });
    expect(result.current.currentStepIndex).toBe(1);

    act(() => { result.current.handleDismiss(); });
    act(() => { result.current.startTour(TooltipTourId.Editor); });
    expect(result.current.currentStepIndex).toBe(0);
  });
});

describe('isTourSeen', () => {
  beforeEach(() => { localStorage.clear(); });

  it('returns false when not in localStorage', () => {
    expect(isTourSeen(TooltipTourId.Dashboard)).toBe(false);
  });

  it('returns true when set in localStorage', () => {
    localStorage.setItem(`${TOUR_SEEN_KEY_PREFIX}${TooltipTourId.Dashboard}`, 'true');
    expect(isTourSeen(TooltipTourId.Dashboard)).toBe(true);
  });
});

describe('resetTour', () => {
  beforeEach(() => { localStorage.clear(); });

  it('removes the tour seen flag from localStorage', () => {
    const key = `${TOUR_SEEN_KEY_PREFIX}${TooltipTourId.Dashboard}`;
    localStorage.setItem(key, 'true');
    resetTour(TooltipTourId.Dashboard);
    expect(localStorage.getItem(key)).toBeNull();
  });
});

describe('resetAllTours', () => {
  beforeEach(() => { localStorage.clear(); });

  it('clears seen flags for all tour IDs', () => {
    localStorage.setItem(`${TOUR_SEEN_KEY_PREFIX}${TooltipTourId.Dashboard}`, 'true');
    localStorage.setItem(`${TOUR_SEEN_KEY_PREFIX}${TooltipTourId.Editor}`, 'true');
    localStorage.setItem(`${TOUR_SEEN_KEY_PREFIX}${TooltipTourId.PublicMenu}`, 'true');
    resetAllTours();
    expect(isTourSeen(TooltipTourId.Dashboard)).toBe(false);
    expect(isTourSeen(TooltipTourId.Editor)).toBe(false);
    expect(isTourSeen(TooltipTourId.PublicMenu)).toBe(false);
  });
});
