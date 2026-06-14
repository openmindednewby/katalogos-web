/**
 * Content API mutator — thin local wrapper over `@dloizides/orval-preset`.
 *
 * The shared package owns the mutator logic (delegating to the runtime
 * registry). This file is a local wrapper so the Orval-generated hooks keep
 * importing from the stable path `../../../mutators/contentMutator` AND so
 * Orval's static mutator parser sees a locally-declared `contentInstance`
 * function with the expected single parameter.
 */
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
