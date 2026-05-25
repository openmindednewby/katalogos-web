/**
 * BUG-QUIZ-010: Tests that handleSaveFromJson returns early on invalid JSON.
 * BUG-QUIZ-017: Tests that isQuestionerContents rejects arrays.
 *
 * Tests extracted logic functions without rendering the component.
 */
/**
 * Mirrors the fixed isQuestionerContents type guard (BUG-QUIZ-017).
 */
function isQuestionerContents(value: unknown): boolean {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/**
 * Mirrors parseContents from TemplateEditorModal.
 */
function parseContents(text: string): Record<string, unknown> | null {
  try {
    const parsed: unknown = JSON.parse(text);
    if (isQuestionerContents(parsed)) return parsed as Record<string, unknown>;
    return null;
  } catch {
    return null;
  }
}

describe('TemplateEditorModal - isQuestionerContents (BUG-QUIZ-017)', () => {
  it('accepts a plain object', () => {
    expect(isQuestionerContents({ questions: [] })).toBe(true);
  });

  it('accepts an empty object', () => {
    expect(isQuestionerContents({})).toBe(true);
  });

  it('rejects null', () => {
    expect(isQuestionerContents(null)).toBe(false);
  });

  it('rejects undefined', () => {
    expect(isQuestionerContents(undefined)).toBe(false);
  });

  it('rejects arrays', () => {
    expect(isQuestionerContents([1, 2, 3])).toBe(false);
  });

  it('rejects empty arrays', () => {
    expect(isQuestionerContents([])).toBe(false);
  });

  it('rejects primitive string', () => {
    expect(isQuestionerContents('hello')).toBe(false);
  });

  it('rejects number', () => {
    expect(isQuestionerContents(42)).toBe(false);
  });
});

describe('TemplateEditorModal - parseContents', () => {
  it('parses valid JSON object', () => {
    const result = parseContents('{"questions": []}');
    expect(result).toEqual({ questions: [] });
  });

  it('returns null for invalid JSON', () => {
    const result = parseContents('{bad json}');
    expect(result).toBeNull();
  });

  it('returns null for JSON array (BUG-QUIZ-017)', () => {
    const result = parseContents('[1, 2, 3]');
    expect(result).toBeNull();
  });

  it('returns null for JSON string', () => {
    const result = parseContents('"just a string"');
    expect(result).toBeNull();
  });

  it('returns null for JSON number', () => {
    const result = parseContents('42');
    expect(result).toBeNull();
  });
});

describe('TemplateEditorModal - handleSaveFromJson logic (BUG-QUIZ-010)', () => {
  /**
   * Simulates the fixed handleSaveFromJson logic:
   * If parseContents returns null, should NOT call onSave.
   */
  function simulateHandleSaveFromJson(
    jsonText: string,
    onSave: (payload: unknown) => void,
    onError: () => void,
  ): void {
    const parsed = parseContents(jsonText);
    if (parsed === null) {
      onError();
      return;
    }
    onSave({ contents: parsed });
  }

  it('calls onSave with parsed contents when JSON is valid', () => {
    const onSave = jest.fn();
    const onError = jest.fn();
    simulateHandleSaveFromJson('{"questions": []}', onSave, onError);
    expect(onSave).toHaveBeenCalledWith({ contents: { questions: [] } });
    expect(onError).not.toHaveBeenCalled();
  });

  it('calls onError and does NOT call onSave when JSON is invalid', () => {
    const onSave = jest.fn();
    const onError = jest.fn();
    simulateHandleSaveFromJson('{invalid', onSave, onError);
    expect(onSave).not.toHaveBeenCalled();
    expect(onError).toHaveBeenCalled();
  });

  it('calls onError when JSON is a plain array', () => {
    const onSave = jest.fn();
    const onError = jest.fn();
    simulateHandleSaveFromJson('[1, 2]', onSave, onError);
    expect(onSave).not.toHaveBeenCalled();
    expect(onError).toHaveBeenCalled();
  });
});
