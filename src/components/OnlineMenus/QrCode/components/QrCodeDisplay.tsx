import React from 'react';

import { Text, View } from 'react-native';

import QRCode from 'react-qr-code';

import { TestIds } from '../../../../shared/testIds';
import { DEFAULT_QR_SIZE, QR_CODE_CONTAINER_ID } from '../utils/qrCodeConstants';
import { modalStyles } from '../utils/qrCodeStyles';

interface Props {
  url: string;
  menuName: string;
  fgColor: string;
  bgColor: string;
  size: number;
  textColor: string;
  textSecondaryColor: string;
}

const QrCodeDisplay = ({
  url,
  menuName,
  fgColor,
  bgColor,
  size = DEFAULT_QR_SIZE,
  textColor,
  textSecondaryColor,
}: Props): React.ReactElement => (
  <View style={modalStyles.qrContainer} testID={TestIds.QR_CODE_DISPLAY}>
    <Text
      style={[modalStyles.menuName, { color: textColor }]}
      testID={TestIds.QR_CODE_MENU_NAME}
    >
      {menuName}
    </Text>
    <View id={QR_CODE_CONTAINER_ID} nativeID={QR_CODE_CONTAINER_ID}>
      <QRCode
        bgColor={bgColor}
        fgColor={fgColor}
        size={size}
        value={url}
      />
    </View>
    <Text
      numberOfLines={1}
      style={[modalStyles.urlText, { color: textSecondaryColor }]}
      testID={TestIds.QR_CODE_URL_TEXT}
    >
      {url}
    </Text>
  </View>
);

export default QrCodeDisplay;
