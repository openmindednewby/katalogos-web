import { buildFormDataPayload, buildPayload, buildQueryParams, buildURL } from "./utils";

describe("http/utils", () => {
  it("buildURL replaces {idN} placeholders", () => {
    expect(buildURL("/tenants/{id1}/users/{id2}", ["t1", "u1"])).toBe("/tenants/t1/users/u1");
  });

  it("buildURL returns endpoint when urlIds are missing/empty", () => {
    expect(buildURL("/x")).toBe("/x");
    expect(buildURL("/x", [])).toBe("/x");
  });

  it("buildPayload merges payload and defaults", () => {
    expect(buildPayload({ a: 1 })).toEqual({ a: 1 });
  });

  it("buildQueryParams returns queryParameters merged with defaults", () => {
    expect(buildQueryParams({ q: "x" })).toEqual({ q: "x" });
  });

  it("buildFormDataPayload returns the same FormData instance", () => {
    const fd = new FormData();
    expect(buildFormDataPayload(fd)).toBe(fd);
  });
});
