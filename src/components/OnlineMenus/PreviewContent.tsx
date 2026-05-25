/**
 * PreviewContent - Renders the menu preview content including categories and items.
 */
import React from 'react';

import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { FM } from '@/localization/helpers';

import CategorySection from './PreviewCategorySection';
import { isValueDefined } from '../../utils/is';


import type { Category } from '../../types/menuTypes';

interface PreviewContentProps {
  categories: Category[];
  menuName: string;
  menuDescription?: string;
  menuBackgroundColor: string;
  menuTextColor: string;
  borderColor: string;
  frameWidth: number;
}

const styles = StyleSheet.create({
  previewContainer: {
    flex: 1,
    alignItems: 'center',
    padding: 16,
  },
  previewFrame: {
    borderWidth: 1,
    borderRadius: 12,
    overflow: 'hidden',
  },
  previewContent: {
    padding: 20,
  },
  menuHeader: {
    marginBottom: 20,
    borderBottomWidth: 1,
    paddingBottom: 16,
  },
  menuTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  menuDescription: {
    fontSize: 16,
  },
  emptyText: {
    fontSize: 16,
    fontStyle: 'italic',
    textAlign: 'center',
    padding: 40,
  },
});

const PreviewContent: React.FC<PreviewContentProps> = ({
  categories,
  menuName,
  menuDescription,
  menuBackgroundColor,
  menuTextColor,
  borderColor,
  frameWidth,
}) => {
  const hasDescription = isValueDefined(menuDescription) && menuDescription !== '';

  return (
    <View style={styles.previewContainer}>
      <View
        style={[styles.previewFrame, { width: frameWidth, borderColor, backgroundColor: menuBackgroundColor }]}
      >
        <ScrollView style={styles.previewContent}>
          <View style={[styles.menuHeader, { borderBottomColor: menuTextColor }]}>
            <Text style={[styles.menuTitle, { color: menuTextColor }]}>{menuName}</Text>
            {hasDescription ? (
              <Text style={[styles.menuDescription, { color: menuTextColor }]}>{menuDescription}</Text>
            ) : null}
          </View>

          {categories.length === 0 ? (
            <Text style={[styles.emptyText, { color: menuTextColor }]}>
              {FM('onlineMenus.messages.emptyPreview')}
            </Text>
          ) : (
            categories.map((category, categoryIndex) => (
              <CategorySection
                key={category.name ?? categoryIndex}
                category={category}
                categoryIndex={categoryIndex}
                menuTextColor={menuTextColor}
              />
            ))
          )}
        </ScrollView>
      </View>
    </View>
  );
};

export default PreviewContent;
