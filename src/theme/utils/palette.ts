


/**
 * Theme color palette definitions.
 * Centralizes all color values for light and dark themes.
 */
import env from '../../config/environment';

// Brand override flag: prefer app config (environment.ts), fall back to process.env for web builds.
const isTagHeuerVariant = (env.EXPO_PUBLIC_IS_TAG_HEURE_QUIZZ_FILLER === true)
  || (((process.env.EXPO_PUBLIC_IS_TAG_HEURE_QUIZZ_FILLER ?? process.env.IS_TAG_HEURE_QUIZZ_FILLER) ?? 'false') === 'true');

const basePalette = {
  light: {
    richBlack: '#001219',
    midnightGreen: '#005f73',
    darkCyan: '#0a9396',
    tiffanyBlue: '#94d2bd',
    vanilla: '#e9d8a6',
    gamboge: '#ee9b00',
    alloyOrange: '#ca6702',
    rust: '#bb3e03',
    rufous: '#ae2012',
    auburn: '#9b2226',
    background: '#ffffff',
    surface: '#f7f7f7',
    border: '#e6e6e6',
    primary: '#005f73',
    secondary: '#94d2bd',
    accent: '#008d5c',
    success: '#0a9396',
    error: '#ae2012',
    text: '#001219',
    subtext: '#555555',
    textSecondary: '#717171',
    muted: '#f0e9c9',
    textOnPrimary: '#ffffff',
  },
  dark: {
    richBlack: '#001219',
    midnightGreen: '#005f73',
    darkCyan: '#0a9396',
    tiffanyBlue: '#94d2bd',
    vanilla: '#e9d8a6',
    gamboge: '#ee9b00',
    alloyOrange: '#ca6702',
    rust: '#bb3e03',
    rufous: '#ae2012',
    auburn: '#9b2226',
    background: '#001219',
    surface: '#052f33',
    border: '#053f40',
    primary: '#94d2bd',
    secondary: '#008d5c',
    accent: '#008d5c',
    success: '#0a9396',
    error: '#ae2012',
    text: '#e9d8a6',
    subtext: '#c8c0a6',
    textSecondary: '#a8a090',
    muted: '#073233',
    textOnPrimary: '#001219',
  },
} as const;

// Tag Heuer variant uses green (#008d5c) and red (#ed1b2f) as primary accents
const tagHeuerPalette = {
  light: {
    richBlack: '#001219',
    midnightGreen: '#005f73',
    darkCyan: '#0a9396',
    tiffanyBlue: '#94d2bd',
    vanilla: '#e9d8a6',
    gamboge: '#ee9b00',
    alloyOrange: '#ca6702',
    rust: '#bb3e03',
    rufous: '#ae2012',
    auburn: '#9b2226',
    background: '#ffffff',
    surface: '#f7f7f7',
    border: '#e6e6e6',
    primary: '#008d5c',
    secondary: '#ed1b2f',
    accent: '#008d5c',
    success: '#008d5c',
    error: '#ed1b2f',
    text: '#001219',
    subtext: '#4b4b4b',
    textSecondary: '#717171',
    muted: '#eaf7f0',
    textOnPrimary: '#ffffff',
  },
  dark: {
    richBlack: '#001219',
    midnightGreen: '#005f73',
    darkCyan: '#0a9396',
    tiffanyBlue: '#94d2bd',
    vanilla: '#e9d8a6',
    gamboge: '#ee9b00',
    alloyOrange: '#ca6702',
    rust: '#bb3e03',
    rufous: '#ae2012',
    auburn: '#9b2226',
    background: '#0b1414',
    surface: '#0f1d1b',
    border: '#14433a',
    primary: '#94d2bd',
    secondary: '#ed1b2f',
    accent: '#008d5c',
    success: '#0aa378',
    error: '#ff3b3b',
    text: '#e9f2ef',
    subtext: '#b7c8c3',
    textSecondary: '#a8b8b3',
    muted: '#0f2b26',
    textOnPrimary: '#001219',
  },
} as const;

export const themePalette = isTagHeuerVariant ? tagHeuerPalette : basePalette;

export { default as ThemeMode } from '../../shared/enums/ThemeMode';
export type ThemeColors = typeof basePalette.light | typeof tagHeuerPalette.light | typeof basePalette.dark | typeof tagHeuerPalette.dark;
