
let inFlightDepth = 0;

/** True while at least one deliberate sign-out is awaiting the BFF. */
export function isLogoutInFlight(): boolean {
  return inFlightDepth > 0;
}

/** Run a sign-out with the in-flight flag raised for its whole duration, */
export async function withLogoutInFlight<T>(run: () => Promise<T>): Promise<T> {
  inFlightDepth += 1;
  try {
    return await run();
  } finally {
    inFlightDepth -= 1;
  }
}

/** The protected-route guard's decision, as a pure function so it can be pinned */
export function shouldRedirectToLogin(loading: boolean, isLoggedIn: boolean): boolean {
  return !loading && !isLoggedIn && !isLogoutInFlight();
}

/** Test-only reset so a leaked depth in one test cannot bleed into the next. */
export function resetLogoutInFlightForTests(): void {
  inFlightDepth = 0;
}
