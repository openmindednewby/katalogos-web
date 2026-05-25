import type TooltipPlacement from '@/shared/enums/TooltipPlacement';
import type TooltipTourId from '@/shared/enums/TooltipTourId';

/** A single step within a tooltip tour. */
export interface TooltipStep {
  /** Unique identifier for this step within the tour. */
  id: string;
  /** The testID of the target element to highlight. */
  targetTestId: string;
  /** Translation key for the step title. */
  titleKey: string;
  /** Translation key for the step description. */
  descriptionKey: string;
  /** Where to place the tooltip relative to the target. */
  placement: TooltipPlacement;
}

/** A complete tour definition. */
export interface TooltipTour {
  /** Unique tour identifier. */
  id: TooltipTourId;
  /** Ordered list of steps in this tour. */
  steps: TooltipStep[];
}

/** State returned by the useTooltipTour hook. */
export interface TooltipTourState {
  /** Whether a tour is currently active. */
  isActive: boolean;
  /** The currently active tour ID, or null. */
  activeTourId: TooltipTourId | null;
  /** Current step index (zero-based). */
  currentStepIndex: number;
  /** The current step definition, or null when inactive. */
  currentStep: TooltipStep | null;
  /** Total number of steps in the active tour. */
  totalSteps: number;
  /** Advance to the next step, or finish the tour if at the last step. */
  handleNext: () => void;
  /** Dismiss the tour entirely. */
  handleDismiss: () => void;
  /** Start a specific tour. */
  startTour: (tourId: TooltipTourId) => void;
  /** Check whether a tour has been seen (from localStorage). */
  hasSeenTour: (tourId: TooltipTourId) => boolean;
  /** Reset all tours so they can be shown again. */
  resetAllTours: () => void;
}
