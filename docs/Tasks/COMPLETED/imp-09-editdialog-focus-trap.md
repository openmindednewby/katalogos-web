# IMP-09: Fix EditDialog Focus Trap for Keyboard Accessibility

## Problem
`TableNative/components/EditDialog.tsx` is a custom `div`-based modal with `role="dialog"`, `aria-modal="true"`, `tabIndex={-1}`, and handles Escape -- but does **not implement focus trapping**. A keyboard user can Tab out of the dialog into background content, violating WCAG 2.4.3 (Focus Order) and the WAI-ARIA dialog pattern.

## Approach
**Option A (native `<dialog>`)** -- Refactor EditDialog to use the native HTML `<dialog>` element, mirroring the pattern already used by `DialogNative`. This gives us browser-native focus trapping, backdrop, and Escape handling for free.

## Files to Modify
- `SyncfusionThemeStudio/src/components/ui/native/TableNative/components/EditDialog.tsx` -- refactor from div-based to native dialog

## Success Criteria
- [x] EditDialog uses native `<dialog>` element with `showModal()`/`close()`
- [x] Focus is trapped within the dialog when open
- [x] Escape key closes the dialog
- [x] Backdrop click closes the dialog
- [x] All existing functionality preserved (field editing, save, cancel)
- [x] Visual appearance unchanged
- [x] `npx tsc --noEmit` passes
- [x] `npm test` passes (115 files, 1523 tests all green)

## Changes Made
- Replaced the outer `<div>` overlay + inner `<div role="dialog">` with a single native `<dialog>` element
- Replaced the two `useRef<HTMLDivElement>` refs with one `useRef<HTMLDialogElement>`
- Added `useEffect` to sync open state via `dialog.showModal()` / `dialog.close()`
- Replaced custom `keydown` Escape listener with native `cancel` event handler (browser fires this automatically)
- Replaced custom backdrop click logic with a click handler on the `<dialog>` itself (`e.target === dialog`)
- Removed the `stopPropagation` effect (no longer needed -- no separate overlay div)
- Removed `DIALOG_OVERLAY_BG` constant (replaced by Tailwind `backdrop:bg-black/50` pseudo-element)
- Removed `role="dialog"`, `aria-modal="true"`, `tabIndex={-1}` (native `<dialog>` provides these implicitly)
- Kept `aria-label`, `data-testid`, all form fields, buttons, and the `Props` interface unchanged
- File reduced from 163 to 155 lines, well under 200-line component limit
