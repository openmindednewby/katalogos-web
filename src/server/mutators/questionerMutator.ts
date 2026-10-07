import {
  questionerInstance as sharedQuestionerInstance,
  type OrvalRequest,
  type OrvalMutator,
} from '@dloizides/orval-preset';

export type { OrvalRequest, OrvalMutator };

/** HTTP client for Questioner API; delegates to the shared registry mutator. */
export async function questionerInstance<
  TResp = unknown,
  TReq = unknown,
  TQry = unknown,
>(
  opts: OrvalRequest<TReq, TQry>,
): Promise<TResp> {
  return sharedQuestionerInstance<TResp, TReq, TQry>(opts);
}

export default questionerInstance;
