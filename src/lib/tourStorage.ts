import TooltipTourId from '@/shared/enums/TooltipTourId';

const TOUR_SEEN_KEY_PREFIX = 'menuflow_tour_seen_';

/** Reset all tooltip tours so they appear again on next visit. */
export function resetAllTourStorage(): void {
  localStorage.removeItem(`${TOUR_SEEN_KEY_PREFIX}${TooltipTourId.Dashboard}`);
  localStorage.removeItem(`${TOUR_SEEN_KEY_PREFIX}${TooltipTourId.Editor}`);
  localStorage.removeItem(`${TOUR_SEEN_KEY_PREFIX}${TooltipTourId.PublicMenu}`);
}
