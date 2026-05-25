/**
 * Tests for quizHelpers - Page navigation and ordering.
 */
import { getOrderedPages, findPageInDirection } from './quizHelpers';
import QuestionType from '../../../shared/enums/QuestionType';

import type { DynamicQuiz, Question as UiQuestion } from '../../../components/DynamicForm';

describe('quizHelpers - Page Navigation', () => {
  describe('getOrderedPages', () => {
    it('returns sorted unique pages', () => {
      const form: DynamicQuiz = {
        id: 'form1',
        name: 'Test',
        questions: [
          { id: 'q1', name: 'Q1', type: QuestionType.Text, page: 3, order: 1, isRequired: false },
          { id: 'q2', name: 'Q2', type: QuestionType.Text, page: 1, order: 2, isRequired: false },
          { id: 'q3', name: 'Q3', type: QuestionType.Text, page: 2, order: 3, isRequired: false },
          { id: 'q4', name: 'Q4', type: QuestionType.Text, page: 1, order: 4, isRequired: false },
        ],
      };
      expect(getOrderedPages(form)).toEqual([1, 2, 3]);
    });

    it('returns empty array for empty questions', () => {
      const form: DynamicQuiz = { id: 'form1', name: 'Test', questions: [] };
      expect(getOrderedPages(form)).toEqual([]);
    });
  });

  describe('findPageInDirection', () => {
    const createForm = (pages: number[]): DynamicQuiz => ({
      id: 'form1',
      name: 'Test',
      questions: pages.map((page, idx) => ({
        id: `q${idx}`,
        name: `Q${idx}`,
        type: QuestionType.Text,
        page,
        order: idx + 1,
        isRequired: false,
      })),
    });

    it('finds next page in forward direction', () => {
      const form = createForm([1, 2, 3]);
      expect(findPageInDirection(form, 1, 1)).toBe(2);
    });

    it('finds next page in backward direction', () => {
      const form = createForm([1, 2, 3]);
      expect(findPageInDirection(form, 3, -1)).toBe(2);
    });

    it('returns null when no next page forward', () => {
      const form = createForm([1, 2, 3]);
      expect(findPageInDirection(form, 3, 1)).toBe(null);
    });

    it('returns null when no previous page backward', () => {
      const form = createForm([1, 2, 3]);
      expect(findPageInDirection(form, 1, -1)).toBe(null);
    });

    it('skips pages with no visible questions', () => {
      const trigger: UiQuestion = {
        id: 'trigger',
        name: 'T',
        type: QuestionType.Text,
        page: 1,
        order: 1,
        isRequired: false,
        answer: 'skip',
      };
      const skipped: UiQuestion = {
        id: 'skipped',
        name: 'S',
        type: QuestionType.Text,
        page: 2,
        order: 2,
        isRequired: false,
        skipConditions: [{ questionId: 'trigger', questionAnswer: 'skip' }],
      };
      const visible: UiQuestion = {
        id: 'visible',
        name: 'V',
        type: QuestionType.Text,
        page: 3,
        order: 3,
        isRequired: false,
      };
      const form: DynamicQuiz = { id: 'form1', name: 'Test', questions: [trigger, skipped, visible] };
      expect(findPageInDirection(form, 1, 1)).toBe(3);
    });
  });
});
