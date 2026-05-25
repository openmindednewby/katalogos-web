# Online Menu Customization Feature - Comprehensive Architecture Plan

> **Reference**: Architecture patterns from `BaseClient/docs/code-standards/architecture-patterns.md`

## Status: COMPLETED

## Completion Summary

**Completed**: February 7, 2026

### Implementation Results

| Phase | Tasks | Tests | Status |
|-------|-------|-------|--------|
| Phase 1: Foundation | 3 | 146 | ✅ Complete |
| Phase 2: Editor Components | 10 | 293 | ✅ Complete |
| Phase 3: Display Components | 4 | 205 | ✅ Complete |
| Phase 4: E2E Tests | 5 | Created | ✅ Complete |
| Phase 6: Import/Export | 1 | 85 | ✅ Complete |

**Total Unit Tests**: 1244 passing
**Coverage**: 66% statements, 64% branches, 70% lines
**Build**: Successful

### Files Created/Modified

**Styling Editors** (10 components):
- LayoutTemplateSelector, ColorSchemeEditor, TypographyEditor
- MediaPositionEditor, BoxStyleEditor, PriceStyleEditor
- HeaderEditor, GlobalStylingTab
- CategoryStylingSection, ItemStylingSection

**Display Components** (4 components):
- CategorySection, MenuItemDisplay, MenuContentView, MenuHeader

**Utilities**:
- menuStyleGenerator.ts - Style generation
- menuConfigExport.ts - JSON export
- menuConfigImport.ts - JSON import with validation
- menuDefaults.ts - Default value handling

**Types**:
- menuStyleTypes.ts - All styling interfaces
- Type guards and validation

## Executive Summary

This document outlines a comprehensive architecture for extending the Online Menu customization capabilities. The goal is to provide tenants with rich, granular control over menu appearance while maintaining backward compatibility with existing menus and ensuring excellent performance across web and mobile platforms.

---

## Problem Statement

The current menu JSON structure (`MenuContents`) supports only basic styling properties:
- **Menu Level**: `titleFont`, `titleFontSize`, `backgroundColor`, `textColor`
- **Category Level**: `name`, `description`, `backgroundColor`, `textColor`, `fontSize`, `displayOrder`, `items`, `imageContentId`, `videoContentId`
- **MenuItem Level**: `name`, `description`, `price`, `isAvailable`, `imageContentId`, `videoContentId`, `backgroundColor`, `textColor`, `fontSize`, `displayOrder`

Tenants need much richer customization options including:
- Image/video positioning and sizing
- Typography controls (multiple fonts, weights)
- Layout options (grid vs list)
- Spacing/padding controls
- Border and shadow effects
- Price styling
- Availability badge customization

---

## Quality Requirements & Definition of Done

### Mandatory Quality Gates

Every task MUST pass the following quality gates before being marked complete:

#### 1. Linting & Static Analysis
```bash
# Frontend (BaseClient)
cd BaseClient && npm run lint          # Zero errors required
cd BaseClient && npm run lint:strict   # Zero warnings for new code

# Backend (if applicable)
cd Services/<ServiceName> && dotnet build  # Zero errors/warnings
```

#### 2. Unit Tests
```bash
# Frontend
cd BaseClient && npm run test:coverage

# Backend
cd Services/<ServiceName>/tests && dotnet test
```

**Coverage Requirements**:
| Code Type | Minimum Coverage |
|-----------|-----------------|
| Utility functions | 90%+ |
| React hooks | 85%+ |
| React components (logic only) | 80%+ |
| Backend handlers | 85%+ |

#### 3. Build Verification
```bash
# Frontend - must succeed
cd BaseClient && npx expo export --platform web

# Backend - must succeed
cd Services/<ServiceName> && dotnet build --configuration Release
```

#### 4. YAGNI Check (No Dead Code)
```bash
cd BaseClient && npm run yagni  # No unused exports
```

---

### Code Review Requirements

Every task requires code review before completion:

#### Review Checklist
- [ ] **Correctness**: Does the code solve the problem correctly?
- [ ] **Type Safety**: Are TypeScript types properly defined and used?
- [ ] **React Best Practices**: Proper hooks usage, memoization where needed, stable keys
- [ ] **Accessibility**: All interactive elements have `testID`, `accessibilityLabel`, `accessibilityHint`
- [ ] **Error Handling**: Edge cases handled, user-friendly error messages
- [ ] **Performance**: No unnecessary re-renders, proper memoization
- [ ] **Code Standards**: Follows `BaseClient/docs/code-standards/` guidelines
- [ ] **No Magic Values**: Constants extracted, no hardcoded colors/numbers
- [ ] **File Size Limits**: Components <200 lines, functions <50 lines

#### Review Process
1. **Self-Review**: Developer reviews own code against checklist
2. **Agent Review**: `code-reviewer` agent validates against standards
3. **Quality Gate**: `quality-gate` agent runs all automated checks

---

### Unit Test Requirements

#### What to Test (Frontend Components)
```typescript
// ✅ DO test:
- Callback functions are called with correct arguments
- State changes trigger correct behavior
- Error handling paths
- Edge cases (null, undefined, empty arrays)
- Conditional rendering logic

// ❌ DON'T test:
- "Renders without crashing" (use E2E for this)
- Visual appearance (use E2E/visual regression)
- Third-party library behavior
```

#### Test File Naming
```
src/components/OnlineMenus/ColorSchemeEditor.tsx
src/components/OnlineMenus/__tests__/ColorSchemeEditor.test.tsx
```

#### Test Structure Template
```typescript
describe('ColorSchemeEditor', () => {
  describe('callbacks', () => {
    it('calls onChange when color is selected', () => {});
    it('calls onReset when reset button is pressed', () => {});
  });

  describe('validation', () => {
    it('validates hex color format', () => {});
    it('shows error for invalid color', () => {});
  });

  describe('edge cases', () => {
    it('handles undefined colorScheme prop', () => {});
    it('handles null values in color fields', () => {});
  });
});
```

---

### E2E Test Requirements

#### When E2E Tests are Required
- Any new user-facing feature
- Any change to existing user flows
- Any component that handles user input
- Any component that persists data

#### E2E Test Structure
```typescript
// File: E2ETests/tests/online-menus/<feature>.spec.ts

test.describe('Feature Name @online-menus', () => {
  test.beforeAll(async () => {
    // Setup: Create test data
  });

  test.afterAll(async () => {
    // Cleanup: Delete test data
  });

  test('user can perform action', async ({ page }) => {
    // Arrange
    // Act
    // Assert
  });
});
```

#### E2E Best Practices
- [ ] Use page objects for all interactions
- [ ] No `waitForTimeout()` - use proper waits
- [ ] Proper cleanup in `afterAll`
- [ ] Tagged with feature area (e.g., `@online-menus`)
- [ ] Runs in <60 seconds per test

---

### Task Completion Checklist

Before marking ANY task as complete, verify:

```markdown
## Task Completion Checklist

### Code Quality
- [ ] Code follows project coding standards
- [ ] No ESLint errors or warnings
- [ ] No TypeScript errors
- [ ] Functions under 50 lines, components under 200 lines
- [ ] No hardcoded colors, magic numbers, or strings

### Testing
- [ ] Unit tests written for all new logic
- [ ] Unit tests pass locally
- [ ] Coverage meets minimum requirements
- [ ] E2E tests written (if user-facing)
- [ ] E2E tests pass locally

### Accessibility
- [ ] All interactive elements have testID
- [ ] All interactive elements have accessibilityLabel
- [ ] All interactive elements have accessibilityHint

### Quality Gates
- [ ] `npm run lint` passes
- [ ] `npm run test` passes
- [ ] `npm run yagni` passes (no unused exports)
- [ ] `npx expo export --platform web` succeeds

### Review
- [ ] Self-review completed
- [ ] Code review by agent or peer
- [ ] All review feedback addressed
```

---

## Architecture Decisions

### Decision 1: Schema Extension Strategy

**Context**: How to extend the JSON schema without breaking existing menus.

**Options Considered**:

| Option | Approach | Pros | Cons |
|--------|----------|------|------|
| A | Add optional properties with defaults | Simple, backward compatible | No version tracking |
| B | Schema versioning with migration | Explicit versions, clean upgrades | Complex migration logic |
| C | Nested styling objects | Organized, type-safe | More verbose JSON |

**Decision**: **Option C - Nested Styling Objects** with **Option A fallback defaults**

**Rationale**:
- Nested objects (`typography`, `layout`, `media`, `styling`) provide clear organization
- All new properties are optional with sensible defaults
- Existing menus work unchanged (missing properties resolve to defaults)
- TypeScript interfaces enforce type safety
- Easy to extend further in the future

**Consequences**:
- JSON will be more verbose for fully customized menus
- Need helper functions to merge defaults with user settings
- Frontend must handle partial objects gracefully

---

### Decision 2: Layout System Design

**Context**: How to implement flexible layout options for categories and items.

**Options Considered**:

| Option | Approach | Pros | Cons |
|--------|----------|------|------|
| A | Predefined layout presets | Simple UI, consistent results | Limited flexibility |
| B | Flexbox-like system | Full control | Complex for non-developers |
| C | Template-based layouts | Visual previews, best UX | More development effort |

**Decision**: **Option C - Template-Based Layouts with Customization Overrides**

**Rationale**:
- Offer preset layout templates (modern-grid, classic-list, cards, compact)
- Each template has its own default styling
- Users can override specific properties
- Best balance of simplicity and flexibility

---

### Decision 3: Image Positioning Architecture

**Context**: How to handle media positioning across different contexts.

**Decision**: Use a consistent `MediaSettings` interface:

```typescript
interface MediaSettings {
  position: 'left' | 'right' | 'top' | 'bottom' | 'background' | 'none';
  size: 'thumbnail' | 'small' | 'medium' | 'large' | 'full' | 'custom';
  customWidth?: number;
  customHeight?: number;
  fit: 'cover' | 'contain' | 'fill' | 'none';
  borderRadius?: number;
  opacity?: number;
  overlay?: {
    enabled: boolean;
    color: string;
    opacity: number;
  };
}
```

---

## Extended JSON Schema

### 1. Menu-Level Schema (MenuContents)

```typescript
/**
 * Extended MenuContents with rich customization options.
 * All new properties are optional for backward compatibility.
 */
export interface MenuContents {
  // === EXISTING PROPERTIES (backward compatible) ===
  titleFont?: string | null;
  titleFontSize?: number;
  backgroundColor?: string | null;
  textColor?: string | null;
  categories?: Category[];

  // === NEW: Schema Version (for future migrations) ===
  schemaVersion?: number; // Current: 2, legacy menus: undefined = 1

  // === NEW: Global Typography ===
  typography?: GlobalTypography;

  // === NEW: Global Color Scheme ===
  colorScheme?: ColorScheme;

  // === NEW: Layout Configuration ===
  layout?: MenuLayoutSettings;

  // === NEW: Header/Branding ===
  header?: HeaderSettings;

  // === NEW: Global Spacing ===
  spacing?: SpacingSettings;
}

interface GlobalTypography {
  titleFont?: string;
  titleFontSize?: number;
  titleFontWeight?: FontWeight;
  bodyFont?: string;
  bodyFontSize?: number;
  bodyFontWeight?: FontWeight;
  priceFont?: string;
  priceFontSize?: number;
  priceFontWeight?: FontWeight;
}

interface ColorScheme {
  background?: string;
  surface?: string;
  text?: string;
  textSecondary?: string;
  accent?: string;
  price?: string;
  border?: string;
  divider?: string;
  unavailable?: string;
}

interface MenuLayoutSettings {
  template: 'modern-grid' | 'classic-list' | 'cards' | 'compact' | 'elegant';
  categoryLayout: 'full-width' | 'two-column' | 'masonry';
  itemLayout: 'list' | 'grid' | 'cards';
  itemsPerRow?: number; // For grid layouts (2-4)
  showCategoryDividers?: boolean;
  showItemDividers?: boolean;
}

interface HeaderSettings {
  showLogo?: boolean;
  logoPosition?: 'left' | 'center' | 'right';
  logoSize?: 'small' | 'medium' | 'large';
  logoContentId?: string | null;
  bannerContentId?: string | null;
  bannerHeight?: number;
  showMenuName?: boolean;
  showMenuDescription?: boolean;
  titlePosition?: 'left' | 'center' | 'right';
}

interface SpacingSettings {
  pagePadding?: number;
  categorySpacing?: number;
  itemSpacing?: number;
  contentPadding?: number;
}

type FontWeight = '100' | '200' | '300' | '400' | '500' | '600' | '700' | '800' | '900' | 'normal' | 'bold';
```

### 2. Category-Level Schema

```typescript
/**
 * Extended Category with rich customization options.
 */
export interface Category extends Omit<GeneratedCategory, 'items'> {
  // === EXISTING PROPERTIES ===
  id?: string;
  name: string;
  description?: string;
  backgroundColor?: string | null;
  textColor?: string | null;
  fontSize?: number;
  displayOrder: number;
  imageContentId?: string | null;
  videoContentId?: string | null;
  items?: MenuItem[];

  // === NEW: Media Settings ===
  imageSettings?: MediaSettings;
  videoSettings?: MediaSettings;

  // === NEW: Typography ===
  typography?: CategoryTypography;

  // === NEW: Layout ===
  layout?: CategoryLayout;

  // === NEW: Styling ===
  styling?: BoxStyling;
}

interface MediaSettings {
  position: 'left' | 'right' | 'top' | 'bottom' | 'background' | 'none';
  size: 'thumbnail' | 'small' | 'medium' | 'large' | 'full' | 'custom';
  customWidth?: number;
  customHeight?: number;
  fit: 'cover' | 'contain' | 'fill' | 'none';
  borderRadius?: number;
  opacity?: number;
  overlay?: OverlaySettings;
}

interface OverlaySettings {
  enabled: boolean;
  color: string;
  opacity: number;
}

interface CategoryTypography {
  titleFontSize?: number;
  titleFontWeight?: FontWeight;
  titleColor?: string;
  descriptionFontSize?: number;
  descriptionFontWeight?: FontWeight;
  descriptionColor?: string;
  descriptionVisible?: boolean;
}

interface CategoryLayout {
  titlePosition: 'above-media' | 'below-media' | 'overlay' | 'left-of-media' | 'right-of-media';
  contentAlignment: 'left' | 'center' | 'right';
  itemLayout: 'inherit' | 'list' | 'grid' | 'cards';
  itemsPerRow?: number;
  collapsible?: boolean;
  defaultCollapsed?: boolean;
}

interface BoxStyling {
  padding?: number | SpacingBox;
  margin?: number | SpacingBox;
  borderWidth?: number;
  borderColor?: string;
  borderRadius?: number;
  shadowEnabled?: boolean;
  shadowColor?: string;
  shadowOffset?: { x: number; y: number };
  shadowBlur?: number;
}

interface SpacingBox {
  top: number;
  right: number;
  bottom: number;
  left: number;
}
```

### 3. MenuItem-Level Schema

```typescript
/**
 * Extended MenuItem with rich customization options.
 */
export interface MenuItem extends GeneratedMenuItem {
  // === EXISTING PROPERTIES ===
  id?: string;
  name: string;
  description?: string;
  price: number;
  isAvailable: boolean;
  imageContentId?: string | null;
  videoContentId?: string | null;
  backgroundColor?: string | null;
  textColor?: string | null;
  fontSize?: number;
  displayOrder: number;
  documentContentIds?: string[];

  // === NEW: Media Settings ===
  imageSettings?: MediaSettings;
  videoSettings?: MediaSettings;

  // === NEW: Typography ===
  typography?: ItemTypography;

  // === NEW: Price Styling ===
  priceStyle?: PriceStyle;

  // === NEW: Layout ===
  layout?: ItemLayout;

  // === NEW: Styling ===
  styling?: BoxStyling;

  // === NEW: Availability Badge ===
  availabilityBadge?: AvailabilityBadgeStyle;

  // === NEW: Additional Info ===
  badges?: Badge[];
  tags?: string[];
}

interface ItemTypography {
  nameFontSize?: number;
  nameFontWeight?: FontWeight;
  nameColor?: string;
  descriptionFontSize?: number;
  descriptionFontWeight?: FontWeight;
  descriptionColor?: string;
  descriptionVisible?: boolean;
  descriptionMaxLines?: number;
}

interface PriceStyle {
  fontSize?: number;
  fontWeight?: FontWeight;
  color?: string;
  position: 'right' | 'below-name' | 'below-description' | 'badge';
  prefix?: string;
  suffix?: string;
  showCurrency?: boolean;
  currencyPosition?: 'before' | 'after';
  strikethroughWhenUnavailable?: boolean;
}

interface ItemLayout {
  variant: 'horizontal' | 'vertical' | 'card' | 'compact' | 'detailed';
  imagePosition: 'left' | 'right' | 'top' | 'none';
  contentAlignment: 'left' | 'center' | 'right';
  minHeight?: number;
  maxWidth?: number;
}

interface AvailabilityBadgeStyle {
  show: boolean;
  position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'overlay';
  unavailableText?: string;
  unavailableColor?: string;
  unavailableBackgroundColor?: string;
}

interface Badge {
  text: string;
  backgroundColor: string;
  textColor: string;
  icon?: string;
}
```

---

## Default Values Strategy

### Approach: Deep Merge with Defaults

```typescript
// File: BaseClient/src/utils/menuDefaults.ts

export const DEFAULT_MENU_SETTINGS: Required<MenuContents> = {
  schemaVersion: 2,
  titleFont: 'System',
  titleFontSize: 32,
  backgroundColor: '#FFFFFF',
  textColor: '#000000',
  categories: [],
  typography: {
    titleFont: 'System',
    titleFontSize: 32,
    titleFontWeight: 'bold',
    bodyFont: 'System',
    bodyFontSize: 16,
    bodyFontWeight: 'normal',
    priceFont: 'System',
    priceFontSize: 18,
    priceFontWeight: 'bold',
  },
  colorScheme: {
    background: '#FFFFFF',
    surface: '#F5F5F5',
    text: '#000000',
    textSecondary: '#666666',
    accent: '#007AFF',
    price: '#000000',
    border: '#E0E0E0',
    divider: '#EEEEEE',
    unavailable: '#999999',
  },
  layout: {
    template: 'classic-list',
    categoryLayout: 'full-width',
    itemLayout: 'list',
    itemsPerRow: 2,
    showCategoryDividers: true,
    showItemDividers: false,
  },
  header: {
    showLogo: false,
    logoPosition: 'center',
    logoSize: 'medium',
    logoContentId: null,
    bannerContentId: null,
    bannerHeight: 200,
    showMenuName: true,
    showMenuDescription: true,
    titlePosition: 'center',
  },
  spacing: {
    pagePadding: 16,
    categorySpacing: 24,
    itemSpacing: 12,
    contentPadding: 16,
  },
};

export const DEFAULT_CATEGORY_SETTINGS: Partial<Category> = {
  imageSettings: {
    position: 'top',
    size: 'large',
    fit: 'cover',
    borderRadius: 8,
  },
  typography: {
    titleFontSize: 24,
    titleFontWeight: 'bold',
    descriptionFontSize: 14,
    descriptionFontWeight: 'normal',
    descriptionVisible: true,
  },
  layout: {
    titlePosition: 'below-media',
    contentAlignment: 'left',
    itemLayout: 'inherit',
    collapsible: false,
    defaultCollapsed: false,
  },
  styling: {
    padding: 16,
    margin: 0,
    borderWidth: 0,
    borderRadius: 8,
    shadowEnabled: false,
  },
};

export const DEFAULT_ITEM_SETTINGS: Partial<MenuItem> = {
  imageSettings: {
    position: 'left',
    size: 'medium',
    fit: 'cover',
    borderRadius: 4,
  },
  typography: {
    nameFontSize: 18,
    nameFontWeight: '600',
    descriptionFontSize: 14,
    descriptionFontWeight: 'normal',
    descriptionVisible: true,
    descriptionMaxLines: 2,
  },
  priceStyle: {
    fontSize: 18,
    fontWeight: 'bold',
    position: 'right',
    showCurrency: true,
    currencyPosition: 'before',
    strikethroughWhenUnavailable: true,
  },
  layout: {
    variant: 'horizontal',
    imagePosition: 'left',
    contentAlignment: 'left',
  },
  availabilityBadge: {
    show: true,
    position: 'top-right',
    unavailableText: 'Unavailable',
    unavailableColor: '#FFFFFF',
    unavailableBackgroundColor: '#FF3B30',
  },
};

/**
 * Deep merges user settings with defaults, preserving user overrides.
 */
export function applyMenuDefaults(contents: MenuContents | null): MenuContents {
  if (!contents) return DEFAULT_MENU_SETTINGS;

  return {
    ...DEFAULT_MENU_SETTINGS,
    ...contents,
    typography: { ...DEFAULT_MENU_SETTINGS.typography, ...contents.typography },
    colorScheme: { ...DEFAULT_MENU_SETTINGS.colorScheme, ...contents.colorScheme },
    layout: { ...DEFAULT_MENU_SETTINGS.layout, ...contents.layout },
    header: { ...DEFAULT_MENU_SETTINGS.header, ...contents.header },
    spacing: { ...DEFAULT_MENU_SETTINGS.spacing, ...contents.spacing },
    categories: contents.categories?.map(applyCategoryDefaults) ?? [],
  };
}

export function applyCategoryDefaults(category: Category): Category {
  return {
    ...DEFAULT_CATEGORY_SETTINGS,
    ...category,
    imageSettings: { ...DEFAULT_CATEGORY_SETTINGS.imageSettings, ...category.imageSettings },
    typography: { ...DEFAULT_CATEGORY_SETTINGS.typography, ...category.typography },
    layout: { ...DEFAULT_CATEGORY_SETTINGS.layout, ...category.layout },
    styling: { ...DEFAULT_CATEGORY_SETTINGS.styling, ...category.styling },
    items: category.items?.map(applyItemDefaults) ?? [],
  };
}

export function applyItemDefaults(item: MenuItem): MenuItem {
  return {
    ...DEFAULT_ITEM_SETTINGS,
    ...item,
    imageSettings: { ...DEFAULT_ITEM_SETTINGS.imageSettings, ...item.imageSettings },
    typography: { ...DEFAULT_ITEM_SETTINGS.typography, ...item.typography },
    priceStyle: { ...DEFAULT_ITEM_SETTINGS.priceStyle, ...item.priceStyle },
    layout: { ...DEFAULT_ITEM_SETTINGS.layout, ...item.layout },
    availabilityBadge: { ...DEFAULT_ITEM_SETTINGS.availabilityBadge, ...item.availabilityBadge },
    styling: { ...DEFAULT_ITEM_SETTINGS.styling, ...item.styling },
  };
}
```

---

## Migration Strategy

### Backward Compatibility Rules

1. **Existing menus continue to work** - No migration required
2. **Missing properties resolve to defaults** - Deep merge with defaults at runtime
3. **Schema version tracking** - `schemaVersion` field for future migrations
4. **No database migration needed** - JSONB column handles flexible schema

### Schema Version Handling

```typescript
function normalizeMenuContents(contents: MenuContents | null): MenuContents {
  if (!contents) return applyMenuDefaults(null);

  const version = contents.schemaVersion ?? 1;

  switch (version) {
    case 1:
      // Legacy menu - apply v2 defaults
      return applyMenuDefaults({
        ...contents,
        schemaVersion: 2,
      });
    case 2:
      // Current version - just apply defaults for missing fields
      return applyMenuDefaults(contents);
    default:
      // Future version - apply current defaults (forward compatibility)
      return applyMenuDefaults(contents);
  }
}
```

---

## Editor UI Components

### New Components Required

| Component | Purpose | Location |
|-----------|---------|----------|
| `LayoutTemplateSelector` | Select menu layout template | `OnlineMenus/Styling/` |
| `ColorSchemeEditor` | Edit global color scheme | `OnlineMenus/Styling/` |
| `TypographyEditor` | Edit font settings | `OnlineMenus/Styling/` |
| `MediaPositionEditor` | Edit image/video positioning | `OnlineMenus/Styling/` |
| `SpacingEditor` | Edit padding/margins | `OnlineMenus/Styling/` |
| `BoxStyleEditor` | Edit borders/shadows | `OnlineMenus/Styling/` |
| `PriceStyleEditor` | Edit price appearance | `OnlineMenus/Styling/` |
| `HeaderEditor` | Edit header/logo settings | `OnlineMenus/Styling/` |
| `CategoryStyleEditor` | Category-level styling accordion | `OnlineMenus/` |
| `ItemStyleEditor` | Item-level styling accordion | `OnlineMenus/` |
| `PresetLibrary` | Browse/apply style presets | `OnlineMenus/` |

### UI Architecture

```
FullMenuEditor
├── Tabs
│   ├── MetadataTab (existing)
│   ├── GlobalStylingTab (NEW)
│   │   ├── LayoutTemplateSelector
│   │   ├── ColorSchemeEditor
│   │   ├── TypographyEditor
│   │   ├── HeaderEditor
│   │   └── SpacingEditor
│   ├── ContentTab (existing MenuContentEditor)
│   │   ├── CategoryEditor (enhanced)
│   │   │   ├── CategoryStyleEditor (NEW collapsible section)
│   │   │   │   ├── MediaPositionEditor
│   │   │   │   ├── TypographyEditor
│   │   │   │   └── BoxStyleEditor
│   │   │   └── MenuItemEditor (enhanced)
│   │   │       └── ItemStyleEditor (NEW collapsible section)
│   │   │           ├── MediaPositionEditor
│   │   │           ├── PriceStyleEditor
│   │   │           └── BoxStyleEditor
│   └── PreviewTab (existing)
└── PresetLibrary (floating panel)
```

---

## Public Display Components

### Enhanced Components

| Component | Enhancement |
|-----------|-------------|
| `CategorySection` | Support all positioning/styling options |
| `MenuItemDisplay` | Support all layout variants and styling |
| `MenuContentView` | Apply global layout template |
| `publicMenuStyles` | Generate dynamic styles from settings |

### Dynamic Style Generation

```typescript
// File: BaseClient/src/components/PublicMenu/styleGenerator.ts

export function generateCategoryStyles(
  category: Category,
  globalSettings: MenuContents,
): StyleSheet {
  const settings = applyCategoryDefaults(category);
  const global = applyMenuDefaults(globalSettings);

  return StyleSheet.create({
    container: {
      backgroundColor: settings.backgroundColor ?? global.colorScheme?.surface,
      padding: resolveSpacing(settings.styling?.padding),
      margin: resolveSpacing(settings.styling?.margin),
      borderWidth: settings.styling?.borderWidth,
      borderColor: settings.styling?.borderColor ?? global.colorScheme?.border,
      borderRadius: settings.styling?.borderRadius,
      ...generateShadowStyle(settings.styling),
    },
    title: {
      fontSize: settings.typography?.titleFontSize,
      fontWeight: settings.typography?.titleFontWeight,
      color: settings.typography?.titleColor ?? settings.textColor ?? global.colorScheme?.text,
      textAlign: settings.layout?.contentAlignment,
    },
    description: {
      fontSize: settings.typography?.descriptionFontSize,
      fontWeight: settings.typography?.descriptionFontWeight,
      color: settings.typography?.descriptionColor ?? global.colorScheme?.textSecondary,
      display: settings.typography?.descriptionVisible ? 'flex' : 'none',
    },
    image: {
      ...generateMediaStyles(settings.imageSettings),
    },
  });
}

function generateMediaStyles(settings?: MediaSettings): ViewStyle {
  if (!settings || settings.position === 'none') return { display: 'none' };

  const sizeMap = {
    thumbnail: { width: 60, height: 60 },
    small: { width: 100, height: 100 },
    medium: { width: 150, height: 150 },
    large: { width: 200, height: 200 },
    full: { width: '100%', aspectRatio: 16/9 },
    custom: { width: settings.customWidth, height: settings.customHeight },
  };

  return {
    ...sizeMap[settings.size ?? 'medium'],
    borderRadius: settings.borderRadius,
    opacity: settings.opacity ?? 1,
    resizeMode: settings.fit ?? 'cover',
  };
}

function generateShadowStyle(styling?: BoxStyling): ViewStyle {
  if (!styling?.shadowEnabled) return {};

  return Platform.select({
    ios: {
      shadowColor: styling.shadowColor ?? '#000',
      shadowOffset: styling.shadowOffset ?? { x: 0, y: 2 },
      shadowOpacity: 0.25,
      shadowRadius: styling.shadowBlur ?? 4,
    },
    android: {
      elevation: styling.shadowBlur ?? 4,
    },
    web: {
      boxShadow: `${styling.shadowOffset?.x ?? 0}px ${styling.shadowOffset?.y ?? 2}px ${styling.shadowBlur ?? 4}px ${styling.shadowColor ?? 'rgba(0,0,0,0.25)'}`,
    },
  });
}
```

---

## Task Breakdown

> **IMPORTANT**: Every task below MUST complete ALL quality requirements defined in the "Quality Requirements & Definition of Done" section above. The acceptance criteria listed are IN ADDITION to the standard quality gates.

### Standard Task Completion Requirements (Apply to ALL Tasks)

Every task must complete:

1. **Quality Gates** (run by `quality-gate` agent):
   - `npm run lint` - Zero errors
   - `npm run test` - All tests pass
   - `npm run yagni` - No unused exports
   - `npx expo export --platform web` - Build succeeds

2. **Code Review** (run by `code-reviewer` agent):
   - Correctness verified
   - Type safety verified
   - React best practices followed
   - Accessibility requirements met
   - Code standards compliance

3. **Testing Requirements**:
   - Unit tests for all new functions/hooks
   - Unit tests for component callback logic
   - Minimum coverage: 80% for components, 90% for utilities

---

### Phase 1: Foundation (Backend + Types)

#### Task 1.1: Update Backend Schema
**Agent**: `backend-dev`
**Estimated Effort**: 2-3 hours

**Files to Modify**:
- `OnlineMenuSaaS/OnlineMenuService/OnlineMenu/src/OnlineMenu.Core/TenantMenusAggregate/TenantMenusAggregate.cs`

**Changes**:
```csharp
// Add new nested classes for styling settings
public class GlobalTypography { ... }
public class ColorScheme { ... }
public class MenuLayoutSettings { ... }
public class HeaderSettings { ... }
public class SpacingSettings { ... }
public class MediaSettings { ... }
public class CategoryTypography { ... }
public class CategoryLayout { ... }
public class BoxStyling { ... }
public class ItemTypography { ... }
public class PriceStyle { ... }
public class ItemLayout { ... }
public class AvailabilityBadgeStyle { ... }
public class Badge { ... }

// Update existing classes with new optional properties
public class MenuContents
{
    // Existing properties...

    public int? SchemaVersion { get; set; }
    public GlobalTypography? Typography { get; set; }
    public ColorScheme? ColorScheme { get; set; }
    public MenuLayoutSettings? Layout { get; set; }
    public HeaderSettings? Header { get; set; }
    public SpacingSettings? Spacing { get; set; }
}

public class Category
{
    // Existing properties...

    public MediaSettings? ImageSettings { get; set; }
    public MediaSettings? VideoSettings { get; set; }
    public CategoryTypography? Typography { get; set; }
    public CategoryLayout? Layout { get; set; }
    public BoxStyling? Styling { get; set; }
}

public class MenuItem
{
    // Existing properties...

    public MediaSettings? ImageSettings { get; set; }
    public MediaSettings? VideoSettings { get; set; }
    public ItemTypography? Typography { get; set; }
    public PriceStyle? PriceStyle { get; set; }
    public ItemLayout? Layout { get; set; }
    public BoxStyling? Styling { get; set; }
    public AvailabilityBadgeStyle? AvailabilityBadge { get; set; }
    public List<Badge>? Badges { get; set; }
    public List<string>? Tags { get; set; }
}
```

**Unit Tests Required**:
- `OnlineMenu.UnitTests/TenantMenusAggregate/MenuContentsSerializationTests.cs`
  - [ ] Test serialization of new nested classes
  - [ ] Test deserialization with missing optional properties
  - [ ] Test backward compatibility with legacy JSON
  - [ ] Test round-trip serialization

**Quality Gates**:
- [ ] `dotnet build` - Zero errors/warnings
- [ ] `dotnet test` - All tests pass
- [ ] Code review by `code-reviewer` agent

**Acceptance Criteria**:
- [ ] All new C# classes compile without errors
- [ ] JSON serialization/deserialization works correctly
- [ ] Existing menus deserialize without errors (backward compatibility)
- [ ] Unit test coverage >85% for new code

---

#### Task 1.2: Update Frontend TypeScript Types
**Agent**: `frontend-dev`
**Estimated Effort**: 2 hours

**Files to Create/Modify**:
- `BaseClient/src/types/menuTypes.ts` - Add all new interfaces
- `BaseClient/src/types/menuStyleTypes.ts` (NEW) - Dedicated styling types

**Unit Tests Required**:
- `BaseClient/src/types/__tests__/menuStyleTypes.test.ts`
  - [ ] Type guard tests for `isValidColorScheme()`
  - [ ] Type guard tests for `isValidMediaSettings()`
  - [ ] Type guard tests for `isValidTypography()`

**Quality Gates**:
- [ ] `npm run lint` - Zero errors
- [ ] `npm run test` - All tests pass
- [ ] `npx expo export --platform web` - Build succeeds
- [ ] Code review by `code-reviewer` agent

**Acceptance Criteria**:
- [ ] All TypeScript interfaces match C# schema
- [ ] Type exports are properly organized
- [ ] Existing code compiles without type errors
- [ ] Unit tests for type guards pass with >90% coverage

---

#### Task 1.3: Create Default Values Utility
**Agent**: `frontend-dev`
**Estimated Effort**: 2-3 hours

**Files to Create**:
- `BaseClient/src/utils/menuDefaults.ts`
- `BaseClient/src/utils/__tests__/menuDefaults.test.ts`

**Unit Tests Required**:
- [ ] Test `applyMenuDefaults()` with null input
- [ ] Test `applyMenuDefaults()` with partial input
- [ ] Test `applyMenuDefaults()` preserves user overrides
- [ ] Test `applyCategoryDefaults()` with all edge cases
- [ ] Test `applyItemDefaults()` with all edge cases
- [ ] Test deep merge handles nested objects correctly
- [ ] Test schema version normalization

**Quality Gates**:
- [ ] `npm run lint` - Zero errors
- [ ] `npm run test` - All tests pass
- [ ] `npm run yagni` - No unused exports
- [ ] Coverage >90% for menuDefaults.ts
- [ ] Code review by `code-reviewer` agent

**Acceptance Criteria**:
- [ ] `applyMenuDefaults()` correctly merges user settings with defaults
- [ ] `applyCategoryDefaults()` and `applyItemDefaults()` work correctly
- [ ] Deep merge handles nested objects properly
- [ ] Unit tests cover edge cases (null, undefined, partial objects)

---

### Phase 2: Editor UI Components

> **Note**: All Phase 2 tasks share common requirements:
> - All components must have `testID`, `accessibilityLabel`, `accessibilityHint`
> - All components must follow `BaseClient/docs/code-standards/frontend-react.md`
> - Unit tests focus on callback logic, NOT rendering
> - E2E tests will be added in Phase 4 to cover visual/integration

#### Task 2.1: Layout Template Selector
**Agent**: `frontend-dev`
**Estimated Effort**: 3-4 hours

**Files to Create**:
- `BaseClient/src/components/OnlineMenus/Styling/LayoutTemplateSelector.tsx`
- `BaseClient/src/components/OnlineMenus/Styling/__tests__/LayoutTemplateSelector.test.tsx`

**Features**:
- Visual preview cards for each template
- Horizontal scrollable list
- Selection state indicator
- Template descriptions

**Unit Tests Required** (callback/logic focus):
- [ ] `onChange` called with correct template when selected
- [ ] Current selection is visually indicated (via state)
- [ ] All 5 templates are represented in data
- [ ] Keyboard/screen reader selection works

**Quality Gates**:
- [ ] `npm run lint` - Zero errors
- [ ] `npm run test` - Tests pass with >80% coverage
- [ ] Code review by `code-reviewer` agent

**Acceptance Criteria**:
- [ ] Displays all 5 layout templates with visual previews
- [ ] Selection triggers onChange callback
- [ ] Accessible (testID, accessibilityLabel, accessibilityHint)
- [ ] Themed correctly (light/dark mode)

---

#### Task 2.2: Color Scheme Editor
**Agent**: `frontend-dev`
**Estimated Effort**: 3-4 hours

**Files to Create**:
- `BaseClient/src/components/OnlineMenus/Styling/ColorSchemeEditor.tsx`
- `BaseClient/src/components/OnlineMenus/Styling/__tests__/ColorSchemeEditor.test.tsx`

**Features**:
- Color picker for each scheme property
- Color preview swatches
- Preset color schemes
- Reset to defaults option

**Unit Tests Required**:
- [ ] `onChange` called with correct color value
- [ ] `validateHexColor()` accepts valid hex colors
- [ ] `validateHexColor()` rejects invalid formats
- [ ] Preset selection applies all colors
- [ ] Reset restores default values
- [ ] Handles undefined/null color values

**Quality Gates**:
- [ ] `npm run lint` - Zero errors
- [ ] `npm run test` - Tests pass with >80% coverage
- [ ] Code review by `code-reviewer` agent

**Acceptance Criteria**:
- [ ] All 9 color scheme properties editable
- [ ] Color picker component works on web and mobile
- [ ] Preset schemes can be applied
- [ ] Validation for hex color format

---

#### Task 2.3: Typography Editor
**Agent**: `frontend-dev`
**Estimated Effort**: 3-4 hours

**Files to Create**:
- `BaseClient/src/components/OnlineMenus/Styling/TypographyEditor.tsx`
- `BaseClient/src/components/OnlineMenus/Styling/__tests__/TypographyEditor.test.tsx`

**Features**:
- Font family selector (system fonts)
- Font size slider/input
- Font weight selector
- Live preview of typography changes

**Unit Tests Required**:
- [ ] `onChange` called with updated typography object
- [ ] Font size validation enforces min/max limits
- [ ] Font weight dropdown provides all weight options
- [ ] Handles partial typography objects
- [ ] Handles undefined/null inputs gracefully

**Quality Gates**:
- [ ] `npm run lint` - Zero errors
- [ ] `npm run test` - Tests pass with >80% coverage
- [ ] Code review by `code-reviewer` agent

**Acceptance Criteria**:
- [ ] Supports title, body, and price typography
- [ ] Font size validation (8-72pt range)
- [ ] Font weight dropdown with all options
- [ ] Preview updates in real-time

---

#### Task 2.4: Media Position Editor
**Agent**: `frontend-dev`
**Estimated Effort**: 4-5 hours

**Files to Create**:
- `BaseClient/src/components/OnlineMenus/Styling/MediaPositionEditor.tsx`
- `BaseClient/src/components/OnlineMenus/Styling/__tests__/MediaPositionEditor.test.tsx`

**Features**:
- Visual position selector (grid with icons)
- Size preset buttons
- Custom dimension inputs
- Fit mode selector
- Border radius slider
- Opacity slider
- Overlay settings

**Unit Tests Required**:
- [ ] `onChange` called with correct MediaSettings object
- [ ] Position selection updates correctly
- [ ] Size preset applies correct dimensions
- [ ] Custom dimensions validate numeric input
- [ ] Fit mode selection works
- [ ] Border radius slider updates value
- [ ] Opacity slider constrains to 0-1 range
- [ ] Overlay toggle enables/disables overlay settings
- [ ] Handles null/undefined MediaSettings

**Quality Gates**:
- [ ] `npm run lint` - Zero errors
- [ ] `npm run test` - Tests pass with >80% coverage
- [ ] Code review by `code-reviewer` agent

**Acceptance Criteria**:
- [ ] All position options selectable with visual feedback
- [ ] Size presets work correctly
- [ ] Custom dimensions can be entered
- [ ] All settings trigger onChange

---

#### Task 2.5: Box Style Editor
**Agent**: `frontend-dev`
**Estimated Effort**: 3-4 hours

**Files to Create**:
- `BaseClient/src/components/OnlineMenus/Styling/BoxStyleEditor.tsx`
- `BaseClient/src/components/OnlineMenus/Styling/__tests__/BoxStyleEditor.test.tsx`

**Features**:
- Padding/margin controls (uniform or per-side)
- Border width/color/radius
- Shadow toggle and settings
- Visual preview

**Unit Tests Required**:
- [ ] `onChange` called with correct BoxStyling object
- [ ] Uniform padding applies to all sides
- [ ] Per-side padding updates individual values
- [ ] Border width validates numeric input
- [ ] Border color validates hex format
- [ ] Shadow toggle enables/disables shadow
- [ ] Shadow settings update correctly
- [ ] Handles null/undefined BoxStyling

**Quality Gates**:
- [ ] `npm run lint` - Zero errors
- [ ] `npm run test` - Tests pass with >80% coverage
- [ ] Code review by `code-reviewer` agent

**Acceptance Criteria**:
- [ ] Padding/margin support both uniform and per-side modes
- [ ] Border settings work correctly
- [ ] Shadow settings work on all platforms
- [ ] Preview reflects changes

---

#### Task 2.6: Price Style Editor
**Agent**: `frontend-dev`
**Estimated Effort**: 2-3 hours

**Files to Create**:
- `BaseClient/src/components/OnlineMenus/Styling/PriceStyleEditor.tsx`
- `BaseClient/src/components/OnlineMenus/Styling/__tests__/PriceStyleEditor.test.tsx`

**Features**:
- Font size/weight/color
- Position selector
- Currency display options
- Prefix/suffix inputs
- Strikethrough toggle

**Unit Tests Required**:
- [ ] `onChange` called with correct PriceStyle object
- [ ] Font size validates range
- [ ] Position selection updates correctly
- [ ] Currency toggle works
- [ ] Prefix/suffix inputs update correctly
- [ ] Strikethrough toggle works
- [ ] Handles null/undefined PriceStyle

**Quality Gates**:
- [ ] `npm run lint` - Zero errors
- [ ] `npm run test` - Tests pass with >80% coverage
- [ ] Code review by `code-reviewer` agent

**Acceptance Criteria**:
- [ ] All price style options editable
- [ ] Position options work correctly
- [ ] Currency formatting options work
- [ ] Unit tests pass

---

#### Task 2.7: Header Editor
**Agent**: `frontend-dev`
**Estimated Effort**: 3-4 hours

**Files to Create**:
- `BaseClient/src/components/OnlineMenus/Styling/HeaderEditor.tsx`
- `BaseClient/src/components/OnlineMenus/Styling/__tests__/HeaderEditor.test.tsx`

**Features**:
- Logo upload integration (using ImagePicker)
- Logo position/size controls
- Banner upload integration
- Banner height control
- Menu name/description visibility toggles
- Title position selector

**Unit Tests Required**:
- [ ] `onChange` called with correct HeaderSettings
- [ ] Logo position selection works
- [ ] Logo size selection works
- [ ] Banner height validates range
- [ ] Visibility toggles update correctly
- [ ] Handles null/undefined HeaderSettings

**Quality Gates**:
- [ ] `npm run lint` - Zero errors
- [ ] `npm run test` - Tests pass with >80% coverage
- [ ] Code review by `code-reviewer` agent

**Acceptance Criteria**:
- [ ] Logo picker integrates with ContentService
- [ ] Position controls work correctly
- [ ] Banner settings work correctly
- [ ] Visibility toggles update state

---

#### Task 2.8: Global Styling Tab
**Agent**: `frontend-dev`
**Estimated Effort**: 3-4 hours

**Files to Create**:
- `BaseClient/src/components/OnlineMenus/GlobalStylingTab.tsx`
- `BaseClient/src/components/OnlineMenus/__tests__/GlobalStylingTab.test.tsx`

**Features**:
- Combines all global styling editors
- Collapsible sections for organization
- Reset to defaults button
- Apply preset button

**Unit Tests Required**:
- [ ] `onChange` propagates changes from sub-editors
- [ ] Collapsible sections toggle correctly
- [ ] Reset button calls `onReset` callback
- [ ] Preset apply calls `onApplyPreset` callback
- [ ] Handles undefined/partial MenuContents

**Quality Gates**:
- [ ] `npm run lint` - Zero errors
- [ ] `npm run test` - Tests pass with >80% coverage
- [ ] Code review by `code-reviewer` agent

**Acceptance Criteria**:
- [ ] All sub-editors integrated correctly
- [ ] State changes propagate to parent
- [ ] Sections collapse/expand correctly
- [ ] Reset functionality works

---

#### Task 2.9: Enhanced Category Editor
**Agent**: `frontend-dev`
**Estimated Effort**: 3-4 hours

**Files to Modify**:
- `BaseClient/src/components/OnlineMenus/CategoryEditor.tsx`

**Files to Create**:
- `BaseClient/src/components/OnlineMenus/CategoryStyleEditor.tsx`
- `BaseClient/src/components/OnlineMenus/__tests__/CategoryStyleEditor.test.tsx`

**Features**:
- Add collapsible "Advanced Styling" section
- Include MediaPositionEditor for images/videos
- Include CategoryTypography editor
- Include BoxStyleEditor

**Unit Tests Required**:
- [ ] Advanced styling toggle works
- [ ] `onChange` called with updated Category
- [ ] MediaPositionEditor changes propagate
- [ ] Typography changes propagate
- [ ] BoxStyling changes propagate
- [ ] Existing CategoryEditor tests still pass

**Quality Gates**:
- [ ] `npm run lint` - Zero errors
- [ ] `npm run test` - Tests pass with >80% coverage
- [ ] Existing CategoryEditor tests pass (no regression)
- [ ] Code review by `code-reviewer` agent

**Acceptance Criteria**:
- [ ] Advanced styling section is collapsible
- [ ] All category styling options work
- [ ] Does not break existing functionality

---

#### Task 2.10: Enhanced Item Editor
**Agent**: `frontend-dev`
**Estimated Effort**: 3-4 hours

**Files to Modify**:
- `BaseClient/src/components/OnlineMenus/MenuItemEditor.tsx`

**Files to Create**:
- `BaseClient/src/components/OnlineMenus/ItemStyleEditor.tsx`
- `BaseClient/src/components/OnlineMenus/__tests__/ItemStyleEditor.test.tsx`

**Features**:
- Add collapsible "Advanced Styling" section
- Include MediaPositionEditor
- Include PriceStyleEditor
- Include ItemTypography editor
- Include AvailabilityBadge editor

**Unit Tests Required**:
- [ ] Advanced styling toggle works
- [ ] `onChange` called with updated MenuItem
- [ ] MediaPositionEditor changes propagate
- [ ] PriceStyle changes propagate
- [ ] Typography changes propagate
- [ ] AvailabilityBadge changes propagate
- [ ] Existing MenuItemEditor tests still pass

**Quality Gates**:
- [ ] `npm run lint` - Zero errors
- [ ] `npm run test` - Tests pass with >80% coverage
- [ ] Existing MenuItemEditor tests pass (no regression)
- [ ] Code review by `code-reviewer` agent

**Acceptance Criteria**:
- [ ] Advanced styling section is collapsible
- [ ] All item styling options work
- [ ] Does not break existing functionality

---

### Phase 3: Public Display Components

> **Note**: Phase 3 components render the public-facing menu. These require both unit tests AND E2E tests to verify visual rendering.

#### Task 3.1: Style Generator Utility
**Agent**: `frontend-dev`
**Estimated Effort**: 3-4 hours

**Files to Create**:
- `BaseClient/src/components/PublicMenu/styleGenerator.ts`
- `BaseClient/src/components/PublicMenu/__tests__/styleGenerator.test.ts`

**Features**:
- `generateMenuStyles()` - global styles
- `generateCategoryStyles()` - category-specific styles
- `generateItemStyles()` - item-specific styles
- Platform-specific shadow handling
- Dynamic style caching

**Unit Tests Required** (>90% coverage required):
- [ ] `generateMenuStyles()` returns valid StyleSheet
- [ ] `generateCategoryStyles()` applies all settings
- [ ] `generateItemStyles()` applies all settings
- [ ] `generateShadowStyle()` handles iOS/Android/Web
- [ ] `generateMediaStyles()` handles all positions
- [ ] `generateMediaStyles()` handles all sizes
- [ ] Handles null/undefined inputs gracefully
- [ ] Memoization works correctly

**Quality Gates**:
- [ ] `npm run lint` - Zero errors
- [ ] `npm run test` - Tests pass with >90% coverage
- [ ] Code review by `code-reviewer` agent

**Acceptance Criteria**:
- [ ] All style generators produce valid StyleSheet objects
- [ ] Platform-specific styles work on iOS/Android/Web
- [ ] Shadows render correctly on all platforms
- [ ] Performance is acceptable (memoization)

---

#### Task 3.2: Enhanced CategorySection
**Agent**: `frontend-dev`
**Estimated Effort**: 4-5 hours

**Files to Modify**:
- `BaseClient/src/components/PublicMenu/CategorySection.tsx`

**Files to Create**:
- `BaseClient/src/components/PublicMenu/__tests__/CategorySection.test.tsx`

**Features**:
- Apply dynamic styles from styleGenerator
- Support all image/video positions
- Support all typography options
- Support collapsible categories
- Support different title positions

**Unit Tests Required**:
- [ ] Renders with default styling when no customization
- [ ] Applies custom colors correctly
- [ ] Applies custom typography correctly
- [ ] Collapsible behavior works
- [ ] All media positions render correct layout
- [ ] Backward compatible with legacy categories

**E2E Tests Required** (Phase 4):
- Covered by Task 4.2: Menu Customization E2E tests

**Quality Gates**:
- [ ] `npm run lint` - Zero errors
- [ ] `npm run test` - Tests pass with >80% coverage
- [ ] Code review by `code-reviewer` agent

**Acceptance Criteria**:
- [ ] All media positions render correctly
- [ ] Typography settings applied
- [ ] Collapsible categories work
- [ ] Backward compatible with existing menus
- [ ] Unit tests pass

---

#### Task 3.3: Enhanced MenuItemDisplay
**Agent**: `frontend-dev`
**Estimated Effort**: 4-5 hours

**Files to Modify**:
- `BaseClient/src/components/PublicMenu/MenuItemDisplay.tsx`

**Files to Create**:
- `BaseClient/src/components/PublicMenu/__tests__/MenuItemDisplay.test.tsx`

**Features**:
- Support all layout variants (horizontal, vertical, card, compact, detailed)
- Apply dynamic styles
- Support all price positions
- Support availability badges
- Support item badges and tags

**Unit Tests Required**:
- [ ] Renders default layout when no customization
- [ ] All 5 layout variants render correct structure
- [ ] Price position 'right' renders correctly
- [ ] Price position 'below-name' renders correctly
- [ ] Price position 'below-description' renders correctly
- [ ] Availability badge shows when `show: true`
- [ ] Availability badge hidden when `show: false`
- [ ] Custom badges render correctly
- [ ] Tags render correctly
- [ ] Backward compatible with legacy items

**E2E Tests Required** (Phase 4):
- Covered by Task 4.2: Menu Customization E2E tests

**Quality Gates**:
- [ ] `npm run lint` - Zero errors
- [ ] `npm run test` - Tests pass with >80% coverage
- [ ] Code review by `code-reviewer` agent

**Acceptance Criteria**:
- [ ] All 5 layout variants render correctly
- [ ] Price positioning works
- [ ] Badges render correctly
- [ ] Backward compatible

---

#### Task 3.4: Enhanced MenuContentView
**Agent**: `frontend-dev`
**Estimated Effort**: 3-4 hours

**Files to Modify**:
- `BaseClient/src/components/PublicMenu/MenuContentView.tsx`

**Files to Create**:
- `BaseClient/src/components/PublicMenu/__tests__/MenuContentView.test.tsx`

**Features**:
- Apply layout template styles
- Support header/logo rendering
- Support different category layouts (full-width, two-column, masonry)
- Support item grid layouts

**Unit Tests Required**:
- [ ] Renders with default template when none specified
- [ ] All 5 layout templates apply correct styles
- [ ] Header renders when `header.showLogo: true`
- [ ] Header hidden when `header.showLogo: false`
- [ ] Banner renders when bannerContentId present
- [ ] Category layout 'full-width' works
- [ ] Category layout 'two-column' works
- [ ] Category layout 'masonry' works
- [ ] Backward compatible with legacy menus

**E2E Tests Required** (Phase 4):
- Covered by Task 4.2: Menu Customization E2E tests

**Quality Gates**:
- [ ] `npm run lint` - Zero errors
- [ ] `npm run test` - Tests pass with >80% coverage
- [ ] Code review by `code-reviewer` agent

**Acceptance Criteria**:
- [ ] Layout templates apply correctly
- [ ] Header renders with logo/banner
- [ ] Category layouts work
- [ ] Item grid layouts work

---

### Phase 4: Comprehensive Testing

> **CRITICAL**: Phase 4 is mandatory before feature release. All tests must pass and coverage requirements must be met.

#### Task 4.1: Unit Test Coverage Verification
**Agent**: `quality-gate`
**Estimated Effort**: 4-6 hours

**Purpose**: Ensure all Phase 1-3 tasks meet unit test requirements.

**Verification Steps**:
```bash
# Run full test suite with coverage
cd BaseClient && npm run test:coverage

# Verify coverage thresholds
# - Utilities (menuDefaults, styleGenerator): >90%
# - Components: >80%
# - Types/guards: >90%
```

**Files to Verify**:
- All `__tests__/*.test.ts` files from Phase 1-3
- `BaseClient/src/types/__tests__/menuStyleTypes.test.ts`

**Coverage Requirements**:
| Category | Minimum | Target |
|----------|---------|--------|
| Utility functions | 90% | 95% |
| Style generators | 90% | 95% |
| React hooks | 85% | 90% |
| React components | 80% | 85% |
| Type guards | 90% | 95% |

**Quality Gates**:
- [ ] `npm run test:coverage` - All tests pass
- [ ] Coverage report shows all minimums met
- [ ] No uncovered critical paths

**Acceptance Criteria**:
- [ ] All new utility functions have 90%+ coverage
- [ ] All new components have callback/logic tests
- [ ] Edge cases covered (null, undefined, partial objects)

---

#### Task 4.2: E2E Tests for Menu Customization
**Agent**: `regression-tester`
**Estimated Effort**: 6-8 hours

**Files to Create**:
- `E2ETests/tests/online-menus/menu-customization.spec.ts`
- `E2ETests/pages/StylingEditorPage.ts` (NEW page object)

**Page Object Methods Required**:
```typescript
class StylingEditorPage {
  selectLayoutTemplate(template: string): Promise<void>;
  setBackgroundColor(color: string): Promise<void>;
  setTextColor(color: string): Promise<void>;
  applyColorPreset(preset: string): Promise<void>;
  setTitleFontSize(size: number): Promise<void>;
  setCategoryImagePosition(position: string): Promise<void>;
  setItemLayoutVariant(variant: string): Promise<void>;
  setPricePosition(position: string): Promise<void>;
  toggleAvailabilityBadge(show: boolean): Promise<void>;
  getPreviewBackgroundColor(): Promise<string>;
  getPreviewTextColor(): Promise<string>;
}
```

**Test Scenarios**:

1. **Layout Template Selection** `@menu-customization @critical`
   - [ ] Select each layout template
   - [ ] Verify preview updates immediately
   - [ ] Save and reload, verify persistence
   - [ ] Verify public menu reflects template

2. **Color Scheme Editing** `@menu-customization`
   - [ ] Change background color
   - [ ] Change text color
   - [ ] Apply preset scheme
   - [ ] Verify preview reflects changes
   - [ ] Save and verify persistence

3. **Typography Editing** `@menu-customization`
   - [ ] Change title font size
   - [ ] Change body font size
   - [ ] Verify public menu displays changes
   - [ ] Verify persistence after reload

4. **Category Styling** `@menu-customization`
   - [ ] Change image position (all 6 options)
   - [ ] Change title position (all 5 options)
   - [ ] Add border and shadow
   - [ ] Verify public display renders correctly

5. **Item Styling** `@menu-customization`
   - [ ] Change layout variant (all 5 options)
   - [ ] Change price position (all 4 options)
   - [ ] Toggle availability badge
   - [ ] Verify public display renders correctly

6. **Backward Compatibility** `@menu-customization @critical`
   - [ ] Load legacy menu (no styling properties)
   - [ ] Verify it displays correctly with defaults
   - [ ] Add styling, save, reload
   - [ ] Verify styling persists
   - [ ] Verify legacy menu still works after schema change

**Quality Gates**:
- [ ] All E2E tests pass on chromium
- [ ] All E2E tests pass on mobile viewport
- [ ] Tests run in under 5 minutes total
- [ ] No flaky tests (run 3x to verify)
- [ ] Proper cleanup in afterAll hooks

**Acceptance Criteria**:
- [ ] All 6 E2E scenarios pass
- [ ] Tests tagged for selective runs
- [ ] Page objects documented

---

#### Task 4.3: Visual Regression Tests
**Agent**: `regression-tester`
**Estimated Effort**: 2-3 hours

**Files to Create**:
- `E2ETests/tests/online-menus/menu-customization-visual.spec.ts`

**Visual Test Scenarios**:
```typescript
test.describe('Menu Customization Visual Regression', () => {
  test('layout template: modern-grid', async ({ page }) => {
    // Apply modern-grid template
    await expect(page).toHaveScreenshot('modern-grid-template.png');
  });

  test('layout template: classic-list', async ({ page }) => {
    await expect(page).toHaveScreenshot('classic-list-template.png');
  });

  // ... for all 5 templates

  test('color scheme: dark preset', async ({ page }) => {
    await expect(page).toHaveScreenshot('dark-color-scheme.png');
  });

  test('image position: background', async ({ page }) => {
    await expect(page).toHaveScreenshot('image-background-position.png');
  });
});
```

**Quality Gates**:
- [ ] Baseline screenshots captured and committed
- [ ] Visual comparison threshold configured (maxDiffPixels)
- [ ] Tests pass on CI environment

**Acceptance Criteria**:
- [ ] Baseline screenshots for all 5 templates
- [ ] Baseline screenshots for all color presets
- [ ] Baseline screenshots for key styling options
- [ ] Visual comparison tests pass

---

### Phase 5: Documentation & Final Review

#### Task 5.1: Update API Documentation
**Agent**: `backend-dev`
**Estimated Effort**: 1-2 hours

**Files to Modify**:
- OpenAPI spec (auto-generated from C# models)
- Regenerate hooks: `npm run generate:hooks`

**Verification**:
- [ ] New types appear in generated TypeScript
- [ ] API hooks work with new schema
- [ ] No breaking changes to existing endpoints

**Quality Gates**:
- [ ] `npm run generate:hooks` succeeds
- [ ] `npm run lint` passes after regeneration
- [ ] `npm run test` passes after regeneration

---

#### Task 5.2: User Documentation
**Agent**: Any
**Estimated Effort**: 2-3 hours

**Files to Create**:
- `BaseClient/docs/features/menu-customization-guide.md`

**Content Requirements**:
1. **Overview** - What customization options are available
2. **Quick Start** - Apply a template in 3 steps
3. **Layout Templates** - Description of each template with screenshots
4. **Color Scheme** - How to customize colors
5. **Typography** - How to customize fonts
6. **Category Styling** - Image positions, borders, shadows
7. **Item Styling** - Layout variants, price positions, badges
8. **Import/Export** - How to save and share configurations
9. **Best Practices** - Tips for good menu design
10. **Troubleshooting** - Common issues and solutions

**Quality Gates**:
- [ ] All sections written
- [ ] Screenshots included for visual options
- [ ] Reviewed for accuracy

---

#### Task 5.3: Final Code Review & Quality Gate
**Agent**: `code-reviewer` + `quality-gate`
**Estimated Effort**: 2-3 hours

**Purpose**: Final comprehensive review before feature release.

**Review Checklist**:
- [ ] All Phase 1-4 tasks marked complete
- [ ] All unit tests pass with required coverage
- [ ] All E2E tests pass
- [ ] All visual regression tests pass
- [ ] No lint errors or warnings
- [ ] No YAGNI violations
- [ ] Build succeeds for web
- [ ] Code review passed for all components
- [ ] Documentation complete

**Final Quality Gates**:
```bash
# Run all quality checks
cd BaseClient && npm run lint:strict
cd BaseClient && npm run test:coverage
cd BaseClient && npm run yagni
cd BaseClient && npx expo export --platform web
cd E2ETests && npx playwright test --grep "@menu-customization"
```

**Acceptance Criteria**:
- [ ] All checks pass
- [ ] Feature ready for production

---

## Success Criteria

### Functional Requirements
- [ ] All new styling options work in the editor
- [ ] All styling changes reflect in live preview
- [ ] All styling changes persist correctly (save/reload)
- [ ] Public menu displays all styling correctly
- [ ] Existing menus work without modification

### Non-Functional Requirements
- [ ] No performance regression (preview updates < 100ms)
- [ ] JSON size increase < 50% for fully styled menus
- [ ] Works on web, iOS, and Android
- [ ] Accessible (all controls have proper labels)

### Testing Requirements
- [ ] Unit test coverage > 80% for new code
- [ ] All E2E tests pass
- [ ] No visual regressions
- [ ] Backward compatibility verified

---

## Risk Assessment

| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|------------|
| JSON size bloat | Medium | Medium | Only store non-default values, compress |
| Performance regression | High | Low | Memoize style generation, lazy load editors |
| Cross-platform inconsistencies | Medium | Medium | Test on all platforms early |
| Breaking existing menus | Critical | Low | Extensive backward compatibility testing |
| Complex UI overwhelming users | Medium | Medium | Progressive disclosure, presets |

---

## Dependencies

- No backend API changes required (JSONB handles flexible schema)
- No database migrations required
- Frontend only: TypeScript types and React components
- Content Service integration for logo/banner uploads (existing)

---

## Phase 6: Import/Export Configuration

### Overview

Allow users to import and export menu configurations as JSON files. This enables:
- **Backup/Restore** - Save menu styling for safekeeping
- **Template Sharing** - Share styling configurations between menus
- **Quick Setup** - Import pre-made professional templates
- **Migration** - Move configurations between environments

---

### Architecture Decision: Import/Export Strategy

**Context**: How to handle import/export of menu configurations.

**Options Considered**:

| Option | Approach | Pros | Cons |
|--------|----------|------|------|
| A | Export full MenuContents JSON | Simple, complete | Large files, includes content IDs |
| B | Export styling-only (no content) | Smaller, reusable | Loses category/item structure |
| C | Export with options (full/styling-only) | Flexible | More complex UI |

**Decision**: **Option C - Export with Options**

**Rationale**:
- Users can choose to export full configuration OR styling-only
- Styling-only export strips content IDs (images/videos) for portability
- Full export is useful for backup/restore
- Styling-only is useful for templates

---

### Export Configuration Schema

```typescript
/**
 * Exported menu configuration file format.
 * Version-tracked for future compatibility.
 */
interface MenuConfigExport {
  // Metadata
  exportVersion: number;          // Export format version (1)
  exportDate: string;             // ISO date string
  exportType: 'full' | 'styling'; // What was exported

  // Source info (for reference only)
  sourceMenuName?: string;
  sourceMenuId?: string;

  // The actual configuration
  contents: MenuContents;
}

/**
 * For styling-only exports, content IDs are stripped:
 */
interface StylingOnlyContents extends Omit<MenuContents, 'categories'> {
  categories?: StylingOnlyCategory[];
}

interface StylingOnlyCategory extends Omit<Category, 'items' | 'imageContentId' | 'videoContentId'> {
  imageContentId?: never;  // Stripped
  videoContentId?: never;  // Stripped
  items?: StylingOnlyMenuItem[];
}

interface StylingOnlyMenuItem extends Omit<MenuItem, 'imageContentId' | 'videoContentId' | 'documentContentIds'> {
  imageContentId?: never;   // Stripped
  videoContentId?: never;   // Stripped
  documentContentIds?: never; // Stripped
}
```

---

### Task 6.1: Export Configuration Utility
**Agent**: `frontend-dev`
**Estimated Effort**: 2-3 hours

**Files to Create**:
- `BaseClient/src/utils/menuConfigExport.ts`
- `BaseClient/src/utils/__tests__/menuConfigExport.test.ts`

**Functions**:
```typescript
export function exportFullConfig(...): MenuConfigExport;
export function exportStylingOnly(...): MenuConfigExport;
export function downloadConfigAsJson(...): void;
export function stripContentIds(...): StylingOnlyContents;
```

**Unit Tests Required** (>90% coverage):
- [ ] `exportFullConfig()` includes all properties
- [ ] `exportFullConfig()` sets correct exportType
- [ ] `exportFullConfig()` includes metadata (date, version)
- [ ] `exportStylingOnly()` strips imageContentId
- [ ] `exportStylingOnly()` strips videoContentId
- [ ] `exportStylingOnly()` strips documentContentIds
- [ ] `exportStylingOnly()` preserves styling properties
- [ ] `stripContentIds()` handles null/undefined
- [ ] `stripContentIds()` handles empty categories
- [ ] `downloadConfigAsJson()` creates correct blob
- [ ] `downloadConfigAsJson()` generates correct filename

**Quality Gates**:
- [ ] `npm run lint` - Zero errors
- [ ] `npm run test` - Tests pass with >90% coverage
- [ ] Code review by `code-reviewer` agent

**Acceptance Criteria**:
- [ ] `exportFullConfig()` includes all properties
- [ ] `exportStylingOnly()` strips all content IDs
- [ ] `downloadConfigAsJson()` triggers browser download
- [ ] Export includes version and metadata

---

### Task 6.2: Import Configuration Utility
**Agent**: `frontend-dev`
**Estimated Effort**: 3-4 hours

**Files to Create**:
- `BaseClient/src/utils/menuConfigImport.ts`
- `BaseClient/src/utils/__tests__/menuConfigImport.test.ts`

**Functions**:
```typescript
export function parseConfigFile(...): Result<MenuConfigExport, ImportError>;
export function validateConfig(...): Result<MenuConfigExport, ValidationError>;
export function mergeImportedConfig(...): MenuContents;
```

**Unit Tests Required** (>90% coverage):
- [ ] `parseConfigFile()` parses valid JSON
- [ ] `parseConfigFile()` returns error for invalid JSON
- [ ] `parseConfigFile()` returns error for empty string
- [ ] `validateConfig()` accepts valid config
- [ ] `validateConfig()` rejects missing exportVersion
- [ ] `validateConfig()` rejects unsupported version
- [ ] `validateConfig()` rejects missing contents
- [ ] `mergeImportedConfig()` replaces all when mode='replace'
- [ ] `mergeImportedConfig()` merges when mode='merge'
- [ ] `mergeImportedConfig()` preserves content IDs when option set
- [ ] `mergeImportedConfig()` preserves category structure when option set
- [ ] Error codes are correct for each failure type

**Quality Gates**:
- [ ] `npm run lint` - Zero errors
- [ ] `npm run test` - Tests pass with >90% coverage
- [ ] Code review by `code-reviewer` agent

**Acceptance Criteria**:
- [ ] `parseConfigFile()` handles invalid JSON gracefully
- [ ] `validateConfig()` checks schema version compatibility
- [ ] `mergeImportedConfig()` correctly merges styling with existing content
- [ ] Clear error messages for all failure cases

---

### Task 6.3: Export/Import UI Components
**Agent**: `frontend-dev`
**Estimated Effort**: 4-5 hours

**Files to Create**:
- `BaseClient/src/components/OnlineMenus/ConfigExportButton.tsx`
- `BaseClient/src/components/OnlineMenus/ConfigImportButton.tsx`
- `BaseClient/src/components/OnlineMenus/ImportConfigModal.tsx`
- `BaseClient/src/components/OnlineMenus/__tests__/ConfigExportButton.test.tsx`
- `BaseClient/src/components/OnlineMenus/__tests__/ConfigImportButton.test.tsx`
- `BaseClient/src/components/OnlineMenus/__tests__/ImportConfigModal.test.tsx`

**ConfigExportButton Features**:
- Dropdown with "Export Full" and "Export Styling Only" options
- Shows export in progress indicator
- Generates filename with menu name and date

**ConfigImportButton Features**:
- File picker for JSON files
- Validates file before opening modal
- Error toast for invalid files

**ImportConfigModal Features**:
- Preview of what will be imported
- Import mode selection (Replace All / Merge)
- Option to preserve existing images/videos
- Confirmation before applying

**Unit Tests Required**:
- [ ] ConfigExportButton: dropdown opens on press
- [ ] ConfigExportButton: `onExportFull` called when selected
- [ ] ConfigExportButton: `onExportStyling` called when selected
- [ ] ConfigImportButton: `onFileSelected` called with file
- [ ] ConfigImportButton: shows error for invalid file type
- [ ] ImportConfigModal: `onConfirm` called with correct options
- [ ] ImportConfigModal: `onCancel` closes modal
- [ ] ImportConfigModal: mode selection updates state
- [ ] ImportConfigModal: preserve options update state

**Quality Gates**:
- [ ] `npm run lint` - Zero errors
- [ ] `npm run test` - Tests pass with >80% coverage
- [ ] All components have testID, accessibilityLabel, accessibilityHint
- [ ] Code review by `code-reviewer` agent

**Acceptance Criteria**:
- [ ] Export dropdown with both options works
- [ ] File download works on web, iOS, Android
- [ ] Import file picker accepts only .json files
- [ ] Preview shows configuration summary
- [ ] Merge options work correctly
- [ ] Error handling with user-friendly messages

---

### Task 6.4: Integrate Export/Import in Editor
**Agent**: `frontend-dev`
**Estimated Effort**: 2 hours

**Files to Modify**:
- `BaseClient/src/components/OnlineMenus/FullMenuEditor.tsx`
- `BaseClient/src/components/OnlineMenus/GlobalStylingTab.tsx`

**Changes**:
- Add Export/Import buttons to GlobalStylingTab header
- Wire up export to current menuContents state
- Wire up import to update menuContents state
- Add confirmation dialog before import replaces content

**Unit Tests Required**:
- [ ] Export button triggers export with current state
- [ ] Import updates menuContents state
- [ ] Confirmation shown before destructive import
- [ ] Cancel on confirmation prevents import

**Quality Gates**:
- [ ] `npm run lint` - Zero errors
- [ ] `npm run test` - Existing tests still pass
- [ ] Code review by `code-reviewer` agent

**Acceptance Criteria**:
- [ ] Buttons visible in GlobalStylingTab header
- [ ] Export uses current editor state
- [ ] Import updates editor state
- [ ] Confirmation before destructive import
- [ ] No layout issues on mobile

---

### Task 6.5: Pre-built Template Library (Optional Enhancement)
**Agent**: `frontend-dev`
**Estimated Effort**: 3-4 hours

**Files to Create**:
- `BaseClient/src/data/menuTemplates/index.ts`
- `BaseClient/src/data/menuTemplates/modernDark.json`
- `BaseClient/src/data/menuTemplates/classicElegant.json`
- `BaseClient/src/data/menuTemplates/minimalist.json`
- `BaseClient/src/data/menuTemplates/vibrant.json`
- `BaseClient/src/data/menuTemplates/rustic.json`
- `BaseClient/src/components/OnlineMenus/TemplateLibrary.tsx`
- `BaseClient/src/components/OnlineMenus/__tests__/TemplateLibrary.test.tsx`

**Features**:
- Built-in professional templates
- Visual preview cards
- One-click apply
- Templates stored as JSON in the app bundle

**Template Categories**:
- Modern (dark theme, bold typography)
- Classic (elegant, serif fonts)
- Minimalist (clean, lots of whitespace)
- Vibrant (colorful, playful)
- Rustic (warm colors, textured)

**Unit Tests Required**:
- [ ] All 5 templates are valid MenuConfigExport
- [ ] Template index exports all templates
- [ ] TemplateLibrary renders all 5 templates
- [ ] `onSelect` called with correct template
- [ ] Preview cards have correct styling

**Quality Gates**:
- [ ] `npm run lint` - Zero errors
- [ ] `npm run test` - Tests pass with >80% coverage
- [ ] All templates validate against schema
- [ ] Code review by `code-reviewer` agent

**Acceptance Criteria**:
- [ ] 5 pre-built templates included
- [ ] Templates are valid MenuConfigExport format
- [ ] Preview cards show visual representation
- [ ] One-click apply works

---

### Task 6.6: E2E Tests for Import/Export
**Agent**: `regression-tester`
**Estimated Effort**: 3-4 hours

**Files to Create**:
- `E2ETests/tests/online-menus/menu-config-import-export.spec.ts`
- `E2ETests/fixtures/configs/valid-full-config.json`
- `E2ETests/fixtures/configs/valid-styling-config.json`
- `E2ETests/fixtures/configs/invalid-config.json`

**Test Scenarios** (all tagged `@import-export`):

1. **Export Full Configuration** `@critical`
   - [ ] Create menu with categories, items, images
   - [ ] Add custom styling
   - [ ] Export full configuration
   - [ ] Verify downloaded file contains all data

2. **Export Styling Only** `@critical`
   - [ ] Create styled menu with images
   - [ ] Export styling only
   - [ ] Verify file does NOT contain content IDs
   - [ ] Verify styling properties are present

3. **Import Full Configuration** `@critical`
   - [ ] Create empty menu
   - [ ] Import full configuration file
   - [ ] Verify categories and styling applied
   - [ ] Save and reload, verify persistence

4. **Import Styling Only (Merge)**
   - [ ] Create menu with categories and images
   - [ ] Import styling-only configuration
   - [ ] Verify styling applied
   - [ ] Verify existing images preserved

5. **Import Validation Errors**
   - [ ] Try importing invalid JSON - verify error toast
   - [ ] Try importing incompatible version - verify error message
   - [ ] Verify modal closes on cancel

6. **Apply Pre-built Template** `@critical`
   - [ ] Open menu editor
   - [ ] Apply "Modern Dark" template from library
   - [ ] Verify styling changes applied in editor
   - [ ] Save and verify in public view

**Quality Gates**:
- [ ] All 6 E2E scenarios pass on chromium
- [ ] All tests pass on mobile viewport
- [ ] No flaky tests (run 3x to verify)
- [ ] Proper cleanup in afterAll hooks
- [ ] Tests complete in <3 minutes

**Acceptance Criteria**:
- [ ] All 6 E2E scenarios pass
- [ ] Tests are not flaky
- [ ] Proper cleanup after tests
- [ ] Tagged for selective runs

---

## Estimated Total Effort

| Phase | Tasks | Estimated Hours |
|-------|-------|-----------------|
| Phase 1: Foundation | 3 tasks | 6-8 hours |
| Phase 2: Editor UI | 10 tasks | 28-36 hours |
| Phase 3: Public Display | 4 tasks | 14-18 hours |
| Phase 4: Testing | 3 tasks | 12-17 hours |
| Phase 5: Documentation | 3 tasks | 5-8 hours |
| Phase 6: Import/Export | 6 tasks | 14-20 hours |
| **Total** | **29 tasks** | **79-107 hours** |

---

## Summary of Quality Requirements

### For Every Task

| Requirement | Mandatory |
|-------------|-----------|
| `npm run lint` passes | ✅ |
| `npm run test` passes | ✅ |
| `npm run yagni` passes | ✅ |
| `npx expo export --platform web` passes | ✅ |
| Code review by `code-reviewer` agent | ✅ |

### Coverage Requirements

| Code Type | Minimum |
|-----------|---------|
| Utility functions | 90% |
| Style generators | 90% |
| React hooks | 85% |
| React components | 80% |
| Type guards | 90% |

### E2E Test Requirements

| Requirement | Standard |
|-------------|----------|
| Tag all tests | `@menu-customization`, `@import-export` |
| Run time per test | <60 seconds |
| Flakiness | 0% (run 3x to verify) |
| Cleanup | Required in afterAll |

---

## Change Log

| Date | Version | Author | Changes |
|------|---------|--------|---------|
| 2026-02-07 | 1.0 | Chief Architect | Initial architecture document |
| 2026-02-07 | 1.1 | Chief Architect | Added Phase 6: Import/Export Configuration feature |
| 2026-02-07 | 1.2 | Chief Architect | Added explicit quality requirements, unit test requirements, E2E test requirements, and code review requirements for all tasks |
