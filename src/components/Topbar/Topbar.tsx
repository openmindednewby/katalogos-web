import React from 'react';

import { Text, TouchableOpacity, View } from 'react-native';

import { useDispatch, useSelector } from 'react-redux';

import { FM } from '@/localization/helpers';

import { useAuth } from '../../auth/AuthProvider';
import { TestIds } from '../../shared/testIds';
import { setLocale } from '../../store/slices/uiSlice';
import { useTheme } from '../../theme/hooks/useTheme';
import { layoutStyles } from '../../theme/utils/styles';
import { TenantLogo } from '../core/TenantLogo';
import SafeNotificationBell from '../Notifications/SafeNotificationBell';

import type { RootState } from '../../store/reduxStore';

/** Text color for elements on primary-colored backgrounds. */
const TEXT_ON_PRIMARY = '#ffffff';

interface Props {
  showAccountButton?: boolean;
}

const Topbar = ({ showAccountButton = false }: Props): React.ReactElement => {
  const { user, userInfo, logout } = useAuth();
  const dispatch = useDispatch();
  const { theme } = useTheme();
  const locale = useSelector((s: RootState) => s.ui.locale);

  const colors = theme.colors;
  const primaryColor = theme.palette.primary['500'];

  function handleLogoutPress(): void {
    logout().catch(() => {});
  }

  return (
    <View style={[layoutStyles.topbarContainer, { borderBottomColor: colors.border, backgroundColor: colors.background }]}>
      <View style={layoutStyles.topbarLeft}>
        <TenantLogo />
      </View>
      <View style={layoutStyles.topbarRight}>
        <TouchableOpacity
          accessibilityHint={FM('topbar.langHint')}
          accessibilityLabel={FM(`topbar.lang.${locale}`)}
          accessibilityRole="button"
          style={layoutStyles.topbarRowItem}
          onPress={() => dispatch(setLocale(locale))}
        >
          <Text style={[layoutStyles.topbarLabel, { color: colors.text }]}>{FM(`topbar.lang.${locale}`)}</Text>
        </TouchableOpacity>

        <SafeNotificationBell />

        <View style={layoutStyles.userBlock}>
          <Text style={[layoutStyles.userName, { color: colors.text }]}>{user?.displayName ?? userInfo?.preferred_username ?? '---'}</Text>
          <Text style={[layoutStyles.userEmail, { color: colors.textSecondary }]}>{user?.email ?? userInfo?.email ?? ''}</Text>
        </View>

        {showAccountButton ? (
          <TouchableOpacity
            accessibilityHint={FM('topbar.accountHint')}
            accessibilityLabel={FM('topbar.account')}
            accessibilityRole="button"
            style={[layoutStyles.accountBtn, { backgroundColor: primaryColor }]}
            onPress={() => { /* TODO: open account */ }}
          >
            <Text style={[layoutStyles.accountText, { color: TEXT_ON_PRIMARY }]}>{FM('topbar.account')}</Text>
          </TouchableOpacity>
        ) : null}

        <TouchableOpacity
          accessible
          accessibilityHint={FM('topbar.logoutHint')}
          accessibilityLabel={FM('topbar.logout')}
          accessibilityRole="button"
          style={[layoutStyles.accountBtn, { backgroundColor: primaryColor }]}
          testID={TestIds.LOGOUT_BUTTON}
          onPress={handleLogoutPress}
        >
          <Text style={[layoutStyles.accountText, { color: TEXT_ON_PRIMARY }]}>{FM('topbar.logout')}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default Topbar;
