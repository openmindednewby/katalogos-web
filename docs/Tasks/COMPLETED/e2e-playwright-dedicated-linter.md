# E2E Playwright Dedicated Linter

## Status: COMPLETED

## Problem Statement
E2ETests had zero ESLint setup — no config, no dependencies, no lint scripts. Investigation found 100+ violations of E2E code standards across 45 test files. Key anti-patterns causing slow tests: hardcoded waits, `networkidle`, console.log debris, oversized files.

## Implementation Plan
1. Create 10 custom ESLint plugin rules in `E2ETests/eslint-plugins/`
2. Create ESLint 9 flat config at `E2ETests/eslint.config.mjs`
3. Add ESLint dependencies and lint scripts to `E2ETests/package.json`
4. Add `e2e-lint` and `e2e-lint-fix` Tilt resources
5. Gate all 6 playwright resources behind `e2e-lint`

## Files Created
- `E2ETests/eslint-plugins/no-wait-for-timeout.mjs` — Bans `waitForTimeout()` (error)
- `E2ETests/eslint-plugins/no-set-timeout-in-promise.mjs` — Bans `new Promise(r => setTimeout(r, N))` (error)
- `E2ETests/eslint-plugins/no-networkidle.mjs` — Bans `'networkidle'` string (error)
- `E2ETests/eslint-plugins/no-console-in-tests.mjs` — Bans `console.*` in tests (error)
- `E2ETests/eslint-plugins/no-locator-or-chain.mjs` — Bans `.or()` on locator chains (error)
- `E2ETests/eslint-plugins/no-page-reload.mjs` — Warns on `page.reload()` (warn)
- `E2ETests/eslint-plugins/max-file-lines.mjs` — Warns on files > 300 lines (warn)
- `E2ETests/eslint-plugins/no-fragile-selectors.mjs` — Bans XPath and `.nth(N)` (error)
- `E2ETests/eslint-plugins/no-wait-until-slow.mjs` — Bans `waitUntil: 'load'/'networkidle'` (error)
- `E2ETests/eslint-plugins/no-redundant-visibility.mjs` — Warns on `if (isVisible) toBeVisible` (warn)
- `E2ETests/eslint.config.mjs` — ESLint 9 flat config with all 10 plugins

## Files Modified
- `E2ETests/package.json` — Added eslint deps and lint/lint:fix scripts
- `Tiltfile` — Added e2e-lint/e2e-lint-fix resources, updated 6 playwright resource_deps
- `OnlineMenuSaaS/TIltfileBackup/Tiltfile` — Same changes as main Tiltfile

## Test Results
- `npm run lint` executes successfully, reports 261 problems (224 errors, 37 warnings)
- All 10 custom rules fire on known violations
- Console rule correctly OFF for fixtures/helpers/teardown

## Success Criteria
- [x] All 10 ESLint rules created and working
- [x] ESLint config properly set up with TypeScript parser
- [x] `npm run lint` and `npm run lint:fix` scripts work
- [x] Tilt resources added and playwright resources gated behind lint
- [x] Both Tiltfiles updated identically
