import React from 'react';

import { Text, View } from 'react-native';

import { CheckboxQuestion } from './components/CheckboxQuestion';
import { DropdownQuestion } from './components/DropdownQuestion';
import { RadioQuestion } from './components/RadioQuestion';
import { RequiredMark } from './components/RequiredMark';
import { TextQuestion } from './components/TextQuestion';
import QuestionType from '../../../shared/enums/QuestionType';
import { isValueDefined } from '../../../utils/is';


import type { FormStyles } from '../../../theme/utils/styles';
import type { Answer, Question } from '../interfaces';

interface Props {
  question: Question;
  value: Answer;
  errorMsg?: string;
  updateAnswer: (questionId: string, value: Answer) => void;
  shouldSkip: (q: Question) => boolean;
  styles: FormStyles;
}

const QuestionRenderer: React.FC<Props> = ({ question, value, errorMsg, updateAnswer, shouldSkip, styles }) => {
  if (shouldSkip(question)) return null;

  const body = renderQuestionBody({ errorMsg, question, styles, updateAnswer, value });
  if (!isValueDefined(body)) return null;

  return (
    <View key={question.id} style={styles.questionBlock}>
      <View style={styles.questionHeaderRow}>
        <Text style={styles.questionTitle}>{question.name}</Text>
        {question.isRequired === true ? <RequiredMark styles={styles} /> : null}
      </View>
      {body}
    </View>
  );
};

export default QuestionRenderer;

interface RenderQuestionBodyArgs {
  errorMsg?: string;
  question: Question;
  styles: FormStyles;
  updateAnswer: (questionId: string, value: Answer) => void;
  value: Answer;
}

function renderQuestionBody({ errorMsg, question, styles, updateAnswer, value }: RenderQuestionBodyArgs): React.ReactElement | null {
  if (question.type === QuestionType.Text)
    return (
      <TextQuestion
        errorMsg={errorMsg}
        styles={styles}
        updateAnswer={(txt: string) => updateAnswer(question.id, txt)}
        value={typeof value === 'string' ? value : ''}
      />
    );
  

  const hasOptions = Array.isArray(question.options) && question.options.length > 0;
  if (!hasOptions) return null;

  if (question.type === QuestionType.Dropdown)
    return (
      <DropdownQuestion
        errorMsg={errorMsg}
        options={question.options ?? []}
        styles={styles}
        updateAnswer={(v: string | number) => updateAnswer(question.id, v)}
        value={typeof value === 'string' || typeof value === 'number' ? value : ''}
      />
    );


  if (question.type === QuestionType.Radio)
    return (
      <RadioQuestion
        errorMsg={errorMsg}
        options={question.options ?? []}
        styles={styles}
        updateAnswer={(v: string | number) => updateAnswer(question.id, v)}
        value={typeof value === 'string' || typeof value === 'number' ? value : ''}
      />
    );


  return (
    <CheckboxQuestion
      errorMsg={errorMsg}
      options={question.options ?? []}
      styles={styles}
      updateAnswer={(updated: Array<string | number>) => updateAnswer(question.id, updated)}
      value={Array.isArray(value) ? value : []}
    />
  );
}
