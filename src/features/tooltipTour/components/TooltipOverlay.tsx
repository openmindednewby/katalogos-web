import type { ReactElement } from 'react';
import React, { useCallback, useEffect, useRef, useState } from 'react';

import { Platform, Pressable, View } from 'react-native';

import { FM } from '@/localization/helpers';
import { TestIds } from '@/shared/testIds';
import { useTheme } from '@/theme/hooks/useTheme';
import { isValueDefined } from '@/utils/is';


import TooltipBubble from './TooltipBubble';
import { BACKDROP_COLOR, overlayStyles, POSITION_OFFSET, SPOTLIGHT_PADDING } from './tooltipOverlayStyles';
import { useTooltipTourContext } from './TooltipProvider';
import { getTargetRect, scrollTargetIntoView } from '../utils/targetElement';

import type { TargetRect } from '../utils/targetElement';

const MEASURE_DELAY_MS = 350;

interface SpotlightStyle {
  top: number;
  left: number;
  width: number;
  height: number;
  borderColor: string;
}

interface BubblePosition {
  top: number;
  left: number;
}

function buildSpotlightStyle(rect: TargetRect | null, borderColor: string): SpotlightStyle {
  if (!isValueDefined(rect))
    return { top: 0, left: 0, width: 0, height: 0, borderColor };

  return {
    top: rect.top - SPOTLIGHT_PADDING,
    left: rect.left - SPOTLIGHT_PADDING,
    width: rect.width + SPOTLIGHT_PADDING * 2,
    height: rect.height + SPOTLIGHT_PADDING * 2,
    borderColor,
  };
}

function buildBubblePosition(rect: TargetRect | null): BubblePosition {
  if (!isValueDefined(rect))
    return { top: POSITION_OFFSET, left: POSITION_OFFSET };

  return {
    top: rect.top + rect.height + POSITION_OFFSET,
    left: Math.max(POSITION_OFFSET, rect.left),
  };
}

const TooltipOverlay = (): ReactElement | null => {
  const { isActive, currentStep, currentStepIndex, totalSteps, handleNext, handleDismiss } =
    useTooltipTourContext();
  const { theme } = useTheme();
  const primary = theme.palette.primary['500'];
  const [targetRect, setTargetRect] = useState<TargetRect | null>(null);
  const measureTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const measureTarget = useCallback((): void => {
    if (!isValueDefined(currentStep)) {
      setTargetRect(null);
      return;
    }
    scrollTargetIntoView(currentStep.targetTestId);
    measureTimerRef.current = setTimeout(() => {
      setTargetRect(getTargetRect(currentStep.targetTestId));
    }, MEASURE_DELAY_MS);
  }, [currentStep]);

  useEffect(() => {
    measureTarget();
    const timerRef = measureTimerRef.current;
    return (): void => {
      if (isValueDefined(timerRef)) clearTimeout(timerRef);
    };
  }, [measureTarget]);

  useEffect(() => {
    if (!isActive) return undefined;
    const handleKeyDown = (event: KeyboardEvent): void => {
      if (event.key === 'Escape') handleDismiss();
    };
    if (Platform.OS === 'web' && typeof document !== 'undefined')
      document.addEventListener('keydown', handleKeyDown);

    return (): void => {
      if (Platform.OS === 'web' && typeof document !== 'undefined')
        document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isActive, handleDismiss]);

  if (!isActive || !isValueDefined(currentStep)) return null;

  return (
    <View
      accessibilityHint={FM('tooltipTour.overlayHint')}
      accessibilityLabel={FM('tooltipTour.overlayLabel')}
      accessibilityRole="alert"
      style={overlayStyles.overlay}
      testID={TestIds.TOOLTIP_OVERLAY}
    >
      <Pressable
        accessibilityHint={FM('tooltipTour.backdropHint')}
        accessibilityLabel={FM('tooltipTour.backdropLabel')}
        accessibilityRole="button"
        style={[overlayStyles.backdrop, { backgroundColor: BACKDROP_COLOR }]}
        testID={TestIds.TOOLTIP_BACKDROP}
        onPress={handleDismiss}
      />

      {isValueDefined(targetRect) && (
        <View
          style={[overlayStyles.spotlight, buildSpotlightStyle(targetRect, primary)]}
          testID={TestIds.TOOLTIP_SPOTLIGHT}
        />
      )}

      <TooltipBubble
        bubblePosition={buildBubblePosition(targetRect)}
        isLastStep={currentStepIndex === totalSteps - 1}
        step={currentStep}
        stepIndex={currentStepIndex}
        totalSteps={totalSteps}
        onNext={handleNext}
        onSkip={handleDismiss}
      />
    </View>
  );
};

export default TooltipOverlay;
