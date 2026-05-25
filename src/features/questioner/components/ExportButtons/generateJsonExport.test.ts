import { type CompletedQuestionerWithUser } from '@/server/customHooks/useCompletedQuestionersWithUsers';

jest.mock("react-native", () => ({
  Platform: { OS: "web" },
}));

describe("generateJsonExport", () => {
  let restoreUrl: (() => void) | undefined;

  async function blobToText(blob: Blob): Promise<string> {
    if (typeof blob.text === 'function') return await blob.text();
    return await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result ?? ""));
      reader.onerror = () => reject(reader.error instanceof Error ? reader.error : new Error('FileReader error'));
      reader.readAsText(blob);
    });
  }

  function setupDomSpies(): {
    clickSpy: jest.Mock;
    createObjectURLSpy: jest.Mock;
    revokeObjectURLSpy: jest.Mock;
  } {
    const clickSpy = jest.fn<undefined, []>();

    const originalCreateElement = document.createElement.bind(document);
    jest.spyOn(document, "createElement").mockImplementation((tagName: string) => {
      const el = originalCreateElement(tagName);
      if (String(tagName).toLowerCase() === 'a') {
        const anchor = el as HTMLAnchorElement;
        anchor.click = clickSpy as unknown as () => void;
      }
      return el;
    });

    const originalURL = globalThis.URL;
    const createObjectURLSpy = jest.fn((): string => 'blob:mock-url');
    const revokeObjectURLSpy = jest.fn();
    const baseURL = originalURL;
    Object.defineProperty(globalThis, "URL", {
      value: {
        ...baseURL,
        createObjectURL: createObjectURLSpy,
        revokeObjectURL: revokeObjectURLSpy,
      },
      configurable: true,
    });
    restoreUrl = () => {
      Object.defineProperty(globalThis, "URL", { value: originalURL, configurable: true });
    };

    return { clickSpy, createObjectURLSpy, revokeObjectURLSpy };
  }

  afterEach(() => {
    jest.restoreAllMocks();
    restoreUrl?.();
    restoreUrl = undefined;
  });

  it("should download sanitized JSON (removes contentsJson recursively)", async () => {
    const { clickSpy, createObjectURLSpy, revokeObjectURLSpy } = setupDomSpies();

    const { generateJsonExport } = require("./generateJsonExport") as { generateJsonExport: (p: CompletedQuestionerWithUser[]) => void };

    const payload: CompletedQuestionerWithUser[] = [
      {
        id: "r1",
        contentsJson: "{shouldBeRemoved}",
        nested: { contentsJson: "remove", keep: "yes" },
        arr: [{ contentsJson: "remove" }, { ok: true }],
      },
    ];

    generateJsonExport(payload);

    expect(createObjectURLSpy).toHaveBeenCalledTimes(1);
    expect(clickSpy).toHaveBeenCalledTimes(1);
    expect(revokeObjectURLSpy).toHaveBeenCalledWith("blob:mock-url");

    const blob = createObjectURLSpy.mock.calls[0]?.[0] as Blob;
    const text = await blobToText(blob);
    const parsed = JSON.parse(text) as unknown;

    expect(parsed).toEqual([
      {
        id: "r1",
        nested: { keep: "yes" },
        arr: [{}, { ok: true }],
      },
    ]);
    expect(text).not.toContain("contentsJson");
  });

  it("should export an empty array payload", async () => {
    const { clickSpy, createObjectURLSpy } = setupDomSpies();

    const { generateJsonExport } = require("./generateJsonExport") as { generateJsonExport: (p: CompletedQuestionerWithUser[]) => void };

    generateJsonExport([]);

    expect(createObjectURLSpy).toHaveBeenCalledTimes(1);
    expect(clickSpy).toHaveBeenCalledTimes(1);

    const blob = createObjectURLSpy.mock.calls[0]?.[0] as Blob;
    const text = await blobToText(blob);
    expect(text).toBe("[]");
  });

  it("should log fallback on non-web platforms", async () => {
    jest.resetModules();
    jest.doMock("react-native", () => ({
      Platform: { OS: "ios" },
    }));


    const { logger } = require("@/utils/logger") as { logger: { info: (...args: unknown[]) => void } };
    const infoSpy = jest.spyOn(logger, "info").mockImplementation(() => {});

    const { generateJsonExport } = require("./generateJsonExport") as { generateJsonExport: (p: CompletedQuestionerWithUser[]) => void };

    generateJsonExport([{ externalId: "r1" }]);

    expect(infoSpy).toHaveBeenCalled();
    expect(infoSpy.mock.calls[0]?.[0]).toBe("generateJsonExport");
  });
});
