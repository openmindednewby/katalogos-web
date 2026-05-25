


import React from 'react';

import { Text, View } from 'react-native';

import { FM } from '@/localization/helpers';

import MediaPosition from '../../../../types/enums/MediaPosition';
import { mediaPositionEditorStyles as styles } from '../utils/mediaPositionEditorStyles';

interface Props {
  position: MediaPosition;
  borderRadius: number;
  primaryColor: string;
  textColor: string;
  textSecondary: string;
  surfaceColor: string;
  borderColor: string;
}

const PREVIEW_IMAGE_TEXT_COLOR = '#FFFFFF';
const BACKGROUND_OVERLAY_OPACITY = 0.3;

const MediaPositionPreview: React.FC<Props> = ({
  position,
  borderRadius,
  primaryColor,
  textColor,
  textSecondary,
  surfaceColor,
  borderColor,
}) => {

  const imageStyle = [
    styles.previewImage,
    { backgroundColor: primaryColor, borderRadius },
  ];

  const boxStyle = [styles.previewBox, { borderColor, backgroundColor: surfaceColor }];

  if (position === MediaPosition.None)
    return (
      <View style={boxStyle}>
        <Text style={[styles.previewText, { color: textSecondary }]}>
          {FM('mediaPosition.preview.hidden')}
        </Text>
      </View>
    );

  if (position === MediaPosition.Background)
    return (
      <View style={boxStyle}>
        <View
          style={[
            styles.previewBackgroundImage,
            { backgroundColor: primaryColor, opacity: BACKGROUND_OVERLAY_OPACITY },
          ]}
        />
        <View style={styles.previewOverlayContent}>
          <Text style={[styles.previewText, { color: textColor }]}>
            {FM('mediaPosition.preview.content')}
          </Text>
        </View>
      </View>
    );

  const isHorizontal = position === MediaPosition.Left || position === MediaPosition.Right;
  const imageFirst = position === MediaPosition.Left || position === MediaPosition.Top;

  const imageElement = (
    <View style={imageStyle}>
      <Text style={[styles.previewText, { color: PREVIEW_IMAGE_TEXT_COLOR }]}>
        {FM('mediaPosition.preview.image')}
      </Text>
    </View>
  );

  const contentElement = (
    <View style={styles.previewContent}>
      <Text style={[styles.previewText, { color: textSecondary }]}>
        {FM('mediaPosition.preview.content')}
      </Text>
    </View>
  );

  if (isHorizontal)
    return (
      <View style={boxStyle}>
        <View style={styles.previewRow}>
          {imageFirst ? imageElement : contentElement}
          {imageFirst ? contentElement : imageElement}
        </View>
      </View>
    );

  return (
    <View style={boxStyle}>
      <View style={styles.previewColumn}>
        {imageFirst ? imageElement : contentElement}
        {imageFirst ? contentElement : imageElement}
      </View>
    </View>
  );
};

export default MediaPositionPreview;
