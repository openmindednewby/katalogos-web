import { useCallback, useEffect, useState } from 'react';

import { Platform } from 'react-native';

import { isValueDefined } from '../utils/is';
import { logger } from '../utils/logger';

const enum PwaInstallOutcome {
  Accepted = 'accepted',
  Dismissed = 'dismissed',
}

interface BeforeInstallPromptUserChoice {
  outcome: PwaInstallOutcome;
}

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<BeforeInstallPromptUserChoice>;
};

type WebNavigator = Navigator & {
  standalone?: boolean;
};

declare global {
  interface Window {
    deferredPrompt?: unknown;
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return isValueDefined(value) && typeof value === 'object';
}

function isBeforeInstallPromptEvent(value: unknown): value is BeforeInstallPromptEvent {
  if (!isRecord(value)) return false;
  return 'prompt' in value && 'userChoice' in value;
}

function isWebNavigatorWithStandalone(nav: Navigator): nav is WebNavigator {
  return 'standalone' in nav;
}

/** Check if PWA is already installed (standalone mode) */
function checkIsInstalled(): boolean {
  try {
    const mq = typeof window.matchMedia === 'function' ? window.matchMedia('(display-mode: standalone)') : undefined;
    const standalone = Boolean(mq?.matches);
    const iosStandalone = isWebNavigatorWithStandalone(navigator) && navigator.standalone === true;
    return standalone || iosStandalone;
  } catch {
    return false;
  }
}

function setWindowDeferredPrompt(event: BeforeInstallPromptEvent): void {
  window.deferredPrompt = event;
}

function getWindowDeferredPrompt(): unknown {
  return window.deferredPrompt;
}

/** Handle the beforeinstallprompt event */
function createBeforeInstallHandler(
  setDeferredPrompt: (p: BeforeInstallPromptEvent | null) => void,
  setShowInstallPrompt: (show: boolean) => void,
): (event: Event) => void {
  return (event: Event): void => {
    const maybeEvent: unknown = event;
    if (!isBeforeInstallPromptEvent(maybeEvent)) return;
    maybeEvent.preventDefault();
    setWindowDeferredPrompt(maybeEvent);
    setDeferredPrompt(maybeEvent);
    setShowInstallPrompt(true);
  };
}

/** Setup event listeners for PWA install and return cleanup function */
function setupPWAListeners(
  setDeferredPrompt: (p: BeforeInstallPromptEvent | null) => void,
  setShowInstallPrompt: (show: boolean) => void,
  setIsInstalled: (installed: boolean) => void,
): () => void {
  const handleBeforeInstallPrompt = createBeforeInstallHandler(setDeferredPrompt, setShowInstallPrompt);
  const handleAppInstalled = (): void => setIsInstalled(true);
  const mq = typeof window.matchMedia === 'function' ? window.matchMedia('(display-mode: standalone)') : undefined;
  const onChange = (): void => setIsInstalled(checkIsInstalled());
  window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  window.addEventListener('appinstalled', handleAppInstalled);
  mq?.addEventListener('change', onChange);
  return () => {
    window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.removeEventListener('appinstalled', handleAppInstalled);
    mq?.removeEventListener('change', onChange);
  };
}

interface PWAInstallHookResult {
  showInstallPrompt: boolean;
  handleInstall: () => Promise<void>;
  closePrompt: () => void;
  isInstalled: boolean;
}

export function usePWAInstall(): PWAInstallHookResult {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    if (Platform.OS !== 'web' || typeof window === 'undefined') return;
    setIsInstalled(checkIsInstalled());
    const storedPrompt = getWindowDeferredPrompt();
    if (isBeforeInstallPromptEvent(storedPrompt)) {
      setDeferredPrompt(storedPrompt);
      setShowInstallPrompt(true);
      return;
    }
    return setupPWAListeners(setDeferredPrompt, setShowInstallPrompt, setIsInstalled);
  }, []);

  const handleInstall = useCallback(async (): Promise<void> => {
    if (!isValueDefined(deferredPrompt)) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === PwaInstallOutcome.Accepted) logger.info('usePWAInstall', 'User accepted the PWA install');
    setDeferredPrompt(null);
    setShowInstallPrompt(false);
  }, [deferredPrompt]);

  return { showInstallPrompt, handleInstall, closePrompt: useCallback(() => setShowInstallPrompt(false), []), isInstalled };
}
