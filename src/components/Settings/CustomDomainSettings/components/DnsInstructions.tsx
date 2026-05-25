/**
 * DnsInstructions - shows CNAME and TXT record setup instructions
 * with copyable values for DNS verification.
 */
import React, { useCallback } from 'react';

import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { notifyError, notifySuccess } from '../../../../lib/notifications';
import { FM } from '../../../../localization/helpers';
import { TestIds } from '../../../../shared/testIds';
import { useTheme } from '../../../../theme/hooks/useTheme';
import { BODY_FONT_SIZE, DESCRIPTION_FONT_SIZE } from '../../constants';
import {
  CNAME_TARGET,
  COPY_BUTTON_BORDER_RADIUS,
  COPY_BUTTON_MARGIN_LEFT,
  COPY_BUTTON_PADDING,
  INSTRUCTION_GAP,
  LABEL_MARGIN_BOTTOM,
  TXT_RECORD_PREFIX,
} from '../constants';

interface Props {
  domainName: string;
  ownershipToken: string;
  cnameTarget?: string;
}

const styles = StyleSheet.create({
  container: { gap: INSTRUCTION_GAP },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  label: { fontSize: DESCRIPTION_FONT_SIZE, fontWeight: '600', marginBottom: LABEL_MARGIN_BOTTOM },
  value: { fontSize: BODY_FONT_SIZE, fontFamily: 'monospace', flex: 1 },
  copyButton: { padding: COPY_BUTTON_PADDING, borderRadius: COPY_BUTTON_BORDER_RADIUS, borderWidth: 1, marginLeft: COPY_BUTTON_MARGIN_LEFT },
  copyText: { fontSize: DESCRIPTION_FONT_SIZE, fontWeight: '600' },
});

async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

const DnsInstructions = ({ domainName, ownershipToken, cnameTarget }: Props): React.ReactElement => {
  const { theme } = useTheme();
  const colors = theme.colors;
  const primary = theme.palette.primary['500'];
  const target = cnameTarget ?? CNAME_TARGET;
  const txtHost = `${TXT_RECORD_PREFIX}${domainName}`;

  const handleCopyCname = useCallback(async () => {
    const ok = await copyToClipboard(target);
    if (ok) notifySuccess(FM('settings.customDomain.copied'));
    else notifyError(FM('settings.customDomain.copyFailed'));
  }, [target]);

  const handleCopyTxt = useCallback(async () => {
    const ok = await copyToClipboard(ownershipToken);
    if (ok) notifySuccess(FM('settings.customDomain.copied'));
    else notifyError(FM('settings.customDomain.copyFailed'));
  }, [ownershipToken]);

  return (
    <View style={styles.container}>
      <View testID={TestIds.CUSTOM_DOMAIN_CNAME_INSTRUCTION}>
        <Text style={[styles.label, { color: colors.textSecondary }]}>
          {FM('settings.customDomain.cnameInstruction', domainName, target)}
        </Text>
        <View style={styles.row}>
          <Text style={[styles.value, { color: colors.text }]}>{target}</Text>
          <TouchableOpacity
            accessibilityHint={FM('settings.customDomain.copyCnameHint')}
            accessibilityLabel={FM('settings.customDomain.copyCnameLabel')}
            accessibilityRole="button"
            style={[styles.copyButton, { borderColor: primary }]}
            testID={TestIds.CUSTOM_DOMAIN_COPY_CNAME}
            onPress={handleCopyCname}
          >
            <Text style={[styles.copyText, { color: primary }]}>{FM('common.copy')}</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View testID={TestIds.CUSTOM_DOMAIN_TXT_INSTRUCTION}>
        <Text style={[styles.label, { color: colors.textSecondary }]}>
          {FM('settings.customDomain.txtInstruction', txtHost, ownershipToken)}
        </Text>
        <View style={styles.row}>
          <Text style={[styles.value, { color: colors.text }]}>{ownershipToken}</Text>
          <TouchableOpacity
            accessibilityHint={FM('settings.customDomain.copyTxtHint')}
            accessibilityLabel={FM('settings.customDomain.copyTxtLabel')}
            accessibilityRole="button"
            style={[styles.copyButton, { borderColor: primary }]}
            testID={TestIds.CUSTOM_DOMAIN_COPY_TXT}
            onPress={handleCopyTxt}
          >
            <Text style={[styles.copyText, { color: primary }]}>{FM('common.copy')}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default DnsInstructions;
