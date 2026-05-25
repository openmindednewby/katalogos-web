describe("http/types", () => {
  it("module loads (types are compile-time only)", () => {
     
    expect(() => require("./types")).not.toThrow();
  });
});

