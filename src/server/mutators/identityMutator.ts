/**
 * Identity API mutator for Orval code generation.
 *
 * This file has no Expo dependencies at the module level, allowing Orval
 * to load it in Node.js during code generation. At runtime, it retrieves
 * the real HTTP client from the registry.
 */
import { getMutator, type OrvalRequest, type OrvalMutator } from './registry';

export type { OrvalRequest, OrvalMutator };

/**
 * HTTP client for Identity API.
 * At runtime, delegates to the real implementation registered via registerMutators().
 */
export async function identityInstance<
  TResp = unknown,
  TReq = unknown,
  TQry = unknown,
>(
  opts: OrvalRequest<TReq, TQry>,
): Promise<TResp> {
  const realMutator = getMutator('identityInstance');
  return realMutator<TResp, TReq, TQry>(opts);
}

export default identityInstance;
