/**
 * Unit tests for the session-expiry interceptor. Focus is on the logic: a 401
 * is confirmed against `/bff/me` before the session is torn down — only a
 * genuinely dead session clears the session view and emits `session-expired`.
 * An endpoint-level 401 (where `/bff/me` still reports a live user) passes
 * through untouched. Any non-401 status is passed through untouched. No real
 * HTTP — `bffAuthClient.getCurrentUser` is mocked.
 */
import { registerSessionExpiryInterceptor } from './sessionExpiry';

const mockEmit = jest.fn();
const mockDispatch = jest.fn();
const mockClearSession = jest.fn(() => ({ type: 'auth/clearSession' }));
const mockGetCurrentUser = jest.fn();

jest.mock('./events/apiEventBus', () => ({
  apiEventBus: { emit: (...args: unknown[]): void => mockEmit(...args) },
}));

jest.mock('../../store/reduxStore', () => ({
  reduxStore: { dispatch: (...args: unknown[]): void => mockDispatch(...args) },
}));

jest.mock('../../store/slices/authSlice', () => ({
  clearSession: (): unknown => mockClearSession(),
}));

jest.mock('../../auth/bffClient', () => ({
  bffAuthClient: { getCurrentUser: (): unknown => mockGetCurrentUser() },
}));

type ErrorHandler = (error: unknown) => Promise<unknown>;

interface FakeAxios {
  handler: ErrorHandler | null;
  interceptors: { response: { use: jest.Mock } };
}

function makeAxios(): FakeAxios {
  const fake: FakeAxios = {
    handler: null,
    interceptors: {
      response: {
        use: jest.fn((_onFulfilled: unknown, onRejected: ErrorHandler) => {
          fake.handler = onRejected;
          return 1;
        }),
      },
    },
  };
  return fake;
}

describe('registerSessionExpiryInterceptor', () => {
  beforeEach(() => {
    mockEmit.mockReset();
    mockDispatch.mockReset();
    mockClearSession.mockClear();
    mockGetCurrentUser.mockReset();
  });

  it('on a 401 with a dead session (/bff/me returns null): clears the session and emits session-expired', async () => {
    mockGetCurrentUser.mockResolvedValue(null);
    const axios = makeAxios();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- minimal axios stub
    registerSessionExpiryInterceptor(axios as any);

    const error = { response: { status: 401 }, config: {} };
    await expect(axios.handler?.(error)).rejects.toBe(error);

    expect(mockGetCurrentUser).toHaveBeenCalledTimes(1);
    expect(mockClearSession).toHaveBeenCalledTimes(1);
    expect(mockDispatch).toHaveBeenCalledTimes(1);
    expect(mockEmit).toHaveBeenCalledWith({ type: 'session-expired' });
  });

  it('on a 401 with a live session (/bff/me returns a user): does NOT clear the session or emit', async () => {
    mockGetCurrentUser.mockResolvedValue({ sub: 'user-1' });
    const axios = makeAxios();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- minimal axios stub
    registerSessionExpiryInterceptor(axios as any);

    const error = { response: { status: 401 }, config: {} };
    await expect(axios.handler?.(error)).rejects.toBe(error);

    expect(mockGetCurrentUser).toHaveBeenCalledTimes(1);
    expect(mockClearSession).not.toHaveBeenCalled();
    expect(mockEmit).not.toHaveBeenCalled();
  });

  it('on a 401 where the /bff/me probe itself throws: treats the session as ended', async () => {
    mockGetCurrentUser.mockRejectedValue(new Error('network down'));
    const axios = makeAxios();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- minimal axios stub
    registerSessionExpiryInterceptor(axios as any);

    const error = { response: { status: 401 }, config: {} };
    await expect(axios.handler?.(error)).rejects.toBe(error);

    expect(mockClearSession).toHaveBeenCalledTimes(1);
    expect(mockEmit).toHaveBeenCalledWith({ type: 'session-expired' });
  });

  it('on a non-401 (500): does NOT probe /bff/me, clear the session, or emit', async () => {
    const axios = makeAxios();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- minimal axios stub
    registerSessionExpiryInterceptor(axios as any);

    const error = { response: { status: 500 }, config: {} };
    await expect(axios.handler?.(error)).rejects.toBe(error);

    expect(mockGetCurrentUser).not.toHaveBeenCalled();
    expect(mockClearSession).not.toHaveBeenCalled();
    expect(mockEmit).not.toHaveBeenCalled();
  });

  it('on a 403: does NOT treat it as session end', async () => {
    const axios = makeAxios();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- minimal axios stub
    registerSessionExpiryInterceptor(axios as any);

    const error = { response: { status: 403 }, config: {} };
    await expect(axios.handler?.(error)).rejects.toBe(error);

    expect(mockGetCurrentUser).not.toHaveBeenCalled();
    expect(mockEmit).not.toHaveBeenCalled();
  });

  it('always rejects so the original error still surfaces to the caller', async () => {
    mockGetCurrentUser.mockResolvedValue(null);
    const axios = makeAxios();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- minimal axios stub
    registerSessionExpiryInterceptor(axios as any);

    const error = { response: { status: 401 } };
    await expect(axios.handler?.(error)).rejects.toBe(error);
  });
});
