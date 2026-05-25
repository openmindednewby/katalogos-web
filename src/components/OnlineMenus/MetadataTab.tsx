/**
 * MetadataTab - Editor tab for menu name, description, theme, and global styling.
 */
import React from 'react';

import { StyleSheet, Text, TextInput, View } from 'react-native';

import { FM } from '@/localization/helpers';

import ScheduleEditor from './components/ScheduleEditor';
import FeaturedSectionSettings from './FeaturedSectionSettings';
import GlobalStylingControls from './GlobalStylingControls';
import ThemeSelector from './ThemeSelector';
import { TestIds } from '../../shared/testIds';
import { isValueDefined } from '../../utils/is';

import type { MenuTheme } from './ThemeSelector';
import type { MenuContents, MenuSchedule } from '../../types/menuTypes';

interface MetadataTabProps {
  name: string;
  setName: (name: string) => void;
  nameError: string;
  setNameError: (error: string) => void;
  description: string;
  setDescription: (description: string) => void;
  menuContents: MenuContents;
  setMenuContents: (contents: MenuContents) => void;
  onThemeSelect: (theme: MenuTheme) => void;
  textColor: string;
  borderColor: string;
  backgroundColor: string;
  errorColor: string;
  textSecondary: string;
  primaryColor?: string;
  textOnPrimary?: string;
  hasPremiumThemes?: boolean;
  onPremiumThemeBlocked?: () => void;
  schedule?: MenuSchedule | null;
  onSaveSchedule?: (schedule: MenuSchedule) => void;
  onRemoveSchedule?: () => void;
  isScheduleSaving?: boolean;
}

const styles = StyleSheet.create({
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    marginTop: 16,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  errorText: {
    fontSize: 12,
    marginTop: 4,
  },
});

const MetadataTab: React.FC<MetadataTabProps> = ({
  name,
  setName,
  nameError,
  setNameError,
  description,
  setDescription,
  menuContents,
  setMenuContents,
  onThemeSelect,
  textColor,
  borderColor,
  backgroundColor,
  errorColor,
  textSecondary,
  primaryColor,
  textOnPrimary,
  hasPremiumThemes,
  onPremiumThemeBlocked,
  schedule,
  onSaveSchedule,
  onRemoveSchedule,
  isScheduleSaving,
}) => {
  return (
    <View>
      {/* Menu Name */}
      <Text style={[styles.label, { color: textColor }]}>
        {FM('onlineMenus.nameLabel')} *
      </Text>
      <TextInput
        accessibilityHint={FM('onlineMenus.menuNameHint')}
        accessibilityLabel={FM('onlineMenus.menuNameLabel')}
        placeholder={FM('onlineMenus.namePlaceholder')}
        placeholderTextColor={textSecondary}
        style={[styles.input, { borderColor, color: textColor, backgroundColor }]}
        testID={TestIds.MENU_EDITOR_NAME_INPUT}
        value={name}
        onChangeText={(text) => {
          setName(text);
          if (nameError !== '') setNameError('');
        }}
      />
      {nameError !== '' ? (
        <Text style={[styles.errorText, { color: errorColor }]}>{nameError}</Text>
      ) : null}

      {/* Menu Description */}
      <Text style={[styles.label, { color: textColor }]}>
        {FM('onlineMenus.descriptionLabel')}
      </Text>
      <TextInput
        multiline
        accessibilityHint={FM('onlineMenus.menuDescriptionHint')}
        accessibilityLabel={FM('onlineMenus.menuDescriptionLabel')}
        numberOfLines={4}
        placeholder={FM('onlineMenus.descriptionPlaceholder')}
        placeholderTextColor={textSecondary}
        style={[styles.input, styles.textArea, { borderColor, color: textColor, backgroundColor }]}
        testID={TestIds.MENU_EDITOR_DESCRIPTION_INPUT}
        value={description}
        onChangeText={setDescription}
      />

      {/* Theme Selector */}
      <ThemeSelector
        hasPremiumThemes={hasPremiumThemes}
        onPremiumThemeBlocked={onPremiumThemeBlocked}
        onSelectTheme={onThemeSelect}
      />

      {/* Global Styling Controls */}
      <GlobalStylingControls
        backgroundColor={menuContents.backgroundColor}
        textColor={menuContents.textColor}
        titleFontSize={menuContents.titleFontSize}
        onBackgroundColorChange={(color) => {
          setMenuContents({ ...menuContents, backgroundColor: color });
        }}
        onTextColorChange={(color) => {
          setMenuContents({ ...menuContents, textColor: color });
        }}
        onTitleFontSizeChange={(size) => {
          setMenuContents({ ...menuContents, titleFontSize: size });
        }}
      />

      {/* Featured Section Settings */}
      <FeaturedSectionSettings
        borderColor={borderColor}
        menuContents={menuContents}
        surfaceColor={backgroundColor}
        textColor={textColor}
        onUpdate={setMenuContents}
      />

      {/* Menu Schedule */}
      {isValueDefined(onSaveSchedule) && isValueDefined(onRemoveSchedule) && (
        <ScheduleEditor
          backgroundColor={backgroundColor}
          borderColor={borderColor}
          errorColor={errorColor}
          isSaving={isScheduleSaving}
          primaryColor={primaryColor}
          schedule={schedule}
          textColor={textColor}
          textOnPrimary={textOnPrimary}
          textSecondary={textSecondary}
          onRemove={onRemoveSchedule}
          onSave={onSaveSchedule}
        />
      )}
    </View>
  );
};

export default MetadataTab;
