import { useCallback, useMemo, useState } from 'react';

import TooltipTourId from '@/shared/enums/TooltipTourId';
import { isValueDefined } from '@/utils/is';

import { TOUR_SEEN_KEY_PREFIX } from '../constants';
import { tourRegistry } from '../data/tourDefinitions';

import type { TooltipStep, TooltipTourState } from '../types';

function buildStorageKey(tourId: TooltipTourId): string {
  return `${TOUR_SEEN_KEY_PREFIX}${tourId}`;
}

/** Check if a tour has been completed previously. */
export function isTourSeen(tourId: TooltipTourId): boolean {
  return localStorage.getItem(buildStorageKey(tourId)) === 'true';
}

function markTourSeen(tourId: TooltipTourId): void {
  localStorage.setItem(buildStorageKey(tourId), 'true');
}

/** Reset a specific tour so it can be shown again. */
export function resetTour(tourId: TooltipTourId): void {
  localStorage.removeItem(buildStorageKey(tourId));
}

/** Reset all tours so they can be shown again. */
export function resetAllTours(): void {
  resetTour(TooltipTourId.Dashboard);
  resetTour(TooltipTourId.Editor);
  resetTour(TooltipTourId.PublicMenu);
}

function resolveCurrentStep(tourId: TooltipTourId | null, stepIndex: number): TooltipStep | null {
  if (!isValueDefined(tourId)) return null;
  return tourRegistry[tourId].steps[stepIndex] ?? null;
}

function getTotalSteps(tourId: TooltipTourId | null): number {
  if (!isValueDefined(tourId)) return 0;
  return tourRegistry[tourId].steps.length;
}

function useFinishTour(
  activeTourId: TooltipTourId | null,
  setActiveTourId: (id: TooltipTourId | null) => void,
  setStepIndex: (i: number) => void,
): () => void {
  return useCallback((): void => {
    if (isValueDefined(activeTourId)) markTourSeen(activeTourId);
    setActiveTourId(null);
    setStepIndex(0);
  }, [activeTourId, setActiveTourId, setStepIndex]);
}

export function useTooltipTour(): TooltipTourState {
  const [activeTourId, setActiveTourId] = useState<TooltipTourId | null>(null);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const totalSteps = getTotalSteps(activeTourId);
  const currentStep = useMemo(() => resolveCurrentStep(activeTourId, currentStepIndex), [activeTourId, currentStepIndex]);
  const finishTour = useFinishTour(activeTourId, setActiveTourId, setCurrentStepIndex);

  const handleNext = useCallback((): void => {
    if (!isValueDefined(activeTourId)) return;
    const nextIndex = currentStepIndex + 1;
    if (nextIndex >= tourRegistry[activeTourId].steps.length) { finishTour(); return; }
    setCurrentStepIndex(nextIndex);
  }, [activeTourId, currentStepIndex, finishTour]);

  const startTour = useCallback((tourId: TooltipTourId): void => {
    if (!(tourId in tourRegistry)) return;
    const tour = tourRegistry[tourId];
    if (tour.steps.length === 0) return;
    setActiveTourId(tourId);
    setCurrentStepIndex(0);
  }, []);

  const hasSeenTour = useCallback((tourId: TooltipTourId): boolean => isTourSeen(tourId), []);

  const resetAll = useCallback((): void => { resetAllTours(); }, []);

  return {
    isActive: isValueDefined(activeTourId), activeTourId, currentStepIndex, currentStep, totalSteps,
    handleNext, handleDismiss: finishTour, startTour, hasSeenTour, resetAllTours: resetAll,
  };
}
