import React, { useMemo } from 'react';

import { View } from 'react-native';

import QRCode from 'react-qr-code';

import { TestIds } from '../../../../shared/testIds';
import { type TemplateType } from '../enums/TemplateType';
import { renderTemplate } from '../utils/designerTemplates';
import { DEFAULT_QR_SIZE } from '../utils/qrCodeConstants';
import { DESIGNER_QR_SOURCE_ID, TEMPLATE_DIMENSIONS } from '../utils/qrDesignerConstants';
import { extractQrDataUri } from '../utils/qrDesignerDownload';
import { previewStyles } from '../utils/qrDesignerStyles';

import type { TemplateRenderOptions } from '../utils/designerTemplates';

interface Props {
  template: TemplateType;
  restaurantName: string;
  tagline: string;
  callToAction: string;
  qrFgColor: string;
  qrBgColor: string;
  accentColor: string;
  publicUrl: string;
  logoDataUri: string;
}

const PREVIEW_SCALE = 0.6;

const DesignerPreview = ({
  template,
  restaurantName,
  tagline,
  callToAction,
  qrFgColor,
  qrBgColor,
  accentColor,
  publicUrl,
  logoDataUri,
}: Props): React.ReactElement => {
  const qrDataUri = useMemo(() => extractQrDataUri(), []);

  const svgString = useMemo(() => {
    const opts: TemplateRenderOptions = {
      restaurantName,
      tagline,
      callToAction,
      qrFgColor,
      qrBgColor,
      accentColor,
      qrDataUri,
      logoDataUri,
    };
    return renderTemplate(template, opts);
  }, [template, restaurantName, tagline, callToAction, qrFgColor, qrBgColor, accentColor, qrDataUri, logoDataUri]);

  const dims = TEMPLATE_DIMENSIONS[template];
  const previewWidth = dims.width * PREVIEW_SCALE;
  const previewHeight = dims.height * PREVIEW_SCALE;

  return (
    <View style={previewStyles.container} testID={TestIds.QR_DESIGNER_PREVIEW}>
      <View id={DESIGNER_QR_SOURCE_ID} nativeID={DESIGNER_QR_SOURCE_ID} style={previewStyles.hiddenSource}>
        <QRCode bgColor={qrBgColor} fgColor={qrFgColor} size={DEFAULT_QR_SIZE} value={publicUrl} />
      </View>
      <View style={[previewStyles.svgWrapper, { width: previewWidth, height: previewHeight }]}>
        <div
          dangerouslySetInnerHTML={{ __html: svgString }}
          style={{ width: previewWidth, height: previewHeight }}
        />
      </View>
    </View>
  );
};

export default DesignerPreview;
