import { addListener, notify, notifySignOut, notifySuccess } from "./notifications";

describe("notifications", () => {
  it("notifies listeners and supports unsubscribe", () => {
    const listener = jest.fn();
    const unsubscribe = addListener(listener);

    notify("custom", { a: 1 });
    expect(listener).toHaveBeenCalledWith("custom", { a: 1 });

    unsubscribe();
    notify("custom", { a: 2 });
    expect(listener).toHaveBeenCalledTimes(1);
  });

  it("ignores listener errors", () => {
    const ok = jest.fn();
    const bad = jest.fn(() => {
      throw new Error("boom");
    });
    const unsubOk = addListener(ok);
    const unsubBad = addListener(bad);

    expect(() => notify("e1", { x: 1 })).not.toThrow();
    expect(ok).toHaveBeenCalledWith("e1", { x: 1 });

    unsubOk();
    unsubBad();
  });

  it("notifySignOut and notifySuccess publish expected events", () => {
    const listener = jest.fn();
    const unsubscribe = addListener(listener);

    notifySignOut("bye");
    notifySuccess("ok");

    expect(listener).toHaveBeenCalledWith("signout", { message: "bye" });
    expect(listener).toHaveBeenCalledWith("success", { message: "ok" });

    unsubscribe();
  });
});

