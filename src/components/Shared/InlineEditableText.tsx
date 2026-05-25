/**
 * InlineEditableText - A reusable component that displays text
 * and allows inline editing on click.
 *
 * Click on the text to enter edit mode. Press Enter or blur to save,
 * press Escape to cancel. Shows a cursor pointer on hover and a subtle
 * pencil icon to indicate the text is editable.
 */
import React, { useEffect, useMemo } from 'react';

import { TextInput, TouchableOpacity, View } from 'react-native';
import type { StyleProp, TextStyle } from 'react-native';

import { FM } from '@/localization/helpers';

import { inlineEditableTextStyles as styles } from './inlineEditableTextStyles';
import { useInlineEdit } from '../../hooks/useInlineEdit';
import { TestIds } from '../../shared/testIds';
import { isValueDefined } from '../../utils/is';
import { SvgIcon } from '../Icons';

import type { IconName } from '../Icons';

const EDIT_ICON: IconName = 'edit';
const EDIT_ICON_SIZE = 14;

interface InlineEditableTextProps {
  value: string;
  onCommit: (newValue: string) => void;
  inputStyle?: StyleProp<TextStyle>;
  testID?: string;
  validate?: (newValue: string) => boolean;
  renderDisplay: (value: string, startEditing: () => void) => React.ReactNode;
  editIconColor: string;
}

const InlineEditableText: React.FC<InlineEditableTextProps> = ({
  value,
  onCommit,
  inputStyle,
  testID,
  validate,
  renderDisplay,
  editIconColor,
}) => {
  const hookOptions = useMemo(
    () => ({ value, onCommit, validate }),
    [value, onCommit, validate],
  );

  const edit = useInlineEdit(hookOptions);

  useEffect(() => {
    if (edit.isEditing) edit.inputRef.current?.focus();
  }, [edit.isEditing, edit.inputRef]);

  const displayTestID = isValueDefined(testID) ? `${testID}-display` : TestIds.INLINE_EDIT_DISPLAY;
  const inputTestID = isValueDefined(testID) ? `${testID}-input` : TestIds.INLINE_EDIT_INPUT;

  if (edit.isEditing)
    return (
      <TextInput
        ref={edit.inputRef}
        accessibilityHint={FM('onlineMenus.inlineEdit.editingHint')}
        accessibilityLabel={FM('onlineMenus.inlineEdit.editingLabel')}
        style={[styles.input, inputStyle]}
        testID={inputTestID}
        value={edit.draftValue}
        onBlur={edit.commitEdit}
        onChangeText={edit.handleChange}
        onKeyPress={(e) => { edit.handleKeyPress(e.nativeEvent.key); }}
      />
    );

  return (
    <TouchableOpacity
      accessibilityHint={FM('onlineMenus.inlineEdit.clickToEdit')}
      accessibilityLabel={`${value} - ${FM('onlineMenus.inlineEdit.editableHint')}`}
      accessibilityRole="button"
      style={styles.displayContainer}
      testID={displayTestID}
      onPress={edit.startEditing}
    >
      {renderDisplay(value, edit.startEditing)}
      <View style={styles.editIconWrapper}>
        <SvgIcon color={editIconColor} name={EDIT_ICON} size={EDIT_ICON_SIZE} />
      </View>
    </TouchableOpacity>
  );
};

export default InlineEditableText;
