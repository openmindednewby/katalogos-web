import React from 'react';

import { StyleSheet, Text, View } from 'react-native';

import { useAuth } from '../../../auth/AuthProvider';
import { useBreakpoint } from '../../../hooks/useBreakpoint';
import { FM } from '../../../localization/helpers';
import { TestIds } from '../../../shared/testIds';
import { useTheme } from '../../../theme/hooks/useTheme';
import { isValueDefined } from '../../../utils/is';

const TITLE_FONT_SIZE = 26;
const TITLE_FONT_SIZE_PHONE = 22;
const SUBTITLE_FONT_SIZE = 15;
const SUBTITLE_FONT_SIZE_PHONE = 13;
const SECTION_MARGIN_BOTTOM = 24;
const SUBTITLE_MARGIN_TOP = 6;

const styles = StyleSheet.create({
  container: {
    marginBottom: SECTION_MARGIN_BOTTOM,
  },
  title: {
    fontSize: TITLE_FONT_SIZE,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: SUBTITLE_FONT_SIZE,
    marginTop: SUBTITLE_MARGIN_TOP,
  },
});

interface Props {
  isEmpty: boolean;
}

const phoneTitleStyle = { fontSize: TITLE_FONT_SIZE_PHONE };
const phoneSubtitleStyle = { fontSize: SUBTITLE_FONT_SIZE_PHONE };

const WelcomeHeader = ({ isEmpty }: Props): React.ReactElement => {
  const { user } = useAuth();
  const { theme } = useTheme();
  const { colors } = theme;
  const { isPhone } = useBreakpoint();

  const displayName = user?.displayName;
  const greeting = isValueDefined(displayName) && displayName !== ''
    ? FM('dashboard.welcomeBack', displayName)
    : FM('dashboard.welcomeNew');

  const subtitle = isEmpty
    ? FM('dashboard.subtitleEmpty')
    : FM('dashboard.subtitleActive');

  return (
    <View style={styles.container} testID={TestIds.DASHBOARD_WELCOME_HEADER}>
      <Text style={[styles.title, { color: colors.text }, isPhone && phoneTitleStyle]}>
        {greeting}
      </Text>
      <Text style={[styles.subtitle, { color: colors.textSecondary }, isPhone && phoneSubtitleStyle]}>
        {subtitle}
      </Text>
    </View>
  );
};

export default WelcomeHeader;
