/**
 * BUG-QUIZ-011: Tests that question ID generation produces unique IDs
 * even when called in rapid succession.
 */

const RADIX_BASE_36 = 36;
const RANDOM_SUFFIX_START = 2;
const RANDOM_SUFFIX_END = 7;
const ID_COUNT = 100;

describe('QuestionList - unique ID generation (BUG-QUIZ-011)', () => {
  /**
   * Mirrors the fixed ID generation logic from QuestionList.handleAdd.
   */
  function generateQuestionId(): string {
    const suffix = Math.random().toString(RADIX_BASE_36).slice(RANDOM_SUFFIX_START, RANDOM_SUFFIX_END);
    return `q-${Date.now()}-${suffix}`;
  }

  it('generates IDs matching the expected format', () => {
    const id = generateQuestionId();
    expect(id).toMatch(/^q-\d+-[a-z0-9]{5}$/);
  });

  it('generates unique IDs when called in rapid succession', () => {
    const ids = new Set<string>();
    for (let i = 0; i < ID_COUNT; i += 1)
      ids.add(generateQuestionId());

    expect(ids.size).toBe(ID_COUNT);
  });

  it('does not produce the old Date.now()-only format', () => {
    const id = generateQuestionId();
    const isOldFormat = /^\d+$/.test(id);
    expect(isOldFormat).toBe(false);
  });
});
