/**
 * @deprecated For new endpoint-specific error handling, use the error registry
 * at `src/lib/api/errors/errorRegistry.ts` with `registerErrorRule()`.
 *
 * This module provides a path-based notification handler registry for
 * customizing API response messages. The new error registry system in
 * `src/lib/api/errors/` offers a more powerful alternative with status
 * code matching, error code matching, and typed actions.
 */
import { HttpMethod } from '@dloizides/api-client-base';

import { FM } from '../localization/helpers';
import NotificationType from '../shared/enums/NotificationType';
import { isValueDefined } from '../utils/is';

/**
 * Result from notification handler
 */
interface NotificationResult {
  message: string;
  type: NotificationType;
}

/**
 * Input for getting notification message
 */
interface ApiNotificationInput {
  path: string;
  method: HttpMethod;
  isSuccess: boolean;
  responseData?: unknown;
  errorMessage?: string;
}

/**
 * Handler context passed to notification handlers
 */
interface NotificationHandlerContext {
  isSuccess: boolean;
  responseData?: unknown;
  errorMessage?: string;
}

/**
 * Notification handler function type
 */
type NotificationHandler = (
  context: NotificationHandlerContext
) => NotificationResult | null;

/**
 * Configuration for registering a notification handler
 */
interface ApiNotificationConfig {
  pathPattern: string | RegExp;
  method: HttpMethod;
  handler: NotificationHandler;
}

// Type guard for delete response
interface DeleteResponse {
  deletedCount?: number;
}

// Internal registry of notification handlers
const notificationHandlers: ApiNotificationConfig[] = [];

function isDeleteResponse(value: unknown): value is DeleteResponse {
  return isValueDefined(value) && typeof value === 'object';
}

function getDeletedCount(responseData: unknown): number {
  if (!isDeleteResponse(responseData)) return 0;
  return responseData.deletedCount ?? 0;
}

/**
 * Register a custom notification handler for an API endpoint
 */
export function registerApiNotification(config: ApiNotificationConfig): void {
  notificationHandlers.push(config);
}

/**
 * Check if a path matches a pattern
 */
function matchesPath(path: string, pattern: string | RegExp): boolean {
  if (pattern instanceof RegExp) 
    return pattern.test(path);
  
  return path === pattern || path.endsWith(pattern);
}

/**
 * Get notification message for an API call
 *
 * @param input - API call information
 * @returns NotificationResult or null if no handler matches
 */
export function getApiNotificationMessage(
  input: ApiNotificationInput
): NotificationResult | null {
  const { path, method, isSuccess, responseData, errorMessage } = input;

  // Find matching handler from registry
  for (const config of notificationHandlers) 
    if (config.method === method && matchesPath(path, config.pathPattern)) 
      return config.handler({ isSuccess, responseData, errorMessage });
    
  

  // Built-in handlers
  const builtInResult = handleBuiltInNotifications(input);
  if (isValueDefined(builtInResult)) 
    return builtInResult;
  

  return null;
}

/**
 * Built-in notification handlers for common endpoints
 */
function handleBuiltInNotifications(
  input: ApiNotificationInput
): NotificationResult | null {
  const { path, method, isSuccess, responseData, errorMessage } = input;

  // DELETE /questionerTemplates/delete/inactive
  const isDeleteInactiveTemplatesEndpoint =
    path === '/questionerTemplates/delete/inactive' ||
    path.endsWith('/questionerTemplates/delete/inactive');
  const isDeleteInactiveTemplatesRequest = method === HttpMethod.Delete && isDeleteInactiveTemplatesEndpoint;
  if (isDeleteInactiveTemplatesRequest) {
    if (!isSuccess) 
      return {
        message: errorMessage ?? FM('common.error'),
        type: NotificationType.Error,
      };


    const count = getDeletedCount(responseData);

    if (count > 0)
      return {
        message: FM('quizTemplates.messages.deleteInactiveSuccess', String(count)),
        type: NotificationType.Success,
      };


    return {
      message: FM('quizTemplates.messages.deleteInactiveNone'),
      type: NotificationType.Success,
    };
  }

  return null;
}

/**
 * Clear all registered handlers (useful for testing)
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function clearApiNotificationHandlers(): void {
  notificationHandlers.length = 0;
}
