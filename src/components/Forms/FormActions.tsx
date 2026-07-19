/**
 * Re-export of the shared `FormActions` from @dloizides/ui-forms (added in ui-forms@1.9.0,
 * adopted here in Campaign F4).
 *
 * The previous app-local copy was BYTE-IDENTICAL to erevna-web's; both are now retired in favour
 * of the shared row. Two behavioural notes for callers:
 *
 *  1. Labels and accessibility hints arrive as PRE-LOCALIZED props. The local copy resolved them
 *     internally via `FM('common.save')` / `FM('common.cancel')` / `FM('common.saveHint')` /
 *     `FM('common.discardHint')`; the shared component cannot, because the seven portals do not
 *     share one localization runtime. Call sites pass them explicitly.
 *  2. The buttons come from `@dloizides/ui-buttons` — the same implementation the app-local
 *     `core/Button` adapter already wrapped, so the rendered result is unchanged.
 *
 * `testID`s still default to `save-button` / `cancel-button`, so Playwright selectors keep matching.
 * Theme is supplied app-wide via FeedbackUiAdapter (@dloizides/ui-feedback context).
 */
export { FormActions } from '@dloizides/ui-forms';
