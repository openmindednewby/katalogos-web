


/**
 * useQuizNavigation - Hook for quiz page navigation and scrolling.
 */
import { useCallback, useRef } from 'react';

import type { ScrollView } from 'react-native';
import { Animated } from 'react-native';

const ANIMATION_DURATION = 200;

interface UseQuizNavigationReturn {
  scrollRef: React.RefObject<ScrollView | null>;
  pageOpacity: Animated.Value;
  scrollToTop: () => void;
  navigateToPage: (targetPage: number, currentPage: number, options?: { animate?: boolean }) => void;
  resetPageOpacity: () => void;
}

function createFadeOutAnimation(opacity: Animated.Value): Animated.CompositeAnimation {
  return Animated.timing(opacity, { toValue: 0, duration: ANIMATION_DURATION, useNativeDriver: false });
}

function createFadeInAnimation(opacity: Animated.Value): Animated.CompositeAnimation {
  return Animated.timing(opacity, { toValue: 1, duration: ANIMATION_DURATION, useNativeDriver: false });
}

export function useQuizNavigation(setCurrentPage: (page: number) => void): UseQuizNavigationReturn {
  const scrollRef = useRef<ScrollView>(null);
  const pageOpacity = useRef(new Animated.Value(1)).current;

  const scrollToTop = useCallback((): void => { requestAnimationFrame(() => { scrollRef.current?.scrollTo({ y: 0, animated: true }); }); }, []);
  const resetPageOpacity = useCallback((): void => { pageOpacity.stopAnimation(); pageOpacity.setValue(1); }, [pageOpacity]);

  const navigateToPage = useCallback((targetPage: number, currentPage: number, options?: { animate?: boolean }): void => {
    const shouldAnimate = options?.animate ?? true;
    if (targetPage <= 0 || targetPage === currentPage) return;
    if (!shouldAnimate) { resetPageOpacity(); setCurrentPage(targetPage); scrollToTop(); return; }
    pageOpacity.stopAnimation();
    createFadeOutAnimation(pageOpacity).start(() => {
      setCurrentPage(targetPage);
      requestAnimationFrame(() => { scrollToTop(); createFadeInAnimation(pageOpacity).start(); });
    });
  }, [pageOpacity, resetPageOpacity, scrollToTop, setCurrentPage]);

  return { scrollRef, pageOpacity, scrollToTop, navigateToPage, resetPageOpacity };
}
