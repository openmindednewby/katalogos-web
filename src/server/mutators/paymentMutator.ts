import {
  paymentInstance as sharedPaymentInstance,
  type OrvalRequest,
  type OrvalMutator,
} from '@dloizides/orval-preset';

export type { OrvalRequest, OrvalMutator };

/** HTTP client for Payment API; delegates to the shared registry mutator. */
export async function paymentInstance<
  TResp = unknown,
  TReq = unknown,
  TQry = unknown,
>(
  opts: OrvalRequest<TReq, TQry>,
): Promise<TResp> {
  return sharedPaymentInstance<TResp, TReq, TQry>(opts);
}

export default paymentInstance;
