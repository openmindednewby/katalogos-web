import React from 'react';

import { Text, TouchableOpacity, View } from 'react-native';

import { FM } from '@/localization/helpers';

import { TestIds } from '../../../../shared/testIds';
import { SvgIcon } from '../../../Icons';
import { downloadActionsStyles as styles } from '../utils/qrDesignerStyles';

const ACTION_ICON_SIZE = 16;

interface Props {
  primaryColor: string;
  textOnPrimaryColor: string;
  onDownloadPng: () => void;
  onDownloadSvg: () => void;
  onDownloadPdf: () => void;
}

const DesignerDownloadActions = ({
  primaryColor,
  textOnPrimaryColor,
  onDownloadPng,
  onDownloadSvg,
  onDownloadPdf,
}: Props): React.ReactElement => (
  <View style={styles.container}>
    <View style={styles.row}>
      <TouchableOpacity
        accessibilityHint={FM('onlineMenus.qrCode.designer.downloadPngHint')}
        accessibilityLabel={FM('onlineMenus.qrCode.designer.downloadPng')}
        accessibilityRole="button"
        style={[styles.button, { backgroundColor: primaryColor }]}
        testID={TestIds.QR_DESIGNER_DOWNLOAD_PNG}
        onPress={onDownloadPng}
      >
        <SvgIcon color={textOnPrimaryColor} name="download" size={ACTION_ICON_SIZE} />
        <Text style={[styles.buttonText, { color: textOnPrimaryColor }]}>
          {FM('onlineMenus.qrCode.designer.downloadPng')}
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        accessibilityHint={FM('onlineMenus.qrCode.designer.downloadSvgHint')}
        accessibilityLabel={FM('onlineMenus.qrCode.designer.downloadSvg')}
        accessibilityRole="button"
        style={[styles.button, { backgroundColor: primaryColor }]}
        testID={TestIds.QR_DESIGNER_DOWNLOAD_SVG}
        onPress={onDownloadSvg}
      >
        <SvgIcon color={textOnPrimaryColor} name="download" size={ACTION_ICON_SIZE} />
        <Text style={[styles.buttonText, { color: textOnPrimaryColor }]}>
          {FM('onlineMenus.qrCode.designer.downloadSvg')}
        </Text>
      </TouchableOpacity>
    </View>
    <TouchableOpacity
      accessibilityHint={FM('onlineMenus.qrCode.designer.downloadPdfHint')}
      accessibilityLabel={FM('onlineMenus.qrCode.designer.downloadPdf')}
      accessibilityRole="button"
      style={[styles.button, { backgroundColor: primaryColor }]}
      testID={TestIds.QR_DESIGNER_DOWNLOAD_PDF}
      onPress={onDownloadPdf}
    >
      <SvgIcon color={textOnPrimaryColor} name="download" size={ACTION_ICON_SIZE} />
      <Text style={[styles.buttonText, { color: textOnPrimaryColor }]}>
        {FM('onlineMenus.qrCode.designer.downloadPdf')}
      </Text>
    </TouchableOpacity>
  </View>
);

export default DesignerDownloadActions;
