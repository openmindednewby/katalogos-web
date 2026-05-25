import type { ReactElement } from 'react';
import React from 'react';

import { Text, TouchableOpacity, View } from 'react-native';

import { FM } from '@/localization/helpers';
import { TestIds } from '@/shared/testIds';
import { useTheme } from '@/theme/hooks/useTheme';

import { overlayStyles } from './tooltipOverlayStyles';

import type { TooltipStep } from '../types';


interface Props {
  step: TooltipStep;
  stepIndex: number;
  totalSteps: number;
  isLastStep: boolean;
  bubblePosition: { top: number; left: number };
  onNext: () => void;
  onSkip: () => void;
}

const TooltipBubble = ({
  step,
  stepIndex,
  totalSteps,
  isLastStep,
  bubblePosition,
  onNext,
  onSkip,
}: Props): ReactElement => {
  const { theme } = useTheme();
  const { colors } = theme;
  const primary = theme.palette.primary['500'];
  const stepDisplayNumber = String(stepIndex + 1);
  const totalDisplayNumber = String(totalSteps);
  const nextLabel = isLastStep ? FM('tooltipTour.finishButton') : FM('tooltipTour.nextButton');

  return (
    <View
      style={[overlayStyles.bubble, bubblePosition, { backgroundColor: colors.surface }]}
      testID={TestIds.TOOLTIP_BUBBLE}
    >
      <Text style={[overlayStyles.title, { color: colors.text }]} testID={TestIds.TOOLTIP_TITLE}>
        {FM(step.titleKey)}
      </Text>
      <Text
        style={[overlayStyles.description, { color: colors.textSecondary }]}
        testID={TestIds.TOOLTIP_DESCRIPTION}
      >
        {FM(step.descriptionKey)}
      </Text>

      <View style={overlayStyles.footer}>
        <Text
          style={[overlayStyles.counter, { color: colors.textSecondary }]}
          testID={TestIds.TOOLTIP_STEP_COUNTER}
        >
          {FM('tooltipTour.stepCounter', stepDisplayNumber, totalDisplayNumber)}
        </Text>

        <View style={overlayStyles.buttonRow}>
          <TouchableOpacity
            accessibilityHint={FM('tooltipTour.skipHint')}
            accessibilityLabel={FM('tooltipTour.skipButton')}
            accessibilityRole="button"
            style={overlayStyles.button}
            testID={TestIds.TOOLTIP_SKIP_BUTTON}
            onPress={onSkip}
          >
            <Text style={[overlayStyles.buttonText, { color: colors.textSecondary }]}>
              {FM('tooltipTour.skipButton')}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            accessibilityHint={FM('tooltipTour.nextHint')}
            accessibilityLabel={nextLabel}
            accessibilityRole="button"
            style={[overlayStyles.button, { backgroundColor: primary }]}
            testID={TestIds.TOOLTIP_NEXT_BUTTON}
            onPress={onNext}
          >
            <Text style={[overlayStyles.buttonText, { color: colors.surface }]}>
              {nextLabel}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default TooltipBubble;
