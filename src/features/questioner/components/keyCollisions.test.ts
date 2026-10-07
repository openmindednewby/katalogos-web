
describe('OptionEditor/SkipConditions - key generation (BUG-QUIZ-012)', () => {
  function optionKey(index: number, value: string | null, label: string | null): string {
    return `${index}-${value ?? ''}|${label ?? ''}`;
  }

  function skipConditionKey(index: number, questionId: string | null, questionAnswer: string | null): string {
    return `${index}-${questionId ?? ''}|${questionAnswer ?? ''}`;
  }

  it('produces unique keys for blank option entries at different indexes', () => {
    const key0 = optionKey(0, '', '');
    const key1 = optionKey(1, '', '');
    expect(key0).not.toBe(key1);
  });

  it('produces unique keys when values match but index differs', () => {
    const key0 = optionKey(0, 'a', 'Label');
    const key1 = optionKey(1, 'a', 'Label');
    expect(key0).not.toBe(key1);
  });

  it('produces the same key for same index, value, and label', () => {
    const key1 = optionKey(2, 'val', 'lab');
    const key2 = optionKey(2, 'val', 'lab');
    expect(key1).toBe(key2);
  });

  it('produces unique keys for blank skip conditions at different indexes', () => {
    const key0 = skipConditionKey(0, '', '');
    const key1 = skipConditionKey(1, '', '');
    expect(key0).not.toBe(key1);
  });

  it('handles null values gracefully', () => {
    const key = optionKey(0, null, null);
    expect(key).toBe('0-|');
  });
});
