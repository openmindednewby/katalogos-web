# i18n Lint Enforcement: eslint-plugin-i18next

> **Rule**: `i18next/no-literal-string` — errors on hardcoded user-facing strings in JSX

## Status: COMPLETED (BaseClient) / COMPLETED (SyncfusionThemeStudio)

## Problem Statement

Hardcoded English strings slip through code review and bypass the i18n system (FM()/t()). This makes the app untranslatable and creates inconsistencies. Automated enforcement ensures all user-facing text uses the localization pipeline.

## Implementation

### What was done

1. **Installed** `eslint-plugin-i18next` as devDependency in both projects
2. **Configured** `i18next/no-literal-string` as `warn` in both ESLint configs
3. **Disabled** the rule in test file overrides (tests legitimately use hardcoded strings)
4. **Configured exclusions** to avoid false positives on technical attributes

### Configuration Rationale

- **`markupOnly: true`** — Only checks JSX content (not plain JS string assignments)
- **`ignoreAttribute`** — Technical props like `className`, `testID`, `data-testid`, `role`, SVG attributes, etc.
- **`ignoreCallee`** — Functions that take technical strings: `require()`, `Error()`, `console.*`, `cn()`, `navigate()`
- **`ignoreProperty`** — Object properties that are technical: `style`, `fontFamily`, `path`, `variant`, etc.
- **`ignore` patterns** — UPPER_SNAKE_CASE constants, hex colors, rgba/hsl colors, CSS variables, Syncfusion CSS classes (`e-*`), SVG path data (`M\d`)

### Projects affected

| Project | Config File | Warnings |
|---------|-------------|----------|
| SyncfusionThemeStudio | `eslint.config.mjs` | ~76 -> 0 (FIXED 2026-03-19) |
| BaseClient | `eslint.config.mjs` | ~49 |

## Migration Checklist

### SyncfusionThemeStudio — COMPLETED (2026-03-19)

Most of the original ~76 warnings had already been fixed by prior work. The remaining violations
were concentrated in `PillBadgeShowcase/index.tsx` (49 warnings from hardcoded status/semantic/trend/role labels).

**What was done:**
- Added 23 translation keys to `en.json` under `components.pillBadgeShowcase.*`
- Replaced all hardcoded JSX text in `PillBadgeShowcase/index.tsx` with `FM()` calls
- Extracted CopyableCodeSnippet `code` prop strings to module-level constants (fixed `react/jsx-curly-brace-presence` errors)
- Upgraded `i18next/no-literal-string` from `warn` to `error`
- Upgraded `react/jsx-no-literals` from `warn` to `error`

**Additional fixes (pre-existing issues):**
- Fixed `import/order` errors in `tradeHistoryData.test.ts`, `tradeHistoryData.ts`, `TradeHistoryTable.tsx`
- Fixed `enforce-function-style` warnings in `TradeHistoryTable.tsx`, `TradeHistoryKpis.tsx`, `IncidentsManagementPage/index.tsx`
- Fixed `max-lines` errors in `defaultComponentsDark.ts` and `defaultComponentsLight.ts`
- Fixed 3 pre-existing test failures in `StatCardNative.test.tsx` (selector `span.rounded-full` -> `span.whitespace-nowrap`)

- [x] All `i18next/no-literal-string` warnings fixed
- [x] All `react/jsx-no-literals` warnings fixed
- [x] Both rules upgraded from `warn` to `error`
- [x] Full lint: zero errors, zero warnings
- [x] Full test suite: 146 files, 1674 tests, all passing

### BaseClient (~49 warnings) — COMPLETED (2026-03-19)

All warnings were already resolved by prior work (FM() migration, `no-restricted-imports` enforcement).
Rule upgraded from `warn` to `error` in `eslint.config.mjs`. `react/jsx-no-literals` also upgraded to `error`.
Additionally fixed: nested ternary in `useSubscription.ts`, unused eslint-disable in `parseMenuFile.ts`.

- [x] All warnings fixed (zero `i18next/no-literal-string` violations)
- [x] `i18next/no-literal-string` upgraded to `error`
- [x] `react/jsx-no-literals` upgraded to `error`
- [x] All lint, unit tests, YAGNI, and prod build pass

### For each violation

1. Add the translation key to the appropriate `en.json` locale file
2. Replace the hardcoded string with `FM('key')` or `t('key')`
3. Re-run `npm run lint` to verify the warning disappears

## Upgrading to `error`

Once all warnings are fixed in a project:

1. Change `'warn'` to `'error'` in the eslint config for `i18next/no-literal-string`
2. Run `npm run lint` to confirm zero violations
3. New hardcoded strings will now fail CI

## Files Modified

| File | Change |
|------|--------|
| `SyncfusionThemeStudio/package.json` | Added eslint-plugin-i18next devDependency |
| `SyncfusionThemeStudio/eslint.config.mjs` | Added i18next plugin import + config block + test override |
| `BaseClient/package.json` | Added eslint-plugin-i18next devDependency |
| `BaseClient/eslint.config.mjs` | Added i18next plugin import + config block + test override; upgraded `i18next/no-literal-string` and `react/jsx-no-literals` from `warn` to `error` (2026-03-19) |
| `BaseClient/src/lib/subscription/hooks/useSubscription.ts` | Fixed nested ternary (extracted `fallbackTier` variable) |
| `BaseClient/src/components/OnlineMenus/MenuImport/utils/parseMenuFile.ts` | Removed unused eslint-disable directive |
| `CLAUDE.md` | Documented new ESLint rule |
| `SyncfusionThemeStudio/eslint.config.mjs` | Upgraded `i18next/no-literal-string` and `react/jsx-no-literals` from `warn` to `error` |
| `SyncfusionThemeStudio/src/localization/locales/en.json` | Added 23 translation keys for PillBadgeShowcase |
| `SyncfusionThemeStudio/src/features/components/pages/PillBadgeShowcase/index.tsx` | Replaced all hardcoded strings with `FM()` calls |
| `SyncfusionThemeStudio/src/components/ui/native/StatCardNative/StatCardNative.test.tsx` | Fixed pre-existing test selector (`span.rounded-full` -> `span.whitespace-nowrap`) |
| `SyncfusionThemeStudio/src/features/alerts-incidents/pages/IncidentsManagementPage/*` | Fixed import/order and enforce-function-style issues |
| `SyncfusionThemeStudio/src/stores/theme/defaults/defaultComponents{Dark,Light}.ts` | Condensed to stay within max-lines limit |

## Related: `no-restricted-imports` for `useTranslation` — COMPLETED (2026-03-15)

Separate from `i18next/no-literal-string`, the `no-restricted-imports` rule banning `useTranslation` from `react-i18next` was upgraded from `warn` to `error`. This required migrating ~104 files from `t()` to `FM()`, adding 177 translation keys to `en.json`, consolidating 22 local jest mocks to a global mock, and updating 7 unit test assertions. All 196 unit test suites and 3 previously-flaky E2E suites now pass.

## Success Criteria

- [x] `i18next/no-literal-string` rule active in both projects (as `warn`)
- [x] No false positives on technical attributes
- [x] True positives on hardcoded user-facing text
- [x] Rule disabled in test files
- [x] No new errors introduced (only warnings)
- [x] `no-restricted-imports` for `useTranslation` upgraded to `error` — DONE (2026-03-15)
- [x] All `i18next/no-literal-string` warnings fixed with FM() calls — BaseClient DONE (2026-03-19)
- [x] `i18next/no-literal-string` upgraded to `error` in BaseClient (2026-03-19)
- [x] All `i18next/no-literal-string` warnings fixed in SyncfusionThemeStudio (2026-03-19)
- [x] `i18next/no-literal-string` upgraded to `error` in SyncfusionThemeStudio (2026-03-19)
- [x] `react/jsx-no-literals` upgraded to `error` in SyncfusionThemeStudio (2026-03-19)
