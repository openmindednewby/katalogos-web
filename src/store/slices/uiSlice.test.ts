import reducer, { setLocale, setTheme, toggleTheme } from "./uiSlice";
import ThemeMode from '../../shared/enums/ThemeMode';

describe("uiSlice", () => {
  it("returns initial state", () => {
    expect(reducer(undefined, { type: "unknown" })).toEqual({
      theme: "light",
      locale: "en",
    });
  });

  it("setTheme sets theme", () => {
    const state = reducer(undefined, setTheme(ThemeMode.Dark));
    expect(state.theme).toBe("dark");
  });

  it("toggleTheme toggles light -> dark -> light", () => {
    const darkState = reducer({ theme: ThemeMode.Light, locale: "en" }, toggleTheme());
    expect(darkState.theme).toBe("dark");

    const lightState = reducer(darkState, toggleTheme());
    expect(lightState.theme).toBe("light");
  });

  it("setLocale sets locale", () => {
    const state = reducer(undefined, setLocale("el"));
    expect(state.locale).toBe("el");
  });
});

