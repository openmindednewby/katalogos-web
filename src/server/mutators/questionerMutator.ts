/**
 * Questioner API mutator — thin local wrapper over `@dloizides/orval-preset`.
 *
 * The shared package owns the mutator logic (delegating to the runtime
 * registry). This file is a local wrapper so the Orval-generated hooks keep
 * importing from the stable path `../../../mutators/questionerMutator` AND so
 * Orval's static mutator parser sees a locally-declared `questionerInstance`
 * function with the expected single parameter.
 */
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
