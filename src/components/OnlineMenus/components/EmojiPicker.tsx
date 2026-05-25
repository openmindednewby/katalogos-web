/** EmojiPicker - Curated emoji grid for selecting category icons. */
import React, { useCallback, useState } from 'react';

import { Text, TouchableOpacity, View } from 'react-native';

import { FM } from '@/localization/helpers';

import { CATEGORY_EMOJI_GROUPS } from './categoryEmojiData';
import { emojiPickerStyles as styles } from './emojiPickerStyles';
import { TestIds } from '../../../shared/testIds';
import { isValueDefined } from '../../../utils/is';

// ─── Inner Grid Component ─────────────────────────────────────────────

interface EmojiGridProps {
  selectedEmoji: string | null | undefined;
  categoryIndex: number;
  onSelect: (emoji: string) => void;
  borderColor: string;
  textColor: string;
  primaryColor: string;
}

const EmojiGrid: React.FC<EmojiGridProps> = ({
  selectedEmoji,
  categoryIndex,
  onSelect,
  borderColor,
  textColor,
  primaryColor,
}) => (
  <View
    style={[styles.container, { borderColor }]}
    testID={`${TestIds.CATEGORY_EMOJI_PICKER}-${categoryIndex}`}
  >
    <Text style={[styles.title, { color: textColor }]}>
      {FM('onlineMenus.categoryIcon.pickerTitle')}
    </Text>
    {CATEGORY_EMOJI_GROUPS.map((group) => (
      <View key={group.labelKey}>
        <Text style={[styles.groupLabel, { color: textColor }]}>
          {FM(`onlineMenus.categoryIcon.${group.labelKey}`)}
        </Text>
        <View style={styles.grid}>
          {group.emojis.map((entry) => {
            const isSelected = selectedEmoji === entry.emoji;
            return (
              <TouchableOpacity
                key={entry.emoji}
                accessibilityHint={FM('onlineMenus.categoryIcon.emojiLabel', entry.label)}
                accessibilityLabel={entry.emoji}
                accessibilityRole="button"
                style={[
                  styles.emojiCell,
                  isSelected ? [styles.emojiCellSelected, { borderColor: primaryColor }] : undefined,
                ]}
                testID={`${TestIds.CATEGORY_EMOJI_GRID_ITEM}-${categoryIndex}-${entry.label}`}
                onPress={() => { onSelect(entry.emoji); }}
              >
                <Text style={styles.emojiText}>{entry.emoji}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    ))}
  </View>
);

// ─── Main Component ───────────────────────────────────────────────────

interface EmojiPickerProps {
  selectedEmoji: string | null | undefined;
  categoryIndex: number;
  onSelect: (emoji: string | null) => void;
  borderColor: string;
  textColor: string;
  primaryColor: string;
}

const EmojiPicker: React.FC<EmojiPickerProps> = ({
  selectedEmoji,
  categoryIndex,
  onSelect,
  borderColor,
  textColor,
  primaryColor,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleToggle = useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);

  const handleSelect = useCallback(
    (emoji: string) => {
      onSelect(emoji);
      setIsOpen(false);
    },
    [onSelect],
  );

  const handleClear = useCallback(() => {
    onSelect(null);
  }, [onSelect]);

  const categoryName = FM('onlineMenus.categoryIcon.label');
  const hasEmoji = isValueDefined(selectedEmoji) && selectedEmoji !== '';

  return (
    <View style={styles.row}>
      <TouchableOpacity
        accessibilityHint={FM('onlineMenus.categoryIcon.buttonHint')}
        accessibilityLabel={FM('onlineMenus.categoryIcon.buttonLabel', categoryName)}
        accessibilityRole="button"
        style={styles.emojiButton}
        testID={`${TestIds.CATEGORY_EMOJI_BUTTON}-${categoryIndex}`}
        onPress={handleToggle}
      >
        <Text style={styles.emojiButtonText}>
          {selectedEmoji ?? '\u{1F3F7}\uFE0F'}
        </Text>
      </TouchableOpacity>

      {hasEmoji ? (
        <TouchableOpacity
          accessibilityHint={FM('onlineMenus.categoryIcon.clearHint')}
          accessibilityLabel={FM('onlineMenus.categoryIcon.clearLabel')}
          accessibilityRole="button"
          testID={`${TestIds.CATEGORY_EMOJI_CLEAR_BUTTON}-${categoryIndex}`}
          onPress={handleClear}
        >
          <Text style={[styles.clearButtonText, { color: textColor }]}>{'\u2715'}</Text>
        </TouchableOpacity>
      ) : null}

      {isOpen ? (
        <EmojiGrid
          borderColor={borderColor}
          categoryIndex={categoryIndex}
          primaryColor={primaryColor}
          selectedEmoji={selectedEmoji}
          textColor={textColor}
          onSelect={handleSelect}
        />
      ) : null}
    </View>
  );
};

export default EmojiPicker;
