import {
  notificationInstance as sharedNotificationInstance,
  type OrvalRequest,
  type OrvalMutator,
} from '@dloizides/orval-preset';

export type { OrvalRequest, OrvalMutator };

/** HTTP client for Notification API; delegates to the shared registry mutator. */
export async function notificationInstance<
  TResp = unknown,
  TReq = unknown,
  TQry = unknown,
>(
  opts: OrvalRequest<TReq, TQry>,
): Promise<TResp> {
  return sharedNotificationInstance<TResp, TReq, TQry>(opts);
}

export default notificationInstance;
