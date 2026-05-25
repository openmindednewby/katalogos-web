import React, { useCallback, useState } from 'react';

import { Modal, Text, TouchableOpacity, View } from 'react-native';

import { FM } from '@/localization/helpers';
import AnalyticsEventName from '@/shared/enums/AnalyticsEventName';

import QrCodeActions from './components/QrCodeActions';
import QrCodeColorInputs from './components/QrCodeColorInputs';
import QrCodeDisplay from './components/QrCodeDisplay';
import { DEFAULT_BG_COLOR, DEFAULT_FG_COLOR, DEFAULT_QR_SIZE } from './utils/qrCodeConstants';
import { copyToClipboard, downloadQrAsPng, downloadQrAsSvg } from './utils/qrCodeDownload';
import { modalStyles } from './utils/qrCodeStyles';
import { useAnalytics } from '../../../lib/analytics';
import { notify, notifySuccess } from '../../../lib/notifications';
import { TestIds } from '../../../shared/testIds';
import { useTheme } from '../../../theme/hooks/useTheme';

interface Props {
  visible: boolean;
  menuName: string;
  publicUrl: string;
  onClose: () => void;
}

const QrCodeModal = ({ visible, menuName, publicUrl, onClose }: Props): React.ReactElement => {
  const { theme } = useTheme();
  const colors = theme.colors;
  const { track } = useAnalytics();

  const [fgColor, setFgColor] = useState(DEFAULT_FG_COLOR);
  const [bgColor, setBgColor] = useState(DEFAULT_BG_COLOR);

  const handleDownloadPng = useCallback(async () => {
    const success = await downloadQrAsPng(menuName, DEFAULT_QR_SIZE);
    if (success) {
      notifySuccess(FM('onlineMenus.qrCode.downloadStarted'));
      track(AnalyticsEventName.QrCodeDownloaded, { format: 'png' });
    }
  }, [menuName, track]);

  const handleDownloadSvg = useCallback(() => {
    const success = downloadQrAsSvg(menuName);
    if (success) {
      notifySuccess(FM('onlineMenus.qrCode.downloadStarted'));
      track(AnalyticsEventName.QrCodeDownloaded, { format: 'svg' });
    }
  }, [menuName, track]);

  const handleCopyLink = useCallback(async () => {
    const success = await copyToClipboard(publicUrl);
    if (success) notifySuccess(FM('onlineMenus.qrCode.linkCopied'));
    else notify('error', FM('onlineMenus.qrCode.copyFailed'));
  }, [publicUrl]);

  const modalTitle = FM('onlineMenus.qrCode.menuQrCode', menuName);

  return (
    <Modal
      transparent
      animationType="fade"
      testID={TestIds.QR_CODE_MODAL}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={modalStyles.overlay}>
        <View
          accessibilityViewIsModal
          aria-label={modalTitle}
          role="dialog"
          style={[modalStyles.content, { backgroundColor: colors.surface }]}
        >
          <View style={[modalStyles.header, { borderBottomColor: colors.border }]}>
            <Text style={[modalStyles.headerTitle, { color: colors.text }]}>
              {modalTitle}
            </Text>
            <TouchableOpacity
              accessibilityHint={FM('onlineMenus.qrCode.closeBtnHint')}
              accessibilityLabel={FM('common.cancel')}
              accessibilityRole="button"
              style={[modalStyles.closeButton, { backgroundColor: colors.border }]}
              testID={TestIds.QR_CODE_CLOSE_BUTTON}
              onPress={onClose}
            >
              <Text style={[modalStyles.closeText, { color: colors.text }]}>
                {FM('common.cancel')}
              </Text>
            </TouchableOpacity>
          </View>
          <View style={modalStyles.body}>
            <QrCodeDisplay
              bgColor={bgColor}
              fgColor={fgColor}
              menuName={menuName}
              size={DEFAULT_QR_SIZE}
              textColor={colors.text}
              textSecondaryColor={colors.textSecondary}
              url={publicUrl}
            />
            <QrCodeColorInputs
              bgColor={bgColor}
              bgHint={FM('onlineMenus.qrCode.backgroundColorHint')}
              bgLabel={FM('onlineMenus.qrCode.backgroundColor')}
              borderColor={colors.border}
              fgColor={fgColor}
              fgHint={FM('onlineMenus.qrCode.foregroundColorHint')}
              fgLabel={FM('onlineMenus.qrCode.foregroundColor')}
              textColor={colors.text}
              onBgColorChange={setBgColor}
              onFgColorChange={setFgColor}
            />
            <QrCodeActions
              copyLinkHint={FM('onlineMenus.qrCode.copyLinkHint')}
              copyLinkLabel={FM('onlineMenus.qrCode.copyLink')}
              downloadPngHint={FM('onlineMenus.qrCode.downloadPngHint')}
              downloadPngLabel={FM('onlineMenus.qrCode.downloadPng')}
              downloadSvgHint={FM('onlineMenus.qrCode.downloadSvgHint')}
              downloadSvgLabel={FM('onlineMenus.qrCode.downloadSvg')}
              primaryColor={theme.palette.primary['500']}
              secondaryColor={theme.palette.secondary['500']}
              textOnPrimaryColor={String(colors.background)}
              onCopyLink={handleCopyLink}
              onDownloadPng={handleDownloadPng}
              onDownloadSvg={handleDownloadSvg}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default QrCodeModal;
