/**
 * MenuItemContentPickers - Content upload section for a menu item.
 */
import React from 'react';

import { StyleSheet, View } from 'react-native';

import { FM } from '@/localization/helpers';

import { TestIds } from '../../../shared/testIds';
import { isValueDefined } from '../../../utils/is';
import { DocumentPicker, ImagePicker, VideoPicker } from '../../Content';

import type { MenuItem } from '../../../types/menuTypes';

interface MenuItemContentPickersProps {
  item: MenuItem;
  categoryIndex: number;
  itemIndex: number;
  onUpdate: (updates: Partial<MenuItem>) => void;
  borderColor: string;
  isPhone: boolean;
}

const styles = StyleSheet.create({
  contentPickersSection: { marginTop: 16, paddingTop: 16, borderTopWidth: 1 },
  contentPickersRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginTop: 8 },
  contentPickersRowPhone: { flexDirection: 'column' },
  contentPickerWrapper: { flex: 1, minWidth: 200, maxWidth: 300 },
  contentPickerWrapperPhone: { minWidth: 0, maxWidth: '100%' },
  documentsSection: { marginTop: 12 },
});

const MenuItemContentPickers: React.FC<MenuItemContentPickersProps> = ({
  item, categoryIndex, itemIndex, onUpdate, borderColor, isPhone,
}) => (
  <View style={[styles.contentPickersSection, { borderTopColor: borderColor }]}>
    <View style={[styles.contentPickersRow, isPhone ? styles.contentPickersRowPhone : undefined]}>
      <View
        style={[styles.contentPickerWrapper, isPhone ? styles.contentPickerWrapperPhone : undefined]}
        testID={`${TestIds.MENU_ITEM_IMAGE_PICKER}-${categoryIndex}-${itemIndex}`}
      >
        <ImagePicker
          enableCrop
          isPublic
          hint={FM('onlineMenus.itemImageHint')}
          label={FM('onlineMenus.itemImage')}
          value={item.imageContentId ?? undefined}
          onChange={(contentId) => { onUpdate({ imageContentId: contentId }); }}
        />
      </View>
      <View
        style={[styles.contentPickerWrapper, isPhone ? styles.contentPickerWrapperPhone : undefined]}
        testID={`${TestIds.MENU_ITEM_VIDEO_PICKER}-${categoryIndex}-${itemIndex}`}
      >
        <VideoPicker
          isPublic
          hint={FM('onlineMenus.itemVideoHint')}
          label={FM('onlineMenus.itemVideo')}
          value={item.videoContentId ?? undefined}
          onChange={(contentId) => { onUpdate({ videoContentId: contentId }); }}
        />
      </View>
    </View>
    <View style={styles.documentsSection} testID={`${TestIds.MENU_ITEM_DOCUMENT_PICKER}-${categoryIndex}-${itemIndex}`}>
      <DocumentPicker
        isPublic
        hint={FM('onlineMenus.itemDocumentsHint')}
        label={FM('onlineMenus.itemDocuments')}
        value={item.documentContentIds?.[0]}
        onChange={(contentId) => { onUpdate({ documentContentIds: isValueDefined(contentId) ? [contentId] : [] }); }}
      />
    </View>
  </View>
);

export default MenuItemContentPickers;
