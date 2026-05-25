import React, { useCallback } from 'react';

import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { FM } from '@/localization/helpers';

import { notify, notifySuccess } from '../../../../lib/notifications';
import { TestIds } from '../../../../shared/testIds';
import { copyToClipboard } from '../../QrCode/utils/qrCodeDownload';

interface Props {
  code: string;
  textColor: string;
  backgroundColor: string;
  borderColor: string;
  buttonColor: string;
  buttonTextColor: string;
}

const CODE_FONT_SIZE = 12;
const CODE_PADDING = 12;
const CODE_BORDER_RADIUS = 6;
const BUTTON_PADDING_VERTICAL = 8;
const BUTTON_PADDING_HORIZONTAL = 16;
const BUTTON_BORDER_RADIUS = 6;
const BUTTON_MARGIN_TOP = 8;
const CODE_MAX_HEIGHT = 160;

const styles = StyleSheet.create({
  container: { marginTop: BUTTON_MARGIN_TOP },
  codeContainer: {
    padding: CODE_PADDING,
    borderRadius: CODE_BORDER_RADIUS,
    borderWidth: 1,
    maxHeight: CODE_MAX_HEIGHT,
  },
  codeText: {
    fontSize: CODE_FONT_SIZE,
    fontFamily: 'monospace',
  },
  copyButton: {
    paddingVertical: BUTTON_PADDING_VERTICAL,
    paddingHorizontal: BUTTON_PADDING_HORIZONTAL,
    borderRadius: BUTTON_BORDER_RADIUS,
    marginTop: BUTTON_MARGIN_TOP,
    alignSelf: 'flex-start',
  },
  copyButtonText: {
    fontWeight: '600',
    fontSize: CODE_FONT_SIZE,
  },
});

const EmbedCodePreview = ({
  code,
  textColor,
  backgroundColor,
  borderColor,
  buttonColor,
  buttonTextColor,
}: Props): React.ReactElement => {
  const handleCopy = useCallback(async () => {
    const success = await copyToClipboard(code);
    if (success) notifySuccess(FM('onlineMenus.embedWidget.codeCopied'));
    else notify('error', FM('onlineMenus.embedWidget.copyFailed'));
  }, [code]);

  return (
    <View style={styles.container}>
      <ScrollView style={[styles.codeContainer, { backgroundColor, borderColor }]}>
        <Text
          selectable
          style={[styles.codeText, { color: textColor }]}
          testID={TestIds.EMBED_WIDGET_CODE_PREVIEW}
        >
          {code}
        </Text>
      </ScrollView>
      <TouchableOpacity
        accessibilityHint={FM('onlineMenus.embedWidget.copyCodeHint')}
        accessibilityLabel={FM('onlineMenus.embedWidget.copyCode')}
        accessibilityRole="button"
        style={[styles.copyButton, { backgroundColor: buttonColor }]}
        testID={TestIds.EMBED_WIDGET_COPY_BUTTON}
        onPress={handleCopy}
      >
        <Text style={[styles.copyButtonText, { color: buttonTextColor }]}>
          {FM('onlineMenus.embedWidget.copyCode')}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default EmbedCodePreview;
