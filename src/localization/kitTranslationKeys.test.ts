/**
 * The guard for the shared kit's half of `en.json`.
 *
 * The kit's `t(...)` call sites live in `node_modules`, so nothing in this repo references them
 * and a missing key produces no type error, no lint error, and no runtime throw — just the
 * literal key string rendered at the user. This suite is the only thing standing between a kit
 * upgrade and raw `uiTables.pager.rowsTriggerLabel` text on the menus list pager.
 */
import { KIT_REQUIRED_TRANSLATION_KEYS } from './kitTranslationKeys';
import en from './locales/en.json';

/** Walks a dotted i18n path, mirroring how i18next resolves a key against the bundle. */
const resolveKey = (key: string): unknown =>
  key.split('.').reduce<unknown>((node, segment) => {
    if (node === null || typeof node !== 'object') return undefined;
    return (node as Record<string, unknown>)[segment];
  }, en);

describe('kit-required translation keys', () => {
  it('lists a non-empty contract, so a broken import cannot vacuously pass', () => {
    expect(KIT_REQUIRED_TRANSLATION_KEYS.length).toBeGreaterThan(0);
  });

  it.each(KIT_REQUIRED_TRANSLATION_KEYS)('en.json defines "%s"', (key) => {
    const value = resolveKey(key);

    // A non-empty string is the only resolution that renders. An object means the key points at
    // a namespace (i18next would return the key itself), and undefined or '' both surface the
    // raw key to the user.
    expect(typeof value).toBe('string');
    expect(value).not.toBe('');
  });

  it('reports every missing key at once rather than failing on the first', () => {
    const missing = KIT_REQUIRED_TRANSLATION_KEYS.filter(
      (key) => typeof resolveKey(key) !== 'string'
    );

    expect(missing).toEqual([]);
  });

  it('resolves the keys the mounted kit components actually call', () => {
    // Regression pins for UX-7f: Katalogos mounts `Pager`, whose `PagerNav` calls both of these
    // ui-tables@1.12.0 keys. These two specifically do NOT render their raw dotted name when
    // missing — ui-tables routes accessible names through an internal `accessibleName()` guard
    // that falls back to the value being replaced (the bare page size). So the failure mode here
    // is silent and sighted-invisible: the rows control keeps announcing just "50" to a screen
    // reader. That is precisely why it needs a test rather than review.
    expect(resolveKey('uiTables.pager.rowsTriggerLabel')).toBe(
      'Rows per page, currently {{p1}}'
    );
    expect(resolveKey('uiTables.pager.rowsOptionLabel')).toBe('Show {{p1}} rows per page');
  });

  it('supplies {{p1}} for the kit keys that interpolate a count', () => {
    const interpolated = [
      'uiTables.select.pageSelected',
      'uiTables.select.allMatching',
      'uiTables.select.matchingSelected',
      'uiTables.pager.rowsTriggerLabel',
      'uiTables.pager.rowsOptionLabel',
      'analytics.statHint',
    ];

    interpolated.forEach((key) => {
      expect(resolveKey(key)).toContain('{{p1}}');
    });
  });

  it('supplies both params for the kit keys that interpolate a label and a value', () => {
    // `uiTables.filters.selectTriggerLabel` is "Status: Active" — dropping {{p2}} would silently
    // hide the current selection from a screen reader, the exact defect ui-tables@1.12.0 fixed.
    ['uiTables.filters.selectTriggerLabel', 'analytics.statCardLabel'].forEach((key) => {
      const value = resolveKey(key);
      expect(value).toContain('{{p1}}');
      expect(value).toContain('{{p2}}');
    });
  });

  it('uses this app\'s i18next {{pN}} interpolation, never the positional {N} spelling', () => {
    // Katalogos resolves kit strings through `FM()` -> i18next, which binds NAMED options p1/p2/p3.
    // Sibling portals on `@dloizides/i18n` interpolate POSITIONALLY ({0}/{1}) instead. Copying a
    // key across from one of those would render the literal characters "{0}" to a real user, so
    // pin the spelling rather than trusting review to catch it.
    const positional = KIT_REQUIRED_TRANSLATION_KEYS.filter((key) =>
      /\{\d+\}/.test(String(resolveKey(key)))
    );

    expect(positional).toEqual([]);
  });
});
