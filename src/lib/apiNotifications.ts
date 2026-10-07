import { HttpMethod } from '@dloizides/api-client-base';

import { FM } from '../localization/helpers';
import NotificationType from '../shared/enums/NotificationType';
import { isValueDefined } from '../utils/is';

interface NotificationResult {
  message: string;
  type: NotificationType;
}

interface ApiNotificationInput {
  path: string;
  method: HttpMethod;
  isSuccess: boolean;
  responseData?: unknown;
  errorMessage?: string;
}

interface NotificationHandlerContext {
  isSuccess: boolean;
  responseData?: unknown;
  errorMessage?: string;
}

type NotificationHandler = (
  context: NotificationHandlerContext
) => NotificationResult | null;

interface ApiNotificationConfig {
  pathPattern: string | RegExp;
  method: HttpMethod;
  handler: NotificationHandler;
}

interface DeleteResponse {
  deletedCount?: number;
}

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

  for (const config of notificationHandlers) 
    if (config.method === method && matchesPath(path, config.pathPattern)) 
      return config.handler({ isSuccess, responseData, errorMessage });
    
  

  const builtInResult = handleBuiltInNotifications(input);
  if (isValueDefined(builtInResult)) 
    return builtInResult;
  

  return null;
}

function handleBuiltInNotifications(
  input: ApiNotificationInput
): NotificationResult | null {
  const { path, method, isSuccess, responseData, errorMessage } = input;

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

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function clearApiNotificationHandlers(): void {
  notificationHandlers.length = 0;
}
