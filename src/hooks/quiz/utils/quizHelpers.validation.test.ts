/**
 * Tests for quizHelpers - Answer validation and page completion.
 */
import { isRequiredAnswerMissing, isPageComplete } from './quizHelpers';
import QuestionType from '../../../shared/enums/QuestionType';

import type { DynamicQuiz, Question as UiQuestion } from '../../../components/DynamicForm';

describe('quizHelpers - Validation', () => {
  describe('isRequiredAnswerMissing', () => {
    it('returns true for undefined', () => {
      expect(isRequiredAnswerMissing(undefined)).toBe(true);
    });

    it('returns true for empty string', () => {
      expect(isRequiredAnswerMissing('')).toBe(true);
    });

    it('returns true for empty array', () => {
      expect(isRequiredAnswerMissing([])).toBe(true);
    });

    it('returns false for non-empty string', () => {
      expect(isRequiredAnswerMissing('answer')).toBe(false);
    });

    it('returns false for non-empty array', () => {
      expect(isRequiredAnswerMissing(['a'])).toBe(false);
    });

    it('returns false for boolean', () => {
      expect(isRequiredAnswerMissing(false)).toBe(false);
      expect(isRequiredAnswerMissing(true)).toBe(false);
    });

    it('returns false for number', () => {
      expect(isRequiredAnswerMissing(0)).toBe(false);
      expect(isRequiredAnswerMissing(42)).toBe(false);
    });
  });

  describe('isPageComplete', () => {
    const createQuestion = (overrides: Partial<UiQuestion> = {}): UiQuestion => ({
      id: 'q1',
      name: 'Question',
      type: QuestionType.Text,
      page: 1,
      order: 1,
      isRequired: true,
      ...overrides,
    });

    it('returns true when all required questions are answered', () => {
      const form: DynamicQuiz = {
        id: 'form1',
        name: 'Test',
        questions: [
          createQuestion({ id: 'q1', answer: 'answer1' }),
          createQuestion({ id: 'q2', answer: 'answer2' }),
        ],
      };
      expect(isPageComplete(form, 1)).toBe(true);
    });

    it('returns false when a required question is missing answer', () => {
      const form: DynamicQuiz = {
        id: 'form1',
        name: 'Test',
        questions: [
          createQuestion({ id: 'q1', answer: 'answer1' }),
          createQuestion({ id: 'q2', answer: undefined }),
        ],
      };
      expect(isPageComplete(form, 1)).toBe(false);
    });

    it('returns true when non-required question is missing answer', () => {
      const form: DynamicQuiz = {
        id: 'form1',
        name: 'Test',
        questions: [
          createQuestion({ id: 'q1', answer: 'answer1', isRequired: true }),
          createQuestion({ id: 'q2', answer: undefined, isRequired: false }),
        ],
      };
      expect(isPageComplete(form, 1)).toBe(true);
    });

    it('ignores skipped questions', () => {
      const trigger = createQuestion({ id: 'trigger', page: 1, answer: 'skip', isRequired: false });
      const skipped = createQuestion({
        id: 'skipped',
        page: 1,
        answer: undefined,
        isRequired: true,
        skipConditions: [{ questionId: 'trigger', questionAnswer: 'skip' }],
      });
      const form: DynamicQuiz = { id: 'form1', name: 'Test', questions: [trigger, skipped] };
      expect(isPageComplete(form, 1)).toBe(true);
    });
  });
});
