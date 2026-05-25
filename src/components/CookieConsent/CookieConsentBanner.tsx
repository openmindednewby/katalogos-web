/**
 * GDPR Cookie Consent Banner.
 *
 * Appears at the bottom of the screen on first visit. Allows user to
 * accept all, reject all, or customise analytics/marketing cookies.
 * Consent is persisted in localStorage so the banner only shows once.
 */
import React, { useState, useCallback } from 'react';

import { StyleSheet, View, Text, Switch, Platform } from 'react-native';

import { FM } from '@/localization/helpers';

import ConsentButton from './components/ConsentButton';
import { useCookieConsent } from './hooks/useCookieConsent';
import { TestIds } from '../../shared/testIds';
import { useTheme } from '../../theme/hooks/useTheme';
import { PrivacyPolicyModal } from '../Legal/PrivacyPolicyModal';

const BANNER_PADDING = 16;
const BANNER_MAX_WIDTH = 640;
const BORDER_RADIUS = 12;
const SECTION_GAP = 12;
const TOGGLE_MARGIN_TOP = 8;
const SHADOW_OFFSET_Y = -2;
const SHADOW_RADIUS = 8;
const SHADOW_OPACITY = 0.15;
const OVERLAY_ELEVATION = 20;
const BORDER_WIDTH = 1;
const MESSAGE_FONT_SIZE = 14;
const MESSAGE_LINE_HEIGHT = 20;
const SMALL_FONT_SIZE = 12;
const TOGGLE_DESC_MARGIN_TOP = 2;

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
    padding: BANNER_PADDING,
    elevation: OVERLAY_ELEVATION,
    zIndex: OVERLAY_ELEVATION,
  },
  banner: {
    width: '100%',
    maxWidth: BANNER_MAX_WIDTH,
    borderRadius: BORDER_RADIUS,
    padding: BANNER_PADDING,
    borderWidth: BORDER_WIDTH,
    ...Platform.select({
      web: {
        boxShadow: `0px ${SHADOW_OFFSET_Y}px ${SHADOW_RADIUS}px rgba(0,0,0,${SHADOW_OPACITY})`,
      },
      default: {
        shadowOffset: { width: 0, height: SHADOW_OFFSET_Y },
        shadowRadius: SHADOW_RADIUS,
        shadowOpacity: SHADOW_OPACITY,
      },
    }),
  },
  message: { fontSize: MESSAGE_FONT_SIZE, lineHeight: MESSAGE_LINE_HEIGHT, marginBottom: SECTION_GAP },
  buttonRow: { flexDirection: 'row', gap: SECTION_GAP, flexWrap: 'wrap' },
  customiseSection: { marginTop: SECTION_GAP },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: TOGGLE_MARGIN_TOP,
  },
  toggleLabel: { fontSize: MESSAGE_FONT_SIZE, fontWeight: '600' },
  toggleDescription: { fontSize: SMALL_FONT_SIZE, marginTop: TOGGLE_DESC_MARGIN_TOP },
  privacyLink: { fontSize: SMALL_FONT_SIZE, marginTop: SECTION_GAP, textDecorationLine: 'underline' },
});

const CookieConsentBanner = (): React.ReactElement | null => {
  const { theme } = useTheme();
  const { showBanner, acceptAll, rejectAll, savePreferences } = useCookieConsent();

  const [showCustomise, setShowCustomise] = useState(false);
  const [analytics, setAnalytics] = useState(false);
  const [marketing, setMarketing] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);

  const handleCustomise = useCallback(() => {
    setShowCustomise((prev) => !prev);
  }, []);

  const handleSavePreferences = useCallback(() => {
    savePreferences(analytics, marketing);
  }, [analytics, marketing, savePreferences]);

  const handlePrivacyLink = useCallback(() => setShowPrivacy(true), []);
  const handleClosePrivacy = useCallback(() => setShowPrivacy(false), []);

  if (!showBanner) return null;

  const colors = theme.colors;
  const primary = theme.palette.primary['500'];

  return (
    <View style={styles.overlay} testID={TestIds.COOKIE_CONSENT_BANNER}>
      <View style={[styles.banner, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Text style={[styles.message, { color: colors.text }]}>{FM('cookieConsent.message')}</Text>

        <View style={styles.buttonRow}>
          <ConsentButton
            primary
            a11yHint={FM('cookieConsent.acceptAllHint')}
            label={FM('cookieConsent.acceptAll')}
            primaryColor={primary}
            testID={TestIds.COOKIE_CONSENT_ACCEPT_ALL}
            textColor={colors.surface}
            onPress={acceptAll}
          />
          <ConsentButton
            a11yHint={FM('cookieConsent.rejectAllHint')}
            borderColor={colors.border}
            label={FM('cookieConsent.rejectAll')}
            testID={TestIds.COOKIE_CONSENT_REJECT_ALL}
            textColor={colors.text}
            onPress={rejectAll}
          />
          <ConsentButton
            a11yHint={FM('cookieConsent.customizeHint')}
            borderColor={colors.border}
            label={FM('cookieConsent.customize')}
            testID={TestIds.COOKIE_CONSENT_CUSTOMIZE}
            textColor={colors.text}
            onPress={handleCustomise}
          />
        </View>

        {showCustomise ? (
          <View style={styles.customiseSection}>
            <View style={styles.toggleRow}>
              <View>
                <Text style={[styles.toggleLabel, { color: colors.text }]}>{FM('cookieConsent.necessaryLabel')}</Text>
                <Text style={[styles.toggleDescription, { color: colors.textSecondary }]}>
                  {FM('cookieConsent.necessaryDescription')}
                </Text>
              </View>
              <Switch
                disabled
                value
                accessibilityHint={FM('cookieConsent.essentialToggleHint')}
                accessibilityLabel={FM('cookieConsent.necessaryLabel')}
                testID={TestIds.COOKIE_CONSENT_ESSENTIAL_TOGGLE}
                trackColor={{ true: primary, false: colors.border }}
              />
            </View>

            <View style={styles.toggleRow}>
              <View>
                <Text style={[styles.toggleLabel, { color: colors.text }]}>{FM('cookieConsent.analyticsLabel')}</Text>
                <Text style={[styles.toggleDescription, { color: colors.textSecondary }]}>
                  {FM('cookieConsent.analyticsDescription')}
                </Text>
              </View>
              <Switch
                accessibilityHint={FM('cookieConsent.analyticsToggleHint')}
                accessibilityLabel={FM('cookieConsent.analyticsLabel')}
                testID={TestIds.COOKIE_CONSENT_ANALYTICS_TOGGLE}
                trackColor={{ true: primary, false: colors.border }}
                value={analytics}
                onValueChange={setAnalytics}
              />
            </View>

            <View style={styles.toggleRow}>
              <View>
                <Text style={[styles.toggleLabel, { color: colors.text }]}>{FM('cookieConsent.marketingLabel')}</Text>
                <Text style={[styles.toggleDescription, { color: colors.textSecondary }]}>
                  {FM('cookieConsent.marketingDescription')}
                </Text>
              </View>
              <Switch
                accessibilityHint={FM('cookieConsent.marketingToggleHint')}
                accessibilityLabel={FM('cookieConsent.marketingLabel')}
                testID={TestIds.COOKIE_CONSENT_MARKETING_TOGGLE}
                trackColor={{ true: primary, false: colors.border }}
                value={marketing}
                onValueChange={setMarketing}
              />
            </View>

            <ConsentButton
              primary
              a11yHint={FM('cookieConsent.savePreferencesHint')}
              label={FM('cookieConsent.savePreferences')}
              primaryColor={primary}
              testID={TestIds.COOKIE_CONSENT_SAVE_PREFERENCES}
              textColor={colors.surface}
              onPress={handleSavePreferences}
            />
          </View>
        ) : null}

        <Text
          accessibilityHint={FM('cookieConsent.privacyLinkHint')}
          accessibilityLabel={FM('cookieConsent.privacyPolicyLink')}
          accessibilityRole="link"
          style={[styles.privacyLink, { color: primary }]}
          testID={TestIds.COOKIE_CONSENT_PRIVACY_LINK}
          onPress={handlePrivacyLink}
        >
          {FM('cookieConsent.privacyPolicyLink')}
        </Text>
      </View>
      <PrivacyPolicyModal visible={showPrivacy} onClose={handleClosePrivacy} />
    </View>
  );
};

export default CookieConsentBanner;
