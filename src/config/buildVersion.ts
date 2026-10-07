import { isNotEmptyString } from '@dloizides/utils';

const FALLBACK_BUILD_VERSION = 'dev';

/** The stamped build id, or `dev` when unset (local runs). */
export function buildVersion(): string {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const stamped: string | undefined = process.env.EXPO_PUBLIC_BUILD_VERSION;
  return isNotEmptyString(stamped) ? stamped : FALLBACK_BUILD_VERSION;
}
