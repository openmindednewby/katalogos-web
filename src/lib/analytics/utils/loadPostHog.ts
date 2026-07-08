import type { PostHog } from 'posthog-js';

/**
 * Dynamic-import seam for posthog-js.
 *
 * Isolated into its own module (the same pattern as the jsPDF lazy wrapper) so
 * that PostHogClient can be unit-tested by mocking this loader instead of the
 * dynamic import itself. The `import('posthog-js')` here keeps posthog-js
 * (~180 kB) in its own async chunk, off the first-paint critical path.
 */
export async function loadPostHog(): Promise<PostHog> {
  const { default: posthog } = await import('posthog-js');
  return posthog;
}
