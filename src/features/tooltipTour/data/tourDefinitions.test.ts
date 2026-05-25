/**
 * Tests for tour definitions.
 * Validates structure, uniqueness, and completeness of tour step data.
 */
import TooltipTourId from '@/shared/enums/TooltipTourId';

import {
  dashboardTour,
  editorTour,
  publicMenuTour,
  tourRegistry,
  TOTAL_TOURS,
} from './tourDefinitions';

const EXPECTED_DASHBOARD_STEPS = 3;
const EXPECTED_EDITOR_STEPS = 3;
const EXPECTED_PUBLIC_MENU_STEPS = 3;

describe('tourDefinitions', () => {
  it('dashboard tour has correct ID', () => {
    expect(dashboardTour.id).toBe(TooltipTourId.Dashboard);
  });

  it('editor tour has correct ID', () => {
    expect(editorTour.id).toBe(TooltipTourId.Editor);
  });

  it('public menu tour has correct ID', () => {
    expect(publicMenuTour.id).toBe(TooltipTourId.PublicMenu);
  });

  it('dashboard tour has expected number of steps', () => {
    expect(dashboardTour.steps).toHaveLength(EXPECTED_DASHBOARD_STEPS);
  });

  it('editor tour has expected number of steps', () => {
    expect(editorTour.steps).toHaveLength(EXPECTED_EDITOR_STEPS);
  });

  it('public menu tour has expected number of steps', () => {
    expect(publicMenuTour.steps).toHaveLength(EXPECTED_PUBLIC_MENU_STEPS);
  });

  it('all steps have unique IDs within each tour', () => {
    const allTours = [dashboardTour, editorTour, publicMenuTour];
    allTours.forEach((tour) => {
      const ids = tour.steps.map((s) => s.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
    });
  });

  it('all steps have required fields populated', () => {
    const allTours = [dashboardTour, editorTour, publicMenuTour];
    allTours.forEach((tour) => {
      tour.steps.forEach((step) => {
        expect(step.id).not.toBe('');
        expect(step.targetTestId).not.toBe('');
        expect(step.titleKey).not.toBe('');
        expect(step.descriptionKey).not.toBe('');
        expect(step.placement).toBeDefined();
      });
    });
  });

  it('all step IDs are globally unique across all tours', () => {
    const allIds = [
      ...dashboardTour.steps.map((s) => s.id),
      ...editorTour.steps.map((s) => s.id),
      ...publicMenuTour.steps.map((s) => s.id),
    ];
    const uniqueIds = new Set(allIds);
    expect(uniqueIds.size).toBe(allIds.length);
  });
});

describe('tourRegistry', () => {
  it('contains all tour IDs', () => {
    expect(Object.keys(tourRegistry)).toHaveLength(TOTAL_TOURS);
    expect(tourRegistry[TooltipTourId.Dashboard]).toBeDefined();
    expect(tourRegistry[TooltipTourId.Editor]).toBeDefined();
    expect(tourRegistry[TooltipTourId.PublicMenu]).toBeDefined();
  });

  it('maps to correct tour objects', () => {
    expect(tourRegistry[TooltipTourId.Dashboard]).toBe(dashboardTour);
    expect(tourRegistry[TooltipTourId.Editor]).toBe(editorTour);
    expect(tourRegistry[TooltipTourId.PublicMenu]).toBe(publicMenuTour);
  });

  it('TOTAL_TOURS constant matches registry size', () => {
    expect(TOTAL_TOURS).toBe(Object.keys(tourRegistry).length);
  });
});
