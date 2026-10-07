import {
  identityInstance as sharedIdentityInstance,
  type OrvalRequest,
  type OrvalMutator,
} from '@dloizides/orval-preset';

export type { OrvalRequest, OrvalMutator };

/** HTTP client for Identity API; delegates to the shared registry mutator. */
export async function identityInstance<
  TResp = unknown,
  TReq = unknown,
  TQry = unknown,
>(
  opts: OrvalRequest<TReq, TQry>,
): Promise<TResp> {
  return sharedIdentityInstance<TResp, TReq, TQry>(opts);
}

export default identityInstance;
