import React from 'react';

import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

import { FM } from '@/localization/helpers';

import { TestIds } from '../../../../shared/testIds';
import { isValueDefined } from '../../../../utils/is';
import { DEFAULT_EMBED_WIDTH, FIXED_EMBED_WIDTH, MAX_EMBED_HEIGHT, MIN_EMBED_HEIGHT } from '../utils/embedCodeConstants';

interface Props {
  width: string;
  height: number;
  themeOverride: 'light' | 'dark' | null;
  accentColor: string | null;
  textColor: string;
  borderColor: string;
  inputBackgroundColor: string;
  activePresetColor: string;
  inactivePresetColor: string;
  onWidthChange: (width: string) => void;
  onHeightChange: (height: number) => void;
  onThemeChange: (theme: 'light' | 'dark' | null) => void;
  onAccentColorChange: (color: string | null) => void;
}

const SECTION_GAP = 12;
const INPUT_HEIGHT = 36;
const INPUT_BORDER_RADIUS = 6;
const INPUT_PADDING_HORIZONTAL = 8;
const LABEL_FONT_SIZE = 13;
const LABEL_MARGIN_BOTTOM = 4;
const PRESET_PADDING_VERTICAL = 6;
const PRESET_PADDING_HORIZONTAL = 12;
const PRESET_BORDER_RADIUS = 6;
const PRESET_GAP = 8;
const PRESET_FONT_SIZE = 13;

const styles = StyleSheet.create({
  container: { gap: SECTION_GAP },
  label: { fontSize: LABEL_FONT_SIZE, fontWeight: '500', marginBottom: LABEL_MARGIN_BOTTOM },
  input: {
    height: INPUT_HEIGHT,
    borderWidth: 1,
    borderRadius: INPUT_BORDER_RADIUS,
    paddingHorizontal: INPUT_PADDING_HORIZONTAL,
  },
  presetRow: { flexDirection: 'row', gap: PRESET_GAP },
  presetButton: {
    paddingVertical: PRESET_PADDING_VERTICAL,
    paddingHorizontal: PRESET_PADDING_HORIZONTAL,
    borderRadius: PRESET_BORDER_RADIUS,
  },
  presetText: { fontSize: PRESET_FONT_SIZE, fontWeight: '600' },
  themeRow: { flexDirection: 'row', gap: PRESET_GAP },
});

function getThemeLabel(theme: 'light' | 'dark' | null): string {
  if (!isValueDefined(theme)) return FM('onlineMenus.embedWidget.themeNone');
  if (theme === 'light') return FM('onlineMenus.embedWidget.themeLight');
  return FM('onlineMenus.embedWidget.themeDark');
}

const EmbedConfigPanel = ({
  width,
  height,
  themeOverride,
  accentColor,
  textColor,
  borderColor,
  inputBackgroundColor,
  activePresetColor,
  inactivePresetColor,
  onWidthChange,
  onHeightChange,
  onThemeChange,
  onAccentColorChange,
}: Props): React.ReactElement => {
  const isFullWidth = width === DEFAULT_EMBED_WIDTH;
  const clampHeight = (raw: string): void => {
    const parsed = parseInt(raw, 10);
    if (Number.isNaN(parsed)) return;
    const clamped = Math.max(MIN_EMBED_HEIGHT, Math.min(MAX_EMBED_HEIGHT, parsed));
    onHeightChange(clamped);
  };

  return (
    <View style={styles.container}>
      {/* Width presets */}
      <View>
        <Text style={[styles.label, { color: textColor }]}>{FM('onlineMenus.embedWidget.widthLabel')}</Text>
        <View style={styles.presetRow}>
          <TouchableOpacity
            accessibilityHint={FM('onlineMenus.embedWidget.widthHint')}
            accessibilityLabel={FM('onlineMenus.embedWidget.widthPresetFull')}
            accessibilityRole="button"
            style={[styles.presetButton, { backgroundColor: isFullWidth ? activePresetColor : inactivePresetColor }]}
            testID={TestIds.EMBED_WIDGET_PRESET_FULL}
            onPress={() => onWidthChange(DEFAULT_EMBED_WIDTH)}
          >
            <Text style={[styles.presetText, { color: textColor }]}>{FM('onlineMenus.embedWidget.widthPresetFull')}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            accessibilityHint={FM('onlineMenus.embedWidget.widthHint')}
            accessibilityLabel={FM('onlineMenus.embedWidget.widthPresetFixed')}
            accessibilityRole="button"
            style={[styles.presetButton, { backgroundColor: !isFullWidth ? activePresetColor : inactivePresetColor }]}
            testID={TestIds.EMBED_WIDGET_PRESET_FIXED}
            onPress={() => onWidthChange(FIXED_EMBED_WIDTH)}
          >
            <Text style={[styles.presetText, { color: textColor }]}>{FM('onlineMenus.embedWidget.widthPresetFixed')}</Text>
          </TouchableOpacity>
        </View>
        {!isFullWidth ? (
          <TextInput
            accessibilityHint={FM('onlineMenus.embedWidget.widthHint')}
            accessibilityLabel={FM('onlineMenus.embedWidget.widthLabel')}
            style={[styles.input, { color: textColor, borderColor, backgroundColor: inputBackgroundColor }]}
            testID={TestIds.EMBED_WIDGET_WIDTH_INPUT}
            value={width}
            onChangeText={onWidthChange}
          />
        ) : null}
      </View>

      {/* Height */}
      <View>
        <Text style={[styles.label, { color: textColor }]}>{FM('onlineMenus.embedWidget.heightLabel')}</Text>
        <TextInput
          accessibilityHint={FM('onlineMenus.embedWidget.heightHint')}
          accessibilityLabel={FM('onlineMenus.embedWidget.heightLabel')}
          inputMode="numeric"
          style={[styles.input, { color: textColor, borderColor, backgroundColor: inputBackgroundColor }]}
          testID={TestIds.EMBED_WIDGET_HEIGHT_INPUT}
          value={String(height)}
          onChangeText={clampHeight}
        />
      </View>

      {/* Theme override */}
      <View>
        <Text style={[styles.label, { color: textColor }]}>{FM('onlineMenus.embedWidget.themeLabel')}</Text>
        <View style={styles.themeRow}>
          {([null, 'light', 'dark'] as const).map((t) => {
            const isActive = themeOverride === t;
            const label = getThemeLabel(t);
            return (
              <TouchableOpacity
                key={String(t)}
                accessibilityHint={FM('onlineMenus.embedWidget.themeHint')}
                accessibilityLabel={label}
                accessibilityRole="button"
                style={[styles.presetButton, { backgroundColor: isActive ? activePresetColor : inactivePresetColor }]}
                testID={TestIds.EMBED_WIDGET_THEME_SELECT}
                onPress={() => onThemeChange(t)}
              >
                <Text style={[styles.presetText, { color: textColor }]}>{label}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Accent color */}
      <View>
        <Text style={[styles.label, { color: textColor }]}>{FM('onlineMenus.embedWidget.accentColorLabel')}</Text>
        <TextInput
          accessibilityHint={FM('onlineMenus.embedWidget.accentColorHint')}
          accessibilityLabel={FM('onlineMenus.embedWidget.accentColorLabel')}
          placeholder={FM('onlineMenus.embedWidget.accentColorPlaceholder')}
          style={[styles.input, { color: textColor, borderColor, backgroundColor: inputBackgroundColor }]}
          testID={TestIds.EMBED_WIDGET_ACCENT_COLOR_INPUT}
          value={accentColor ?? ''}
          onChangeText={(v) => onAccentColorChange(v === '' ? null : v)}
        />
      </View>
    </View>
  );
};

export default EmbedConfigPanel;
