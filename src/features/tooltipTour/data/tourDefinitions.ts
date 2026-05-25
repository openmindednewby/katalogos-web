import TooltipPlacement from '@/shared/enums/TooltipPlacement';
import TooltipTourId from '@/shared/enums/TooltipTourId';

import type { TooltipTour } from '../types';

/** Dashboard tour: highlights overview card, quick actions, and setup checklist. */
export const dashboardTour: TooltipTour = {
  id: TooltipTourId.Dashboard,
  steps: [
    {
      id: 'dashboard-welcome',
      targetTestId: 'dashboard-overview-card',
      titleKey: 'tooltipTour.dashboard.welcomeTitle',
      descriptionKey: 'tooltipTour.dashboard.welcomeDescription',
      placement: TooltipPlacement.Bottom,
    },
    {
      id: 'dashboard-quick-actions',
      targetTestId: 'dashboard-quick-actions',
      titleKey: 'tooltipTour.dashboard.quickActionsTitle',
      descriptionKey: 'tooltipTour.dashboard.quickActionsDescription',
      placement: TooltipPlacement.Bottom,
    },
    {
      id: 'dashboard-checklist',
      targetTestId: 'setup-checklist',
      titleKey: 'tooltipTour.dashboard.setupChecklistTitle',
      descriptionKey: 'tooltipTour.dashboard.setupChecklistDescription',
      placement: TooltipPlacement.Top,
    },
  ],
};

/** Menu editor tour: highlights tabs, auto-save, and preview. */
export const editorTour: TooltipTour = {
  id: TooltipTourId.Editor,
  steps: [
    {
      id: 'editor-tabs',
      targetTestId: 'menu-tab-content',
      titleKey: 'tooltipTour.editor.editorTabsTitle',
      descriptionKey: 'tooltipTour.editor.editorTabsDescription',
      placement: TooltipPlacement.Bottom,
    },
    {
      id: 'editor-save',
      targetTestId: 'auto-save-indicator',
      titleKey: 'tooltipTour.editor.saveButtonTitle',
      descriptionKey: 'tooltipTour.editor.saveButtonDescription',
      placement: TooltipPlacement.Bottom,
    },
    {
      id: 'editor-preview',
      targetTestId: 'menu-tab-preview',
      titleKey: 'tooltipTour.editor.previewButtonTitle',
      descriptionKey: 'tooltipTour.editor.previewButtonDescription',
      placement: TooltipPlacement.Bottom,
    },
  ],
};

/** Public menu tour: highlights theme selector, QR code, and share button. */
export const publicMenuTour: TooltipTour = {
  id: TooltipTourId.PublicMenu,
  steps: [
    {
      id: 'public-theme',
      targetTestId: 'menu-editor-theme-selector',
      titleKey: 'tooltipTour.publicMenu.themeTitle',
      descriptionKey: 'tooltipTour.publicMenu.themeDescription',
      placement: TooltipPlacement.Bottom,
    },
    {
      id: 'public-qr',
      targetTestId: 'menu-card-qr-code-button',
      titleKey: 'tooltipTour.publicMenu.qrCodeTitle',
      descriptionKey: 'tooltipTour.publicMenu.qrCodeDescription',
      placement: TooltipPlacement.Left,
    },
    {
      id: 'public-share',
      targetTestId: 'public-menu-share-button',
      titleKey: 'tooltipTour.publicMenu.shareTitle',
      descriptionKey: 'tooltipTour.publicMenu.shareDescription',
      placement: TooltipPlacement.Left,
    },
  ],
};

/** Strongly typed tour registry mapping tour IDs to their definitions. */
export const tourRegistry: Readonly<Record<TooltipTourId, TooltipTour>> = {
  [TooltipTourId.Dashboard]: dashboardTour,
  [TooltipTourId.Editor]: editorTour,
  [TooltipTourId.PublicMenu]: publicMenuTour,
};

/** Total number of defined tours. */
export const TOTAL_TOURS = Object.keys(tourRegistry).length;
