/**
 * Translation management panel for the menu editor.
 * Shows translation status for all supported languages and provides actions.
 */
import React, { useCallback, useMemo } from 'react';

import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { useSelector } from 'react-redux';

import { FM } from '@/localization/helpers';
import ThemeMode from '@/shared/enums/ThemeMode';
import { TestIds } from '@/shared/testIds';
import type { RootState } from '@/store/reduxStore';
import { themePalette } from '@/theme/utils/styles';

import { TranslationStatusRow } from './components/TranslationStatusRow';
import { useMenuTranslations } from './hooks/useMenuTranslations';
import { SUPPORTED_LANGUAGES } from './utils/supportedLanguages';
import TranslationStatus from '../../../shared/enums/TranslationStatus';

import type { MenuTranslationSummary } from '../../../types/menuTypes';

const EMPTY_STATE_PADDING = 32;

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  title: { fontSize: 18, fontWeight: '700' },
  translateAllButton: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 8 },
  translateAllText: { fontSize: 14, fontWeight: '600' },
  emptyState: { alignItems: 'center', justifyContent: 'center', padding: EMPTY_STATE_PADDING },
  emptyText: { fontSize: 15, textAlign: 'center' },
  loadingContainer: { alignItems: 'center', justifyContent: 'center', padding: EMPTY_STATE_PADDING },
  loadingText: { marginTop: 8, fontSize: 14 },
});

interface Props {
  menuExternalId: string | undefined;
}

/** Merges API translations with supported languages to show all rows. */
function buildLanguageRows(translations: MenuTranslationSummary[]): MenuTranslationSummary[] {
  const translationMap = new Map(translations.map((t) => [t.languageCode, t]));

  return SUPPORTED_LANGUAGES
    .filter((lang) => lang.code !== 'en')
    .map((lang) => translationMap.get(lang.code) ?? {
      externalId: '',
      languageCode: lang.code,
      languageName: lang.name,
      status: TranslationStatus.Pending,
      isStale: false,
      lastUpdatedDate: '',
    });
}

export const TranslationManager: React.FC<Props> = ({ menuExternalId }) => {
  const themeMode = useSelector((s: RootState) => s.ui.theme);
  const colors = themeMode === ThemeMode.Dark ? themePalette.dark : themePalette.light;
  const textColor = String(colors.text);
  const borderColor = String(colors.border);
  const primaryColor = String(colors.primary);
  const textSecondary = String(colors.textSecondary);
  const textOnPrimary = String(colors.textOnPrimary);

  const { translations, isLoading, translateMenu, isTranslating, deleteTranslation } = useMenuTranslations(menuExternalId);

  const languageRows = useMemo(() => buildLanguageRows(translations), [translations]);

  const handleTranslateAll = useCallback(() => {
    const codes = SUPPORTED_LANGUAGES.filter((l) => l.code !== 'en').map((l) => l.code);
    translateMenu(codes);
  }, [translateMenu]);

  const handleEdit = useCallback((_languageCode: string) => {
    // TODO: build an inline edit modal when the backend is ready (the unused
    // TranslationEditModal stub was removed as dead code; recover from git history if useful)
  }, []);

  const handleDelete = useCallback((languageCode: string) => {
    deleteTranslation(languageCode);
  }, [deleteTranslation]);

  const handleRetranslate = useCallback((languageCode: string) => {
    translateMenu([languageCode]);
  }, [translateMenu]);

  if (isLoading) 
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator color={primaryColor} size="large" />
        <Text style={[styles.loadingText, { color: textSecondary }]}>{FM('loading')}</Text>
      </View>
    );
  

  if (isTranslating) 
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator color={primaryColor} size="large" />
        <Text style={[styles.loadingText, { color: textSecondary }]}>{FM('translations.translating')}</Text>
      </View>
    );
  

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: textColor }]}>{FM('translations.tabTitle')}</Text>
        <TouchableOpacity
          accessibilityHint={FM('translations.translateAllHint')}
          accessibilityLabel={FM('translations.translateAll')}
          style={[styles.translateAllButton, { backgroundColor: primaryColor }]}
          testID={TestIds.TRANSLATE_ALL_BUTTON}
          onPress={handleTranslateAll}
        >
          <Text style={[styles.translateAllText, { color: textOnPrimary }]}>{FM('translations.translateAll')}</Text>
        </TouchableOpacity>
      </View>

      {languageRows.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={[styles.emptyText, { color: textSecondary }]}>{FM('translations.noTranslations')}</Text>
        </View>
      ) : (
        languageRows.map((row) => (
          <TranslationStatusRow
            key={row.languageCode}
            borderColor={borderColor}
            primaryColor={primaryColor}
            textColor={textColor}
            translation={row}
            onDelete={handleDelete}
            onEdit={handleEdit}
            onRetranslate={handleRetranslate}
          />
        ))
      )}
    </View>
  );
};
