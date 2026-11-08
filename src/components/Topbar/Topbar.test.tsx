import React from 'react';

import { NAV_TEST_IDS } from '@dloizides/ui-nav';
import { fireEvent, render } from '@testing-library/react-native';

import Topbar from './Topbar';
import { Routes } from '../../navigation/routes';

jest.mock('@dloizides/ui-nav', () => ({
  ...jest.requireActual('@dloizides/ui-nav'),
  Topbar: ({ left }: { left: React.ReactElement }) => left,
}));
jest.mock('@dloizides/ui-feedback', () => ({
  ...jest.requireActual('@dloizides/ui-feedback'),
  useUi: () => ({ theme: { palette: { primary: { '500': 'primary' } } } }),
}));
jest.mock('react-redux', () => ({
  useDispatch: () => jest.fn(),
  useSelector: () => 'en',
}));
jest.mock('../../auth/AuthProvider', () => ({
  useAuth: () => ({ user: null, userInfo: null, logout: jest.fn() }),
}));
jest.mock('../core/TenantLogo', () => ({ TenantLogo: () => null }));
jest.mock('../Notifications/SafeNotificationBell', () => () => null);

const PRESS_EVENT = { nativeEvent: {}, preventDefault: jest.fn() };

describe('Topbar', () => {
  it('with the logo pressed, navigates to the signed-in home route', () => {
    const onNavigate = jest.fn();
    const screen = render(<Topbar onNavigate={onNavigate} />);

    fireEvent.press(screen.getByTestId(NAV_TEST_IDS.brandHome), PRESS_EVENT);

    expect(onNavigate).toHaveBeenCalledWith(Routes.SIGNED_IN_HOME);
  });
});
