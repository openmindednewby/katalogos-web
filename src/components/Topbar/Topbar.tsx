import React from 'react';

import { BrandHomeLink, Topbar as SharedTopbar } from '@dloizides/ui-nav';
import { useDispatch, useSelector } from 'react-redux';


import { FM } from '@/localization/helpers';

import { useAuth } from '../../auth/AuthProvider';
import { Routes } from '../../navigation/routes';
import { TestIds } from '../../shared/testIds';
import { setLocale } from '../../store/slices/uiSlice';
import { TenantLogo } from '../core/TenantLogo';
import SafeNotificationBell from '../Notifications/SafeNotificationBell';

import type { RootState } from '../../store/reduxStore';

const FALLBACK_NAME = '---';

interface Props {
  showAccountButton?: boolean;
  onNavigate: (route: string) => void;
}

const Topbar = ({ showAccountButton = false, onNavigate }: Props): React.ReactElement => {
  const { user, userInfo, logout } = useAuth();
  const dispatch = useDispatch();
  const locale = useSelector((s: RootState) => s.ui.locale);

  function handleLogoutPress(): void {
    logout().catch(() => {});
  }

  const topbarUser = {
    name: user?.displayName ?? userInfo?.preferred_username ?? FALLBACK_NAME,
    email: user?.email ?? userInfo?.email ?? '',
  };

  const account = showAccountButton
    ? {
        label: FM('topbar.account'),
        hint: FM('topbar.accountHint'),
        onPress: () => { },
      }
    : undefined;

  return (
    <SharedTopbar
      account={account}
      language={{
        label: FM(`topbar.lang.${locale}`),
        hint: FM('topbar.langHint'),
        onPress: () => dispatch(setLocale(locale)),
      }}
      left={
        <BrandHomeLink label={FM('topbar.brandHome')} route={Routes.SIGNED_IN_HOME} onNavigate={onNavigate}>
          <TenantLogo />
        </BrandHomeLink>
      }
      logout={{
        label: FM('topbar.logout'),
        hint: FM('topbar.logoutHint'),
        onPress: handleLogoutPress,
        testID: TestIds.LOGOUT_BUTTON,
      }}
      notificationSlot={<SafeNotificationBell />}
      user={topbarUser}
    />
  );
};

export default Topbar;
