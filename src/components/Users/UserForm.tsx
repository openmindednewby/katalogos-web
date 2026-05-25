import React from 'react';

import { ScrollView, StyleSheet, View } from 'react-native';

import UserFormFields from './UserFormFields';
import UserFormTenantSelector from './UserFormTenantSelector';
import { buildSavePayload, trimFormValues } from './UserFormUtils';
import { useUserFormState } from './useUserFormState';
import { logger } from '../../utils/logger';
import { FormActions } from '../Forms';

import type { UserFormPayload } from './UserFormUtils';
import type { InitialValues } from './useUserFormState';

export type { UserFormPayload };

interface TenantOption {
  id: string;
  name: string;
}

interface Props {
  initialUsername?: string;
  initialEmail?: string;
  initialPhoneNumber?: string;
  initialFirstName?: string;
  initialLastName?: string;
  initialEnabled?: boolean;
  initialRoles?: string[];
  tenantId: string;
  tenants?: TenantOption[];
  isEdit?: boolean;
  onSave: (payload: UserFormPayload) => void;
  onCancel: () => void;
  saving?: boolean;
}

const AVAILABLE_ROLES = [
  { value: 'user', label: 'user' },
  { value: 'admin', label: 'admin' },
  { value: 'manager', label: 'manager' },
];

const styles = StyleSheet.create({
  scroll: { maxHeight: 600 },
  container: { padding: 16 },
  enabledContainer: { marginBottom: 16 },
  rolesContainer: { marginBottom: 24 },
});

const DEFAULT_INITIAL_ROLES: string[] = [];

function buildInitialValues(props: Props): InitialValues {
  return {
    username: props.initialUsername ?? '',
    email: props.initialEmail ?? '',
    phoneNumber: props.initialPhoneNumber ?? '',
    firstName: props.initialFirstName ?? '',
    lastName: props.initialLastName ?? '',
    enabled: props.initialEnabled ?? true,
    roles: props.initialRoles ?? DEFAULT_INITIAL_ROLES,
  };
}

const UserForm = (props: Props): React.ReactElement => {
  const { tenantId, tenants = [], isEdit = false, onSave, onCancel, saving = false } = props;
  const initialValues = buildInitialValues(props);
  const formState = useUserFormState(initialValues, tenantId);

  function toggleRole(role: string): void {
    formState.setSelectedRoles((prev) => (prev.includes(role) ? prev.filter((r) => r !== role) : [...prev, role]));
  }

  function handleSave(): void {
    const trimmed = trimFormValues({
      username: formState.username,
      email: formState.email,
      phoneNumber: formState.phoneNumber,
      firstName: formState.firstName,
      lastName: formState.lastName,
      password: formState.password,
      selectedTenantId: formState.selectedTenantId,
    });
    if (trimmed.username.length === 0) return;
    onSave(buildSavePayload({ trimmed, enabled: formState.enabled, selectedRoles: formState.selectedRoles }));
  }

  function handleSelectTenant(id: string): void {
    logger.debug('UserForm', 'Selected Tenant ID:', { id, tenants });
    formState.setSelectedTenantId(id);
  }

  const showTenantSelector = !isEdit && tenants.length > 0;
  const saveLabel = isEdit ? 'Update' : 'Create';
  const saveDisabled = formState.username.trim().length === 0;

  return (
    <ScrollView style={styles.scroll}>
      <View style={styles.container}>
        {showTenantSelector ? <UserFormTenantSelector disabled={saving} selectedTenantId={formState.selectedTenantId} tenants={tenants} onSelectTenant={handleSelectTenant} /> : null}

        <UserFormFields
          availableRoles={AVAILABLE_ROLES}
          email={formState.email}
          enabled={formState.enabled}
          enabledContainerStyle={styles.enabledContainer}
          firstName={formState.firstName}
          isEdit={isEdit}
          lastName={formState.lastName}
          password={formState.password}
          phoneNumber={formState.phoneNumber}
          rolesContainerStyle={styles.rolesContainer}
          saving={saving}
          selectedRoles={formState.selectedRoles}
          username={formState.username}
          onEmailChange={formState.setEmail}
          onEnabledChange={formState.setEnabled}
          onFirstNameChange={formState.setFirstName}
          onLastNameChange={formState.setLastName}
          onPasswordChange={formState.setPassword}
          onPhoneNumberChange={formState.setPhoneNumber}
          onRoleToggle={toggleRole}
          onUsernameChange={formState.setUsername}
        />

        <FormActions saveDisabled={saveDisabled} saveLabel={saveLabel} saving={saving} onCancel={onCancel} onSave={handleSave} />
      </View>
    </ScrollView>
  );
};

export default UserForm;
