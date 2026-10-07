import {
  customInstance as sharedCustomInstance,
  type OrvalRequest,
  type OrvalMutator,
} from '@dloizides/orval-preset';

export type { OrvalRequest, OrvalMutator };

/** HTTP client for OnlineMenu API; delegates to the shared registry mutator. */
export async function customInstance<
  TResp = unknown,
  TReq = unknown,
  TQry = unknown,
>(
  opts: OrvalRequest<TReq, TQry>,
): Promise<TResp> {
  return sharedCustomInstance<TResp, TReq, TQry>(opts);
}

export default customInstance;
