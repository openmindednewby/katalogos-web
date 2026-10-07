import type { PostHog } from 'posthog-js';

/** Dynamic-import seam for posthog-js. */
export async function loadPostHog(): Promise<PostHog> {
  const { default: posthog } = await import('posthog-js');
  return posthog;
}
