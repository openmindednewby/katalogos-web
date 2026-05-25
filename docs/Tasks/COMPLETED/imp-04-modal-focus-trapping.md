# BC-IMP-04: Add Focus Trapping to Modal Components for Web Platform

## Status: In Progress

## Summary
Added keyboard focus trapping to 12 modal/dialog components for WCAG 2.4.3 compliance on web. Created a reusable `useFocusTrap` hook that is web-only (no-op on native where `<Modal>` handles focus natively).

## Changes Made

### New Files
| File | Purpose |
|------|---------|
| `src/hooks/useFocusTrap.ts` | Focus trap hook — web-only, attaches to container ref |
| `src/hooks/useFocusTrap.test.ts` | 7 unit tests covering wrap, cleanup, no-op |

### Modified Files — Group A (hook only)
| File | Change |
|------|--------|
| `src/components/Shared/ModalShell.tsx` | Added ref + useFocusTrap |
| `src/components/Shared/ConfirmDialog.tsx` | Added ref + useFocusTrap |
| `src/components/feedback/ApiErrorModal.tsx` | Added ref + useFocusTrap |
| `src/components/OnlineMenus/MenuEditorModal.tsx` | Added ref + useFocusTrap |
| `src/components/OnlineMenus/MenuPreviewModal.tsx` | Added ref + useFocusTrap |
| `src/pwa/PWAInstallPrompt.tsx` | Added ref + useFocusTrap |
| `src/pwa/IOSAddToHomePrompt.tsx` | Added ref + useFocusTrap |

### Modified Files — Group B (hook + a11y attrs)
| File | Change |
|------|--------|
| `src/components/Settings/components/DisplayPreferenceDropdown.tsx` | Added ref + useFocusTrap + `accessibilityViewIsModal`, `role="dialog"`, `aria-label` |
| `src/components/OnlineMenus/Styling/components/ImportExportButtons.tsx` | Added ref + useFocusTrap + `accessibilityViewIsModal`, `role="dialog"`, `aria-label` |
| `src/components/OnlineMenus/Styling/components/TypographyMenuPicker.tsx` | Added ref + useFocusTrap + `accessibilityViewIsModal`, `role="dialog"`, `aria-label` |
| `src/components/OnlineMenus/FullMenuEditor.tsx` | Added ref + useFocusTrap + `accessibilityViewIsModal`, `role="dialog"`, `aria-label` |
| `src/components/OnlineMenus/Styling/components/PriceStyleInputControls.tsx` | Added ref + useFocusTrap + `accessibilityViewIsModal`, `role="dialog"`, `aria-label` |

## Testing
- [ ] `useFocusTrap.test.ts` — 7/7 passing
- [ ] `npm run lint:fix` — pending
- [ ] `npm run test:coverage` — pending
- [ ] `npx expo export --platform web` — pending
