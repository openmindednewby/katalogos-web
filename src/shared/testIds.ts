/**
 * Shared testID constants for E2E testing
 *
 * These constants are used both in React Native components and Playwright E2E tests
 * to ensure consistency and avoid magic strings.
 *
 * Usage in React components:
 *   import { TestIds } from '../shared/testIds';
 *   <View testID={TestIds.TEMPLATE_LIST}>
 *
 * Usage in Playwright tests:
 *   import { TestIds } from '../../OnlineMenuSaaS/clients/OnlineMenuClientApp/src/shared/testIds';
 *   page.locator(`[data-testid="${TestIds.TEMPLATE_LIST}"]`)
 *
 * Split into sub-modules:
 * - testIds/commonTestIds.ts: Common UI, login, navigation, loading states
 * - testIds/menuTestIds.ts: Menu management, editor, categories, items, display
 * - testIds/stylingTestIds.ts: Styling editors, notifications, content upload
 */

import { AccessibilityTestIds } from './testIds/accessibilityTestIds';
import { AccountHubTestIds } from './testIds/accountHubTestIds';
import { AiImportTestIds } from './testIds/aiImportTestIds';
import { AnalyticsTestIds } from './testIds/analyticsTestIds';
import { BillingTestIds } from './testIds/billingTestIds';
import { BreadcrumbTestIds } from './testIds/breadcrumbTestIds';
import { BusinessProfileTestIds } from './testIds/businessProfileTestIds';
import { CommonTestIds } from './testIds/commonTestIds';
import { CustomDomainTestIds } from './testIds/customDomainTestIds';
import { DarkModeTestIds } from './testIds/darkModeTestIds';
import { DashboardTestIds } from './testIds/dashboardTestIds';
import { ExperimentTestIds } from './testIds/experimentTestIds';
import { KeyboardShortcutTestIds } from './testIds/keyboardShortcutTestIds';
import { LandingTestIds } from './testIds/landingTestIds';
import { LegalTestIds } from './testIds/legalTestIds';
import { LocationOverrideTestIds } from './testIds/locationOverrideTestIds';
import { LocationSettingsTestIds } from './testIds/locationSettingsTestIds';
import { MenuEditorTestIds } from './testIds/menuEditorTestIds';
import { MenuExportTestIds } from './testIds/menuExportTestIds';
import { MenuExtrasTestIds } from './testIds/menuExtrasTestIds';
import { MenuTemplateTestIds } from './testIds/menuTemplateTestIds';
import { MenuTestIds } from './testIds/menuTestIds';
import { NavTestIds } from './testIds/navTestIds';
import { NutritionTestIds } from './testIds/nutritionTestIds';
import { PrivacyTestIds } from './testIds/privacyTestIds';
import { ProfileTestIds } from './testIds/profileTestIds';
import { PublicMenuTestIds } from './testIds/publicMenuTestIds';
import { ScheduleTestIds } from './testIds/scheduleTestIds';
import { ShowcaseTestIds } from './testIds/showcaseTestIds';
import { StatusPageTestIds } from './testIds/statusPageTestIds';
import { StylingTestIds } from './testIds/stylingTestIds';
import { TeamTestIds } from './testIds/teamTestIds';
import { TooltipTourTestIds } from './testIds/tooltipTourTestIds';
import { VersioningTestIds } from './testIds/versioningTestIds';
import { WhiteLabelTestIds } from './testIds/whiteLabelTestIds';

export const TestIds = {
  ...AccessibilityTestIds,
  ...AccountHubTestIds,
  ...AiImportTestIds,
  ...AnalyticsTestIds,
  ...BillingTestIds,
  ...BreadcrumbTestIds,
  ...BusinessProfileTestIds,
  ...CommonTestIds,
  ...CustomDomainTestIds,
  ...DarkModeTestIds,
  ...DashboardTestIds,
  ...ExperimentTestIds,
  ...KeyboardShortcutTestIds,
  ...LandingTestIds,
  ...LegalTestIds,
  ...LocationOverrideTestIds,
  ...LocationSettingsTestIds,
  ...MenuEditorTestIds,
  ...MenuExportTestIds,
  ...MenuExtrasTestIds,
  ...MenuTemplateTestIds,
  ...MenuTestIds,
  ...NavTestIds,
  ...NutritionTestIds,
  ...PrivacyTestIds,
  ...ProfileTestIds,
  ...PublicMenuTestIds,
  ...ScheduleTestIds,
  ...ShowcaseTestIds,
  ...StatusPageTestIds,
  ...StylingTestIds,
  ...TeamTestIds,
  ...TooltipTourTestIds,
  ...VersioningTestIds,
  ...WhiteLabelTestIds,
} as const;

// Type for testID values
export type TestId = typeof TestIds[keyof typeof TestIds];
