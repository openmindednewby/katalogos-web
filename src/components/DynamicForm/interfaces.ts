import type QuestionType from '../../shared/enums/QuestionType';

export interface DynamicQuiz {
  id: string;
  name: string;
  description?: string;
  questions: Question[];
}

export interface Question {
  id: string;
  name: string;
  type: QuestionType;
  options?: Option[];
  page: number;
  answer?: Answer;
  isRequired?: boolean;
  skipConditions?: SkipCondition[];
  order: number;
}

export { default as QuestionType } from '../../shared/enums/QuestionType';
export type Answer = boolean | string | number | Array<string | number>;

export interface Option {
  value: string | number;
  label: string;
}

export interface SkipCondition {
  questionId: string;
  questionAnswer: boolean | string | number;
}
