import React, { useCallback, useMemo } from 'react';

import { Modal, ScrollView, Text, TouchableOpacity, View } from 'react-native';

import { FM } from '@/localization/helpers';
import AnalyticsEventName from '@/shared/enums/AnalyticsEventName';

import DesignerCustomizePanel from './components/DesignerCustomizePanel';
import DesignerDownloadActions from './components/DesignerDownloadActions';
import DesignerPreview from './components/DesignerPreview';
import TemplateSelector from './components/TemplateSelector';
import { buildInitialState, useDesignerState } from './hooks/useDesignerState';
import { renderTemplate } from './utils/designerTemplates';
import { TEMPLATE_DIMENSIONS } from './utils/qrDesignerConstants';
import { downloadDesignAsPdf, downloadDesignAsPng, downloadDesignAsSvg, extractQrDataUri } from './utils/qrDesignerDownload';
import { designerModalStyles as styles } from './utils/qrDesignerStyles';
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

const QrCodeDesignerModal = ({ visible, menuName, publicUrl, onClose }: Props): React.ReactElement => {
  const { theme } = useTheme();
  const colors = theme.colors;
  const { track } = useAnalytics();

  const initialState = useMemo(() => buildInitialState(menuName, publicUrl), [menuName, publicUrl]);
  const { state, dispatchers } = useDesignerState(initialState);

  const buildCurrentSvg = useCallback(() => {
    const qrDataUri = extractQrDataUri();
    return renderTemplate(state.template, {
      restaurantName: state.restaurantName,
      tagline: state.tagline,
      callToAction: state.callToAction,
      qrFgColor: state.qrFgColor,
      qrBgColor: state.qrBgColor,
      accentColor: state.accentColor,
      qrDataUri,
      logoDataUri: state.logoDataUri,
    });
  }, [state]);

  const dims = TEMPLATE_DIMENSIONS[state.template];

  const handleDownloadPng = useCallback(async () => {
    const svg = buildCurrentSvg();
    const success = await downloadDesignAsPng(svg, dims.width, dims.height, menuName);
    if (success) {
      notifySuccess(FM('onlineMenus.qrCode.designer.downloadStarted'));
      track(AnalyticsEventName.QrCodeDownloaded, { format: 'png' });
    } else notify('error', FM('onlineMenus.qrCode.designer.downloadFailed'));
  }, [buildCurrentSvg, dims, menuName, track]);

  const handleDownloadSvg = useCallback(() => {
    const svg = buildCurrentSvg();
    const success = downloadDesignAsSvg(svg, menuName);
    if (success) {
      notifySuccess(FM('onlineMenus.qrCode.designer.downloadStarted'));
      track(AnalyticsEventName.QrCodeDownloaded, { format: 'svg' });
    } else notify('error', FM('onlineMenus.qrCode.designer.downloadFailed'));
  }, [buildCurrentSvg, menuName, track]);

  const handleDownloadPdf = useCallback(async () => {
    const svg = buildCurrentSvg();
    const success = await downloadDesignAsPdf(svg, dims.width, dims.height, menuName);
    if (success) {
      notifySuccess(FM('onlineMenus.qrCode.designer.downloadStarted'));
      track(AnalyticsEventName.QrCodeDownloaded, { format: 'pdf' });
    } else notify('error', FM('onlineMenus.qrCode.designer.downloadFailed'));
  }, [buildCurrentSvg, dims, menuName, track]);

  const modalTitle = FM('onlineMenus.qrCode.designer.title', menuName);

  return (
    <Modal
      transparent
      animationType="fade"
      testID={TestIds.QR_DESIGNER_MODAL}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View
          accessibilityViewIsModal
          aria-label={modalTitle}
          role="dialog"
          style={[styles.content, { backgroundColor: colors.surface }]}
        >
          <View style={[styles.header, { borderBottomColor: colors.border }]}>
            <Text style={[styles.headerTitle, { color: colors.text }]}>
              {modalTitle}
            </Text>
            <TouchableOpacity
              accessibilityHint={FM('onlineMenus.qrCode.designer.closeBtnHint')}
              accessibilityLabel={FM('common.cancel')}
              accessibilityRole="button"
              style={[styles.closeButton, { backgroundColor: colors.border }]}
              testID={TestIds.QR_DESIGNER_CLOSE_BUTTON}
              onPress={onClose}
            >
              <Text style={[styles.closeText, { color: colors.text }]}>
                {FM('common.cancel')}
              </Text>
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.scrollBody}>
            <View style={styles.body}>
              <TemplateSelector selected={state.template} onSelect={dispatchers.setTemplate} />
              <DesignerPreview
                accentColor={state.accentColor}
                callToAction={state.callToAction}
                logoDataUri={state.logoDataUri}
                publicUrl={state.publicUrl}
                qrBgColor={state.qrBgColor}
                qrFgColor={state.qrFgColor}
                restaurantName={state.restaurantName}
                tagline={state.tagline}
                template={state.template}
              />
              <DesignerCustomizePanel dispatchers={dispatchers} state={state} />
              <DesignerDownloadActions
                primaryColor={theme.palette.primary['500']}
                textOnPrimaryColor={String(colors.background)}
                onDownloadPdf={handleDownloadPdf}
                onDownloadPng={handleDownloadPng}
                onDownloadSvg={handleDownloadSvg}
              />
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

export default QrCodeDesignerModal;
