import { KIT_REQUIRED_TRANSLATION_KEYS } from './kitTranslationKeys';
import en from './locales/en.json';

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
    ['uiTables.filters.selectTriggerLabel', 'analytics.statCardLabel'].forEach((key) => {
      const value = resolveKey(key);
      expect(value).toContain('{{p1}}');
      expect(value).toContain('{{p2}}');
    });
  });

  it('uses this app\'s i18next {{pN}} interpolation, never the positional {N} spelling', () => {
    const positional = KIT_REQUIRED_TRANSLATION_KEYS.filter((key) =>
      /\{\d+\}/.test(String(resolveKey(key)))
    );

    expect(positional).toEqual([]);
  });
});
