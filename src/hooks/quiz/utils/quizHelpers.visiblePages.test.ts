/**
 * BUG-QUIZ-018: Tests that totalPages counts only pages with at least one
 * non-skipped (visible) question.
 */
import { pageHasVisibleQuestion } from './quizHelpers';
import QuestionType from '../../../shared/enums/QuestionType';

import type { DynamicQuiz, Question as UiQuestion } from '../../../components/DynamicForm';

describe('quizHelpers - visible pages count (BUG-QUIZ-018)', () => {
  function createQuestion(overrides: Partial<UiQuestion> = {}): UiQuestion {
    return {
      id: 'q1',
      name: 'Question',
      type: QuestionType.Text,
      page: 1,
      order: 1,
      isRequired: false,
      ...overrides,
    };
  }

  /**
   * Mirrors the fixed totalPages computation from useQuizFormState.
   */
  function computeVisiblePageCount(form: DynamicQuiz): number {
    const allPages = [...new Set(form.questions.map((q) => q.page))];
    return allPages.filter((page) => pageHasVisibleQuestion(form, page)).length;
  }

  it('counts all pages when no questions are skipped', () => {
    const form: DynamicQuiz = {
      id: 'f1',
      name: 'Test',
      questions: [
        createQuestion({ id: 'q1', page: 1 }),
        createQuestion({ id: 'q2', page: 2 }),
        createQuestion({ id: 'q3', page: 3 }),
      ],
    };
    expect(computeVisiblePageCount(form)).toBe(3);
  });

  it('excludes pages where all questions are skipped', () => {
    const trigger = createQuestion({ id: 'trigger', page: 1, answer: 'skip' });
    const skipped = createQuestion({
      id: 'skipped',
      page: 2,
      skipConditions: [{ questionId: 'trigger', questionAnswer: 'skip' }],
    });

    const form: DynamicQuiz = {
      id: 'f1',
      name: 'Test',
      questions: [trigger, skipped],
    };

    expect(computeVisiblePageCount(form)).toBe(1);
  });

  it('includes pages that have at least one visible question alongside skipped ones', () => {
    const trigger = createQuestion({ id: 'trigger', page: 1, answer: 'skip' });
    const skippedOnPage2 = createQuestion({
      id: 'skipped',
      page: 2,
      skipConditions: [{ questionId: 'trigger', questionAnswer: 'skip' }],
    });
    const visibleOnPage2 = createQuestion({ id: 'visible', page: 2 });

    const form: DynamicQuiz = {
      id: 'f1',
      name: 'Test',
      questions: [trigger, skippedOnPage2, visibleOnPage2],
    };

    expect(computeVisiblePageCount(form)).toBe(2);
  });

  it('returns 0 for empty questions', () => {
    const form: DynamicQuiz = { id: 'f1', name: 'Test', questions: [] };
    expect(computeVisiblePageCount(form)).toBe(0);
  });

  it('old computation counts skipped pages (demonstrates the bug)', () => {
    const trigger = createQuestion({ id: 'trigger', page: 1, answer: 'skip' });
    const skipped = createQuestion({
      id: 'skipped',
      page: 2,
      skipConditions: [{ questionId: 'trigger', questionAnswer: 'skip' }],
    });
    const form: DynamicQuiz = { id: 'f1', name: 'Test', questions: [trigger, skipped] };

    const oldCount = [...new Set(form.questions.map((q) => q.page))].length;
    const newCount = computeVisiblePageCount(form);

    expect(oldCount).toBe(2); // old: counts both pages
    expect(newCount).toBe(1); // new: only counts visible page
  });
});
