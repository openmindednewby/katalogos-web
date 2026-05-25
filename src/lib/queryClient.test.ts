import { QUERY_CACHE, invalidateQueries, queryClient, queryKeys, shouldRetryQuery } from "./queryClient";

describe("queryClient", () => {
  it("queryKeys factories generate stable keys", () => {
    expect(queryKeys.tenants.all).toEqual(["tenants"]);
    expect(queryKeys.tenants.list()).toEqual(["tenants", "list"]);
    expect(queryKeys.tenants.detail("1")).toEqual(["tenants", "detail", "1"]);
    expect(queryKeys.users.byTenant("t1")).toEqual(["users", "tenant", "t1"]);
    expect(queryKeys.questioners.completed()).toEqual(["questioners", "completed"]);
  });

  it("creates a QueryClient with expected defaults", () => {
    const defaults = queryClient.getDefaultOptions();
    const queries = defaults.queries;
    expect(queries?.staleTime).toBe(QUERY_CACHE.STALE_TIME_MS);
    expect(queries?.gcTime).toBe(QUERY_CACHE.GC_TIME_MS);
    expect(queries?.refetchOnWindowFocus).toBe(false);
    expect(queries?.refetchOnReconnect).toBe(true);
  });

  it("invalidateQueries delegates to queryClient.invalidateQueries", async () => {
    const spy = jest.spyOn(queryClient, "invalidateQueries").mockResolvedValueOnce(undefined);
    const key = queryKeys.tenants.all;
    await invalidateQueries(key);
    expect(spy).toHaveBeenCalledWith({ queryKey: key });
  });
});

describe("shouldRetryQuery", () => {
  it("does not retry on 400 Bad Request", () => {
    const error = { status: 400 };
    expect(shouldRetryQuery(0, error)).toBe(false);
  });

  it("does not retry on 401 Unauthorized", () => {
    const error = { status: 401 };
    expect(shouldRetryQuery(0, error)).toBe(false);
  });

  it("does not retry on 403 Forbidden", () => {
    const error = { status: 403 };
    expect(shouldRetryQuery(0, error)).toBe(false);
  });

  it("does not retry on 404 Not Found", () => {
    const error = { status: 404 };
    expect(shouldRetryQuery(0, error)).toBe(false);
  });

  it("does not retry on 422 Unprocessable Entity", () => {
    const error = { status: 422 };
    expect(shouldRetryQuery(0, error)).toBe(false);
  });

  it("retries once on 500 Internal Server Error", () => {
    const error = { status: 500 };
    expect(shouldRetryQuery(0, error)).toBe(true);
    expect(shouldRetryQuery(1, error)).toBe(false);
  });

  it("retries once on network error (status 0)", () => {
    const error = { status: 0 };
    expect(shouldRetryQuery(0, error)).toBe(true);
    expect(shouldRetryQuery(1, error)).toBe(false);
  });

  it("extracts status from response property", () => {
    const error = { response: { status: 401 } };
    expect(shouldRetryQuery(0, error)).toBe(false);
  });

  it("retries when error has no status (network failure)", () => {
    const error = new Error("Network Error");
    expect(shouldRetryQuery(0, error)).toBe(true);
  });

  it("does not retry when failureCount exceeds max", () => {
    const error = { status: 503 };
    expect(shouldRetryQuery(0, error)).toBe(true);
    expect(shouldRetryQuery(1, error)).toBe(false);
  });

  it("handles null and undefined errors", () => {
    expect(shouldRetryQuery(0, null)).toBe(true);
    expect(shouldRetryQuery(0, undefined)).toBe(true);
  });
});
