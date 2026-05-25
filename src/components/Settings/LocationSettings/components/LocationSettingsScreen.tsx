/**
 * LocationSettingsScreen - Main location management page.
 * Enterprise-gated: shows UpgradePrompt for non-enterprise tiers.
 */
import React, { useState, useCallback, useMemo } from 'react';

import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';

import LocationForm from './LocationForm';
import LocationList from './LocationList';
import { useLocationMutations, useLocationList } from '../../../../lib/hooks/location';
import { useSubscription } from '../../../../lib/subscription/hooks/useSubscription';
import { FM } from '../../../../localization/helpers';
import { TestIds } from '../../../../shared/testIds';
import { useTheme } from '../../../../theme/hooks/useTheme';
import { isValueDefined } from '../../../../utils/is';
import { Button } from '../../../core/Button';
import ButtonVariant from '../../../core/Button/utils/ButtonVariant';
import Breadcrumb from '../../../Shared/Breadcrumb';
import ConfirmDialog from '../../../Shared/ConfirmDialog';
import Heading from '../../../Shared/Heading';
import UpgradePrompt from '../../../Shared/UpgradePrompt';
import { SECTION_SPACING, BODY_FONT_SIZE, ERROR_TEXT_MARGIN_TOP } from '../../constants';

import type { LocationDto, CreateLocationRequest } from '../../../../lib/hooks/location';

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { padding: SECTION_SPACING },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  errorText: { fontSize: BODY_FONT_SIZE, textAlign: 'center', marginTop: ERROR_TEXT_MARGIN_TOP },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});

const LocationSettingsScreen = (): React.ReactElement => {
  const { theme } = useTheme();
  const { colors } = theme;
  const primary = theme.palette.primary['500'];
  const errorColor = theme.semantic.error['500'];

  const { isEnterpriseTier, tier, isLoading: subLoading } = useSubscription();

  const { locations, isLoading, isError } = useLocationList();

  const [showForm, setShowForm] = useState(false);
  const [editingLocation, setEditingLocation] = useState<LocationDto | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  const mutationCallbacks = useMemo(() => ({
    onCreateSuccess: () => setShowForm(false),
    onUpdateSuccess: () => { setShowForm(false); setEditingLocation(null); },
    onDeleteSuccess: () => setDeleteTarget(null),
  }), []);

  const { createLocation, updateLocation, deleteLocation, isMutating, isDeleting } =
    useLocationMutations(mutationCallbacks);

  const handleAddPress = useCallback(() => {
    setEditingLocation(null);
    setShowForm(true);
  }, []);

  const handleEdit = useCallback((location: LocationDto) => {
    setEditingLocation(location);
    setShowForm(true);
  }, []);

  const handleDeletePress = useCallback((externalId: string) => {
    setDeleteTarget(externalId);
  }, []);

  const handleDeleteConfirm = useCallback(() => {
    if (isValueDefined(deleteTarget)) deleteLocation(deleteTarget);
  }, [deleteTarget, deleteLocation]);

  const handleFormSave = useCallback((data: CreateLocationRequest) => {
    if (isValueDefined(editingLocation?.externalId))
      updateLocation(editingLocation.externalId, data);
    else createLocation(data);
  }, [editingLocation, createLocation, updateLocation]);

  const handleFormCancel = useCallback(() => {
    setShowForm(false);
    setEditingLocation(null);
  }, []);

  if (subLoading || isLoading)
    return (
      <View style={styles.loadingContainer} testID={TestIds.LOCATION_SETTINGS_LOADING}>
        <ActivityIndicator color={primary} size="large" />
        <Text style={[styles.errorText, { color: colors.textSecondary }]}>{FM('loading')}</Text>
      </View>
    );

  if (!isEnterpriseTier)
    return (
      <View
        style={[styles.container, { backgroundColor: colors.background }]}
        testID={TestIds.LOCATION_UPGRADE_PROMPT}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <Breadcrumb />
          <Heading>{FM('settings.locations.title')}</Heading>
          <UpgradePrompt currentTier={tier} requiredTier="Enterprise" />
        </ScrollView>
      </View>
    );

  if (isError)
    return (
      <View style={styles.loadingContainer} testID={TestIds.LOCATION_SETTINGS_ERROR}>
        <Text style={[styles.errorText, { color: errorColor }]}>
          {FM('settings.locations.messages.loadError')}
        </Text>
      </View>
    );

  return (
    <View
      style={[styles.container, { backgroundColor: colors.background }]}
      testID={TestIds.LOCATION_SETTINGS_SCREEN}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Breadcrumb />

        <View style={styles.headerRow}>
          <Heading>{FM('settings.locations.title')}</Heading>
          <Button
            accessibilityHint={FM('settings.locations.addLocationHint')}
            accessibilityLabel={FM('settings.locations.addLocation')}
            label={FM('settings.locations.addLocation')}
            testID={TestIds.LOCATION_ADD_BUTTON}
            variant={ButtonVariant.Primary}
            onPress={handleAddPress}
          />
        </View>

        <LocationList
          disabled={isMutating}
          locations={locations}
          onDelete={handleDeletePress}
          onEdit={handleEdit}
        />
      </ScrollView>

      <LocationForm
        isSaving={isMutating}
        location={editingLocation}
        visible={showForm}
        onCancel={handleFormCancel}
        onSave={handleFormSave}
      />

      <ConfirmDialog
        destructive
        loading={isDeleting}
        message={FM('settings.locations.deleteConfirmMessage')}
        title={FM('settings.locations.deleteConfirmTitle')}
        visible={isValueDefined(deleteTarget)}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
      />
    </View>
  );
};

export default LocationSettingsScreen;
