import React from 'react';

import { Text, TouchableOpacity, View } from 'react-native';

import { FM } from '@/localization/helpers';
import SetupChecklistStep from '@/shared/enums/SetupChecklistStep';
import type { ThemeModeColors } from '@/theme/types/themeModeColors';

import { checklistStyles } from '../utils/setupChecklistStyles';


const CHECKMARK_SYMBOL = '\u2713';

interface Props {
  step: SetupChecklistStep;
  completed: boolean;
  testID: string;
  colors: ThemeModeColors;
  successColor: string;
  onPress: () => void;
}

function getLabelKey(step: SetupChecklistStep): string {
  switch (step) {
    case SetupChecklistStep.UploadLogo: return 'dashboard.setupChecklist.uploadLogo';
    case SetupChecklistStep.CreateMenu: return 'dashboard.setupChecklist.createMenu';
    case SetupChecklistStep.AddItems: return 'dashboard.setupChecklist.addItems';
    case SetupChecklistStep.GenerateQr: return 'dashboard.setupChecklist.generateQr';
    case SetupChecklistStep.ShareMenu: return 'dashboard.setupChecklist.shareMenu';
    default: return 'dashboard.setupChecklist.shareMenu';
  }
}

function getHintKey(step: SetupChecklistStep): string {
  switch (step) {
    case SetupChecklistStep.UploadLogo: return 'dashboard.setupChecklist.uploadLogoHint';
    case SetupChecklistStep.CreateMenu: return 'dashboard.setupChecklist.createMenuHint';
    case SetupChecklistStep.AddItems: return 'dashboard.setupChecklist.addItemsHint';
    case SetupChecklistStep.GenerateQr: return 'dashboard.setupChecklist.generateQrHint';
    case SetupChecklistStep.ShareMenu: return 'dashboard.setupChecklist.shareMenuHint';
    default: return 'dashboard.setupChecklist.shareMenuHint';
  }
}

const SetupChecklistItem = ({ step, completed, testID, colors, successColor, onPress }: Props): React.ReactElement => {
  const label = FM(getLabelKey(step));
  const hint = FM(getHintKey(step));

  const checkmarkStyle = completed
    ? { backgroundColor: successColor, borderColor: successColor }
    : { borderColor: colors.border };

  const labelStyle = completed
    ? [checklistStyles.itemLabel, checklistStyles.completedLabel, { color: colors.textSecondary }]
    : [checklistStyles.itemLabel, { color: colors.text }];

  return (
    <TouchableOpacity
      accessibilityHint={hint}
      accessibilityLabel={label}
      accessibilityRole="button"
      style={checklistStyles.itemRow}
      testID={testID}
      onPress={onPress}
    >
      <View style={[checklistStyles.checkmark, checkmarkStyle]}>
        {completed ? (
          <Text style={[checklistStyles.checkmarkIcon, { color: colors.background }]}>{CHECKMARK_SYMBOL}</Text>
        ) : null}
      </View>
      <Text style={labelStyle}>{label}</Text>
    </TouchableOpacity>
  );
};

export default SetupChecklistItem;
