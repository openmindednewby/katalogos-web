/**
 * React hook that subscribes to the API event bus and dispatches
 * UI side-effects (toasts, modals, redirects, session-expired, maintenance).
 *
 * Must be used inside a component tree that has access to navigation
 * and the Redux store (for logout dispatch).
 */

import type React from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';

import { useDispatch } from 'react-redux';

import { apiEventBus } from './apiEventBus';
import { clearClientAuthState } from '../../../auth/authStorageCleanup';
import { FM } from '../../../localization/helpers';
import { STORAGE_KEYS } from '../../../shared/constants';
import { isValueDefined } from '../../../utils/is';
import { notify } from '../../notifications';
import { ErrorSeverity } from '../errors/errorTypes';

import type { ApiEvent, ModalEvent } from './apiEventTypes';
import type { AppDispatch } from '../../../store/reduxStore';

const LOGIN_PATH = '/login';

interface UseApiEventsResult {
  /** The currently visible modal event, or null */
  activeModal: ModalEvent | null;
  /** Dismiss the currently active modal */
  dismissModal: () => void;
}

function handleToastEvent(event: ApiEvent): void {
  if (event.type !== 'toast') return;
  notify(event.severity, { message: event.message });
}

function handleRedirectEvent(event: ApiEvent): void {
  if (event.type !== 'redirect') return;
  if (typeof window !== 'undefined')
    window.location.href = event.target;
}

function handleSessionExpired(dispatch: AppDispatch): void {
  clearClientAuthState(dispatch);
  notify('signout', { message: FM('errors.sessionExpired') });
  try {
    sessionStorage.setItem(STORAGE_KEYS.SESSION_EXPIRED, 'true');
  } catch {
    // sessionStorage may be unavailable (SSR, private browsing)
  }
  if (typeof window !== 'undefined')
    window.location.href = LOGIN_PATH;
}

function buildMaintenanceModal(event: ApiEvent): ModalEvent | null {
  if (event.type !== 'maintenance-mode') return null;
  return {
    type: 'modal',
    modalComponent: 'MaintenanceModal',
    message: FM('errors.maintenanceMode'),
    severity: ErrorSeverity.Warning,
    data: { estimatedEnd: event.estimatedEnd },
  };
}

function createEventHandler(
  dispatchRef: React.MutableRefObject<AppDispatch>,
  setModal: React.Dispatch<React.SetStateAction<ModalEvent | null>>,
): (event: ApiEvent) => void {
  return function handleEvent(event: ApiEvent): void {
    switch (event.type) {
      case 'toast':
        handleToastEvent(event);
        break;
      case 'modal':
        setModal(event);
        break;
      case 'redirect':
        handleRedirectEvent(event);
        break;
      case 'session-expired':
        handleSessionExpired(dispatchRef.current);
        break;
      case 'maintenance-mode': {
        const modal = buildMaintenanceModal(event);
        if (isValueDefined(modal)) setModal(modal);
        break;
      }
      default:
        break;
    }
  };
}

/**
 * Subscribe to the API event bus and route events to the appropriate
 * UI handler. Returns the current active modal for rendering.
 */
function useApiEvents(): UseApiEventsResult {
  const dispatch = useDispatch<AppDispatch>();
  const [activeModal, setActiveModal] = useState<ModalEvent | null>(null);
  const dispatchRef = useRef(dispatch);
  dispatchRef.current = dispatch;

  const dismissModal = useCallback(() => {
    setActiveModal(null);
  }, []);

  useEffect(() => {
    const handler = createEventHandler(dispatchRef, setActiveModal);
    return apiEventBus.subscribe(handler);
  }, []);

  return { activeModal, dismissModal };
}

export { useApiEvents };
export type { UseApiEventsResult };
