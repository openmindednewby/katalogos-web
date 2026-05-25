/**
 * LocationFormFields - Renders all form fields for a location.
 */
import React, { useCallback } from 'react';

import { StyleSheet, Switch, Text, View } from 'react-native';

import LocationFormField from './LocationFormField';
import { FM } from '../../../../localization/helpers';
import { TestIds } from '../../../../shared/testIds';
import { useTheme } from '../../../../theme/hooks/useTheme';
import { BODY_FONT_SIZE } from '../../constants';

import type { CreateLocationRequest } from '../../../../lib/hooks/location';

interface Props {
  form: CreateLocationRequest;
  onFieldChange: <K extends keyof CreateLocationRequest>(key: K, value: CreateLocationRequest[K]) => void;
}

const SWITCH_ROW_MARGIN_TOP = 8;
const LABEL_FONT_WEIGHT = '500' as const;

const styles = StyleSheet.create({
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: SWITCH_ROW_MARGIN_TOP,
  },
  switchLabel: {
    fontSize: BODY_FONT_SIZE,
    fontWeight: LABEL_FONT_WEIGHT,
  },
});

const LocationFormFields = ({ form, onFieldChange }: Props): React.ReactElement => {
  const { theme } = useTheme();
  const { colors } = theme;
  const primary = theme.palette.primary['500'];

  const handleHqToggle = useCallback(
    (v: boolean) => onFieldChange('isHeadquarters', v),
    [onFieldChange],
  );

  return (
    <>
      <LocationFormField
        hint={FM('settings.locations.form.nameHint')}
        label={FM('settings.locations.form.name')}
        placeholder={FM('settings.locations.form.namePlaceholder')}
        testID={TestIds.LOCATION_FORM_NAME_INPUT}
        value={form.name}
        onChangeText={(v) => onFieldChange('name', v)}
      />
      <LocationFormField
        hint={FM('settings.locations.form.addressLine1Hint')}
        label={FM('settings.locations.form.addressLine1')}
        placeholder={FM('settings.locations.form.addressLine1Placeholder')}
        testID={TestIds.LOCATION_FORM_ADDRESS1_INPUT}
        value={form.addressLine1 ?? ''}
        onChangeText={(v) => onFieldChange('addressLine1', v)}
      />
      <LocationFormField
        hint={FM('settings.locations.form.addressLine2Hint')}
        label={FM('settings.locations.form.addressLine2')}
        placeholder={FM('settings.locations.form.addressLine2Placeholder')}
        testID={TestIds.LOCATION_FORM_ADDRESS2_INPUT}
        value={form.addressLine2 ?? ''}
        onChangeText={(v) => onFieldChange('addressLine2', v)}
      />
      <LocationFormField
        hint={FM('settings.locations.form.cityHint')}
        label={FM('settings.locations.form.city')}
        placeholder={FM('settings.locations.form.cityPlaceholder')}
        testID={TestIds.LOCATION_FORM_CITY_INPUT}
        value={form.city ?? ''}
        onChangeText={(v) => onFieldChange('city', v)}
      />
      <LocationFormField
        hint={FM('settings.locations.form.stateHint')}
        label={FM('settings.locations.form.state')}
        placeholder={FM('settings.locations.form.statePlaceholder')}
        testID={TestIds.LOCATION_FORM_STATE_INPUT}
        value={form.state ?? ''}
        onChangeText={(v) => onFieldChange('state', v)}
      />
      <LocationFormField
        hint={FM('settings.locations.form.postalCodeHint')}
        label={FM('settings.locations.form.postalCode')}
        placeholder={FM('settings.locations.form.postalCodePlaceholder')}
        testID={TestIds.LOCATION_FORM_POSTAL_INPUT}
        value={form.postalCode ?? ''}
        onChangeText={(v) => onFieldChange('postalCode', v)}
      />
      <LocationFormField
        hint={FM('settings.locations.form.countryHint')}
        label={FM('settings.locations.form.country')}
        placeholder={FM('settings.locations.form.countryPlaceholder')}
        testID={TestIds.LOCATION_FORM_COUNTRY_INPUT}
        value={form.country ?? ''}
        onChangeText={(v) => onFieldChange('country', v)}
      />
      <LocationFormField
        hint={FM('settings.locations.form.phoneHint')}
        label={FM('settings.locations.form.phone')}
        placeholder={FM('settings.locations.form.phonePlaceholder')}
        testID={TestIds.LOCATION_FORM_PHONE_INPUT}
        value={form.phone ?? ''}
        onChangeText={(v) => onFieldChange('phone', v)}
      />
      <LocationFormField
        hint={FM('settings.locations.form.emailHint')}
        label={FM('settings.locations.form.email')}
        placeholder={FM('settings.locations.form.emailPlaceholder')}
        testID={TestIds.LOCATION_FORM_EMAIL_INPUT}
        value={form.email ?? ''}
        onChangeText={(v) => onFieldChange('email', v)}
      />
      <LocationFormField
        hint={FM('settings.locations.form.timezoneHint')}
        label={FM('settings.locations.form.timezone')}
        placeholder={FM('settings.locations.form.timezonePlaceholder')}
        testID={TestIds.LOCATION_FORM_TIMEZONE_INPUT}
        value={form.timezone ?? ''}
        onChangeText={(v) => onFieldChange('timezone', v)}
      />

      <View style={styles.switchRow}>
        <Text style={[styles.switchLabel, { color: colors.text }]}>
          {FM('settings.locations.form.isHeadquarters')}
        </Text>
        <Switch
          accessibilityHint={FM('settings.locations.form.isHeadquartersHint')}
          accessibilityLabel={FM('settings.locations.form.isHeadquarters')}
          testID={TestIds.LOCATION_FORM_HQ_TOGGLE}
          trackColor={{ false: colors.border, true: primary }}
          value={form.isHeadquarters === true}
          onValueChange={handleHqToggle}
        />
      </View>
    </>
  );
};

export default LocationFormFields;
