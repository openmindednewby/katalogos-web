import React from 'react';

import { StyleSheet, Text, View } from 'react-native';

import { DevicePinUnlockScreen } from '@dloizides/auth-web';

import { bffAuthClient } from '../../auth/bffClient';
import { FM } from '../../localization/helpers';
import themeStyles from '../../theme/utils/styles';

import type { mapAppThemeToAuthTheme } from '../../auth/authThemeMapping';
import type { useDevicePinUnlockLabels } from '../../auth/useAuthLabels';
import type { DevicePinUnlockedUser } from '@dloizides/auth-web';

const ROOT_PADDING = 24;
const ROUTING_MARGIN_TOP = 16;

const styles = StyleSheet.create({
  root: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    padding: ROOT_PADDING,
  },
  routing: {
    marginTop: ROUTING_MARGIN_TOP,
  },
});

interface DevicePinUnlockGateProps {
  digits: number;
  rememberedUsername: string;
  authTheme: ReturnType<typeof mapAppThemeToAuthTheme>;
  labels: ReturnType<typeof useDevicePinUnlockLabels>;
  routing: boolean;
  backgroundColor: string;
  onSignedIn: (user: DevicePinUnlockedUser) => void;
  onUsePassword: () => void;
}

/** The login-route device-PIN unlock gate. */
export const DevicePinUnlockGate = ({
  digits,
  rememberedUsername,
  authTheme,
  labels,
  routing,
  backgroundColor,
  onSignedIn,
  onUsePassword,
}: DevicePinUnlockGateProps): React.ReactElement => (
  <View style={[styles.root, { backgroundColor }]} testID="katalogos-login-page">
    <DevicePinUnlockScreen
      client={bffAuthClient}
      digits={digits}
      labels={labels}
      rememberedUsername={rememberedUsername}
      testIdPrefix="katalogos"
      theme={authTheme}
      onSignedIn={onSignedIn}
      onUsePassword={onUsePassword}
    />

    {routing ? (
      <Text style={[themeStyles.loadingText, styles.routing]} testID="katalogos-login-routing">
        {FM('loading')}
      </Text>
    ) : null}
  </View>
);
