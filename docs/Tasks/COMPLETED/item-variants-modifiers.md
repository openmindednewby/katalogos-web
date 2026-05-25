# Task: Item Variants & Modifiers

## Status: COMPLETE (Phases 1-5 Done, Phase 6 Verification Passed)
## Created: 2026-03-18
## Last Updated: 2026-03-18

---

## Context

Real restaurant menus need more than flat price-per-item. A pizza might be $12 (Small), $16 (Medium), or $20 (Large). A burger might have add-ons like cheese (+$1) or bacon (+$2). This feature adds **VariantGroups** and **ModifierGroups** to menu items, bringing the platform to feature parity with real-world menu SaaS competitors (Toast, Square, Clover).

This is the highest-impact differentiator vs. Canva-style menu builders.

---

## Architecture Decision Record (ADR)

### ADR-1: Data Model — JSON-Embedded vs. Relational Entities

**Options Considered:**

| Option | Pros | Cons |
|--------|------|------|
| **A) JSON-embedded in MenuContents** (CHOSEN) | Zero migration risk; backward compatible; matches existing pattern (all of MenuContents is JSON); simple reads; no joins; atomic save | Harder to query variants across items; no referential integrity for shared groups |
| **B) Relational entities (separate tables)** | Strong referential integrity; easy to query across items; reusable groups | Major migration; breaks existing JSON-based pattern; complex joins for menu display; N+1 risk on public endpoint; diverges from architecture |
| **C) Hybrid (JSON + shared relational groups)** | Reusable groups; some referential integrity | Highest complexity; two patterns to maintain; migration still needed |

**Decision:** Option A — Embed `VariantGroups` and `ModifierGroups` as JSON properties inside `MenuItem`.

**Rationale:**
1. The entire `MenuContents` including `Categories` and `MenuItem` is already stored as a single JSONB column (`ContentsJson`). Adding variant/modifier data follows the established pattern exactly.
2. A single menu read loads everything — no joins, no N+1 queries. The public menu endpoint stays fast.
3. No database migration required — the JSONB column already stores whatever JSON shape `MenuContents` serializes to. Adding new properties to the C# classes is automatically handled by `System.Text.Json`.
4. Menu items are inherently tenant-scoped and document-scoped. Cross-item reuse of variant groups is a Phase 2 concern (templates) that can be layered on top without changing this schema.
5. Backward compatibility is automatic — existing menus without variants/modifiers deserialize with null/empty collections.

**Trade-offs accepted:**
- Cannot query "all items with size variants" across menus without deserializing JSON (acceptable — this is not a business requirement)
- No foreign key enforcement on variant/modifier data (acceptable — the JSON is always saved/loaded as a whole document)
- If shared/reusable groups are needed later, we add a separate "variant templates" table and copy-on-use pattern

### ADR-2: Price Model — Base Price Behavior with Variants

**Decision:** When a MenuItem has VariantGroups, the `Price` field becomes the **minimum/starting price** (displayed as "from $12"). The actual price is determined by the selected variant. If no VariantGroups exist, `Price` works exactly as before.

**Rationale:** This preserves backward compatibility. Existing menus with `Price = 15.99` continue to work. New menus can set `Price = 0` and use variants exclusively, or set `Price = 12` as the base and let variants show the range.

### ADR-3: Selection Rules Model

**Decision:** Each VariantGroup and ModifierGroup has `MinSelections` and `MaxSelections` properties:
- VariantGroup: Typically `Min=1, Max=1` (choose exactly one size)
- ModifierGroup: Typically `Min=0, Max=N` (choose up to N extras)

This covers all real-world scenarios:
- "Choose 1 size" → `Min=1, Max=1`
- "Choose up to 3 toppings" → `Min=0, Max=3`
- "Choose 1-2 sauces" → `Min=1, Max=2`
- "Add as many extras as you want" → `Min=0, Max=null` (null = unlimited)

---

## Data Model Design

### New Classes (added to TenantMenusAggregate.cs)

```
MenuItem
├── VariantGroups: List<VariantGroup>
│   ├── Name: string ("Size")
│   ├── DisplayOrder: int
│   ├── IsRequired: bool (true)
│   ├── MinSelections: int (1)
│   ├── MaxSelections: int? (1, null = unlimited)
│   └── Variants: List<Variant>
│       ├── Name: string ("Small")
│       ├── Price: decimal (12.00)
│       ├── DisplayOrder: int
│       └── IsAvailable: bool (true)
│
└── ModifierGroups: List<ModifierGroup>
    ├── Name: string ("Extras")
    ├── DisplayOrder: int
    ├── IsRequired: bool (false)
    ├── MinSelections: int (0)
    ├── MaxSelections: int? (3, null = unlimited)
    └── Modifiers: List<Modifier>
        ├── Name: string ("Add cheese")
        ├── PriceAdjustment: decimal (1.00)
        ├── DisplayOrder: int
        └── IsAvailable: bool (true)
```

### Key differences between Variants and Modifiers:
- **Variant.Price** = absolute price (replaces base price). "Small = $12"
- **Modifier.PriceAdjustment** = additive price delta. "Add cheese = +$1.00"
- **VariantGroup** is typically required (choose a size). Single-select by default.
- **ModifierGroup** is typically optional (add extras). Multi-select by default.

---

## API Changes

### No new endpoints needed

Since variants and modifiers are embedded in `MenuContents` JSON, they flow through existing CRUD endpoints:
- `PUT /TenantMenus` — Update already accepts `MenuContents` with categories/items. Items will now include `variantGroups` and `modifierGroups`.
- `GET /TenantMenus/{id}` — Returns full menu including variants/modifiers in the JSON.
- `GET /public/menus/{id}` — Returns public menu with variants/modifiers.

### Swagger/OpenAPI impact
The OpenAPI spec will automatically include the new classes because `MenuItem` is already part of `MenuContents` which is part of the request/response DTOs. After backend changes, `npm run generate:hooks` regenerates TypeScript types.

---

## Implementation Plan

### Phase 1: Backend — Domain Model (OnlineMenu.Core) -- COMPLETE
- [x] Add `VariantGroup`, `Variant`, `ModifierGroup`, `Modifier` classes to `TenantMenusAggregate.cs`
- [x] Add `VariantGroups` and `ModifierGroups` properties to `MenuItem`
- [x] Add unit tests for JSON serialization round-trip with new properties (8 new tests)
- [x] Add unit tests for backward compatibility (deserializing existing JSON without new fields)
- [x] Add domain entity tests for all new classes (15 new tests)
- [x] All 362+ backend unit tests pass

### Phase 2: Backend — Validation (OnlineMenu.Web) -- COMPLETE
- [x] Update `UpdateTenantMenusValidator` to validate variant/modifier structure
- [x] Validate: variant names not empty, prices >= 0
- [x] Validate: modifier names not empty, price adjustments valid (negative = discount)
- [x] Validate: selection rules make sense (min <= max when max is not null)
- [x] Validate: abuse limits (max 10 groups per item, max 50 items per group)
- [x] Add validator unit tests (72 new tests across 2 test files)
- [x] All 491 backend unit tests pass

### Phase 3: Frontend — Types & Localization (BaseClient) -- COMPLETE
- [x] Add `VariantGroup`, `Variant`, `ModifierGroup`, `Modifier` interfaces to `menuTypes.ts`
- [x] Add `variantGroups` and `modifierGroups` properties to `MenuItem` interface
- [x] Add 40+ translation keys to `en.json` (variants and modifiers sections)
- [x] Add 20+ test IDs to `menuTestIds.ts` for all new interactive elements
- [x] Frontend prod build passes (TypeScript types compile correctly)
- [ ] Regenerate hooks after backend Swagger spec updates (when backend is deployed)

### Phase 4: Frontend — Variant/Modifier Editor (BaseClient) -- COMPLETE
- [x] Create `VariantGroupEditor` component (add/edit/delete variant groups on a menu item)
- [x] Create `ModifierGroupEditor` component (add/edit/delete modifier groups on a menu item)
- [x] Create `VariantGroupCard` sub-component (renders a single variant group with variant rows)
- [x] Create `ModifierGroupCard` sub-component (renders a single modifier group with modifier rows)
- [x] Extract `PriceInput` component from MenuItemEditor (reusable decimal input)
- [x] Create `variantModifierHelpers.ts` — pure CRUD helpers for immutable state updates
- [x] Integrate into `MenuItemEditor` (new collapsible sections below existing fields)
- [x] Add test IDs for all new interactive elements (using existing menuTestIds.ts entries)
- [x] Add unit tests for helper logic (30+ tests in variantModifierHelpers.test.ts)

### Phase 5: Frontend — Public Display (BaseClient) -- COMPLETE
- [x] Update `MenuItemDisplay` to show variant groups (e.g., "Size: Small $12.00 / Medium $16.00 / Large $20.00")
- [x] Update `ItemPrice` to show "from $12" when variants exist (showFromPrefix prop)
- [x] Update `MenuItemDisplay` to show modifier groups (e.g., "Extras: Add cheese +$1.00, Bacon +$2.00")
- [x] Create `VariantModifierDisplay` component for public-facing variant/modifier rendering
- [x] Update `PreviewMenuItemCard` to show "from $X" pricing in live preview
- [x] Add unit tests for price display logic (getMinVariantPrice, hasVariants, hasModifiers, formatPriceAdjustment)

### Phase 6: Verification -- COMPLETE
- [x] Frontend lint-fix via Tilt MCP — PASSED (0 errors)
- [x] Frontend YAGNI via Tilt MCP — PASSED (no unused exports)
- [x] Frontend unit tests via Tilt MCP — PASSED (2918 tests, 226 suites)
- [x] Frontend prod build via Tilt MCP — PASSED
- [ ] Regenerate API hooks and verify types match (deferred — awaiting backend deployment)
- [ ] E2E tests for menu CRUD with variants/modifiers (deferred — requires visual-qa + regression-tester)

---

## Files to Modify

### Backend (OnlineMenuSaaS/)
- `OnlineMenu.Core/TenantMenusAggregate/TenantMenusAggregate.cs` — Add new classes and MenuItem properties
- `OnlineMenu.Web/TenantMenus/Update.Validator.cs` — Add validation rules
- `OnlineMenu.UnitTests/Domain/TenantMenusJsonSerializationTests.cs` — Add round-trip tests
- `OnlineMenu.UnitTests/Domain/CategoryAndMenuItemTests.cs` — Add variant/modifier tests
- `OnlineMenu.UnitTests/Validators/UpdateTenantMenusValidatorTests.cs` — Add validator tests

### Frontend (BaseClient/)
- `src/types/menuTypes.ts` — Add VariantGroup, Variant, ModifierGroup, Modifier interfaces
- `src/localization/locales/en.json` — Add translation keys
- `src/components/OnlineMenus/MenuItemEditor.tsx` — Integrate variant/modifier editors
- `src/components/OnlineMenus/Display/components/MenuItemDisplay.tsx` — Show variants/modifiers
- `src/components/OnlineMenus/Display/components/ItemPrice.tsx` — "from $X" logic
- New files: VariantGroupEditor.tsx, ModifierGroupEditor.tsx (in components/OnlineMenus/)
- `src/shared/testIds.ts` — Add test IDs for new elements

---

## Files Created/Modified in Phases 4-5

### New Files
- `src/components/OnlineMenus/utils/variantModifierHelpers.ts` (299 lines) — Pure CRUD helpers for variant/modifier state management
- `src/components/OnlineMenus/utils/variantModifierHelpers.test.ts` (422 lines) — 30+ unit tests for helpers
- `src/components/OnlineMenus/VariantGroupEditor.tsx` (196 lines) — Admin editor for variant groups
- `src/components/OnlineMenus/ModifierGroupEditor.tsx` (196 lines) — Admin editor for modifier groups
- `src/components/OnlineMenus/components/VariantGroupCard.tsx` (153 lines) — Single variant group card with variant rows
- `src/components/OnlineMenus/components/ModifierGroupCard.tsx` (153 lines) — Single modifier group card with modifier rows
- `src/components/OnlineMenus/components/PriceInput.tsx` (79 lines) — Controlled decimal input (extracted from MenuItemEditor)
- `src/components/OnlineMenus/Display/components/VariantModifierDisplay.tsx` (126 lines) — Public display of variants/modifiers

### Modified Files
- `src/components/OnlineMenus/MenuItemEditor.tsx` — Integrated VariantGroupEditor, ModifierGroupEditor; extracted PriceInput
- `src/components/OnlineMenus/Display/components/MenuItemDisplay.tsx` — Added variant pricing ("from $X"), VariantModifierDisplay
- `src/components/OnlineMenus/Display/components/ItemPrice.tsx` — Added showFromPrefix prop for "from $X" display
- `src/components/OnlineMenus/PreviewMenuItemCard.tsx` — Added variant pricing in live preview

---

## Acceptance Criteria

1. A menu item can have zero or more VariantGroups, each containing one or more Variants with absolute prices
2. A menu item can have zero or more ModifierGroups, each containing one or more Modifiers with price adjustments
3. Existing menus without variants/modifiers continue to work unchanged (backward compatible)
4. The menu editor UI allows adding/editing/deleting variant groups and modifier groups
5. The public menu display shows variants as selectable options with prices
6. The public menu display shows modifiers as add-on options with price adjustments
7. Price display shows "from $X" when variants exist
8. All selection rule combinations work (required/optional, single/multi-select, min/max)
9. All linting, unit tests, and build checks pass
10. No database migration required (JSON-embedded approach)

---

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Large JSON payload for menus with many variants | Low | Low | JSONB compression; typical menus have <10 items with <3 variant groups each |
| Backward compatibility break | Low | High | Null-safe deserialization; new properties default to empty lists |
| Complex editor UI | Medium | Medium | Phased rollout; variant editor is a separate collapsible section |
| OpenAPI spec divergence after hook regen | Low | Medium | Test types after regeneration; maintain manual type extensions until stable |
