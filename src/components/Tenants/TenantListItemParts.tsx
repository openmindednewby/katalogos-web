/**
 * Sub-components for TenantListItem.
 */
import React from 'react';

import { StyleSheet, Text, View } from 'react-native';

import { FM } from '@/localization/helpers';

import { isValueDefined } from '../../utils/is';
import Heading from '../Shared/Heading';
import GenericStatusBadge from '../Status/GenericStatusBadge';
import StatusBadge from '../Status/StatusBadge';

interface ListItemColors {
  textSecondary: string;
}

const styles = StyleSheet.create({
  userText: { marginBottom: 6 },
  idText: { marginBottom: 6, fontSize: 12 },
});

interface HeadingWithOptionalTestIDProps {
  text: string;
  testID?: string;
}

export const HeadingWithOptionalTestID = ({ text, testID }: HeadingWithOptionalTestIDProps): React.ReactElement => {
  if (isValueDefined(testID)) 
    return (
      <View testID={testID}>
        <Heading text={text} />
      </View>
    );
  
  return <Heading text={text} />;
};

interface IdDisplayProps {
  showId: boolean;
  itemID: string;
  colors: ListItemColors;
  idTestID?: string;
  label: string;
}

export const IdDisplay = ({ showId, itemID, colors, idTestID, label }: IdDisplayProps): React.ReactNode => {
  const shouldShow = showId && itemID.length > 0;
  if (!shouldShow) return null;
  return (
    <Text style={[styles.idText, { color: colors.textSecondary }]} testID={idTestID}>
      {label}: {itemID}
    </Text>
  );
};

interface UserDisplayProps {
  showUser: boolean;
  userDisplay: string;
  colors: ListItemColors;
}

export const UserDisplay = ({ showUser, userDisplay, colors }: UserDisplayProps): React.ReactNode => {
  if (!showUser) return null;
  return <Text style={[styles.userText, { color: colors.textSecondary }]}>{userDisplay}</Text>;
};

interface StatusDisplayProps {
  useGenericBadge: boolean;
  numericStatus: number;
  statusBadgeTestID?: string;
  translationNs: string;
}

export const StatusDisplay = ({ useGenericBadge, numericStatus, statusBadgeTestID, translationNs }: StatusDisplayProps): React.ReactElement => {
  if (useGenericBadge) 
    return <GenericStatusBadge status={numericStatus} testID={statusBadgeTestID} translationNs={translationNs} />;
  
  return <StatusBadge status={numericStatus} />;
};

export interface ActionLabels {
  viewLabel: string;
  viewHint: string;
  editLabel: string;
  editHint: string;
  deleteLabel: string;
  deleteHint: string;
  activateLabel: string;
  activateHint: string;
  previewLabel: string;
  previewHint: string;
  openExternalLabel: string;
  openExternalHint: string;
  openExternalDisabledHint: string;
  qrCodeLabel: string;
  qrCodeHint: string;
  qrCodeDisabledHint: string;
  embedLabel: string;
  embedHint: string;
  embedDisabledHint: string;
}

export function getActionLabels(ns: string): ActionLabels {
  return {
    viewLabel: FM(`${ns}.view`),
    viewHint: FM(`${ns}.viewHint`),
    editLabel: FM(`${ns}.edit`),
    editHint: FM(`${ns}.editHint`),
    deleteLabel: FM(`${ns}.delete`),
    deleteHint: FM(`${ns}.deleteHint`),
    activateLabel: FM(`${ns}.activate`),
    activateHint: FM(`${ns}.activateHint`),
    previewLabel: FM(`${ns}.preview`),
    previewHint: FM(`${ns}.previewHint`),
    openExternalLabel: FM(`${ns}.openExternal`),
    openExternalHint: FM(`${ns}.openExternalHint`),
    openExternalDisabledHint: FM(`${ns}.openExternalDisabledHint`),
    qrCodeLabel: FM(`${ns}.qrCode.title`),
    qrCodeHint: FM(`${ns}.qrCode.qrCodeHint`),
    qrCodeDisabledHint: FM(`${ns}.qrCode.qrCodeDisabledHint`),
    embedLabel: FM(`${ns}.embedWidget.title`),
    embedHint: FM(`${ns}.embedWidget.embedHint`),
    embedDisabledHint: FM(`${ns}.embedWidget.embedDisabledHint`),
  };
}
