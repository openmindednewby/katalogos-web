/** CategoryEditor - Editor for a single menu category including its items. */
import React, { useCallback, useState } from 'react';

import { Text, TouchableOpacity, View } from 'react-native';

import { FM } from '@/localization/helpers';

import { categoryEditorStyles as catStyles } from './categoryEditorStyles';
import CategoryEditorBody from './components/CategoryEditorBody';
import { CategoryOverflowMenu } from './components/CategoryOverflowMenu';
import { useBreakpoint } from '../../hooks/useBreakpoint';
import { TestIds } from '../../shared/testIds';
import { isValueDefined } from '../../utils/is';
import InlineEditableText from '../Shared/InlineEditableText';

import type { OverrideContextProps } from './LocationOverrides';
import type { BoxStyling, MediaSettings } from '../../types/menuStyleTypes';
import type { Category, MenuItem } from '../../types/menuTypes';

const ELLIPSIS_CHAR = '\u2026';

interface CategoryEditorProps {
  category: Category;
  categoryIndex: number;
  isExpanded: boolean;
  totalCategories: number;
  onToggle: () => void;
  onUpdateCategory: (updates: Partial<Category>) => void;
  onDeleteCategory: () => void;
  onMoveCategoryUp: () => void;
  onMoveCategoryDown: () => void;
  onAddItem: () => void;
  onUpdateItem: (itemIndex: number, updates: Partial<MenuItem>) => void;
  onDeleteItem: (itemIndex: number) => void;
  onMoveItemUp: (itemIndex: number) => void;
  onMoveItemDown: (itemIndex: number) => void;
  borderColor: string;
  textColor: string;
  backgroundColor: string;
  primaryColor: string;
  textOnPrimary: string;
  errorColor: string;
  secondaryColor: string;
  menuExternalId?: string;
  isSelectionMode?: boolean;
  isSelected?: (itemId: string) => boolean;
  onToggleSelectItem?: (itemId: string) => void;
  onSelectAllInCategory?: () => void;
  overrideContext?: OverrideContextProps;
}

const CategoryEditor: React.FC<CategoryEditorProps> = ({
  category, categoryIndex, isExpanded, totalCategories,
  onToggle, onUpdateCategory, onDeleteCategory, onMoveCategoryUp, onMoveCategoryDown,
  onAddItem, onUpdateItem, onDeleteItem, onMoveItemUp, onMoveItemDown,
  borderColor, textColor, backgroundColor, primaryColor, textOnPrimary, errorColor, secondaryColor,
  menuExternalId,
  isSelectionMode, isSelected, onToggleSelectItem, onSelectAllInCategory,
  overrideContext,
}) => {
  const { isPhone } = useBreakpoint();
  const [overflowOpen, setOverflowOpen] = useState(false);

  const handleStylingChange = useCallback(
    (styling: BoxStyling) => { onUpdateCategory({ styling }); },
    [onUpdateCategory],
  );

  const handleImageSettingsChange = useCallback(
    (imageSettings: MediaSettings) => { onUpdateCategory({ imageSettings }); },
    [onUpdateCategory],
  );

  const handleIconChange = useCallback(
    (icon: string | null) => { onUpdateCategory({ icon }); },
    [onUpdateCategory],
  );

  const handleOverflowOpen = useCallback(() => { setOverflowOpen(true); }, []);
  const handleOverflowClose = useCallback(() => { setOverflowOpen(false); }, []);

  const handleMoveUp = useCallback(() => {
    setOverflowOpen(false);
    onMoveCategoryUp();
  }, [onMoveCategoryUp]);

  const handleMoveDown = useCallback(() => {
    setOverflowOpen(false);
    onMoveCategoryDown();
  }, [onMoveCategoryDown]);

  const handleDelete = useCallback(() => {
    setOverflowOpen(false);
    onDeleteCategory();
  }, [onDeleteCategory]);

  const handleSelectAll = useCallback(() => {
    setOverflowOpen(false);
    if (isValueDefined(onSelectAllInCategory)) onSelectAllInCategory();
  }, [onSelectAllInCategory]);

  const toggleHint = isExpanded
    ? FM('onlineMenus.collapseCategoryHint')
    : FM('onlineMenus.expandCategoryHint');

  const categoryName = String(category.name);
  const hasIcon = isValueDefined(category.icon) && category.icon !== '';
  const totalItems = category.items?.length ?? 0;
  const isFirst = categoryIndex === 0;
  const isLast = categoryIndex === totalCategories - 1;

  return (
    <View
      style={[catStyles.categoryCard, isPhone ? catStyles.categoryCardPhone : undefined, { borderColor, backgroundColor }]}
      testID={`${TestIds.CATEGORY_ITEM}-${categoryIndex}`}
    >
      <View style={catStyles.categoryHeader}>
        <TouchableOpacity
          accessibilityHint={toggleHint}
          accessibilityLabel={FM('onlineMenus.toggleCategoryLabel', categoryName)}
          accessibilityRole="button"
          testID={`${TestIds.CATEGORY_TOGGLE_BUTTON}-${categoryIndex}`}
          onPress={onToggle}
        >
          <Text style={[catStyles.categoryTitle, { color: textColor }]}>
            {isExpanded ? '\u25BC' : '\u25B6'}
          </Text>
        </TouchableOpacity>
        {hasIcon ? (
          <Text style={catStyles.categoryTitle}>{category.icon}</Text>
        ) : null}
        <InlineEditableText
          editIconColor={textColor}
          inputStyle={[catStyles.categoryTitle, { color: textColor, borderColor }]}
          renderDisplay={(displayValue) => (
            <Text style={[catStyles.categoryTitle, { color: textColor }]}>{displayValue}</Text>
          )}
          testID={`${TestIds.CATEGORY_NAME_INPUT}-${categoryIndex}`}
          value={categoryName}
          onCommit={(newName) => { onUpdateCategory({ name: newName }); }}
        />
        <TouchableOpacity
          accessibilityHint={FM('onlineMenus.overflowMenu.moreActionsHint')}
          accessibilityLabel={FM('onlineMenus.overflowMenu.moreActions')}
          accessibilityRole="button"
          style={[catStyles.smallButton, { backgroundColor: borderColor }]}
          testID={`${TestIds.CATEGORY_OVERFLOW_BUTTON}-${categoryIndex}`}
          onPress={handleOverflowOpen}
        >
          <Text style={[catStyles.smallButtonText, { color: textColor }]}>{ELLIPSIS_CHAR}</Text>
        </TouchableOpacity>
      </View>

      <CategoryOverflowMenu
        backgroundColor={backgroundColor}
        borderColor={borderColor}
        categoryIndex={categoryIndex}
        categoryName={categoryName}
        errorColor={errorColor}
        hasSelectAll={isValueDefined(onSelectAllInCategory)}
        isFirst={isFirst}
        isLast={isLast}
        isOpen={overflowOpen}
        isSelectionMode={isSelectionMode === true}
        primaryColor={primaryColor}
        textColor={textColor}
        onClose={handleOverflowClose}
        onDelete={handleDelete}
        onMoveDown={handleMoveDown}
        onMoveUp={handleMoveUp}
        onSelectAll={handleSelectAll}
      />

      {isExpanded ? (
        <CategoryEditorBody
          backgroundColor={backgroundColor}
          borderColor={borderColor}
          category={category}
          categoryIndex={categoryIndex}
          errorColor={errorColor}
          isPhone={isPhone}
          isSelected={isSelected}
          isSelectionMode={isSelectionMode}
          menuExternalId={menuExternalId}
          overrideContext={overrideContext}
          primaryColor={primaryColor}
          secondaryColor={secondaryColor}
          textColor={textColor}
          textOnPrimary={textOnPrimary}
          totalItems={totalItems}
          onAddItem={onAddItem}
          onDeleteItem={onDeleteItem}
          onIconChange={handleIconChange}
          onImageSettingsChange={handleImageSettingsChange}
          onMoveItemDown={onMoveItemDown}
          onMoveItemUp={onMoveItemUp}
          onStylingChange={handleStylingChange}
          onToggleSelectItem={onToggleSelectItem}
          onUpdateCategory={onUpdateCategory}
          onUpdateItem={onUpdateItem}
        />
      ) : null}
    </View>
  );
};

export default CategoryEditor;
