import React, { useCallback } from 'react';

import { Text, TouchableOpacity, View } from 'react-native';

import { useRouter } from 'expo-router';

import { FM } from '@/localization/helpers';
import { Routes } from '@/navigation/routes';
import SetupChecklistStep from '@/shared/enums/SetupChecklistStep';
import { TestIds } from '@/shared/testIds';
import { useTheme } from '@/theme/hooks/useTheme';

import SetupChecklistItem from './SetupChecklistItem';
import { PERCENTAGE_MULTIPLIER } from '../utils/setupChecklistConstants';
import { checklistStyles } from '../utils/setupChecklistStyles';

import type { SetupChecklistState } from '../hooks/useSetupChecklist';

interface Props {
  checklist: SetupChecklistState;
}

function getStepTestID(step: SetupChecklistStep): string {
  switch (step) {
    case SetupChecklistStep.UploadLogo: return TestIds.SETUP_CHECKLIST_STEP_UPLOAD_LOGO;
    case SetupChecklistStep.CreateMenu: return TestIds.SETUP_CHECKLIST_STEP_CREATE_MENU;
    case SetupChecklistStep.AddItems: return TestIds.SETUP_CHECKLIST_STEP_ADD_ITEMS;
    case SetupChecklistStep.GenerateQr: return TestIds.SETUP_CHECKLIST_STEP_GENERATE_QR;
    case SetupChecklistStep.ShareMenu: return TestIds.SETUP_CHECKLIST_STEP_SHARE_MENU;
    default: return TestIds.SETUP_CHECKLIST_STEP_SHARE_MENU;
  }
}

function getStepRoute(step: SetupChecklistStep): string {
  switch (step) {
    case SetupChecklistStep.UploadLogo: return Routes.BUSINESS_PROFILE_SETTINGS;
    case SetupChecklistStep.CreateMenu: return Routes.MENUS;
    case SetupChecklistStep.AddItems: return Routes.MENUS;
    case SetupChecklistStep.GenerateQr: return Routes.MENUS;
    case SetupChecklistStep.ShareMenu: return Routes.MENUS;
    default: return Routes.MENUS;
  }
}

const SetupChecklist = ({ checklist }: Props): React.ReactElement | null => {
  const { theme } = useTheme();
  const { colors } = theme;
  const successColor = theme.semantic.success['500'];
  const router = useRouter();

  const handleStepPress = useCallback(
    (step: SetupChecklistStep): void => {
      router.push(getStepRoute(step));
    },
    [router],
  );

  if (!checklist.isVisible) return null;

  const progressPercent = Math.round((checklist.completedCount / checklist.totalSteps) * PERCENTAGE_MULTIPLIER);

  return (
    <View
      style={[checklistStyles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}
      testID={TestIds.SETUP_CHECKLIST}
    >
      <View style={checklistStyles.header}>
        <View style={checklistStyles.headerLeft}>
          <Text accessibilityRole="header" style={[checklistStyles.title, { color: colors.text }]}>
            {FM('dashboard.setupChecklist.title')}
          </Text>
          <Text
            style={[checklistStyles.progressText, { color: colors.textSecondary }]}
            testID={TestIds.SETUP_CHECKLIST_PROGRESS}
          >
            {FM('dashboard.setupChecklist.progress', String(checklist.completedCount), String(checklist.totalSteps))}
          </Text>
          <View style={[checklistStyles.progressBarTrack, { backgroundColor: colors.border }]}>
            <View style={[checklistStyles.progressBarFill, { backgroundColor: successColor, width: `${progressPercent}%` }]} />
          </View>
        </View>
        <TouchableOpacity
          accessibilityHint={FM('dashboard.setupChecklist.dismissHint')}
          accessibilityLabel={FM('dashboard.setupChecklist.dismiss')}
          accessibilityRole="button"
          testID={TestIds.SETUP_CHECKLIST_DISMISS}
          onPress={checklist.handleDismiss}
        >
          <Text style={[checklistStyles.dismissText, { color: colors.textSecondary }]}>
            {FM('dashboard.setupChecklist.dismiss')}
          </Text>
        </TouchableOpacity>
      </View>

      {checklist.items.map((item) => (
        <SetupChecklistItem
          key={item.step}
          colors={colors}
          completed={item.completed}
          step={item.step}
          successColor={successColor}
          testID={getStepTestID(item.step)}
          onPress={() => handleStepPress(item.step)}
        />
      ))}
    </View>
  );
};

export default SetupChecklist;
