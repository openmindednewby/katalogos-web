import React from 'react';

import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import type { ListRenderItemInfo } from 'react-native';

import { useSelector } from 'react-redux';

import { FM } from '@/localization/helpers';
import { DISABLED_OPACITY } from '@/shared/constants';

import ThemeMode from '../../../../shared/enums/ThemeMode';
import { themePalette } from '../../../../theme/utils/styles';
import LayoutTemplate from '../../../../types/enums/LayoutTemplate';
import { SvgIcon } from '../../../Icons';

import type { RootState } from '../../../../store/reduxStore';
import type { IconName } from '../../../Icons';

export { default as LayoutTemplate } from '../../../../types/enums/LayoutTemplate';

interface Props {
  value: LayoutTemplate;
  onChange: (template: LayoutTemplate) => void;
  disabled?: boolean;
}

interface TemplateOption {
  id: LayoutTemplate;
  nameKey: string;
  descriptionKey: string;
  icon: IconName;
}

const TEMPLATES: TemplateOption[] = [
  {
    id: LayoutTemplate.ModernGrid,
    nameKey: 'onlineMenus.layoutTemplates.modernGrid.name',
    descriptionKey: 'onlineMenus.layoutTemplates.modernGrid.description',
    icon: 'grid',
  },
  {
    id: LayoutTemplate.ClassicList,
    nameKey: 'onlineMenus.layoutTemplates.classicList.name',
    descriptionKey: 'onlineMenus.layoutTemplates.classicList.description',
    icon: 'list',
  },
  {
    id: LayoutTemplate.Cards,
    nameKey: 'onlineMenus.layoutTemplates.cards.name',
    descriptionKey: 'onlineMenus.layoutTemplates.cards.description',
    icon: 'cards',
  },
  {
    id: LayoutTemplate.Compact,
    nameKey: 'onlineMenus.layoutTemplates.compact.name',
    descriptionKey: 'onlineMenus.layoutTemplates.compact.description',
    icon: 'compact',
  },
  {
    id: LayoutTemplate.Elegant,
    nameKey: 'onlineMenus.layoutTemplates.elegant.name',
    descriptionKey: 'onlineMenus.layoutTemplates.elegant.description',
    icon: 'diamond',
  },
];

const TEMPLATE_COUNT = 5;
const CARD_MIN_WIDTH = 140;
const CARD_PADDING = 16;
const ICON_FONT_SIZE = 32;
const NAME_FONT_SIZE = 14;
const DESCRIPTION_FONT_SIZE = 12;
const BORDER_WIDTH_DEFAULT = 1;
const BORDER_WIDTH_SELECTED = 2;
const BORDER_RADIUS = 12;
const GAP = 12;

const styles = StyleSheet.create({
  container: {
    marginVertical: CARD_PADDING,
  },
  label: {
    fontSize: NAME_FONT_SIZE,
    fontWeight: '600',
    marginBottom: GAP,
  },
  listContentContainer: {
    gap: GAP,
    paddingHorizontal: 2,
  },
  templateCard: {
    minWidth: CARD_MIN_WIDTH,
    padding: CARD_PADDING,
    borderRadius: BORDER_RADIUS,
    alignItems: 'center',
    justifyContent: 'center',
  },
  templateIcon: {
    marginBottom: 8,
  },
  templateName: {
    fontSize: NAME_FONT_SIZE,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 4,
  },
  templateDescription: {
    fontSize: DESCRIPTION_FONT_SIZE,
    textAlign: 'center',
  },
});

const LayoutTemplateSelector = ({ value, onChange, disabled = false }: Props): React.ReactElement => {
  const theme = useSelector((s: RootState) => s.ui.theme);
  const colors = theme === ThemeMode.Dark ? themePalette.dark : themePalette.light;

  const textColor = String(colors.text);
  const textSecondary = String(colors.textSecondary) !== '' ? String(colors.textSecondary) : '#666';
  const surfaceColor = String(colors.surface);
  const borderColor = String(colors.border) !== '' ? String(colors.border) : '#ccc';
  const primaryColor = String(colors.primary) !== '' ? String(colors.primary) : '#007AFF';

  function handleTemplatePress(templateId: LayoutTemplate): void {
    if (disabled) return;
    onChange(templateId);
  }

  function renderTemplateCard({ item }: ListRenderItemInfo<TemplateOption>): React.ReactElement {
    const isSelected = item.id === value;

    const cardStyle = [
      styles.templateCard,
      {
        backgroundColor: surfaceColor,
        borderWidth: isSelected ? BORDER_WIDTH_SELECTED : BORDER_WIDTH_DEFAULT,
        borderColor: isSelected ? primaryColor : borderColor,
        opacity: disabled ? DISABLED_OPACITY : 1,
      },
    ];

    return (
      <TouchableOpacity
        accessibilityHint={FM('onlineMenus.layoutTemplates.selectHint')}
        accessibilityLabel={FM(item.nameKey)}
        accessibilityRole="button"
        accessibilityState={{ selected: isSelected, disabled }}
        disabled={disabled}
        style={cardStyle}
        testID={`layout-template-${item.id}`}
        onPress={() => handleTemplatePress(item.id)}
      >
        <View style={styles.templateIcon}>
          <SvgIcon color={isSelected ? primaryColor : textColor} name={item.icon} size={ICON_FONT_SIZE} />
        </View>
        <Text style={[styles.templateName, { color: textColor }]}>
          {FM(item.nameKey)}
        </Text>
        <Text style={[styles.templateDescription, { color: textSecondary }]}>
          {FM(item.descriptionKey)}
        </Text>
      </TouchableOpacity>
    );
  }

  function keyExtractor(item: TemplateOption): string {
    return item.id;
  }

  return (
    <View style={styles.container} testID="layout-template-selector">
      <Text style={[styles.label, { color: textColor }]}>
        {FM('onlineMenus.layoutTemplate')}
      </Text>
      <FlatList
        horizontal
        contentContainerStyle={styles.listContentContainer}
        data={TEMPLATES}
        keyExtractor={keyExtractor}
        renderItem={renderTemplateCard}
        showsHorizontalScrollIndicator={false}
      />
    </View>
  );
};

export default LayoutTemplateSelector;

export { TEMPLATES, TEMPLATE_COUNT };
