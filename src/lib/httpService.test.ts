describe("httpService", () => {
  it("re-exports core http modules", () => {
     
    const svc = require("./httpService");
    expect(typeof svc.get).toBe("function");
    expect(typeof svc.post).toBe("function");
    expect(typeof svc.put).toBe("function");
    expect(typeof svc.postForm).toBe("function");
    expect(typeof svc.deleteMethod).toBe("function");
    expect(typeof svc.getByEndpoint).toBe("function");
    expect(typeof svc.validateFile).toBe("function");
  });
});

