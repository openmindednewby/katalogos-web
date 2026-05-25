# Image Cropping for Menu Editor (Section 1.2)

## Problem Statement
Menu editors need the ability to crop images before upload. On native, expo-image-picker's `allowsEditing` handles this. On web, there is no cropping capability. This task adds a web-only CropModal using `react-easy-crop` that intercepts the image pick flow, lets users crop with aspect ratio presets, then feeds the cropped blob into the existing upload pipeline.

## Architecture
- Client-side only. Zero backend changes.
- Cropped image is a canvas Blob converted to FileInfo and fed into the existing ContentUploader pipeline.
- New crop UI only renders on web (Platform.OS === 'web' guard).
- Library: `react-easy-crop`

## Data Flow
Pick file -> if enableCrop && web -> open CropModal -> user crops -> canvas toBlob -> blobToFileInfo -> resolve Promise -> ContentUploader resumes normal upload

## Implementation Plan

### Phase 1: Foundation
- [x] Install `react-easy-crop`
- [x] Create `AspectRatioPreset.ts` enum
- [x] Create `cropImageUtils.ts` with helpers + constants
- [x] Create `cropImageUtils.test.ts` (7 tests)
- [x] Create `cropModalStyles.ts` (extracted styles)
- [x] Add testIds to `stylingTestIds.ts`
- [x] Add `imageCrop` translations to `en.json`

### Phase 2: CropModal
- [x] Create `AspectRatioSelector.tsx`
- [x] Create `useImageCrop.ts` hook
- [x] Create `useImageCrop.test.ts` (7 tests)
- [x] Create `CropModal.tsx`
- [x] Create `CropModal.test.tsx` (4 tests)

### Phase 3: ImagePicker Integration
- [x] Modify `ImagePicker.tsx` to add `enableCrop` + `initialPreset` props and wire in CropModal

### Phase 4: Wire Into Menu Editor
- [x] Modify `MenuItemContentPickers.tsx` - add `enableCrop`
- [x] Modify `CategoryContentPickers.tsx` - add `enableCrop` + `initialPreset={AspectRatioPreset.Landscape}`

## Files Created
- `BaseClient/src/shared/enums/AspectRatioPreset.ts` - const enum (Square, Landscape, Classic, Free)
- `BaseClient/src/components/Content/utils/cropImageUtils.ts` - getAspectRatioValue, blobToFileInfo, cropImageToBlob
- `BaseClient/src/components/Content/utils/cropImageUtils.test.ts` - 7 unit tests
- `BaseClient/src/components/Content/utils/cropModalStyles.ts` - extracted StyleSheet for CropModal
- `BaseClient/src/components/Content/hooks/useImageCrop.ts` - hook managing crop flow
- `BaseClient/src/components/Content/hooks/useImageCrop.test.ts` - 7 unit tests
- `BaseClient/src/components/Content/components/AspectRatioSelector.tsx` - aspect ratio button row
- `BaseClient/src/components/Content/components/CropModal.tsx` - web-only crop modal
- `BaseClient/src/components/Content/components/CropModal.test.tsx` - 4 unit tests

## Files Modified
- `BaseClient/package.json` - added react-easy-crop dependency
- `BaseClient/src/shared/testIds/stylingTestIds.ts` - added 8 crop testIds
- `BaseClient/src/localization/locales/en.json` - added imageCrop section (17 keys)
- `BaseClient/src/components/Content/components/ImagePicker.tsx` - added enableCrop, initialPreset props
- `BaseClient/src/components/OnlineMenus/components/MenuItemContentPickers.tsx` - added enableCrop
- `BaseClient/src/components/OnlineMenus/components/CategoryContentPickers.tsx` - added enableCrop + Landscape preset

## Quality Results
- **Lint**: All touched files pass with zero errors and zero warnings
- **Unit Tests**: 18 new tests, all passing (7 cropImageUtils + 7 useImageCrop + 4 CropModal)
- **Prod Build**: Passes successfully
- **Pre-existing failures**: `useAutoSave.test.ts` (10 tests) - unrelated to this change

## Success Criteria
- [x] CropModal opens on web when enableCrop is true
- [x] Aspect ratio presets (Square, Landscape, Classic, Free) selectable
- [x] Cropped image converted to blob and fed into upload pipeline
- [x] All 18 new tests pass
- [x] All text uses FM() with keys in en.json
- [x] All interactive elements have testID + accessibilityLabel + accessibilityHint
- [x] Files under size limits (max 123 lines for CropModal component)
- [x] Production build succeeds
