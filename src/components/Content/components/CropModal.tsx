/**
 * CropModal - web-only modal for cropping images before upload.
 *
 * Uses react-easy-crop for the interactive crop area and a native
 * Slider for zoom control. Guarded by Platform.OS === 'web'.
 */
import React, { useCallback, useState } from 'react';

import { Modal, Platform, Text, TouchableOpacity, View } from 'react-native';

import Slider from '@react-native-community/slider';

import { FM } from '@/localization/helpers';

import AspectRatioSelector from './AspectRatioSelector';
import { TestIds } from '../../../shared/testIds';
import { useTheme } from '../../../theme/hooks/useTheme';
import { isValueDefined } from '../../../utils/is';
import { MAX_ZOOM, MIN_ZOOM, ZOOM_STEP } from '../utils/cropImageUtils';
import { cropModalStyles as styles } from '../utils/cropModalStyles';

import type AspectRatioPreset from '../../../shared/enums/AspectRatioPreset';
import type { PixelCrop } from '../utils/cropImageUtils';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const BUTTON_TEXT_ON_PRIMARY = '#ffffff';
const INITIAL_ZOOM = 1;

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface CropArea {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface Props {
  visible: boolean;
  imageUri: string;
  aspectPreset: AspectRatioPreset;
  aspectRatio: number | undefined;
  onAspectChange: (preset: AspectRatioPreset) => void;
  onApply: (pixelCrop: PixelCrop) => void;
  onCancel: () => void;
}

// ---------------------------------------------------------------------------
// Lazy import helper (web-only)
// ---------------------------------------------------------------------------

/** Loads the Cropper component on web, returns null otherwise. */
function getCropper(): React.ComponentType<Record<string, unknown>> | null {
  if (Platform.OS !== 'web') return null;
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- require() returns any
  const mod: { default: React.ComponentType<Record<string, unknown>> } = require('react-easy-crop');
  return mod.default;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

const CropModal = ({
  visible, imageUri, aspectPreset, aspectRatio, onAspectChange, onApply, onCancel,
}: Props): React.ReactElement | null => {
  const { theme } = useTheme();
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(INITIAL_ZOOM);
  const [croppedArea, setCroppedArea] = useState<CropArea | null>(null);

  const handleCropComplete = useCallback((_: CropArea, areaPixels: CropArea) => {
    setCroppedArea(areaPixels);
  }, []);

  const handleApply = useCallback(() => {
    if (!isValueDefined(croppedArea)) return;
    onApply(croppedArea);
  }, [croppedArea, onApply]);

  const Cropper = getCropper();
  if (Platform.OS !== 'web' || !isValueDefined(Cropper)) return null;

  const textColor = theme.colors.text;
  const borderColor = theme.colors.border;
  const primaryColor = theme.palette.primary['500'];

  return (
    <Modal transparent animationType="fade" testID={TestIds.CROP_MODAL} visible={visible} onRequestClose={onCancel}>
      <View style={styles.overlay}>
        <View style={[styles.card, { backgroundColor: theme.colors.surface }]}>
          <View style={styles.header}>
            <Text style={[styles.title, { color: textColor }]}>{FM('imageCrop.title')}</Text>
          </View>
          <View accessibilityHint={FM('imageCrop.cropAreaHint')} accessibilityLabel={FM('imageCrop.cropAreaLabel')} style={styles.cropContainer}>
            <Cropper aspect={aspectRatio} crop={crop} image={imageUri} maxZoom={MAX_ZOOM} minZoom={MIN_ZOOM} zoom={zoom} onCropChange={setCrop} onCropComplete={handleCropComplete} onZoomChange={setZoom} />
          </View>
          <View style={styles.controls}>
            <AspectRatioSelector borderColor={borderColor} primaryColor={primaryColor} selected={aspectPreset} textColor={textColor} onSelect={onAspectChange} />
            <View style={styles.zoomRow}>
              <Text style={[styles.zoomLabel, { color: textColor }]}>{FM('imageCrop.zoomLabel')}</Text>
              <Slider accessibilityHint={FM('imageCrop.zoomHint')} accessibilityLabel={FM('imageCrop.zoomLabel')} maximumValue={MAX_ZOOM} minimumTrackTintColor={primaryColor} minimumValue={MIN_ZOOM} step={ZOOM_STEP} style={styles.zoomSlider} testID={TestIds.CROP_MODAL_ZOOM_SLIDER} value={zoom} onValueChange={setZoom} />
            </View>
          </View>
          <View style={styles.actions}>
            <TouchableOpacity accessibilityHint={FM('imageCrop.cancelHint')} accessibilityLabel={FM('common.cancel')} accessibilityRole="button" style={[styles.button, { borderColor }]} testID={TestIds.CROP_MODAL_CANCEL} onPress={onCancel}>
              <Text style={[styles.buttonLabel, { color: textColor }]}>{FM('common.cancel')}</Text>
            </TouchableOpacity>
            <TouchableOpacity accessibilityHint={FM('imageCrop.applyHint')} accessibilityLabel={FM('imageCrop.apply')} accessibilityRole="button" disabled={!isValueDefined(croppedArea)} style={[styles.button, { borderColor: primaryColor, backgroundColor: primaryColor }]} testID={TestIds.CROP_MODAL_APPLY} onPress={handleApply}>
              <Text style={[styles.buttonLabel, { color: BUTTON_TEXT_ON_PRIMARY }]}>{FM('imageCrop.apply')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default CropModal;
