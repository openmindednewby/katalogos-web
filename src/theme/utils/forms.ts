


/**
 * Dynamic form styles with theme support.
 * Uses useTheme() for per-tenant color customization.
 */
import { type TextStyle, type ViewStyle } from 'react-native';

import ThemeMode from '../../shared/enums/ThemeMode';
import { useTheme } from '../hooks/useTheme';

const WHITE_COLOR = '#fff';
const TRANSPARENT_COLOR = 'transparent';
const DARK_SELECTED_BACKGROUND_COLOR = '#073a2f';
const LIGHT_SELECTED_BACKGROUND_COLOR = '#e6f4ef';
const CHECKBOX_BORDER_COLOR = '#999';

export function useDynamicFormStyles(): FormStyles {
  const { theme, mode } = useTheme();
  const { colors, palette, semantic } = theme;
  const accentColor = palette.accent['500'];
  const errorColor = semantic.error['500'];

  const tokens: FormColorTokens = {
    background: colors.background,
    surface: colors.surface,
    text: colors.text,
    textSecondary: colors.textSecondary,
    border: colors.border,
    error: errorColor,
    accent: accentColor,
  };

  const config: StylesConfig = { tokens, themeMode: mode, accentColor };

  return {
    ...createContainerStyles(tokens),
    ...createInputStyles(tokens),
    ...createTextStyles(tokens),
    ...createButtonStyles(accentColor),
    ...createCheckboxStyles(tokens),
    ...createRadioStyles(config),
    ...createOptionStyles(config),
    ...createErrorStyles(errorColor),
  };
}

export interface FormStyles {
  container: ViewStyle;
  card: ViewStyle;
  questionTitle: TextStyle;
  input: ViewStyle & TextStyle;
  dropdown: ViewStyle;
  pickerItem: TextStyle;
  checkboxRow: ViewStyle;
  checkboxLabel: TextStyle;
  errorText: TextStyle;
  navButtons: ViewStyle;
  navButton: ViewStyle;
  navButtonText: TextStyle;
  progressText: TextStyle;
  title: TextStyle;
  subtitle: TextStyle;
  questionBlock: ViewStyle;
  questionHeaderRow: ViewStyle;
  optionRow: ViewStyle;
  optionRowSelected: ViewStyle;
  radioOuter: ViewStyle;
  radioInner: ViewStyle;
  checkboxBoxBasic: ViewStyle;
  checkboxBoxSelected: ViewStyle;
  errorBorder: ViewStyle;
  requiredMark: TextStyle;
  helpText: TextStyle;
  optionText: TextStyle;
}

/** Flattened color tokens resolved from the theme for form style builders. */
interface FormColorTokens {
  background: string;
  surface: string;
  text: string;
  textSecondary: string;
  border: string;
  error: string;
  accent: string;
}

interface StylesConfig {
  tokens: FormColorTokens;
  themeMode: ThemeMode;
  accentColor: string;
}

function createContainerStyles(tokens: FormColorTokens): Pick<FormStyles, 'container' | 'card' | 'questionBlock' | 'questionHeaderRow'> {
  return {
    container: { flex: 1, backgroundColor: tokens.background, padding: 16 },
    card: { backgroundColor: tokens.surface, borderRadius: 12, padding: 16, marginBottom: 24, borderWidth: 1, borderColor: tokens.border },
    questionBlock: { marginBottom: 20 },
    questionHeaderRow: { flexDirection: 'row', alignItems: 'center' },
  };
}

function createInputStyles(tokens: FormColorTokens): Pick<FormStyles, 'input' | 'dropdown' | 'pickerItem'> {
  return {
    input: { borderWidth: 1, borderColor: tokens.border, borderRadius: 10, paddingVertical: 10, paddingHorizontal: 12, fontSize: 16, color: tokens.text, backgroundColor: tokens.background },
    dropdown: { borderWidth: 1, borderColor: tokens.border, borderRadius: 10, marginTop: 6, backgroundColor: tokens.background, minHeight: 50, justifyContent: 'center', paddingHorizontal: 10 },
    pickerItem: { fontSize: 16, color: tokens.text },
  };
}

function createTextStyles(tokens: FormColorTokens): Pick<FormStyles, 'questionTitle' | 'title' | 'subtitle' | 'helpText' | 'progressText' | 'optionText'> {
  return {
    questionTitle: { fontSize: 18, color: tokens.text, marginBottom: 10, letterSpacing: 0.3 },
    title: { fontSize: 22, fontWeight: '700', color: tokens.text, marginBottom: 6 },
    subtitle: { fontSize: 14, color: tokens.textSecondary, marginBottom: 16 },
    helpText: { fontSize: 13, color: tokens.textSecondary, marginBottom: 6 },
    progressText: { textAlign: 'center', fontSize: 14, color: tokens.textSecondary, marginTop: 8 },
    optionText: { color: tokens.text, fontSize: 16 },
  };
}

function createButtonStyles(accentColor: string): Pick<FormStyles, 'navButtons' | 'navButton' | 'navButtonText'> {
  return {
    navButtons: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 20, marginBottom: 8, gap: 12 },
    navButton: { flex: 1, paddingVertical: 14, borderRadius: 10, alignItems: 'center', justifyContent: 'center', backgroundColor: accentColor },
    navButtonText: { color: WHITE_COLOR, fontSize: 16, fontWeight: '600' },
  };
}

function createCheckboxStyles(tokens: FormColorTokens): Pick<FormStyles, 'checkboxRow' | 'checkboxLabel' | 'checkboxBoxBasic' | 'checkboxBoxSelected'> {
  return {
    checkboxRow: { flexDirection: 'row', alignItems: 'center', marginVertical: 6 },
    checkboxLabel: { fontSize: 16, color: tokens.text, marginLeft: 12 },
    checkboxBoxBasic: { width: 18, height: 18, borderWidth: 2, borderColor: CHECKBOX_BORDER_COLOR, marginRight: 8, backgroundColor: TRANSPARENT_COLOR },
    checkboxBoxSelected: { borderColor: tokens.accent, backgroundColor: tokens.accent },
  };
}

function createRadioStyles(config: StylesConfig): Pick<FormStyles, 'radioOuter' | 'radioInner'> {
  return {
    radioOuter: { width: 18, height: 18, borderRadius: 9, borderWidth: 2, borderColor: config.tokens.textSecondary, alignItems: 'center', justifyContent: 'center', marginRight: 8 },
    radioInner: { width: 8, height: 8, borderRadius: 4, backgroundColor: config.accentColor },
  };
}

function createOptionStyles(config: StylesConfig): Pick<FormStyles, 'optionRow' | 'optionRowSelected'> {
  const selectedBackground = config.themeMode === ThemeMode.Dark ? DARK_SELECTED_BACKGROUND_COLOR : LIGHT_SELECTED_BACKGROUND_COLOR;
  return {
    optionRow: { paddingVertical: 10, paddingHorizontal: 12, borderRadius: 8, borderWidth: 1, borderColor: config.tokens.border, backgroundColor: TRANSPARENT_COLOR, flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
    optionRowSelected: { borderColor: config.accentColor, backgroundColor: selectedBackground },
  };
}

function createErrorStyles(errorColor: string): Pick<FormStyles, 'errorText' | 'requiredMark' | 'errorBorder'> {
  return {
    errorText: { color: errorColor, fontSize: 13, marginTop: 4 },
    requiredMark: { color: errorColor, fontSize: 18, fontWeight: '700' },
    errorBorder: { borderColor: errorColor },
  };
}
