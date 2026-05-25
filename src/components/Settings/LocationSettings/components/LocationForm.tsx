/**
 * LocationForm - Modal form for creating or editing a location.
 */
import React, { useState, useCallback, useEffect } from 'react';

import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import LocationFormFields from './LocationFormFields';
import { FM } from '../../../../localization/helpers';
import { MODAL_OVERLAY_COLOR } from '../../../../shared/constants';
import { TestIds } from '../../../../shared/testIds';
import { useTheme } from '../../../../theme/hooks/useTheme';
import { isValueDefined } from '../../../../utils/is';
import CancelButton from '../../../Buttons/CancelButton';
import SaveButton from '../../../Buttons/SaveButton';
import {
  SECTION_SPACING,
  TITLE_FONT_SIZE,
  MEDIUM_SPACING,
} from '../../constants';

import type { LocationDto, CreateLocationRequest } from '../../../../lib/hooks/location';

interface Props {
  visible: boolean;
  location: LocationDto | null;
  onSave: (data: CreateLocationRequest) => void;
  onCancel: () => void;
  isSaving: boolean;
}
const MODAL_MAX_WIDTH = 500;
const MODAL_BORDER_RADIUS = 12;
const MODAL_PADDING = 20;
const TITLE_FONT_WEIGHT = '600' as const;
const TITLE_MARGIN_BOTTOM = 16;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: MODAL_OVERLAY_COLOR,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SECTION_SPACING,
  },
  modal: {
    width: '100%',
    maxWidth: MODAL_MAX_WIDTH,
    maxHeight: '90%',
    borderRadius: MODAL_BORDER_RADIUS,
    padding: MODAL_PADDING,
  },
  title: {
    fontSize: TITLE_FONT_SIZE,
    fontWeight: TITLE_FONT_WEIGHT,
    marginBottom: TITLE_MARGIN_BOTTOM,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: MEDIUM_SPACING,
    marginTop: SECTION_SPACING,
  },
});

/** Returns the string value or empty string if null/undefined. */
function str(value: string | null | undefined): string {
  return value ?? '';
}

function buildInitialForm(location: LocationDto | null): CreateLocationRequest {
  if (!isValueDefined(location)) return { name: '', isHeadquarters: false };

  return {
    name: str(location.name),
    addressLine1: str(location.addressLine1),
    addressLine2: str(location.addressLine2),
    city: str(location.city),
    state: str(location.state),
    postalCode: str(location.postalCode),
    country: str(location.country),
    phone: str(location.phone),
    email: str(location.email),
    timezone: str(location.timezone),
    isHeadquarters: location.isHeadquarters === true,
  };
}

const LocationForm = ({ visible, location, onSave, onCancel, isSaving }: Props): React.ReactElement | null => {
  const { theme } = useTheme();
  const { colors } = theme;

  const [form, setForm] = useState<CreateLocationRequest>(() => buildInitialForm(location));

  useEffect(() => { setForm(buildInitialForm(location)); }, [location, visible]);

  const updateField = useCallback(<K extends keyof CreateLocationRequest>(key: K, value: CreateLocationRequest[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  }, []);

  const handleSave = useCallback(() => onSave(form), [onSave, form]);

  const isNameEmpty = form.name.trim() === '';
  const isSaveDisabled = isNameEmpty || isSaving;

  if (!visible) return null;

  return (
    <Modal transparent animationType="fade" visible={visible} onRequestClose={onCancel}>
      <View style={styles.overlay} testID={TestIds.LOCATION_FORM_MODAL}>
        <View style={[styles.modal, { backgroundColor: colors.surfaceElevated }]}>
          <Text style={[styles.title, { color: colors.text }]}>
            {FM('settings.locations.form.title')}
          </Text>

          <ScrollView>
            <LocationFormFields form={form} onFieldChange={updateField} />
          </ScrollView>

          <View style={styles.buttonRow}>
            <CancelButton
              testID={TestIds.LOCATION_FORM_CANCEL_BUTTON}
              title={FM('settings.locations.form.cancel')}
              onPress={onCancel}
            />
            <SaveButton
              disabled={isSaveDisabled}
              testID={TestIds.LOCATION_FORM_SAVE_BUTTON}
              title={FM('settings.locations.form.save')}
              onPress={handleSave}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default LocationForm;
