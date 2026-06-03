/**
 * The device-PIN unlock gate rendered on the login route for a returning,
 * remembered user — unified-login Increment 3 Batch 3.
 *
 * Wraps the shared `<DevicePinUnlockScreen>` from `@dloizides/auth-web` with the
 * login route's screen chrome (centred root + the post-unlock routing
 * indicator). Extracted from `app/(auth)/login.tsx` so the gate's branch stays
 * out of the login screen's complexity / file-length budget.
 *
 * react-query-FREE: the underlying `<DevicePinUnlockScreen>` and the
 * `bffAuthClient` it calls never touch react-query, so this is safe on the
 * provider-less login route.
 */
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
  /** Enrolled PIN length (4/6/8). */
  digits: number;
  /** Remembered username, shown in the greeting. */
  rememberedUsername: string;
  /** The resolved `AuthTheme`. */
  authTheme: ReturnType<typeof mapAppThemeToAuthTheme>;
  /** Localised unlock copy. */
  labels: ReturnType<typeof useDevicePinUnlockLabels>;
  /** `true` while the post-unlock routing indicator should show. */
  routing: boolean;
  /** Background colour for the screen root. */
  backgroundColor: string;
  /** Called with the unlocked claim bag after a successful unlock. */
  onSignedIn: (user: DevicePinUnlockedUser) => void;
  /** Escape hatch → drop the gate and show the password form. */
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
