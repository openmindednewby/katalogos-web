/** Mock FM to return the translation key as-is, so error messages contain the key */
const mockFM = jest.fn((key: string) => key);

describe("http/validation", () => {
  afterEach(() => {
    jest.resetModules();
  });

  function setupMocks(): { validateFile: (file: { name?: string; size?: number; type?: string }, max?: number, allowed?: readonly string[]) => { valid: boolean; error?: string } } {
    jest.doMock("../../../utils/logger", () => ({
      logger: { warn: jest.fn(), info: jest.fn(), debug: jest.fn(), error: jest.fn() },
    }));
    jest.doMock("../../../localization/helpers", () => ({
      FM: mockFM,
    }));
     
    return require("./validation");
  }

  it("rejects empty files", () => {
    const { validateFile } = setupMocks();

    const res = validateFile({ name: "a.txt", size: 0, type: "text/plain" }, 10, ["text/plain"]);
    expect(res.valid).toBe(false);
    expect(res.error).toContain("a.txt");
  });

  it("rejects files larger than max size", () => {
    const { validateFile } = setupMocks();

    const res = validateFile({ name: "a.txt", size: 1024, type: "text/plain" }, 10, ["text/plain"]);
    expect(res.valid).toBe(false);
    expect(res.error).toContain("a.txt");
  });

  it("rejects invalid file types", () => {
    const { validateFile } = setupMocks();

    const res = validateFile({ name: "a.txt", size: 10, type: "text/plain" }, 100, ["image/png"]);
    expect(res.valid).toBe(false);
    expect(res.error).toContain("text/plain");
  });

  it("accepts valid files", () => {
    const { validateFile } = setupMocks();

    expect(validateFile({ name: "a.png", size: 10, type: "image/png" }, 100, ["image/png"])).toEqual({ valid: true });
  });
});

