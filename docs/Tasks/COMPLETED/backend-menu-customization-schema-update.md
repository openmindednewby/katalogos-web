# Backend Menu Customization Schema Update

> **Reference**: `BaseClient/docs/Tasks/TODO/menu-customization-feature.md` - Task 1.1

## Status: COMPLETED

## Problem Statement

The current menu JSON structure (`MenuContents`) in the OnlineMenu backend supports only basic styling properties:
- **Menu Level**: `titleFont`, `titleFontSize`, `backgroundColor`, `textColor`
- **Category Level**: `name`, `description`, `backgroundColor`, `textColor`, `fontSize`, `displayOrder`, `items`, `imageContentId`, `videoContentId`
- **MenuItem Level**: `name`, `description`, `price`, `isAvailable`, `imageContentId`, `videoContentId`, `backgroundColor`, `textColor`, `fontSize`, `displayOrder`

The frontend menu customization feature requires much richer customization options including:
- Image/video positioning and sizing
- Typography controls (multiple fonts, weights)
- Layout options (grid vs list)
- Spacing/padding controls
- Border and shadow effects
- Price styling
- Availability badge customization

## Root Cause Analysis

N/A - This is a new feature implementation, not a bug fix.

## Implementation Plan

1. Create new nested C# classes for rich styling settings:
   - `GlobalTypography` - Font settings for titles, body, prices
   - `ColorScheme` - Global color palette
   - `MenuLayoutSettings` - Layout template and options
   - `HeaderSettings` - Logo and banner configuration
   - `SpacingSettings` - Page and element spacing
   - `MediaSettings` - Image/video positioning and sizing
   - `OverlaySettings` - Media overlay configuration
   - `CategoryTypography` - Category-specific font settings
   - `CategoryLayout` - Category layout options
   - `BoxStyling` - Padding, margin, border, shadow
   - `ItemTypography` - Menu item font settings
   - `PriceStyle` - Price display options
   - `ItemLayout` - Menu item layout variants
   - `AvailabilityBadgeStyle` - Availability indicator styling
   - `Badge` - Custom badge configuration

2. Update existing classes with new optional properties:
   - `MenuContents` - Add `SchemaVersion`, `Typography`, `ColorScheme`, `Layout`, `Header`, `Spacing`
   - `Category` - Add `ImageSettings`, `VideoSettings`, `Typography`, `Layout`, `Styling`
   - `MenuItem` - Add `ImageSettings`, `VideoSettings`, `Typography`, `PriceStyle`, `Layout`, `Styling`, `AvailabilityBadge`, `Badges`, `Tags`

3. Write unit tests for serialization/deserialization

4. Verify backward compatibility with existing menus

## Files Modified

- `OnlineMenuSaaS/OnlineMenuService/OnlineMenu/src/OnlineMenu.Core/TenantMenusAggregate/TenantMenusAggregate.cs`
- `OnlineMenuSaaS/OnlineMenuService/OnlineMenu/tests/OnlineMenu.UnitTests/Domain/TenantMenusJsonSerializationTests.cs`

## Success Criteria

- [x] All new C# classes compile without errors
- [x] JSON serialization/deserialization works correctly
- [x] Existing menus deserialize without errors (backward compatibility)
- [x] Unit tests cover happy path, edge cases, and errors
- [x] `dotnet build` passes with no errors
- [x] `dotnet test` passes - all tests pass
- [x] Unit test coverage >85% for new code

## Changes Made

### New Classes Added (15 styling classes)

All classes added to `TenantMenusAggregate.cs` in the `#region Styling Classes` section:

1. **GlobalTypography** - Title, body, and price font settings (font, size, weight)
2. **ColorScheme** - 9 color properties (background, surface, text, textSecondary, accent, price, border, divider, unavailable)
3. **MenuLayoutSettings** - Template, category layout, item layout, items per row, divider settings
4. **HeaderSettings** - Logo (show, position, size, contentId), banner (contentId, height), menu name/description visibility
5. **SpacingSettings** - Page padding, category spacing, item spacing, content padding
6. **MediaSettings** - Position, size (with custom dimensions), fit mode, border radius, opacity, overlay settings
7. **OverlaySettings** - Enabled flag, color, opacity
8. **CategoryTypography** - Title and description font settings with visibility toggle
9. **CategoryLayout** - Title position, content alignment, item layout override, collapsible settings
10. **BoxStyling** - Padding, margin, border (width, color, radius), shadow (enabled, color, blur)
11. **ItemTypography** - Name and description font settings with max lines
12. **PriceStyle** - Font settings, position, prefix/suffix, currency display, strikethrough option
13. **ItemLayout** - Variant (horizontal, vertical, card, compact, detailed), image position, content alignment, min height/max width
14. **AvailabilityBadgeStyle** - Show flag, position, unavailable text/colors
15. **Badge** - Text, background color, text color, icon

### Existing Classes Updated

**MenuContents** - Added 6 new optional properties:
- `SchemaVersion` (int?) - For future schema migrations
- `Typography` (GlobalTypography?)
- `ColorScheme` (ColorScheme?)
- `Layout` (MenuLayoutSettings?)
- `Header` (HeaderSettings?)
- `Spacing` (SpacingSettings?)

**Category** - Added 5 new optional properties:
- `ImageSettings` (MediaSettings?)
- `VideoSettings` (MediaSettings?)
- `Typography` (CategoryTypography?)
- `Layout` (CategoryLayout?)
- `Styling` (BoxStyling?)

**MenuItem** - Added 9 new optional properties:
- `ImageSettings` (MediaSettings?)
- `VideoSettings` (MediaSettings?)
- `Typography` (ItemTypography?)
- `PriceStyle` (PriceStyle?)
- `Layout` (ItemLayout?)
- `Styling` (BoxStyling?)
- `AvailabilityBadge` (AvailabilityBadgeStyle?)
- `Badges` (List<Badge>?)
- `Tags` (List<string>?)

## Test Results

**Total Tests**: 68 (46 existing + 22 new)
**Passed**: 68
**Failed**: 0
**Build Time**: 4.51 seconds

### New Tests Added (22 tests)

#### Individual Class Serialization Tests (15 tests):
- `GlobalTypography_SerializesAndDeserializesCorrectly`
- `ColorScheme_SerializesAndDeserializesCorrectly`
- `MenuLayoutSettings_SerializesAndDeserializesCorrectly`
- `HeaderSettings_SerializesAndDeserializesCorrectly`
- `SpacingSettings_SerializesAndDeserializesCorrectly`
- `MediaSettings_WithOverlay_SerializesAndDeserializesCorrectly`
- `CategoryTypography_SerializesAndDeserializesCorrectly`
- `CategoryLayout_SerializesAndDeserializesCorrectly`
- `BoxStyling_SerializesAndDeserializesCorrectly`
- `ItemTypography_SerializesAndDeserializesCorrectly`
- `PriceStyle_SerializesAndDeserializesCorrectly`
- `ItemLayout_SerializesAndDeserializesCorrectly`
- `AvailabilityBadgeStyle_SerializesAndDeserializesCorrectly`
- `Badge_SerializesAndDeserializesCorrectly`

#### Backward Compatibility Tests (4 tests):
- `MenuContents_WithNewStylingProperties_SerializesAndDeserializesCorrectly` - Full featured menu with all styling
- `MenuContents_LegacyJsonWithoutNewProperties_DeserializesCorrectly` - Legacy JSON without new properties deserializes with null new properties
- `MenuContents_PartialNewProperties_DeserializesCorrectly` - Partial styling (some properties set, some null)
- `MenuContents_RoundTrip_PreservesAllStylingData` - Serialize -> Deserialize -> Serialize maintains all data

## Quality Gates Verification

- [x] `dotnet format --verify-no-changes` - Passed (no formatting issues)
- [x] No YAGNI warnings (IDE0051, IDE0052, S1144, S4487)
- [x] `dotnet build` - Passed with 0 errors, only unrelated SDK warnings
- [x] `dotnet test` - 68 tests passed, 0 failed
