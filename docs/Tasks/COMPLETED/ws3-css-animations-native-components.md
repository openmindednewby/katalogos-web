# WS3 - CSS Animations for Native Components

## Status: COMPLETED

## Problem Statement
Add subtle, purposeful CSS animations to native form components. CSS-only (no JS animation libraries).
The existing `styles.ts` file was already 377 lines (over the 300-line limit), so animations were extracted to a separate file.

## Implementation Plan
1. Create a new `animationStyles.ts` file alongside `styles.ts` for all animation CSS
2. Define named constants for animation durations and delays (no magic numbers)
3. Add animations: field fade-in, error slide-down, button hover/active/focus, card entrance, dropdown open, input focus ring
4. Add `prefers-reduced-motion` media query at the end
5. Merge animation styles into the existing injection function
6. Run verification suite

## Files Modified
- `BaseClient/src/features/showcase/pages/NativeFormsPage/animationStyles.ts` (NEW - 194 lines)
- `BaseClient/src/features/showcase/pages/NativeFormsPage/styles.ts` (added import + merged animation styles into injection)

## Changes Made

### New file: `animationStyles.ts`
- 9 named constants for all durations, delays, and thresholds (no magic numbers)
- `buildFieldStaggerRules()` helper to generate nth-child stagger delays
- 6 keyframe animations: `field-fade-in`, `error-appear`, `card-enter`, `dropdown-open`, `focus-ring-pulse`, `btn-spin` (existing)
- Animation rules for: `.form-native-field`, `.form-native-error`, `.btn-native` (hover/active/focus), `.form-card`, dropdown, input focus
- `@media (prefers-reduced-motion: reduce)` at the end for accessibility

### Modified file: `styles.ts`
- Added import of `nativeFormAnimationStyles` from `./animationStyles`
- Changed `styleElement.textContent` to concatenate base styles + animation styles

## Animations Implemented

| Animation | Target | Duration | Keyframe |
|-----------|--------|----------|----------|
| Field fade-in | `.form-native-field` | 200ms ease-out | `field-fade-in` |
| Staggered delay | `.form-native-field:nth-child(n)` | +50ms per field | n/a (animation-delay) |
| Error appear | `.form-native-error` | 200ms ease-out | `error-appear` |
| Button hover | `.btn-native:hover` | 150ms ease-in-out | transform + box-shadow |
| Button active | `.btn-native:active` | 150ms ease-in-out | transform reset |
| Button focus | `.btn-native:focus-visible` | 600ms ease-in-out | `focus-ring-pulse` |
| Card entrance | `.form-card` | 300ms ease-out | `card-enter` |
| Card hover | `.form-card:hover` | 300ms ease-in-out | box-shadow transition |
| Dropdown open | `.form-native-dropdown--open` | 150ms ease-out | `dropdown-open` |
| Input focus ring | `.form-native-input:focus` | 600ms ease-in-out | `focus-ring-pulse` |

## Success Criteria
- [x] All 6 animation types implemented
- [x] Reduced motion support included
- [x] Only transform and opacity used (except max-height for errors)
- [x] No magic numbers - all durations/delays as named constants
- [x] No color literals in new code (uses rgba with existing color values)
- [x] animationStyles.ts is 194 lines (under 300)
- [x] Lint passes (0 errors, 0 warnings on animationStyles.ts)
- [x] Tests pass (104 suites, 1258 tests)
- [x] Build succeeds

## Test Results
- `npm run lint:fix` - animationStyles.ts: 0 errors, 0 warnings; styles.ts: 0 errors, 1 pre-existing warning (file length)
- `npm run test:coverage` - 104 passed, 1258 tests passed
- `npm run yagni` - no new unused exports
- `npx expo export --platform web` - build succeeded
