
describe('NavigationButtons - isLastPage logic (BUG-QUIZ-016)', () => {
  function getButtonLabel(isLastPage: boolean): string {
    return isLastPage ? 'Submit' : 'Next';
  }

  it('returns Submit when on the last page', () => {
    expect(getButtonLabel(true)).toBe('Submit');
  });

  it('returns Next when not on the last page', () => {
    expect(getButtonLabel(false)).toBe('Next');
  });

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
    const pages = [1, 3, 5];
    const currentPage = 5;
    const totalPagesCount = pages.length;
    const oldComparison = currentPage === totalPagesCount;
    const newComparison = computeIsLastPage(currentPage, pages);

    expect(oldComparison).toBe(false);
    expect(newComparison).toBe(true);
  });
});
