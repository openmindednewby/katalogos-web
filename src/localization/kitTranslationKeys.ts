import { LAYOUT_I18N } from '@dloizides/ui-layout';
import { FILTERS_I18N, TABLE_I18N } from '@dloizides/ui-tables';

const UI_LAYOUT_KEYS: readonly string[] = Object.values(LAYOUT_I18N);

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

const UI_TABLES_KEYS: readonly string[] = [
  ...Object.values(TABLE_I18N),
  ...Object.values(FILTERS_I18N),
];

/** The full contract, de-duplicated (the packages share the `common.*` namespace). */
export const KIT_REQUIRED_TRANSLATION_KEYS: readonly string[] = [
  ...new Set([...UI_LAYOUT_KEYS, ...UI_FEEDBACK_KEYS, ...UI_TABLES_KEYS]),
];
