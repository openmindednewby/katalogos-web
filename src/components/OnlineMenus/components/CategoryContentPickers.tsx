/**
 * CategoryContentPickers - Image and video picker section for a category.
 */
import React from 'react';

import { View } from 'react-native';

import { FM } from '@/localization/helpers';

import AspectRatioPreset from '../../../shared/enums/AspectRatioPreset';
import { TestIds } from '../../../shared/testIds';
import { ImagePicker, VideoPicker } from '../../Content';
import { categoryEditorStyles as styles } from '../categoryEditorStyles';

import type { Category } from '../../../types/menuTypes';

interface CategoryContentPickersProps {
  category: Category;
  categoryIndex: number;
  isPhone: boolean;
  borderColor: string;
  onUpdateCategory: (updates: Partial<Category>) => void;
}

const CategoryContentPickers: React.FC<CategoryContentPickersProps> = ({
  category,
  categoryIndex,
  isPhone,
  borderColor,
  onUpdateCategory,
}) => (
  <View style={[styles.contentPickersSection, { borderTopColor: borderColor }]}>
    <View style={[styles.contentPickersRow, isPhone ? styles.contentPickersRowPhone : undefined]}>
      <View
        style={[styles.contentPickerWrapper, isPhone ? styles.contentPickerWrapperPhone : undefined]}
        testID={`${TestIds.CATEGORY_IMAGE_PICKER}-${categoryIndex}`}
      >
        <ImagePicker
          enableCrop
          isPublic
          hint={FM('onlineMenus.categoryImageHint')}
          initialPreset={AspectRatioPreset.Landscape}
          label={FM('onlineMenus.categoryImage')}
          value={category.imageContentId ?? undefined}
          onChange={(contentId) => { onUpdateCategory({ imageContentId: contentId }); }}
        />
      </View>
      <View
        style={[styles.contentPickerWrapper, isPhone ? styles.contentPickerWrapperPhone : undefined]}
        testID={`${TestIds.CATEGORY_VIDEO_PICKER}-${categoryIndex}`}
      >
        <VideoPicker
          isPublic
          hint={FM('onlineMenus.categoryVideoHint')}
          label={FM('onlineMenus.categoryVideo')}
          value={category.videoContentId ?? undefined}
          onChange={(contentId) => { onUpdateCategory({ videoContentId: contentId }); }}
        />
      </View>
    </View>
  </View>
);

export default CategoryContentPickers;
