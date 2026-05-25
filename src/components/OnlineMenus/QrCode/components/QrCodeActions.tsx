import React from 'react';

import { Text, TouchableOpacity, View } from 'react-native';

import { TestIds } from '../../../../shared/testIds';
import { SvgIcon } from '../../../Icons';
import { actionStyles } from '../utils/qrCodeStyles';

const ACTION_ICON_SIZE = 16;

interface Props {
  primaryColor: string;
  secondaryColor: string;
  textOnPrimaryColor: string;
  downloadPngLabel: string;
  downloadSvgLabel: string;
  copyLinkLabel: string;
  downloadPngHint: string;
  downloadSvgHint: string;
  copyLinkHint: string;
  onDownloadPng: () => void;
  onDownloadSvg: () => void;
  onCopyLink: () => void;
}

const QrCodeActions = ({
  primaryColor,
  secondaryColor,
  textOnPrimaryColor,
  downloadPngLabel,
  downloadSvgLabel,
  copyLinkLabel,
  downloadPngHint,
  downloadSvgHint,
  copyLinkHint,
  onDownloadPng,
  onDownloadSvg,
  onCopyLink,
}: Props): React.ReactElement => (
  <View style={actionStyles.container}>
    <View style={actionStyles.row}>
      <TouchableOpacity
        accessibilityHint={downloadPngHint}
        accessibilityLabel={downloadPngLabel}
        accessibilityRole="button"
        style={[actionStyles.button, { backgroundColor: primaryColor }]}
        testID={TestIds.QR_CODE_DOWNLOAD_PNG_BUTTON}
        onPress={onDownloadPng}
      >
        <SvgIcon color={textOnPrimaryColor} name="download" size={ACTION_ICON_SIZE} />
        <Text style={[actionStyles.buttonText, { color: textOnPrimaryColor }]}>
          {downloadPngLabel}
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        accessibilityHint={downloadSvgHint}
        accessibilityLabel={downloadSvgLabel}
        accessibilityRole="button"
        style={[actionStyles.button, { backgroundColor: primaryColor }]}
        testID={TestIds.QR_CODE_DOWNLOAD_SVG_BUTTON}
        onPress={onDownloadSvg}
      >
        <SvgIcon color={textOnPrimaryColor} name="download" size={ACTION_ICON_SIZE} />
        <Text style={[actionStyles.buttonText, { color: textOnPrimaryColor }]}>
          {downloadSvgLabel}
        </Text>
      </TouchableOpacity>
    </View>
    <TouchableOpacity
      accessibilityHint={copyLinkHint}
      accessibilityLabel={copyLinkLabel}
      accessibilityRole="button"
      style={[actionStyles.button, { backgroundColor: secondaryColor }]}
      testID={TestIds.QR_CODE_COPY_LINK_BUTTON}
      onPress={onCopyLink}
    >
      <SvgIcon color={textOnPrimaryColor} name="copy" size={ACTION_ICON_SIZE} />
      <Text style={[actionStyles.buttonText, { color: textOnPrimaryColor }]}>
        {copyLinkLabel}
      </Text>
    </TouchableOpacity>
  </View>
);

export default QrCodeActions;
