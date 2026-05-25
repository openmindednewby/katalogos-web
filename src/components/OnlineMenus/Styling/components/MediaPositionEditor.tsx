

import React, { useCallback } from 'react';

import { Text, View } from 'react-native';

import { useSelector } from 'react-redux';

import { FM } from '@/localization/helpers';

import MediaBorderRadiusSlider from './MediaBorderRadiusSlider';
import MediaOptionButton from './MediaOptionButton';
import MediaPositionPreview from './MediaPositionPreview';
import MediaShowToggle from './MediaShowToggle';
import ThemeMode from '../../../../shared/enums/ThemeMode';
import { TestIds } from '../../../../shared/testIds';
import { themePalette } from '../../../../theme/utils/styles';
import MediaPosition from '../../../../types/enums/MediaPosition';
import { FIT_OPTIONS, MIN_BORDER_RADIUS, POSITION_OPTIONS, SIZE_OPTIONS } from '../utils/mediaPositionConstants';
import { mediaPositionEditorStyles as styles } from '../utils/mediaPositionEditorStyles';

import type { RootState } from '../../../../store/reduxStore';
import type { MediaFit, MediaSettings, MediaSize } from '../../../../types/menuStyleTypes';

interface Props {
  value: MediaSettings;
  onChange: (value: MediaSettings) => void;
  disabled?: boolean;
}

const MediaPositionEditor: React.FC<Props> = ({ value, onChange, disabled = false }) => {
  const theme = useSelector((s: RootState) => s.ui.theme);
  const colors = theme === ThemeMode.Dark ? themePalette.dark : themePalette.light;

  const textColor = String(colors.text);
  const textSecondary = String(colors.subtext);
  const surfaceColor = String(colors.surface);
  const borderColor = String(colors.border);
  const primaryColor = String(colors.primary);

  const isImageVisible = value.position !== MediaPosition.None;
  const currentBorderRadius = value.borderRadius ?? MIN_BORDER_RADIUS;
  const currentPosition = value.position ?? MediaPosition.Left;

  const handlePositionChange = useCallback(
    (position: MediaPosition) => {
      if (disabled) return;
      onChange({ ...value, position });
    },
    [disabled, onChange, value],
  );

  const handleSizeChange = useCallback(
    (size: MediaSize) => {
      if (disabled) return;
      onChange({ ...value, size });
    },
    [disabled, onChange, value],
  );

  const handleFitChange = useCallback(
    (fit: MediaFit) => {
      if (disabled) return;
      onChange({ ...value, fit });
    },
    [disabled, onChange, value],
  );

  const handleBorderRadiusChange = useCallback(
    (borderRadius: number) => {
      if (disabled) return;
      onChange({ ...value, borderRadius: Math.round(borderRadius) });
    },
    [disabled, onChange, value],
  );

  const handleShowToggle = useCallback(
    (show: boolean) => {
      if (disabled) return;
      if (show) onChange({ ...value, position: MediaPosition.Left });
      else onChange({ ...value, position: MediaPosition.None });
    },
    [disabled, onChange, value],
  );

  const buttonProps = { disabled, textColor, surfaceColor, borderColor, primaryColor };

  return (
    <View style={styles.container} testID={TestIds.MEDIA_POSITION_EDITOR}>
      <Text style={[styles.sectionTitle, { color: textColor }]}>{FM('mediaPosition.title')}</Text>

      <MediaShowToggle
        disabled={disabled}
        isVisible={isImageVisible}
        primaryColor={primaryColor}
        textColor={textColor}
        onChange={handleShowToggle}
      />

      {isImageVisible ? (
        <>
          <View style={styles.previewContainer} testID={TestIds.MEDIA_PREVIEW}>
            <MediaPositionPreview
              borderColor={borderColor}
              borderRadius={currentBorderRadius}
              position={currentPosition}
              primaryColor={primaryColor}
              surfaceColor={surfaceColor}
              textColor={textColor}
              textSecondary={textSecondary}
            />
          </View>

          <View style={styles.sectionContainer}>
            <Text style={[styles.sectionLabel, { color: textSecondary }]}>
              {FM('mediaPosition.positionLabel')}
            </Text>
            <View style={styles.buttonsRow}>
              {POSITION_OPTIONS.map((opt) => (
                <MediaOptionButton
                  key={opt.id}
                  currentValue={value.position}
                  option={opt}
                  testIdPrefix={TestIds.MEDIA_POSITION_BUTTON}
                  onPress={handlePositionChange}
                  {...buttonProps}
                />
              ))}
            </View>
          </View>

          <View style={styles.sectionContainer}>
            <Text style={[styles.sectionLabel, { color: textSecondary }]}>{FM('mediaPosition.sizeLabel')}</Text>
            <View style={styles.buttonsRow}>
              {SIZE_OPTIONS.map((opt) => (
                <MediaOptionButton
                  key={opt.id}
                  currentValue={value.size}
                  option={opt}
                  testIdPrefix={TestIds.MEDIA_SIZE_BUTTON}
                  onPress={handleSizeChange}
                  {...buttonProps}
                />
              ))}
            </View>
          </View>

          <View style={styles.sectionContainer}>
            <Text style={[styles.sectionLabel, { color: textSecondary }]}>{FM('mediaPosition.fitLabel')}</Text>
            <View style={styles.buttonsRow}>
              {FIT_OPTIONS.map((opt) => (
                <MediaOptionButton
                  key={opt.id}
                  currentValue={value.fit}
                  option={opt}
                  testIdPrefix={TestIds.MEDIA_FIT_BUTTON}
                  onPress={handleFitChange}
                  {...buttonProps}
                />
              ))}
            </View>
          </View>

          <MediaBorderRadiusSlider
            borderColor={borderColor}
            disabled={disabled}
            primaryColor={primaryColor}
            textColor={textColor}
            value={currentBorderRadius}
            onChange={handleBorderRadiusChange}
          />
        </>
      ) : null}
    </View>
  );
};

export default MediaPositionEditor;

// Re-export constants for backward compatibility with tests
export {
  FIT_OPTION_COUNT,
  FIT_OPTIONS,
  POSITION_OPTION_COUNT,
  POSITION_OPTIONS,
  SIZE_OPTION_COUNT,
  SIZE_OPTIONS,
} from '../utils/mediaPositionConstants';
