import React, { memo, useCallback } from 'react';

import { Linking, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { FM } from '../../../localization/helpers';
import { TestIds } from '../../../shared/testIds';
import { isValueDefined } from '../../../utils/is';
import { logger } from '../../../utils/logger';
import { formatAddress, hasDisplayableInfo, isNonEmpty, parseOperatingHours } from '../utils/businessInfoHelpers';

import type { OperatingHoursEntry } from '../utils/businessInfoHelpers';
import type { BusinessProfileData } from '../utils/businessProfileSchema';

const DAY_KEYS: readonly string[] = [
  'settings.businessProfile.days.monday',
  'settings.businessProfile.days.tuesday',
  'settings.businessProfile.days.wednesday',
  'settings.businessProfile.days.thursday',
  'settings.businessProfile.days.friday',
  'settings.businessProfile.days.saturday',
  'settings.businessProfile.days.sunday',
];

interface BusinessInfoSectionProps {
  profile: BusinessProfileData;
  textColor: string;
  secondaryColor: string;
  borderColor: string;
}

const SECTION_PADDING = 20;
const HEADING_FONT_SIZE = 20;
const LABEL_FONT_SIZE = 12;
const VALUE_FONT_SIZE = 15;
const HEADING_MARGIN_BOTTOM = 16;
const FIELD_MARGIN_BOTTOM = 12;
const HOURS_ROW_PADDING = 4;
const DAY_NAME_WIDTH = 110;
const LABEL_MARGIN_BOTTOM = 2;
const LETTER_SPACING = 0.5;

const styles = StyleSheet.create({
  container: { padding: SECTION_PADDING, borderTopWidth: 1 },
  heading: { fontSize: HEADING_FONT_SIZE, fontWeight: 'bold', marginBottom: HEADING_MARGIN_BOTTOM },
  label: { fontSize: LABEL_FONT_SIZE, fontWeight: '600', textTransform: 'uppercase', letterSpacing: LETTER_SPACING, marginBottom: LABEL_MARGIN_BOTTOM },
  linkText: { fontSize: VALUE_FONT_SIZE, marginBottom: FIELD_MARGIN_BOTTOM, textDecorationLine: 'underline' },
  value: { fontSize: VALUE_FONT_SIZE, marginBottom: FIELD_MARGIN_BOTTOM },
  hoursRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: HOURS_ROW_PADDING },
  dayName: { fontSize: VALUE_FONT_SIZE, fontWeight: '500', width: DAY_NAME_WIDTH },
  hoursValue: { fontSize: VALUE_FONT_SIZE, flex: 1, textAlign: 'right' },
});

/** Opens a URL using Linking on native or window.open on web. */
function openExternalUrl(url: string): void {
  if (Platform.OS === 'web') window.open(url, '_blank', 'noopener,noreferrer');
  else Linking.openURL(url).catch((err) => logger.warn('BusinessInfoSection', 'Failed to open URL', err));
}

/** Renders a single day's hours row. */
const HoursRow = ({ entry, textColor }: { entry: OperatingHoursEntry; textColor: string }): React.ReactElement => {
  const dayKey = DAY_KEYS[entry.day] ?? '';
  const dayName = dayKey !== '' ? FM(dayKey) : '';

  return (
    <View style={styles.hoursRow}>
      <Text style={[styles.dayName, { color: textColor }]}>{dayName}</Text>
      <Text style={[styles.hoursValue, { color: textColor }]}>
        {entry.isClosed === true
          ? FM('publicMenu.businessInfo.closed')
          : FM('publicMenu.businessInfo.hoursFormat', entry.open, entry.close)}
      </Text>
    </View>
  );
}

export const BusinessInfoSection: React.FC<BusinessInfoSectionProps> = memo(({
  profile,
  textColor,
  secondaryColor,
  borderColor,
}) => {
  const address = formatAddress(profile);
  const hours = parseOperatingHours(profile.operatingHoursJson);

  const handlePhonePress = useCallback(() => {
    if (isNonEmpty(profile.phone)) openExternalUrl(`tel:${profile.phone}`);
  }, [profile.phone]);

  const handleEmailPress = useCallback(() => {
    if (isNonEmpty(profile.email)) openExternalUrl(`mailto:${profile.email}`);
  }, [profile.email]);

  const handleWebsitePress = useCallback(() => {
    if (isNonEmpty(profile.website)) openExternalUrl(profile.website);
  }, [profile.website]);

  if (!hasDisplayableInfo(profile)) return null;

  return (
    <View
      style={[styles.container, { borderTopColor: borderColor }]}
      testID={TestIds.PUBLIC_MENU_BUSINESS_INFO}
    >
      <Text accessibilityRole="header" style={[styles.heading, { color: textColor }]}>
        {FM('publicMenu.businessInfo.heading')}
      </Text>

      {isNonEmpty(profile.phone) ? (
        <TouchableOpacity
          accessibilityHint={FM('publicMenu.businessInfo.phoneHint')}
          accessibilityLabel={FM('publicMenu.businessInfo.phoneLabel')}
          accessibilityRole="link"
          testID={TestIds.PUBLIC_MENU_BUSINESS_PHONE}
          onPress={handlePhonePress}
        >
          <Text style={[styles.label, { color: secondaryColor }]}>
            {FM('publicMenu.businessInfo.phone')}
          </Text>
          <Text style={[styles.linkText, { color: textColor }]}>{profile.phone}</Text>
        </TouchableOpacity>
      ) : null}

      {isNonEmpty(profile.email) ? (
        <TouchableOpacity
          accessibilityHint={FM('publicMenu.businessInfo.emailHint')}
          accessibilityLabel={FM('publicMenu.businessInfo.emailLabel')}
          accessibilityRole="link"
          testID={TestIds.PUBLIC_MENU_BUSINESS_EMAIL}
          onPress={handleEmailPress}
        >
          <Text style={[styles.label, { color: secondaryColor }]}>
            {FM('publicMenu.businessInfo.email')}
          </Text>
          <Text style={[styles.linkText, { color: textColor }]}>{profile.email}</Text>
        </TouchableOpacity>
      ) : null}

      {isNonEmpty(profile.website) ? (
        <TouchableOpacity
          accessibilityHint={FM('publicMenu.businessInfo.websiteHint')}
          accessibilityLabel={FM('publicMenu.businessInfo.websiteLabel')}
          accessibilityRole="link"
          testID={TestIds.PUBLIC_MENU_BUSINESS_WEBSITE}
          onPress={handleWebsitePress}
        >
          <Text style={[styles.label, { color: secondaryColor }]}>
            {FM('publicMenu.businessInfo.website')}
          </Text>
          <Text style={[styles.linkText, { color: textColor }]}>{profile.website}</Text>
        </TouchableOpacity>
      ) : null}

      {isValueDefined(address) ? (
        <View testID={TestIds.PUBLIC_MENU_BUSINESS_ADDRESS}>
          <Text style={[styles.label, { color: secondaryColor }]}>
            {FM('publicMenu.businessInfo.address')}
          </Text>
          <Text style={[styles.value, { color: textColor }]}>{address}</Text>
        </View>
      ) : null}

      {hours.length > 0 ? (
        <View testID={TestIds.PUBLIC_MENU_BUSINESS_HOURS}>
          <Text style={[styles.label, { color: secondaryColor }]}>
            {FM('publicMenu.businessInfo.hours')}
          </Text>
          {hours.map((entry) => (
            <HoursRow key={entry.day} entry={entry} textColor={textColor} />
          ))}
        </View>
      ) : null}
    </View>
  );
});

BusinessInfoSection.displayName = 'BusinessInfoSection';
