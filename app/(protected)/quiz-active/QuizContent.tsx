/**
 * QuizContent - Renders the quiz form content including questions and navigation.
 */
import React, { useMemo } from 'react';
import type { RefObject } from 'react';

import { Animated, ScrollView, Text, View } from 'react-native';

import { NavigationButtons, QuestionRenderer, ProgressIndicator } from '../../../src/components/DynamicForm';
import { isValueDefined } from '../../../src/utils/is';

import type { DynamicQuiz, Answer, Question as UiQuestion } from '../../../src/components/DynamicForm';
import type { FormStyles } from '../../../src/theme/utils/forms';

interface QuizContentProps {
  form: DynamicQuiz;
  currentPage: number;
  totalPages: number;
  currentQuestions: UiQuestion[];
  errors: Record<string, string>;
  styles: FormStyles;
  submitting: boolean;
  pageOpacity: Animated.Value;
  scrollRef: RefObject<ScrollView | null>;
  t: (key: string, defaultValue?: string) => string;
  shouldSkip: (question: UiQuestion) => boolean;
  updateAnswer: (questionId: string, value: Answer) => void;
  handleBack: () => void;
  handleNext: () => void;
}

const QuizContent: React.FC<QuizContentProps> = ({
  form,
  currentPage,
  totalPages,
  currentQuestions,
  errors,
  styles,
  submitting,
  pageOpacity,
  scrollRef,
  t,
  shouldSkip,
  updateAnswer,
  handleBack,
  handleNext,
}) => {
  const pageAnimatedStyle = useMemo(() => ({ opacity: pageOpacity }), [pageOpacity]);

  const hasDescription = isValueDefined(form.description) && form.description.length > 0;

  const pages = form.questions.map((q) => q.page);
  const isLastPage = pages.length > 0 ? currentPage === Math.max(...pages) : true;

  return (
    <ScrollView ref={scrollRef} style={styles.container}>
      <Text style={styles.title}>{form.name}</Text>
      {hasDescription ? <Text style={styles.subtitle}>{form.description}</Text> : null}

      <Animated.View style={pageAnimatedStyle}>
        <View style={styles.card}>
          {currentQuestions.map((q) => (
            <QuestionRenderer
              key={q.id}
              errorMsg={errors[q.id]}
              question={q}
              shouldSkip={shouldSkip}
              styles={styles}
              t={t}
              updateAnswer={updateAnswer}
              value={q.answer ?? ''}
            />
          ))}
        </View>

        <NavigationButtons
          currentPage={currentPage}
          handleBack={handleBack}
          handleNext={handleNext}
          isLastPage={isLastPage}
          loading={submitting}
          styles={styles}
          t={t}
          totalPages={totalPages}
        />

        <ProgressIndicator currentPage={currentPage} styles={styles} t={t} totalPages={totalPages} />
      </Animated.View>
    </ScrollView>
  );
};

export default QuizContent;
