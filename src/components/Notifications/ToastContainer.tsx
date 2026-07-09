/**
 * ToastContainer — thin adapter over the shared `ToastHost` from
 * `@dloizides/ui-feedback`. The animated overlay + theming live in the package;
 * this component wires the app's notification event bus (`addListener`) into the
 * host's `subscribe` port, mapping signout/success/error events to toast text +
 * type. The `notification-toast` testID is preserved for E2E.
 */
import React, { useCallback } from 'react';

import { ToastHost, type ToastInput } from '@dloizides/ui-feedback';

import { FM } from '@/localization/helpers';

import { addListener } from '../../lib/notifications';
import { TOAST_DURATION_MS, ANIMATION } from '../../shared/constants';
import { TestIds } from '../../shared/testIds';
import { isValueDefined } from '../../utils/is';
import { logger } from '../../utils/logger';
import { sanitizeText } from '../../utils/sanitize';

/** Maximum length for sanitized message text. */
const TOAST_MESSAGE_MAX_LENGTH = 500;

interface PayloadWithMessage {
  message?: unknown;
}

function isPayloadWithMessage(payload: unknown): payload is PayloadWithMessage {
  if (typeof payload !== 'object' || !isValueDefined(payload)) return false;
  return 'message' in payload;
}

function extractMessage(payload: unknown): string | undefined {
  if (!isPayloadWithMessage(payload)) return undefined;
  return typeof payload.message === 'string' ? payload.message : undefined;
}

function toToast(payload: unknown, fallbackKey: string, type: ToastInput['type']): ToastInput {
  const message = extractMessage(payload) ?? FM(fallbackKey);
  return { text: sanitizeText(message, TOAST_MESSAGE_MAX_LENGTH), type };
}

const ToastContainer = (): React.ReactElement | null => {
  const subscribe = useCallback((push: (toast: ToastInput) => void): (() => void) => {
    const off = addListener((event, payload) => {
      try {
        if (event === 'signout') push(toToast(payload, 'notifications.sessionExpired', 'error'));
        if (event === 'success') push(toToast(payload, 'notifications.savedSuccessfully', 'success'));
        if (event === 'error') push(toToast(payload, 'notifications.errorOccurred', 'error'));
      } catch (listenerError) {
        logger.error('ToastContainer', 'Error handling notification event', listenerError);
      }
    });

    return () => {
      try {
        off();
      } catch (cleanupError) {
        logger.warn('ToastContainer', 'Error during listener cleanup', cleanupError);
      }
    };
  }, []);

  return (
    <ToastHost
      durationMs={TOAST_DURATION_MS}
      fadeMs={ANIMATION.TOAST_FADE_IN_MS}
      maxLength={TOAST_MESSAGE_MAX_LENGTH}
      subscribe={subscribe}
      toastTestID={TestIds.NOTIFICATION_TOAST}
    />
  );
};

export default ToastContainer;
