import React, { Suspense, useEffect } from 'react';

import { View, ActivityIndicator } from 'react-native';

import { Stack } from 'expo-router';

import { useAuth } from '../../src/auth/AuthProvider';
import { shouldRedirectToLogin } from '../../src/auth/logoutNavigationGuard';
import KeyboardShortcutsProvider from '../../src/components/KeyboardShortcuts/KeyboardShortcutsProvider';
import ProtectedLayoutWrapper from '../../src/components/Layout/ProtectedLayout';
import ApiEventsProvider from '../../src/lib/api/events/ApiEventsProvider';
import { redirectTo } from '../../src/lib/navigation';
import themeStyles from '../../src/theme/utils/styles';

// Lazy-load notification components to defer @microsoft/signalr + zustand (~50 KB gzipped)
const RealTimeNotificationProvider = React.lazy(async () => import('../../src/components/Notifications/RealTimeNotificationProvider'));
const SafeRealTimeToastContainer = React.lazy(async () => import('../../src/components/Notifications/SafeRealTimeToastContainer'));

const ProtectedLayout = (): React.ReactElement => {
  // Post-BFF-cutover the route guard keys off `isLoggedIn` (driven by
  // `GET /bff/me`), not a client-side token — the SPA holds no token.
  const { isLoggedIn, loading } = useAuth();
  useEffect(() => {
    // A deliberate sign-out clears `isLoggedIn` BEFORE `POST /bff/logout` has
    // settled, which would trip this guard mid-flight. `redirectTo` schedules a
    // `window.location.replace()` 150 ms later, and that document unload cancels
    // the in-flight logout — leaving the server-side session ALIVE while the UI
    // claims the user signed out. `performBffLogout` navigates for us once the
    // BFF answers, so standing down here loses nothing. The decision lives in
    // `logoutNavigationGuard` so it is unit-pinned rather than only implied.
    if (shouldRedirectToLogin(loading, isLoggedIn))
      // use cross-platform safe redirect (may be queued until root mounts)
      redirectTo('/(auth)/login');

  }, [loading, isLoggedIn]);

  if (loading) 
    return (
      <View style={themeStyles.containerCenter}>
        <ActivityIndicator />
      </View>
    );
  

  return (
    <ApiEventsProvider>
      <Suspense>
        <RealTimeNotificationProvider>
          <Suspense>
            <SafeRealTimeToastContainer />
          </Suspense>
          <KeyboardShortcutsProvider>
            <ProtectedLayoutWrapper>
              <Stack screenOptions={{ headerShown: false }} />
            </ProtectedLayoutWrapper>
          </KeyboardShortcutsProvider>
        </RealTimeNotificationProvider>
      </Suspense>
    </ApiEventsProvider>
  );
};

export default ProtectedLayout;
