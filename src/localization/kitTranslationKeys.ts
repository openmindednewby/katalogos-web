/**
 * Every translation key the shared `@dloizides/ui-*` kit asks the HOST app to provide.
 *
 * ── Why this file exists ──────────────────────────────────────────────────────
 * The app wires the kit's `UiProvider` with this app's `FM()`, so every kit component resolves
 * its strings through THIS app's `en.json`. `FM()` has no fallback by design — a missing key
 * renders the literal key string to the user (e.g. the menus list pager announcing
 * `uiTables.pager.rowsTriggerLabel` to a screen reader). The kit's keys are invisible to a
 * normal "grep the app for FM(" audit because the call sites live in `node_modules`, so they
 * silently rot every time the kit adds a string.
 *
 * `kitTranslationKeys.test.ts` asserts every key below resolves in `en.json`, so a kit upgrade
 * that introduces a new string FAILS the test suite instead of shipping raw key text.
 *
 * ── Provenance ────────────────────────────────────────────────────────────────
 * ui-tables (@1.12.0) publishes its key maps as real exports, so those are imported LIVE below
 * rather than copied — they cannot drift. As of 1.12.0 that includes `analytics.statCardLabel`
 * / `analytics.statHint`, previously inlined in StatCard and therefore invisible to this guard.
 *
 * The rest are extracted by grepping the published bundles. Re-run after any kit bump:
 *
 *   grep -ohE "\bt\((['\"])[A-Za-z0-9_.]+\1" \
 *     node_modules/@dloizides/<pkg>/dist/index.js | sort -u
 *
 * Last audited 2026-07-18 against: ui-layout@1.10.0, ui-feedback@1.4.0, ui-forms@1.6.0,
 * ui-nav@1.9.0, ui-buttons@1.3.0, ui-primitives@1.0.1, ui-tables@1.12.0.
 *
 * ui-forms, ui-nav, ui-buttons and ui-primitives contain ZERO `t(...)` calls — every label they
 * render is passed in by the caller — so they contribute no keys and need no entry here.
 */
import { LAYOUT_I18N } from '@dloizides/ui-layout';
import { FILTERS_I18N, TABLE_I18N } from '@dloizides/ui-tables';

/**
 * `@dloizides/ui-layout` — Katalogos mounts StatusBadge, ModalDropdown, ModalShell, Section,
 * Heading and UpgradePrompt.
 *
 * As of ui-layout@1.11.0 the package exports `LAYOUT_I18N`, a manifest of every key it looks up,
 * and has ZERO remaining raw key literals — so this half binds LIVE like the ui-tables half
 * instead of being hand-maintained. That matters: a hand-copied list is precisely what rotted
 * across this fleet (agora shipped 23 missing keys straight to users; aml-v2 mounted `Accordion`
 * with `common.accordionToggleHint` undefined, announcing the raw key to screen readers).
 *
 * ⚠️ Two entries in that manifest are worth knowing about when you read `en.json`:
 * `quizTemplates.cancel` is NOT a Katalogos concept — `ModalShell` hardcodes it as its close
 * button's accessible label, a key that leaked out of Erevna's quiz-template screens when the
 * component was extracted into the shared kit. And `common.accordionToggleHint` backs
 * `Accordion`, which Katalogos does not mount today; the copy is defined ahead of use so that
 * importing the component is a one-line change rather than a silent i18n regression.
 */
const UI_LAYOUT_KEYS: readonly string[] = Object.values(LAYOUT_I18N);

/**
 * `@dloizides/ui-feedback` — ErrorState, ConfirmDialog, LoadingFallback, PageSkeleton.
 *
 * `ConfirmDialog`'s `confirmLabel`/`cancelLabel` and `EmptyListState`'s `messageKey` are
 * caller-supplied, so they are the app's own keys and are deliberately absent here.
 */
const UI_FEEDBACK_KEYS: readonly string[] = [
  'common.retry',
  'common.retryHint',
  'common.confirm',
  'common.confirmHint',
  'common.cancel',
  'common.cancelHint',
  'loadingFallback.label',
  'loadingFallback.hint',
  'pageSkeleton.loadingLabel',
  'pageSkeleton.loadingHint',
];

/**
 * `@dloizides/ui-tables` — every key comes from the package's own exported maps, so this list
 * widens automatically on a kit bump (which is exactly how ui-tables@1.12.0's three new
 * accessible-name keys were caught).
 */
const UI_TABLES_KEYS: readonly string[] = [
  ...Object.values(TABLE_I18N),
  ...Object.values(FILTERS_I18N),
];

/** The full contract, de-duplicated (the packages share the `common.*` namespace). */
export const KIT_REQUIRED_TRANSLATION_KEYS: readonly string[] = [
  ...new Set([...UI_LAYOUT_KEYS, ...UI_FEEDBACK_KEYS, ...UI_TABLES_KEYS]),
];
