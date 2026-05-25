import React, { useCallback } from 'react';

import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { useRouter } from 'expo-router';

import { featureFlags } from '../../../config/featureFlags';
import { FM } from '../../../localization/helpers';
import { Routes } from '../../../navigation/routes';
import { TestIds } from '../../../shared/testIds';
import { useTheme } from '../../../theme/hooks/useTheme';

const SECTION_MARGIN_TOP = 8;
const TITLE_FONT_SIZE = 16;
const TITLE_MARGIN_BOTTOM = 12;
const BUTTON_GAP = 12;
const BUTTON_PADDING_VERTICAL = 10;
const BUTTON_PADDING_HORIZONTAL = 16;
const BUTTON_BORDER_RADIUS = 8;
const BUTTON_FONT_SIZE = 14;
const BORDER_WIDTH = 1;

const styles = StyleSheet.create({
  container: {
    marginTop: SECTION_MARGIN_TOP,
  },
  title: {
    fontSize: TITLE_FONT_SIZE,
    fontWeight: '600',
    marginBottom: TITLE_MARGIN_BOTTOM,
  },
  row: {
    flexDirection: 'row',
    gap: BUTTON_GAP,
    flexWrap: 'wrap',
  },
  button: {
    paddingVertical: BUTTON_PADDING_VERTICAL,
    paddingHorizontal: BUTTON_PADDING_HORIZONTAL,
    borderRadius: BUTTON_BORDER_RADIUS,
    borderWidth: BORDER_WIDTH,
  },
  buttonText: {
    fontSize: BUTTON_FONT_SIZE,
    fontWeight: '600',
  },
});

const QuickActions = (): React.ReactElement | null => {
  const router = useRouter();
  const { theme } = useTheme();
  const { colors } = theme;
  const primary = theme.palette.primary['500'];

  const handleCreateMenu = useCallback((): void => {
    router.push(Routes.MENUS);
  }, [router]);

  const handleCreateSurvey = useCallback((): void => {
    router.push(Routes.QUIZ_TEMPLATES);
  }, [router]);

  const showMenuAction = featureFlags.onlineMenuModule;
  const showSurveyAction = featureFlags.questionerModule;

  if (!showMenuAction && !showSurveyAction) return null;

  return (
    <View style={styles.container} testID={TestIds.DASHBOARD_QUICK_ACTIONS}>
      <Text style={[styles.title, { color: colors.text }]}>
        {FM('dashboard.quickActions.title')}
      </Text>
      <View style={styles.row}>
        {showMenuAction ? (
          <TouchableOpacity
            accessibilityHint={FM('dashboard.quickActions.createMenuHint')}
            accessibilityLabel={FM('dashboard.quickActions.createMenu')}
            accessibilityRole="button"
            style={[styles.button, { borderColor: primary }]}
            testID={TestIds.DASHBOARD_QUICK_ACTION_MENU}
            onPress={handleCreateMenu}
          >
            <Text style={[styles.buttonText, { color: primary }]}>
              {FM('dashboard.quickActions.createMenu')}
            </Text>
          </TouchableOpacity>
        ) : null}
        {showSurveyAction ? (
          <TouchableOpacity
            accessibilityHint={FM('dashboard.quickActions.createSurveyHint')}
            accessibilityLabel={FM('dashboard.quickActions.createSurvey')}
            accessibilityRole="button"
            style={[styles.button, { borderColor: primary }]}
            testID={TestIds.DASHBOARD_QUICK_ACTION_SURVEY}
            onPress={handleCreateSurvey}
          >
            <Text style={[styles.buttonText, { color: primary }]}>
              {FM('dashboard.quickActions.createSurvey')}
            </Text>
          </TouchableOpacity>
        ) : null}
      </View>
    </View>
  );
};

export default QuickActions;
