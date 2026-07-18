/**
 * Marks a sign-out as IN FLIGHT so no other part of the app navigates while
 * `POST /bff/logout` is still on the wire.
 *
 * ## Why this exists (it is NOT redundant with `performBffLogout`)
 *
 * `performBffLogout` fixes the ordering INSIDE `AuthProvider.logout` — it awaits
 * the BFF call before navigating. That alone is not enough here, because these
 * apps have a SECOND, indirect navigation that the sequencer cannot see:
 *
 * ```
 * onClearSession()  →  dispatch(setAuthenticated(false))
 *                   →  React re-renders
 *                   →  ProtectedLayout's guard effect sees `!isLoggedIn`
 *                   →  redirectTo('/(auth)/login')
 *                   →  scheduleFallbackNavigation(150 ms) → window.location.replace()
 *                   →  document unload CANCELS the in-flight POST /bff/logout
 * ```
 *
 * A BFF logout round-trip routinely exceeds 150 ms, so the route guard would
 * re-introduce the exact defect `performBffLogout` was published to fix — the
 * server-side session survives while the UI claims the user signed out.
 * `agora-web` never hit this because it has no `redirectTo` route guard; copying
 * agora's call site alone would have left this app still broken.
 *
 * The guard is deliberately dumb: it does not cancel or defer the redirect, it
 * SKIPS it. `performBffLogout` always navigates last (to the IdP logout URL when
 * there is one, otherwise the login route), so the user still leaves the page —
 * and skipping is what keeps an app-level navigation from pre-empting the IdP
 * one, which is the other half of the original bug.
 *
 * Session expiry and every other logged-out transition are unaffected: the flag
 * is only raised for the duration of a deliberate sign-out.
 */

/**
 * Depth counter rather than a boolean: the logout button is wired through a
 * document-level capture listener that can fire for `click`, `pointerup` AND
 * `touchend`, so two sign-outs can legitimately overlap. A boolean would let the
 * first one to finish clear the flag while the second is still awaiting the BFF.
 */
let inFlightDepth = 0;

/** True while at least one deliberate sign-out is awaiting the BFF. */
export function isLogoutInFlight(): boolean {
  return inFlightDepth > 0;
}

/**
 * Run a sign-out with the in-flight flag raised for its whole duration,
 * including the final navigation. Always lowers the flag, even if `run` throws,
 * so a failed logout can never wedge the route guard off permanently.
 */
export async function withLogoutInFlight<T>(run: () => Promise<T>): Promise<T> {
  inFlightDepth += 1;
  try {
    return await run();
  } finally {
    inFlightDepth -= 1;
  }
}

/**
 * The protected-route guard's decision, as a pure function so it can be pinned
 * by a test rather than only observed through an Expo Router layout.
 *
 * Sends a logged-out visitor to the login screen — EXCEPT while a deliberate
 * sign-out is awaiting the BFF, because that redirect would unload the document
 * and cancel `POST /bff/logout`. `performBffLogout` navigates once the BFF
 * answers, so nothing is lost by standing down here.
 */
export function shouldRedirectToLogin(loading: boolean, isLoggedIn: boolean): boolean {
  return !loading && !isLoggedIn && !isLogoutInFlight();
}

/** Test-only reset so a leaked depth in one test cannot bleed into the next. */
export function resetLogoutInFlightForTests(): void {
  inFlightDepth = 0;
}
