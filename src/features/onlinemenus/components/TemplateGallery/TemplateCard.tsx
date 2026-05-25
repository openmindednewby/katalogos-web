import React from 'react';

import { Text, TouchableOpacity } from 'react-native';

import { FM } from '@/localization/helpers';
import { TestIds } from '@/shared/testIds';
import { useTheme } from '@/theme/hooks/useTheme';

import { templateGalleryStyles } from './templateGalleryStyles';


interface TemplateCardProps {
  slug: string;
  displayName: string;
  description: string;
  previewIcon: string;
  isSelected: boolean;
  isBlank: boolean;
  onPress: () => void;
}

const TemplateCard = (props: TemplateCardProps): React.ReactElement => {
  const { slug, displayName, description, previewIcon, isSelected, isBlank, onPress } = props;
  const { theme } = useTheme();
  const { colors } = theme;
  const primary = theme.palette.primary['500'];
  const borderColor = isSelected ? primary : colors.border;
  const testId = isBlank
    ? TestIds.TEMPLATE_GALLERY_BLANK
    : `${TestIds.TEMPLATE_CARD}-${slug}`;
  const hint = isSelected
    ? FM('onlineMenus.templates.selectedHint', displayName)
    : FM('onlineMenus.templates.selectHint', displayName);

  return (
    <TouchableOpacity
      accessibilityHint={hint}
      accessibilityLabel={displayName}
      accessibilityRole="radio"
      style={[templateGalleryStyles.card, { borderColor, backgroundColor: colors.surface }]}
      testID={testId}
      onPress={onPress}
    >
      <Text style={templateGalleryStyles.cardIcon}>{previewIcon}</Text>
      <Text style={[templateGalleryStyles.cardName, { color: colors.text }]}>{displayName}</Text>
      <Text style={[templateGalleryStyles.cardDescription, { color: colors.textSecondary }]}>{description}</Text>
    </TouchableOpacity>
  );
};

export default TemplateCard;
