/**
 * Re-export of the shared `Field` from @dloizides/ui-forms (added in ui-forms@1.5.0, adopted
 * here in UX-7f).
 *
 * `FormField` is hard-wired to a text input, so a NON-text control (a dropdown, a chip selector,
 * a date picker) had no shared way to get a label and ended up misaligned next to its
 * `FormField` siblings — the control's box started ~21px higher (no label row) and it missed
 * `FormField`'s `marginBottom: 16`. `Field` supplies the same label row / required mark / error
 * line / spacing for any control.
 *
 * Theme is supplied app-wide via FeedbackUiAdapter (@dloizides/ui-feedback context).
 */
export { Field } from '@dloizides/ui-forms';
