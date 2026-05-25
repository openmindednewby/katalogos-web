import React from 'react';

import { ActivityIndicator, ScrollView, Text, View } from 'react-native';

import type { MenuTemplateDto } from '@/features/onlinemenus/types';
import { FM } from '@/localization/helpers';
import { TestIds } from '@/shared/testIds';
import { useTheme } from '@/theme/hooks/useTheme';
import { isNullOrUndefined } from '@/utils/is';

import TemplateCard from './TemplateCard';
import { templateGalleryStyles } from './templateGalleryStyles';


interface TemplateGalleryProps {
  selectedSlug: string | null;
  onSelect: (slug: string | null) => void;
  templates: MenuTemplateDto[];
  isLoading: boolean;
}

const BLANK_ICON = '\u{1F4C4}';

const TemplateGallery = (props: TemplateGalleryProps): React.ReactElement => {
  const { selectedSlug, onSelect, templates, isLoading } = props;
  const { theme } = useTheme();
  const { colors } = theme;
  const primary = theme.palette.primary['500'];
  const isBlankSelected = isNullOrUndefined(selectedSlug);

  return (
    <View style={templateGalleryStyles.container} testID={TestIds.TEMPLATE_GALLERY}>
      <Text style={[templateGalleryStyles.title, { color: colors.text }]}>
        {FM('onlineMenus.templates.galleryTitle')}
      </Text>
      <Text style={[templateGalleryStyles.subtitle, { color: colors.textSecondary }]}>
        {FM('onlineMenus.templates.gallerySubtitle')}
      </Text>
      {isLoading
        ? <ActivityIndicator color={primary} size="small" />
        : (
          <ScrollView
            horizontal
            contentContainerStyle={templateGalleryStyles.scrollContent}
            showsHorizontalScrollIndicator={false}
          >
            <TemplateCard
              isBlank
              description={FM('onlineMenus.templates.blankDescription')}
              displayName={FM('onlineMenus.templates.blankOption')}
              isSelected={isBlankSelected}
              previewIcon={BLANK_ICON}
              slug=""
              onPress={() => onSelect(null)}
            />
            {templates.map((template) => (
              <TemplateCard
                key={template.slug}
                description={template.description}
                displayName={template.displayName}
                isBlank={false}
                isSelected={selectedSlug === template.slug}
                previewIcon={template.previewIcon}
                slug={template.slug}
                onPress={() => onSelect(template.slug)}
              />
            ))}
          </ScrollView>
        )}
    </View>
  );
};

export default TemplateGallery;
