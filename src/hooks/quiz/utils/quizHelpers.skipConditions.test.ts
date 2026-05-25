/**
 * Tests for quizHelpers - Skip conditions and page visibility.
 */
import { shouldSkipForForm, pageHasVisibleQuestion } from './quizHelpers';
import QuestionType from '../../../shared/enums/QuestionType';

import type { DynamicQuiz, Question as UiQuestion } from '../../../components/DynamicForm';

describe('quizHelpers - Skip Conditions', () => {
  const createQuestion = (overrides: Partial<UiQuestion> = {}): UiQuestion => ({
    id: 'q1',
    name: 'Question 1',
    type: QuestionType.Text,
    page: 1,
    order: 1,
    isRequired: false,
    ...overrides,
  });

  const createForm = (questions: UiQuestion[]): DynamicQuiz => ({
    id: 'form1',
    name: 'Test Form',
    questions,
  });

  describe('shouldSkipForForm', () => {
    it('returns false when no skip conditions', () => {
      const question = createQuestion({ skipConditions: [] });
      const form = createForm([question]);
      expect(shouldSkipForForm(form, question)).toBe(false);
    });

    it('returns false when skipConditions is undefined', () => {
      const question = createQuestion({ skipConditions: undefined });
      const form = createForm([question]);
      expect(shouldSkipForForm(form, question)).toBe(false);
    });

    it('returns false when trigger question not found', () => {
      const question = createQuestion({
        skipConditions: [{ questionId: 'nonexistent', questionAnswer: 'yes' }],
      });
      const form = createForm([question]);
      expect(shouldSkipForForm(form, question)).toBe(false);
    });

    it('returns false when trigger question has no answer', () => {
      const triggerQuestion = createQuestion({ id: 'trigger', answer: undefined });
      const question = createQuestion({
        id: 'dependent',
        skipConditions: [{ questionId: 'trigger', questionAnswer: 'yes' }],
      });
      const form = createForm([triggerQuestion, question]);
      expect(shouldSkipForForm(form, question)).toBe(false);
    });

    it('returns true when trigger answer matches condition (string)', () => {
      const triggerQuestion = createQuestion({ id: 'trigger', answer: 'yes' });
      const question = createQuestion({
        id: 'dependent',
        skipConditions: [{ questionId: 'trigger', questionAnswer: 'yes' }],
      });
      const form = createForm([triggerQuestion, question]);
      expect(shouldSkipForForm(form, question)).toBe(true);
    });

    it('returns false when trigger answer does not match condition', () => {
      const triggerQuestion = createQuestion({ id: 'trigger', answer: 'no' });
      const question = createQuestion({
        id: 'dependent',
        skipConditions: [{ questionId: 'trigger', questionAnswer: 'yes' }],
      });
      const form = createForm([triggerQuestion, question]);
      expect(shouldSkipForForm(form, question)).toBe(false);
    });

    it('returns true when trigger answer matches condition (array)', () => {
      const triggerQuestion = createQuestion({ id: 'trigger', answer: ['a', 'yes', 'b'] });
      const question = createQuestion({
        id: 'dependent',
        skipConditions: [{ questionId: 'trigger', questionAnswer: 'yes' }],
      });
      const form = createForm([triggerQuestion, question]);
      expect(shouldSkipForForm(form, question)).toBe(true);
    });

    it('returns false when array answer does not contain condition value', () => {
      const triggerQuestion = createQuestion({ id: 'trigger', answer: ['a', 'b', 'c'] });
      const question = createQuestion({
        id: 'dependent',
        skipConditions: [{ questionId: 'trigger', questionAnswer: 'yes' }],
      });
      const form = createForm([triggerQuestion, question]);
      expect(shouldSkipForForm(form, question)).toBe(false);
    });
  });

  describe('pageHasVisibleQuestion', () => {
    it('returns true when page has a question with no skip conditions', () => {
      const form: DynamicQuiz = {
        id: 'form1',
        name: 'Test',
        questions: [createQuestion({ page: 1 })],
      };
      expect(pageHasVisibleQuestion(form, 1)).toBe(true);
    });

    it('returns false when page has no questions', () => {
      const form: DynamicQuiz = {
        id: 'form1',
        name: 'Test',
        questions: [createQuestion({ page: 2 })],
      };
      expect(pageHasVisibleQuestion(form, 1)).toBe(false);
    });

    it('returns false when all questions on page are skipped', () => {
      const trigger = createQuestion({ id: 'trigger', page: 1, answer: 'skip' });
      const skipped = createQuestion({
        id: 'skipped',
        page: 2,
        skipConditions: [{ questionId: 'trigger', questionAnswer: 'skip' }],
      });
      const form: DynamicQuiz = {
        id: 'form1',
        name: 'Test',
        questions: [trigger, skipped],
      };
      expect(pageHasVisibleQuestion(form, 2)).toBe(false);
    });
  });
});
