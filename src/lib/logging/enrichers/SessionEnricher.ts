const SESSION_ID_RANDOM_LENGTH = 11;
const SESSION_ID_RADIX = 36;
const SESSION_ID_SLICE_START = 2;

/** Generates a unique session identifier combining timestamp and random string. */
export function generateSessionId(): string {
  const timestamp = Date.now().toString();
  const random = Math.random()
    .toString(SESSION_ID_RADIX)
    .substring(SESSION_ID_SLICE_START, SESSION_ID_SLICE_START + SESSION_ID_RANDOM_LENGTH);

  return `${timestamp}-${random}`;
}
