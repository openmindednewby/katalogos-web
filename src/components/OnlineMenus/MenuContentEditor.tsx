import React, { useCallback, useMemo, useState } from 'react';

import { ScrollView, Text, TouchableOpacity, View } from 'react-native';

import { useSelector } from 'react-redux';

import { FM } from '@/localization/helpers';

import { AiImportModal } from './AiImport';
import CategoryEditor from './CategoryEditor';
import BulkActionBar from './components/BulkActionBar';
import ImportActionButtons from './components/ImportActionButtons';
import { useBulkActions } from './hooks/useBulkActions';
import { useBulkSelection } from './hooks/useBulkSelection';
import { useMenuHandlers } from './hooks/useMenuHandlers';
import { LocationSelector, useLocationOverrides } from './LocationOverrides';
import { contentEditorStyles as styles } from './menuContentEditorStyles';
import { ExportMenuButton } from './MenuExport';
import { ImportMenuModal } from './MenuImport';
import ThemeMode from '../../shared/enums/ThemeMode';
import { TestIds } from '../../shared/testIds';
import { themePalette } from '../../theme/utils/styles';
import { isValueDefined } from '../../utils/is';

import type { LocationDto, OverrideContextProps } from './LocationOverrides';
import type { RootState } from '../../store/reduxStore';
import type { MenuContents } from '../../types/menuTypes';

const FALLBACK_BORDER = themePalette.light.border;
const FALLBACK_SECONDARY = themePalette.light.textSecondary;

interface MenuContentEditorProps {
  contents: MenuContents | null | undefined;
  onChange: (contents: MenuContents) => void;
  menuExternalId?: string;
  onCategoryFocus?: (id: string | null) => void;
  collapseAllRef?: React.MutableRefObject<(() => void) | null>;
  locations?: LocationDto[];
}

const MenuContentEditor: React.FC<MenuContentEditorProps> = ({ contents, onChange, menuExternalId, onCategoryFocus, collapseAllRef, locations }) => {
  const theme = useSelector((s: RootState) => s.ui.theme);
  const colors = theme === ThemeMode.Dark ? themePalette.dark : themePalette.light;
  const [isImportModalVisible, setIsImportModalVisible] = useState(false);
  const [isAiImportModalVisible, setIsAiImportModalVisible] = useState(false);
  const overrideParams = useMemo(() => ({ menuExternalId }), [menuExternalId]);
  const overrideState = useLocationOverrides(overrideParams);
  const hasLocations = isValueDefined(locations) && locations.length > 0;

  const currentContents: MenuContents = useMemo(() => contents ?? { categories: [] }, [contents]);
  const handlerParams = useMemo(() => ({ currentContents, onChange, onCategoryFocus }), [currentContents, onChange, onCategoryFocus]);

  const {
    expandedCategories, handleAddCategory, handleUpdateCategory, handleDeleteCategory,
    handleMoveCategoryUp, handleMoveCategoryDown, handleAddItem, handleUpdateItem,
    handleDeleteItem, handleMoveItemUp, handleMoveItemDown, toggleCategory, collapseAll,
  } = useMenuHandlers(handlerParams);

  React.useEffect(() => {
    if (!isValueDefined(collapseAllRef)) return;
    const mutableRef = collapseAllRef;
    // eslint-disable-next-line react-compiler/react-compiler -- MutableRefObject.current is designed for mutation
    mutableRef.current = collapseAll;
  }, [collapseAllRef, collapseAll]);

  const {
    isSelectionMode, selectedItemIds, selectedCount, enterSelectionMode,
    exitSelectionMode, toggleItem, selectAllInCategory, isSelected,
  } = useBulkSelection();

  const bulkActionsParams = useMemo(
    () => ({ currentContents, onChange, selectedItemIds, exitSelectionMode }),
    [currentContents, onChange, selectedItemIds, exitSelectionMode],
  );
  const { bulkDelete, bulkMove, bulkSetAvailability, bulkPriceAdjust } = useBulkActions(bulkActionsParams);

  const handleOpenImport = useCallback(() => { setIsImportModalVisible(true); }, []);
  const handleCloseImport = useCallback(() => { setIsImportModalVisible(false); }, []);
  const handleImportComplete = useCallback((imported: MenuContents) => { onChange(imported); }, [onChange]);
  const handleOpenAiImport = useCallback(() => { setIsAiImportModalVisible(true); }, []);
  const handleCloseAiImport = useCallback(() => { setIsAiImportModalVisible(false); }, []);

  const overrideContext: OverrideContextProps = useMemo(() => ({
    getOverride: overrideState.getOverride,
    setOverride: overrideState.setOverride,
    clearOverride: overrideState.clearOverride,
    hasOverride: overrideState.hasOverride,
  }), [overrideState.getOverride, overrideState.setOverride, overrideState.clearOverride, overrideState.hasOverride]);

  const borderColor = String(colors.border) !== '' ? String(colors.border) : FALLBACK_BORDER;
  const textColor = String(colors.text);
  const backgroundColor = String(colors.surface);
  const primaryColor = String(colors.primary);
  const textOnPrimary = String(colors.textOnPrimary);
  const errorColor = String(colors.error);
  const secondaryColor = String(colors.textSecondary) !== '' ? String(colors.textSecondary) : FALLBACK_SECONDARY;
  const totalCategories = currentContents.categories?.length ?? 0;

  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: textColor }]}>{FM('onlineMenus.categories')}</Text>

        {hasLocations ? (
          <LocationSelector
            backgroundColor={backgroundColor}
            borderColor={borderColor}
            locations={locations}
            primaryColor={primaryColor}
            selectedLocationId={overrideState.selectedLocationId}
            textColor={textColor}
            textOnPrimary={textOnPrimary}
            onSelectLocation={overrideState.setSelectedLocationId}
          />
        ) : null}

        {currentContents.categories?.map((category, categoryIndex) => (
          <CategoryEditor
            key={category.id ?? `cat-${categoryIndex}`}
            backgroundColor={backgroundColor}
            borderColor={borderColor}
            category={category}
            categoryIndex={categoryIndex}
            errorColor={errorColor}
            isExpanded={expandedCategories.has(category.id ?? `cat-${categoryIndex}`)}
            isSelected={isSelected}
            isSelectionMode={isSelectionMode}
            menuExternalId={menuExternalId}
            overrideContext={isValueDefined(overrideState.selectedLocationId) ? overrideContext : undefined}
            primaryColor={primaryColor}
            secondaryColor={secondaryColor}
            textColor={textColor}
            textOnPrimary={textOnPrimary}
            totalCategories={totalCategories}
            onAddItem={() => { handleAddItem(categoryIndex); }}
            onDeleteCategory={() => { handleDeleteCategory(categoryIndex); }}
            onDeleteItem={(itemIndex) => { handleDeleteItem(categoryIndex, itemIndex); }}
            onMoveCategoryDown={() => { handleMoveCategoryDown(categoryIndex); }}
            onMoveCategoryUp={() => { handleMoveCategoryUp(categoryIndex); }}
            onMoveItemDown={(itemIndex) => { handleMoveItemDown(categoryIndex, itemIndex); }}
            onMoveItemUp={(itemIndex) => { handleMoveItemUp(categoryIndex, itemIndex); }}
            onSelectAllInCategory={() => { selectAllInCategory(categoryIndex, currentContents); }}
            onToggle={() => { toggleCategory(category.id ?? `cat-${categoryIndex}`); }}
            onToggleSelectItem={toggleItem}
            onUpdateCategory={(updates) => { handleUpdateCategory(categoryIndex, updates); }}
            onUpdateItem={(itemIndex, updates) => { handleUpdateItem(categoryIndex, itemIndex, updates); }}
          />
        ))}

        {isSelectionMode ? null : (
          <TouchableOpacity
            accessibilityHint={FM('onlineMenus.bulkActions.selectItemsHint')}
            accessibilityLabel={FM('onlineMenus.bulkActions.selectItems')}
            accessibilityRole="button"
            style={[styles.button, { backgroundColor: borderColor }]}
            testID={TestIds.BULK_SELECT_BUTTON}
            onPress={enterSelectionMode}
          >
            <Text style={[styles.buttonText, { color: textColor }]}>{FM('onlineMenus.bulkActions.selectItems')}</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          accessibilityHint={FM('onlineMenus.addCategoryHint')}
          accessibilityLabel={FM('onlineMenus.addCategory')}
          accessibilityRole="button"
          style={[styles.button, { backgroundColor: primaryColor }]}
          testID={TestIds.CATEGORY_ADD_BUTTON}
          onPress={handleAddCategory}
        >
          <Text style={[styles.buttonText, { color: textOnPrimary }]}>{FM('onlineMenus.addCategory')}</Text>
        </TouchableOpacity>

        <ImportActionButtons primaryColor={primaryColor} textOnPrimary={textOnPrimary} onOpenAiImport={handleOpenAiImport} onOpenCsvImport={handleOpenImport} />

        <ExportMenuButton
          borderColor={borderColor}
          contents={currentContents}
          primaryColor={primaryColor}
          textColor={textColor}
          textOnPrimary={textOnPrimary}
        />
      </View>

      {isSelectionMode ? (
        <BulkActionBar
          backgroundColor={backgroundColor}
          borderColor={borderColor}
          categories={currentContents.categories ?? []}
          errorColor={errorColor}
          primaryColor={primaryColor}
          selectedCount={selectedCount}
          textColor={textColor}
          textOnPrimary={textOnPrimary}
          onCancel={exitSelectionMode}
          onDelete={bulkDelete}
          onMove={bulkMove}
          onPriceAdjust={bulkPriceAdjust}
          onSetAvailability={bulkSetAvailability}
        />
      ) : null}

      <ImportMenuModal
        existingContents={currentContents}
        visible={isImportModalVisible}
        onClose={handleCloseImport}
        onImportComplete={handleImportComplete}
      />

      <AiImportModal
        existingContents={currentContents}
        visible={isAiImportModalVisible}
        onClose={handleCloseAiImport}
        onImportComplete={handleImportComplete}
      />
    </ScrollView>
  );
};

export default MenuContentEditor;
