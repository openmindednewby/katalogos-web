/**
 * Modal for manually editing a menu translation.
 * Shows source text on the left and translated text on the right, field by field.
 */
import React, { useCallback, useState } from 'react';

import { Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

import { FM } from '@/localization/helpers';
import { MODAL_OVERLAY_COLOR } from '@/shared/constants';
import { TestIds } from '@/shared/testIds';
import { isValueDefined } from '@/utils/is';

import type { MenuContents, TranslatedMenuContents } from '../../../../types/menuTypes';

const FIELD_MARGIN_BOTTOM = 16;
const MODAL_PADDING = 20;
const MAX_MODAL_WIDTH = 900;

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: MODAL_OVERLAY_COLOR, justifyContent: 'center', alignItems: 'center', padding: MODAL_PADDING },
  modal: { width: '100%', maxWidth: MAX_MODAL_WIDTH, maxHeight: '90%', borderRadius: 12, padding: MODAL_PADDING },
  header: { fontSize: 20, fontWeight: 'bold', marginBottom: 16 },
  fieldRow: { flexDirection: 'row', gap: 12, marginBottom: FIELD_MARGIN_BOTTOM },
  fieldColumn: { flex: 1 },
  fieldLabel: { fontSize: 12, fontWeight: '600', marginBottom: 4, textTransform: 'uppercase' },
  sourceText: { fontSize: 14, padding: 10, borderRadius: 6, borderWidth: 1 },
  translatedInput: { fontSize: 14, padding: 10, borderRadius: 6, borderWidth: 1 },
  sectionTitle: { fontSize: 16, fontWeight: '700', marginTop: 16, marginBottom: 8 },
  buttonRow: { flexDirection: 'row', justifyContent: 'flex-end', gap: 12, marginTop: 24, paddingTop: 16, borderTopWidth: 1 },
  button: { paddingHorizontal: 20, paddingVertical: 12, borderRadius: 8, minWidth: 100, alignItems: 'center' },
  buttonText: { fontSize: 16, fontWeight: '600' },
});

interface FieldProps {
  label: string;
  sourceValue: string;
  translatedValue: string;
  textColor: string;
  borderColor: string;
  textSecondary: string;
  backgroundColor: string;
  onChange: (value: string) => void;
}

/** Single editable field row with source on left, translation on right. */
const TranslationField = (props: FieldProps): React.ReactElement => (
  <View style={styles.fieldRow}>
    <View style={styles.fieldColumn}>
      <Text style={[styles.fieldLabel, { color: props.textSecondary }]}>{FM('translations.editModalSource')}</Text>
      <Text style={[styles.sourceText, { color: props.textColor, borderColor: props.borderColor }]}>
        {props.sourceValue}
      </Text>
    </View>
    <View style={styles.fieldColumn}>
      <Text style={[styles.fieldLabel, { color: props.textSecondary }]}>{props.label}</Text>
      <TextInput
        accessibilityHint={FM('translations.editModalTranslated')}
        accessibilityLabel={props.label}
        style={[styles.translatedInput, { color: props.textColor, borderColor: props.borderColor, backgroundColor: props.backgroundColor }]}
        value={props.translatedValue}
        onChangeText={props.onChange}
      />
    </View>
  </View>
);

interface Props {
  visible: boolean;
  sourceContents: MenuContents | undefined;
  translatedContents: TranslatedMenuContents;
  languageName: string;
  backgroundColor: string;
  textColor: string;
  borderColor: string;
  primaryColor: string;
  textOnPrimary: string;
  textSecondary: string;
  onSave: (contents: TranslatedMenuContents) => void;
  onClose: () => void;
}

/** Extract the menu name from source contents safely. */
function getSourceMenuName(contents: MenuContents | undefined): string {
  if (!isValueDefined(contents)) return '';
  const firstCatName = contents.categories?.[0]?.name;
  return firstCatName ?? '';
}

export const TranslationEditModal: React.FC<Props> = ({
  visible, sourceContents, translatedContents, languageName,
  backgroundColor, textColor, borderColor, primaryColor, textOnPrimary, textSecondary,
  onSave, onClose,
}) => {
  const [draft, setDraft] = useState<TranslatedMenuContents>(translatedContents);

  const updateField = useCallback((path: string, value: string) => {
    setDraft((prev) => {
      const parts = path.split('.');
      if (parts[0] === 'menuName') return { ...prev, menuName: value };

      const catIdx = Number(parts[1]);
      const categories = [...prev.categories];
      const cat = { ...categories[catIdx] };

      if (parts[2] === 'name') { cat.name = value; categories[catIdx] = cat; return { ...prev, categories }; }

      if (parts[2] === 'item') {
        const itemIdx = Number(parts[3]);
        const items = [...cat.items];
        const item = { ...items[itemIdx] };
        if (parts[4] === 'name') item.name = value;
        if (parts[4] === 'description') item.description = value;
        items[itemIdx] = item;
        cat.items = items;
        categories[catIdx] = cat;
        return { ...prev, categories };
      }

      return prev;
    });
  }, []);

  const handleSave = useCallback(() => { onSave(draft); }, [draft, onSave]);
  const sourceCategories = sourceContents?.categories ?? [];
  const sourceMenuName = getSourceMenuName(sourceContents);

  return (
    <Modal transparent animationType="fade" testID={TestIds.TRANSLATION_EDIT_MODAL} visible={visible} onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={[styles.modal, { backgroundColor }]}>
          <Text style={[styles.header, { color: textColor }]}>
            {FM('translations.editModalTitle', languageName)}
          </Text>

          <ScrollView showsVerticalScrollIndicator={false}>
            <TranslationField
              backgroundColor={backgroundColor} borderColor={borderColor} label={FM('translations.menuName')}
              sourceValue={sourceMenuName} textColor={textColor} textSecondary={textSecondary}
              translatedValue={draft.menuName ?? ''}
              onChange={(v) => { updateField('menuName', v); }}
            />

            {sourceCategories.map((cat, catIdx) => (
              <View key={`cat-${cat.id ?? catIdx}`}>
                <Text style={[styles.sectionTitle, { color: textColor }]}>{cat.name ?? ''}</Text>
                <TranslationField
                  backgroundColor={backgroundColor} borderColor={borderColor} label={FM('translations.categoryName')}
                  sourceValue={cat.name ?? ''} textColor={textColor} textSecondary={textSecondary}
                  translatedValue={draft.categories[catIdx]?.name ?? ''}
                  onChange={(v) => { updateField(`cat.${catIdx}.name`, v); }}
                />
                {(cat.items ?? []).map((item, itemIdx) => (
                  <View key={`item-${item.id ?? itemIdx}`}>
                    <TranslationField
                      backgroundColor={backgroundColor} borderColor={borderColor} label={FM('translations.itemName')}
                      sourceValue={item.name ?? ''} textColor={textColor} textSecondary={textSecondary}
                      translatedValue={draft.categories[catIdx]?.items[itemIdx]?.name ?? ''}
                      onChange={(v) => { updateField(`cat.${catIdx}.item.${itemIdx}.name`, v); }}
                    />
                  </View>
                ))}
              </View>
            ))}
          </ScrollView>

          <View style={[styles.buttonRow, { borderTopColor: borderColor }]}>
            <TouchableOpacity
              accessibilityHint={FM('translations.editModalCancelHint')} accessibilityLabel={FM('translations.editModalCancel')}
              style={[styles.button, { backgroundColor: borderColor }]} testID={TestIds.TRANSLATION_EDIT_CANCEL}
              onPress={onClose}
            >
              <Text style={[styles.buttonText, { color: textColor }]}>{FM('translations.editModalCancel')}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              accessibilityHint={FM('translations.editModalSaveHint')} accessibilityLabel={FM('translations.editModalSave')}
              style={[styles.button, { backgroundColor: primaryColor }]} testID={TestIds.TRANSLATION_EDIT_SAVE}
              onPress={handleSave}
            >
              <Text style={[styles.buttonText, { color: textOnPrimary }]}>{FM('translations.editModalSave')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};
