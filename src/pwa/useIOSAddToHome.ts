import { useEffect, useState } from 'react';

import { Platform } from 'react-native';

/** Delay before showing iOS add-to-home prompt in ms */
const IOS_PROMPT_DELAY_MS = 2000;

interface WebNavigator extends Navigator {
  standalone?: boolean;
}

function isWebNavigatorWithStandalone(nav: Navigator): nav is WebNavigator {
  return 'standalone' in nav;
}

export function useIOSAddToHome(): {
  showIOSPrompt: boolean;
  closeIOSPrompt: () => void;
} {
  const [showIOSPrompt, setShowIOSPrompt] = useState(false);

  useEffect(() => {
    if (Platform.OS !== 'web' || typeof window === 'undefined') return;

    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIos = /iphone|ipad|ipod/.test(userAgent);
    const isInStandalone = isWebNavigatorWithStandalone(window.navigator) && window.navigator.standalone === true;

    if (isIos && !isInStandalone) {
      const timer = setTimeout(() => setShowIOSPrompt(true), IOS_PROMPT_DELAY_MS);
      return () => clearTimeout(timer);
    }
  }, []);

  const closeIOSPrompt = (): void => setShowIOSPrompt(false);

  return { showIOSPrompt, closeIOSPrompt };
}
