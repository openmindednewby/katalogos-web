import React from 'react';

import { ScrollView, Text, TouchableOpacity, View } from 'react-native';

import { FM } from '@/localization/helpers';

import { TestIds } from '../../../../shared/testIds';
import { useTheme } from '../../../../theme/hooks/useTheme';
import { TemplateType } from '../enums/TemplateType';
import { templateSelectorStyles as styles } from '../utils/qrDesignerStyles';

const SELECTED_BORDER_WIDTH = 3;

interface Props {
  selected: TemplateType;
  onSelect: (template: TemplateType) => void;
}

interface TemplateOption {
  type: TemplateType;
  labelKey: string;
  testId: string;
}

const TEMPLATE_OPTIONS: TemplateOption[] = [
  { type: TemplateType.TableTent, labelKey: 'onlineMenus.qrCode.designer.tableTent', testId: TestIds.QR_DESIGNER_TEMPLATE_TENT },
  { type: TemplateType.Sticker, labelKey: 'onlineMenus.qrCode.designer.sticker', testId: TestIds.QR_DESIGNER_TEMPLATE_STICKER },
  { type: TemplateType.Poster, labelKey: 'onlineMenus.qrCode.designer.poster', testId: TestIds.QR_DESIGNER_TEMPLATE_POSTER },
];

const TemplateSelector = ({ selected, onSelect }: Props): React.ReactElement => {
  const { theme } = useTheme();
  const colors = theme.colors;

  return (
    <View style={styles.container}>
      <Text style={[styles.label, { color: colors.text }]}>
        {FM('onlineMenus.qrCode.designer.selectTemplate')}
      </Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.scrollContent}>
          {TEMPLATE_OPTIONS.map((option) => {
            const isSelected = selected === option.type;
            const label = FM(option.labelKey);
            const borderColor = isSelected ? theme.palette.primary['500'] : colors.border;
            const borderWidth = isSelected ? SELECTED_BORDER_WIDTH : styles.card.borderWidth;

            return (
              <TouchableOpacity
                key={option.type}
                accessibilityHint={FM('onlineMenus.qrCode.designer.templateHint', label)}
                accessibilityLabel={label}
                accessibilityRole="button"
                style={[styles.card, { borderColor, borderWidth, backgroundColor: colors.surface }]}
                testID={option.testId}
                onPress={() => onSelect(option.type)}
              >
                <Text style={[styles.cardLabel, { color: colors.text }]}>
                  {label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
};

export default TemplateSelector;
