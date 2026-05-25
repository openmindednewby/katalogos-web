/** MenuItemEditorBody - Detail body content for a menu item editor with collapsible sections. */
import React, { useCallback, useState } from 'react';

import { Text, TextInput, TouchableOpacity, View } from 'react-native';

import { FM } from '@/localization/helpers';

import AiDescriptionButton from './AiDescriptionButton';
import ItemAdvancedSection from './ItemAdvancedSection';
import MenuItemContentPickers from './MenuItemContentPickers';
import { itemEditorStyles as styles } from './menuItemEditorStyles';
import NutritionSection from './NutritionSection';
import PriceInput from './PriceInput';
import { TestIds } from '../../../shared/testIds';
import { isValueDefined } from '../../../utils/is';
import CollapsibleSection from '../../Shared/CollapsibleSection';
import ModifierGroupEditor from '../ModifierGroupEditor';
import VariantGroupEditor from '../VariantGroupEditor';

import type { DietaryTagDto } from '../../../lib/hooks/dietaryTag/types';
import type { MenuItem } from '../../../types/menuTypes';
import type { OverrideContextProps } from '../LocationOverrides';

interface MenuItemEditorBodyProps {
  item: MenuItem;
  categoryIndex: number;
  itemIndex: number;
  isPhone: boolean;
  availabilityLabel: string;
  onUpdate: (updates: Partial<MenuItem>) => void;
  borderColor: string;
  textColor: string;
  textSecondary: string;
  backgroundColor: string;
  primaryColor: string;
  textOnPrimary: string;
  errorColor: string;
  menuExternalId?: string;
  categoryName?: string;
  overrideContext?: OverrideContextProps;
  dietaryTags?: DietaryTagDto[];
}

const MenuItemEditorBody: React.FC<MenuItemEditorBodyProps> = ({
  item, categoryIndex, itemIndex, isPhone, availabilityLabel,
  onUpdate, borderColor, textColor, textSecondary, backgroundColor, primaryColor, textOnPrimary, errorColor,
  menuExternalId, categoryName, overrideContext, dietaryTags,
}) => {
  const [nutritionOpen, setNutritionOpen] = useState(false);
  const [variantsOpen, setVariantsOpen] = useState(false);
  const [advancedOpen, setAdvancedOpen] = useState(false);

  const toggleNutrition = useCallback(() => { setNutritionOpen((p) => !p); }, []);
  const toggleVariants = useCallback(() => { setVariantsOpen((p) => !p); }, []);
  const toggleAdvanced = useCallback(() => { setAdvancedOpen((p) => !p); }, []);

  return (
    <View>
      <Text style={[styles.label, styles.labelMarginTop, { color: textColor }]}>{FM('onlineMenus.itemName')}</Text>
      <TextInput
        accessibilityHint={FM('onlineMenus.itemNameInputHint')}
        accessibilityLabel={FM('onlineMenus.itemNameLabel')}
        style={[styles.input, { borderColor, color: textColor, backgroundColor }]}
        testID={`${TestIds.MENU_ITEM_NAME_FULL_INPUT}-${categoryIndex}-${itemIndex}`}
        value={String(item.name ?? '')}
        onChangeText={(text) => { onUpdate({ name: text }); }}
      />

      <Text style={[styles.label, { color: textColor }]}>{FM('onlineMenus.itemDescription')}</Text>
      <TextInput
        multiline
        accessibilityHint={FM('onlineMenus.itemDescriptionInputHint')}
        accessibilityLabel={FM('onlineMenus.itemDescriptionLabel')}
        numberOfLines={3}
        style={[styles.input, { borderColor, color: textColor, backgroundColor }]}
        testID={`${TestIds.MENU_ITEM_DESCRIPTION_INPUT}-${categoryIndex}-${itemIndex}`}
        value={String(item.description ?? '')}
        onChangeText={(text) => { onUpdate({ description: text !== '' ? text : null }); }}
      />
      {isValueDefined(menuExternalId) ? (
        <AiDescriptionButton
          categoryName={categoryName ?? ''}
          disabled={false}
          errorColor={errorColor}
          existingDescription={item.description ?? undefined}
          itemName={String(item.name ?? '')}
          menuExternalId={menuExternalId}
          price={item.price}
          primaryColor={primaryColor}
          textColor={textColor}
          textOnPrimary={textOnPrimary}
          onGenerated={(desc) => { onUpdate({ description: desc }); }}
        />
      ) : null}

      <Text style={[styles.label, { color: textColor }]}>{FM('onlineMenus.price')}</Text>
      <PriceInput
        price={item.price}
        testID={`${TestIds.MENU_ITEM_PRICE_INPUT}-${categoryIndex}-${itemIndex}`}
        onPriceChange={(price) => { onUpdate({ price }); }}
      />

      <TouchableOpacity
        accessibilityHint={FM('onlineMenus.toggleAvailabilityHint')}
        accessibilityLabel={availabilityLabel}
        accessibilityRole="button"
        style={[styles.button, { backgroundColor: item.isAvailable === true ? primaryColor : borderColor }]}
        testID={`${TestIds.MENU_ITEM_AVAILABLE_TOGGLE}-${categoryIndex}-${itemIndex}`}
        onPress={() => { onUpdate({ isAvailable: item.isAvailable !== true }); }}
      >
        <Text style={[styles.buttonText, { color: item.isAvailable === true ? textOnPrimary : textColor }]}>
          {availabilityLabel}
        </Text>
      </TouchableOpacity>

      <MenuItemContentPickers
        borderColor={borderColor}
        categoryIndex={categoryIndex}
        isPhone={isPhone}
        item={item}
        itemIndex={itemIndex}
        onUpdate={onUpdate}
      />

      {isValueDefined(menuExternalId) ? (
        <CollapsibleSection
          borderColor={borderColor}
          isExpanded={nutritionOpen}
          surfaceColor={backgroundColor}
          testId={TestIds.ITEM_SECTION_NUTRITION}
          textColor={textColor}
          title={FM('onlineMenus.editorSections.nutrition')}
          onToggle={toggleNutrition}
        >
          <NutritionSection
            backgroundColor={backgroundColor}
            borderColor={borderColor}
            dietaryTags={dietaryTags}
            errorColor={errorColor}
            item={item}
            menuExternalId={menuExternalId}
            primaryColor={primaryColor}
            textColor={textColor}
            textOnPrimary={textOnPrimary}
            onUpdate={onUpdate}
          />
        </CollapsibleSection>
      ) : null}

      <CollapsibleSection
        borderColor={borderColor}
        isExpanded={variantsOpen}
        surfaceColor={backgroundColor}
        testId={TestIds.ITEM_SECTION_VARIANTS_MODIFIERS}
        textColor={textColor}
        title={FM('onlineMenus.editorSections.variantsModifiers')}
        onToggle={toggleVariants}
      >
        <VariantGroupEditor
          backgroundColor={backgroundColor} borderColor={borderColor} item={item}
          primaryColor={primaryColor} textColor={textColor} textOnPrimary={textOnPrimary}
          onUpdate={onUpdate}
        />
        <ModifierGroupEditor
          backgroundColor={backgroundColor} borderColor={borderColor} item={item}
          primaryColor={primaryColor} textColor={textColor} textOnPrimary={textOnPrimary}
          onUpdate={onUpdate}
        />
      </CollapsibleSection>

      <CollapsibleSection
        borderColor={borderColor}
        isExpanded={advancedOpen}
        surfaceColor={backgroundColor}
        testId={TestIds.ITEM_SECTION_ADVANCED}
        textColor={textColor}
        title={FM('onlineMenus.editorSections.advanced')}
        onToggle={toggleAdvanced}
      >
        <ItemAdvancedSection
          backgroundColor={backgroundColor} borderColor={borderColor}
          categoryIndex={categoryIndex} item={item} itemIndex={itemIndex}
          overrideContext={overrideContext} primaryColor={primaryColor}
          textColor={textColor} textOnPrimary={textOnPrimary} textSecondary={textSecondary}
          onUpdate={onUpdate}
        />
      </CollapsibleSection>
    </View>
  );
};

export default MenuItemEditorBody;
