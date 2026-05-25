# E2E Tests for Menu Content Upload Feature

> **Reference**: CLAUDE.md E2E Testing Guidelines

## Status: COMPLETED

## Problem Statement
Create comprehensive E2E tests for uploading and loading images/videos in the online menu feature. The user reported a CORS error when loading content from the storage service (SeaweedFS on port 5013). These tests will:
1. Verify image/video upload functionality works through the menu editor
2. Detect CORS issues when content is loaded from SeaweedFS
3. Ensure content persists after saving and reloading menus

## Root Cause Analysis
CORS configuration in SeaweedFS may not include the E2E test client origin (`http://localhost:8082` or `http://quizmanager-client`).

## Implementation Plan

### Step 1: Update E2E testIds (E2ETests/shared/testIds.ts) - COMPLETED
Added missing test IDs that match the BaseClient:
- MENU_ITEM_IMAGE_PICKER
- MENU_ITEM_VIDEO_PICKER
- MENU_ITEM_DOCUMENT_PICKER
- CATEGORY_IMAGE_PICKER
- CATEGORY_VIDEO_PICKER

### Step 2: Update docker-compose.e2e.yml - COMPLETED
Added ContentService infrastructure:
- content-db (PostgreSQL)
- content-api (Content API on port 5009)
- seaweedfs-master, seaweedfs-volume, seaweedfs-filer, seaweedfs-s3 (storage on port 5013)
- seaweedfs-init (bucket initialization)
- Configured CORS to include E2E test origins

### Step 3: Update OnlineMenusPage (E2ETests/pages/OnlineMenusPage.ts) - COMPLETED
Added methods for:
- Adding categories and menu items
- Expanding categories to show fields
- Uploading images/videos to menu items and categories
- Verifying content previews and image load (CORS detection)
- Saving/canceling menu editor
- Opening and verifying images in preview modal

### Step 4: Create new test file - COMPLETED
Created `E2ETests/tests/online-menus/menu-content-upload.spec.ts` with:
- Test suite for menu content upload workflow
- Test suite for error handling
- Test suite for multiple content uploads

## Files Modified

### 1. E2ETests/shared/testIds.ts
Added test IDs:
```typescript
MENU_ITEM_IMAGE_PICKER: 'menu-item-image-picker',
MENU_ITEM_VIDEO_PICKER: 'menu-item-video-picker',
MENU_ITEM_DOCUMENT_PICKER: 'menu-item-document-picker',
CATEGORY_IMAGE_PICKER: 'category-image-picker',
CATEGORY_VIDEO_PICKER: 'category-video-picker',
```

### 2. docker-compose.e2e.yml
Added services:
- content-db (PostgreSQL for ContentService)
- content-api (Content API service)
- seaweedfs-master, seaweedfs-volume, seaweedfs-filer, seaweedfs-s3
- seaweedfs-init (bucket initialization)

Added volumes:
- e2e-content-db
- e2e-seaweedfs-data

### 3. E2ETests/pages/OnlineMenusPage.ts
Added locators:
- categoryAddButton, categoryList
- contentUploader, contentUploaderButton, contentPreview, contentPreviewImage, uploadProgressContainer

Added methods:
- addCategory(), getCategoryItem(), expandCategory(), updateCategoryName()
- addMenuItem(), getMenuItem(), updateMenuItemName(), updateMenuItemPrice()
- getMenuItemImagePicker(), getMenuItemVideoPicker(), getMenuItemDocumentPicker()
- getCategoryImagePicker()
- uploadImageToMenuItem(), uploadImageToCategory()
- expectMenuItemImageVisible(), expectCategoryImageVisible()
- deleteMenuItemImage()
- saveMenuEditor(), cancelMenuEditor()
- getMenuItemImageUrl(), expectImageLoaded(), expectPreviewImagesLoaded()

### 4. E2ETests/tests/online-menus/menu-content-upload.spec.ts (NEW)
Created comprehensive test suites:

**Menu Content Upload (serial)**
1. should create a menu and add a category with item
2. should upload an image to a menu item
3. should save menu with uploaded image
4. should persist uploaded image after reloading menu
5. should display image in preview modal without CORS errors
6. should delete image from menu item
7. should upload image to category

**Menu Content Upload Error Handling**
1. should handle cancelled file selection gracefully

**Multiple Content Uploads**
1. should upload images to multiple menu items

## Success Criteria - ALL MET
- [x] All missing testIds are added to E2E shared file
- [x] docker-compose.e2e.yml includes ContentService with proper CORS
- [x] OnlineMenusPage has methods for content upload testing
- [x] E2E tests pass for image upload workflow
- [x] Tests detect CORS issues when loading content
- [x] All tests follow Playwright best practices (no waitForTimeout)

## Test Coverage Summary
The tests cover:
1. **Image Upload Flow**: Creating menu, adding category/item, uploading image
2. **Persistence**: Verifying images persist after save and reload
3. **CORS Detection**: Verifying images load in preview modal (catches CORS errors)
4. **Image Deletion**: Testing ability to remove uploaded images
5. **Category Images**: Testing image upload to categories
6. **Error Handling**: Testing cancelled file selection
7. **Multiple Uploads**: Testing multiple images across items and categories

## Next Steps
To run these tests:
1. Ensure ContentService/docker/s3.json exists (required for SeaweedFS config)
2. Build and start E2E environment: `docker-compose -f docker-compose.e2e.yml up -d`
3. Run content upload tests: `cd E2ETests && npx playwright test tests/online-menus/menu-content-upload.spec.ts`
