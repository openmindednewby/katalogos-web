import {
  contentInstance as sharedContentInstance,
  type OrvalRequest,
  type OrvalMutator,
} from '@dloizides/orval-preset';

export type { OrvalRequest, OrvalMutator };

/** HTTP client for Content API; delegates to the shared registry mutator. */
export async function contentInstance<
  TResp = unknown,
  TReq = unknown,
  TQry = unknown,
>(
  opts: OrvalRequest<TReq, TQry>,
): Promise<TResp> {
  return sharedContentInstance<TResp, TReq, TQry>(opts);
}

export default contentInstance;
