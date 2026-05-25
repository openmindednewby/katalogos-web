# Welcome Wizard (3-Step Onboarding)

> **Status**: COMPLETED
> **Priority**: P0
> **Scope**: Frontend (BaseClient)
> **Started**: 2026-03-14
> **Completed**: 2026-03-16

---

## 1. Problem

New users land on an empty dashboard with no guided setup. They must discover features on their own, leading to poor activation. Time-to-value is too high.

## 2. Solution

A 3-step welcome wizard shown on first login for new tenants:

| Step | Action | API |
|------|--------|-----|
| 1. Business Name | Enter restaurant/business name | `updateTenant` (identity) |
| 2. Upload Logo | Pick and upload a logo image via ImagePicker | `updateTenant` with logoUrl |
| 3. Create First Menu | Enter menu name, create it | `createTenantMenu` (onlinemenu) |

### Behavior
- Shows instead of dashboard content when `isEmpty && !wizardCompleted`
- Wizard completion stored in `localStorage` (`menuflow_onboarding_completed`)
- Each step has "Skip" option
- After completion, transitions to normal dashboard
- Progress indicator shows current step (dots + bar)

## 3. Architecture

### New Files Created
- `src/shared/enums/WizardStep.ts` — const enum for wizard steps (BusinessName, Logo, CreateMenu, Completed)
- `src/components/Dashboard/hooks/useWelcomeWizard.ts` — wizard state, step navigation, API calls (~100 lines)
- `src/components/Dashboard/hooks/useWelcomeWizard.test.ts` — unit tests for hook logic (~155 lines)
- `src/components/Dashboard/components/WelcomeWizard.tsx` — main wizard shell component (~65 lines)
- `src/components/Dashboard/components/WizardStepContent.tsx` — step render functions (~178 lines)
- `src/components/Dashboard/components/wizardContentStyles.ts` — shared wizard styles and constants
- `src/components/Dashboard/components/WizardProgressBar.tsx` — progress dots + bar (~92 lines)

### Modified Files
- `src/components/Dashboard/components/DashboardPage.tsx` — integrated wizard via `useWelcomeWizard` + conditional render (177 lines)
- `src/shared/testIds/dashboardTestIds.ts` — added 10 wizard test IDs
- `src/localization/locales/en.json` — added 23 wizard translation keys under `dashboard.wizard`

### State Management
- Wizard step state: local `useState` (current step, form values)
- Wizard completion: `localStorage` flag
- API mutations: `useIdentityServiceAPIEndpointsTenantsUpdateTenant` + `useOnlineMenuWebTenantMenusCreate`
- No Redux/global state needed

## 4. Verification Checklist

- [x] All interactive elements have testID + accessibilityLabel + accessibilityHint
- [x] All text via FM() -- 23 translation keys in en.json
- [x] No hardcoded strings (verified with grep)
- [x] Files under size limits (all under 300 lines, component under 200)
- [x] Functions under 50 lines
- [x] Function parameters under 4 (refactored renderContinueButton to options object)
- [x] No magic numbers (all extracted to named constants)
- [x] const enum used for WizardStep in its own file
- [x] Unit tests cover: visibility logic, step navigation, skip, API call triggers, localStorage persistence
- [x] Lifecycle pipeline: lint PASS, YAGNI PASS, unit tests PASS, prod build PASS
- [x] Code review: REVIEW_FAILED → fixed 2 issues → REVIEW_PASSED
  - Converted `advanceStep` and `executeContinue` from if/else to switch statements
  - Added exhaustive `case WizardStep.Completed: break` for switch-exhaustiveness-check
- [x] Accessibility fixes (from visual QA static analysis):
  - Skip button: added `minHeight: 44` + `justifyContent: 'center'` for WCAG touch target
  - WizardProgressBar: added `accessibilityRole="progressbar"` + `accessibilityValue`
- [x] Linter auto-refactor: `renderStep1/2/3/Completed` functions → proper React components (`Step1Content`, `Step2Content`, `Step3Content`, `CompletedContent`), `renderContinueButton` → `ContinueButton` component, `renderSkipButton` → `SkipButton` component
- [ ] Browser visual QA — blocked (Chrome MCP tools not available)
- [ ] E2E regression tests — blocked (identity-api needs Docker Desktop running)
