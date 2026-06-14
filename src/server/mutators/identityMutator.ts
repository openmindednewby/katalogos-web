/**
 * Identity API mutator — thin local wrapper over `@dloizides/orval-preset`.
 *
 * The shared package owns the mutator logic (delegating to the runtime
 * registry). This file is a local wrapper so the Orval-generated hooks keep
 * importing from the stable path `../../../mutators/identityMutator` AND so
 * Orval's static mutator parser sees a locally-declared `identityInstance`
 * function with the expected single parameter.
 */
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
