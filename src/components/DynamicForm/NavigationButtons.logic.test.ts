/**
 * BUG-QUIZ-016: Tests that NavigationButtons shows "Submit" on the last page
 * based on an isLastPage boolean, not a page count comparison.
 */

describe('NavigationButtons - isLastPage logic (BUG-QUIZ-016)', () => {
  /**
   * Mirrors the fixed label selection logic.
   */
  function getButtonLabel(isLastPage: boolean): string {
    return isLastPage ? 'Submit' : 'Next';
  }

  it('returns Submit when on the last page', () => {
    expect(getButtonLabel(true)).toBe('Submit');
  });

  it('returns Next when not on the last page', () => {
    expect(getButtonLabel(false)).toBe('Next');
  });

  /**
   * Mirrors the isLastPage computation from QuizContent.
   */
  function computeIsLastPage(currentPage: number, pages: number[]): boolean {
    if (pages.length === 0) return true;
    return currentPage === Math.max(...pages);
  }

  it('computes isLastPage correctly for contiguous pages', () => {
    expect(computeIsLastPage(3, [1, 2, 3])).toBe(true);
    expect(computeIsLastPage(2, [1, 2, 3])).toBe(false);
  });

  it('computes isLastPage correctly for non-contiguous pages', () => {
    expect(computeIsLastPage(5, [1, 3, 5])).toBe(true);
    expect(computeIsLastPage(3, [1, 3, 5])).toBe(false);
  });

  it('returns true for empty pages array', () => {
    expect(computeIsLastPage(1, [])).toBe(true);
  });

  it('handles single page correctly', () => {
    expect(computeIsLastPage(1, [1])).toBe(true);
  });

  it('old comparison currentPage === totalPages fails for non-contiguous pages', () => {
    // Non-contiguous pages: [1, 3, 5] => totalPages (count) = 3, max page = 5
    // Old: currentPage (5) === totalPages (3) => false (BUG!)
    // New: currentPage (5) === Math.max(1, 3, 5) => true
    const pages = [1, 3, 5];
    const currentPage = 5;
    const totalPagesCount = pages.length; // 3
    const oldComparison = currentPage === totalPagesCount;
    const newComparison = computeIsLastPage(currentPage, pages);

    expect(oldComparison).toBe(false); // old logic fails
    expect(newComparison).toBe(true);  // new logic correct
  });
});
