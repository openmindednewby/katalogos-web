/**
 * Error action executor.
 *
 * Given a matched rule and classified error, this module executes the
 * appropriate UI action by emitting events on the API event bus.
 */

import { reportToMonitoring } from './errorReporter';
import { ErrorActionType, ErrorSeverity } from './errorTypes';
import i18n from '../../../localization/i18n';
import { isValueDefined } from '../../../utils/is';
import { logger } from '../../../utils/logger';
import { apiEventBus } from '../events/apiEventBus';

import type { ClassifiedError, ErrorRule } from './errorTypes';

const GENERIC_ERROR_MESSAGE = 'An error occurred';
const DEFAULT_MODAL_COMPONENT = 'ErrorModal';
const DEFAULT_REDIRECT_TARGET = '/login';

/** Registry of custom handler functions keyed by name */
const customHandlers = new Map<string, (error: ClassifiedError) => void>();

/**
 * Resolve the user-facing message for a matched error rule.
 * Fallback chain: i18n key -> fallbackMessage -> error.message -> generic
 */
function resolveMessage(rule: ErrorRule, error: ClassifiedError): string {
  if (isValueDefined(rule.messageKey)) {
    const translated = i18n.t(rule.messageKey);
    if (translated !== rule.messageKey && translated !== '')
      return translated;
  }

  if (isValueDefined(rule.fallbackMessage) && rule.fallbackMessage !== '')
    return rule.fallbackMessage;

  if (error.message !== '') return error.message;

  return GENERIC_ERROR_MESSAGE;
}

function emitToastAction(message: string, rule: ErrorRule): void {
  apiEventBus.emit({
    type: 'toast',
    severity: rule.action.severity ?? ErrorSeverity.Error,
    message,
  });
}

function emitModalAction(message: string, rule: ErrorRule): void {
  apiEventBus.emit({
    type: 'modal',
    modalComponent: rule.action.modalComponent ?? DEFAULT_MODAL_COMPONENT,
    message,
    severity: rule.action.severity ?? ErrorSeverity.Error,
  });
}

function emitRedirectAction(message: string, rule: ErrorRule): void {
  apiEventBus.emit({
    type: 'redirect',
    target: rule.action.target ?? DEFAULT_REDIRECT_TARGET,
    message,
  });
}

function executeCustomHandler(handlerName: string | undefined, error: ClassifiedError): void {
  if (!isValueDefined(handlerName)) {
    logger.warn('errorActions', 'Custom action missing handler name');
    return;
  }

  const handler = customHandlers.get(handlerName);
  if (!isValueDefined(handler)) {
    logger.warn('errorActions', `Custom handler not found: ${handlerName}`);
    return;
  }

  try {
    handler(error);
  } catch (handlerError) {
    logger.error('errorActions', `Custom handler "${handlerName}" threw`, handlerError);
  }
}

/**
 * Execute the action defined by a matched error rule.
 */
function executeErrorAction(rule: ErrorRule, error: ClassifiedError): void {
  const message = resolveMessage(rule, error);

  switch (rule.action.type) {
    case ErrorActionType.Toast:
      emitToastAction(message, rule);
      break;
    case ErrorActionType.Modal:
      emitModalAction(message, rule);
      break;
    case ErrorActionType.Redirect:
      emitRedirectAction(message, rule);
      break;
    case ErrorActionType.Silent:
      logger.info('errorActions', `Silent error: ${rule.name}`, { message });
      break;
    case ErrorActionType.Retry:
      break;
    case ErrorActionType.Custom:
      executeCustomHandler(rule.action.handler, error);
      break;
    default:
      logger.warn('errorActions', `Unknown action type on rule: ${rule.name}`);
  }

  if (rule.action.reportToMonitoring === true)
    reportToMonitoring(error);
}

/**
 * Register a custom handler function by name.
 * Custom handlers are invoked when a rule has action type 'custom'.
 */
function registerCustomHandler(name: string, handler: (error: ClassifiedError) => void): void {
  customHandlers.set(name, handler);
}

/**
 * Remove a custom handler by name.
 */
function unregisterCustomHandler(name: string): void {
  customHandlers.delete(name);
}

export { executeErrorAction, resolveMessage, registerCustomHandler, unregisterCustomHandler };
