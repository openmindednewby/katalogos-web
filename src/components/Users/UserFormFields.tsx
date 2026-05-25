import React from 'react';

import type { ViewStyle } from 'react-native';

import { FM } from '@/localization/helpers';

import { FormField, FormSwitch, ChipSelector } from '../Forms';

interface FormFieldsProps {
  username: string;
  email: string;
  phoneNumber: string;
  firstName: string;
  lastName: string;
  password: string;
  enabled: boolean;
  selectedRoles: string[];
  isEdit: boolean;
  saving: boolean;
  enabledContainerStyle: ViewStyle;
  rolesContainerStyle: ViewStyle;
  availableRoles: Array<{ value: string; label: string }>;
  onUsernameChange: (value: string) => void;
  onEmailChange: (value: string) => void;
  onPhoneNumberChange: (value: string) => void;
  onFirstNameChange: (value: string) => void;
  onLastNameChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onEnabledChange: (value: boolean) => void;
  onRoleToggle: (role: string) => void;
}

const UserFormFields = ({
  username,
  email,
  phoneNumber,
  firstName,
  lastName,
  password,
  enabled,
  selectedRoles,
  isEdit,
  saving,
  enabledContainerStyle,
  rolesContainerStyle,
  availableRoles,
  onUsernameChange,
  onEmailChange,
  onPhoneNumberChange,
  onFirstNameChange,
  onLastNameChange,
  onPasswordChange,
  onEnabledChange,
  onRoleToggle,
}: FormFieldsProps): React.ReactElement => {
  const usernameEditable = !isEdit && !saving;

  return (
    <>
      <FormField required editable={usernameEditable} label={FM('users.form.usernameLabel')} placeholder={FM('users.form.usernamePlaceholder')} value={username} onChangeText={onUsernameChange} />

      <FormField autoCapitalize="none" editable={!saving} keyboardType="email-address" label={FM('users.form.emailLabel')} placeholder={FM('users.form.emailPlaceholder')} value={email} onChangeText={onEmailChange} />

      <FormField editable={!saving} keyboardType="phone-pad" label={FM('users.form.phoneLabel')} placeholder={FM('users.form.phonePlaceholder')} value={phoneNumber} onChangeText={onPhoneNumberChange} />

      <FormField editable={!saving} label={FM('users.form.firstNameLabel')} placeholder={FM('users.form.firstNamePlaceholder')} value={firstName} onChangeText={onFirstNameChange} />

      <FormField editable={!saving} label={FM('users.form.lastNameLabel')} placeholder={FM('users.form.lastNamePlaceholder')} value={lastName} onChangeText={onLastNameChange} />

      {!isEdit && <FormField secureTextEntry editable={!saving} label={FM('users.form.passwordLabel')} placeholder={FM('users.form.passwordPlaceholder')} value={password} onChangeText={onPasswordChange} />}

      <FormSwitch containerStyle={enabledContainerStyle} disabled={saving} label={FM('users.form.enabledLabel')} value={enabled} onValueChange={onEnabledChange} />

      <ChipSelector multiple containerStyle={rolesContainerStyle} disabled={saving} label={FM('users.form.rolesLabel')} options={availableRoles} value={selectedRoles} onChange={onRoleToggle} />
    </>
  );
};

export default UserFormFields;
