/**
 * Unit tests for the CSRF request interceptor. Focus is on the logic: which
 * methods get the `X-BFF-Csrf` header and which are left alone.
 */
import { attachCsrfHeader } from './csrfInterceptor';

import type { InternalAxiosRequestConfig } from 'axios';

interface HeaderBag {
  set: jest.Mock;
}

function makeConfig(method: string | undefined): { config: InternalAxiosRequestConfig; headers: HeaderBag } {
  const headers: HeaderBag = { set: jest.fn() };
  // The interceptor only touches `method` and `headers.set` — a minimal stub
  // is enough and avoids constructing a full AxiosHeaders instance.
  const config = { method, headers } as unknown as InternalAxiosRequestConfig;
  return { config, headers };
}

describe('attachCsrfHeader', () => {
  it('adds X-BFF-Csrf: 1 to a POST', () => {
    const { config, headers } = makeConfig('post');
    attachCsrfHeader(config);
    expect(headers.set).toHaveBeenCalledWith('X-BFF-Csrf', '1');
  });

  it('adds the header to PUT, PATCH and DELETE', () => {
    for (const method of ['put', 'patch', 'delete']) {
      const { config, headers } = makeConfig(method);
      attachCsrfHeader(config);
      expect(headers.set).toHaveBeenCalledWith('X-BFF-Csrf', '1');
    }
  });

  it('is case-insensitive on the method', () => {
    const { config, headers } = makeConfig('POST');
    attachCsrfHeader(config);
    expect(headers.set).toHaveBeenCalledWith('X-BFF-Csrf', '1');
  });

  it('does NOT add the header to a GET', () => {
    const { config, headers } = makeConfig('get');
    attachCsrfHeader(config);
    expect(headers.set).not.toHaveBeenCalled();
  });

  it('does NOT add the header to a HEAD request', () => {
    const { config, headers } = makeConfig('head');
    attachCsrfHeader(config);
    expect(headers.set).not.toHaveBeenCalled();
  });

  it('does NOT add the header when the method is undefined', () => {
    const { config, headers } = makeConfig(undefined);
    attachCsrfHeader(config);
    expect(headers.set).not.toHaveBeenCalled();
  });

  it('returns the same config object it was given', () => {
    const { config } = makeConfig('post');
    expect(attachCsrfHeader(config)).toBe(config);
  });
});
