/**
 * Data Export section.
 * Allows users to request, monitor, and download a GDPR data export.
 */
import React, { useCallback, useMemo, useState } from 'react';

import { StyleSheet, Text, View } from 'react-native';

import {
  useRequestDataExport,
  useExportStatus,
  useDownloadExport,
  ExportStatus,
} from '../../../../lib/hooks/privacy';
import { notifyError, notifySuccess } from '../../../../lib/notifications';
import { FM } from '../../../../localization/helpers';
import { TestIds } from '../../../../shared/testIds';
import { useTheme } from '../../../../theme/hooks/useTheme';
import { Button, ButtonVariant } from '../../../core/Button';
import Section from '../../../Shared/Section';
import {
  TITLE_FONT_SIZE,
  TITLE_GAP,
  DESCRIPTION_FONT_SIZE,
  MEDIUM_SPACING,
  BODY_FONT_SIZE,
  SMALL_SPACING,
} from '../constants';

import type { DataExportRequest } from '../../../../lib/hooks/privacy';

const TITLE_FONT_WEIGHT = '600' as const;

const styles = StyleSheet.create({
  sectionTitle: {
    fontSize: TITLE_FONT_SIZE,
    fontWeight: TITLE_FONT_WEIGHT,
    marginBottom: TITLE_GAP,
  },
  sectionDescription: {
    fontSize: DESCRIPTION_FONT_SIZE,
    marginBottom: MEDIUM_SPACING,
  },
  statusText: {
    fontSize: BODY_FONT_SIZE,
    marginBottom: MEDIUM_SPACING,
    fontStyle: 'italic',
  },
  buttonSpacing: {
    marginTop: SMALL_SPACING,
  },
});

/** Translation key map for export statuses. */
const STATUS_TRANSLATION_KEYS: Record<string, string | undefined> = {
  [ExportStatus.Pending]: 'settings.privacy.dataExport.status.pending',
  [ExportStatus.Processing]: 'settings.privacy.dataExport.status.processing',
  [ExportStatus.Completed]: 'settings.privacy.dataExport.status.completed',
  [ExportStatus.Failed]: 'settings.privacy.dataExport.status.failed',
  [ExportStatus.Expired]: 'settings.privacy.dataExport.status.expired',
};

function getStatusTranslationKey(status: string): string {
  return STATUS_TRANSLATION_KEYS[status] ?? 'settings.privacy.dataExport.status.pending';
}

const DataExportSection = (): React.ReactElement => {
  const { theme } = useTheme();
  const { colors } = theme;

  const [activeRequestId, setActiveRequestId] = useState<string | undefined>(undefined);

  const handleExportSuccess = useCallback((data: DataExportRequest) => {
    setActiveRequestId(data.requestId);
    notifySuccess(FM('settings.privacy.dataExport.messages.requestSuccess'));
  }, []);

  const handleExportError = useCallback(
    (_error: Error) => {
      notifyError(FM('settings.privacy.dataExport.messages.requestError'));
    },
    [],
  );

  const requestCallbacks = useMemo(
    () => ({ onSuccess: handleExportSuccess, onError: handleExportError }),
    [handleExportSuccess, handleExportError],
  );

  const { requestExport, isPending: isRequesting } = useRequestDataExport(requestCallbacks);
  const { exportRequest } = useExportStatus(activeRequestId);

  const handleDownloadError = useCallback(
    (_error: Error) => {
      notifyError(FM('settings.privacy.dataExport.messages.downloadError'));
    },
    [],
  );

  const downloadErrorCallbacks = useMemo(
    () => ({ onError: handleDownloadError }),
    [handleDownloadError],
  );

  const { download, isPending: isDownloading } = useDownloadExport(
    activeRequestId,
    downloadErrorCallbacks,
  );

  const currentStatus = exportRequest?.status;
  const isCompleted = currentStatus === ExportStatus.Completed;
  const isActive = currentStatus === ExportStatus.Pending || currentStatus === ExportStatus.Processing;
  const hasStatus = typeof currentStatus === 'string';

  return (
    <Section>
      <View testID={TestIds.DATA_EXPORT_SECTION}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          {FM('settings.privacy.dataExport.title')}
        </Text>
        <Text style={[styles.sectionDescription, { color: colors.textSecondary }]}>
          {FM('settings.privacy.dataExport.description')}
        </Text>

        {hasStatus ? (
          <Text
            style={[styles.statusText, { color: colors.textSecondary }]}
            testID={TestIds.DATA_EXPORT_STATUS}
          >
            {FM(getStatusTranslationKey(currentStatus))}
          </Text>
        ) : null}

        {isCompleted ? (
          <View style={styles.buttonSpacing}>
            <Button
              accessibilityHint={FM('settings.privacy.dataExport.downloadButton')}
              accessibilityLabel={FM('settings.privacy.dataExport.downloadButton')}
              label={FM('settings.privacy.dataExport.downloadButton')}
              loading={isDownloading}
              testID={TestIds.DATA_EXPORT_DOWNLOAD_BUTTON}
              variant={ButtonVariant.Primary}
              onPress={download}
            />
          </View>
        ) : null}

        {!isActive ? (
          <View style={styles.buttonSpacing}>
            <Button
              accessibilityHint={FM('settings.privacy.dataExport.requestButton')}
              accessibilityLabel={FM('settings.privacy.dataExport.requestButton')}
              disabled={isRequesting}
              label={FM('settings.privacy.dataExport.requestButton')}
              loading={isRequesting}
              testID={TestIds.DATA_EXPORT_REQUEST_BUTTON}
              variant={ButtonVariant.Secondary}
              onPress={requestExport}
            />
          </View>
        ) : null}
      </View>
    </Section>
  );
};

export default DataExportSection;
