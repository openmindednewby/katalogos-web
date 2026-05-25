# Fix QR Code Frontend Code Review Issues

## Problem Statement
Four code review issues found in the QR Code frontend implementation need to be fixed:
1. TenantListItem.tsx exceeds the 200-line component limit
2. Magic numbers in qrCodeStyles.ts
3. Rendering-focused tests in TenantListItem.test.tsx
4. Translation key comment needed in TenantListItemParts.tsx

## Implementation Plan

### Issue 1: Extract logic from TenantListItem.tsx
- Move `extractItemData`, `deriveActivateState`, `deriveNumericStatus`, `deriveRawStatusForActions`, helper types, and prop resolution logic into a new utility file
- Keep only the component rendering in TenantListItem.tsx

### Issue 2: Named constants for magic numbers in qrCodeStyles.ts
- Define `OVERLAY_PADDING`, `SMALL_BORDER_RADIUS`, `SMALL_SPACING`, `TINY_SPACING`, `BUTTON_GAP`
- Replace all raw numbers with named constants

### Issue 3: Remove rendering-focused tests
- Remove 'renders QR code button with disabled state for inactive menu'
- Remove 'renders QR code button enabled for active menu'
- Remove 'renders open external button with reduced opacity for inactive menu'
- Remove 'renders open external button enabled for active menu'
- Keep callback-focused tests

### Issue 4: Add comment about namespace-specific QR code labels
- Add comment on QR code label lines noting they're only used by onlineMenus namespace

## Files to Modify
- `BaseClient/src/components/Tenants/TenantListItem.tsx`
- `BaseClient/src/components/Tenants/TenantListItemHelpers.ts` (new)
- `BaseClient/src/components/OnlineMenus/QrCode/utils/qrCodeStyles.ts`
- `BaseClient/src/components/Tenants/TenantListItem.test.tsx`
- `BaseClient/src/components/Tenants/TenantListItemParts.tsx`

## Success Criteria
- TenantListItem.tsx component under 200 lines
- No magic numbers in qrCodeStyles.ts
- No rendering-focused tests in test file
- Code comment explaining namespace-specific QR code labels
- All Tilt checks pass: lint-fix, unit-tests, prod-build
