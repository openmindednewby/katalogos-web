import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

import ThemeMode from '../../shared/enums/ThemeMode';

interface UIState {
  theme: ThemeMode;
  locale: string;
}

const initialState: UIState = {
  theme: ThemeMode.Light,
  locale: 'en',
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setTheme(state, action: PayloadAction<ThemeMode>) {
      return { ...state, theme: action.payload };
    },
    toggleTheme(state) {
      return { ...state, theme: state.theme === ThemeMode.Light ? ThemeMode.Dark : ThemeMode.Light };
    },
    setLocale(state, action: PayloadAction<string>) {
      return { ...state, locale: action.payload };
    },
  },
});

export const { setTheme, toggleTheme, setLocale } = uiSlice.actions;
export default uiSlice.reducer;
