import React from 'react';

import { StyleSheet, View } from 'react-native';

import { FM } from '@/localization/helpers';

import { useTheme } from '../../theme/hooks/useTheme';
import { ChipSelector, Field } from '../Forms';

interface TenantOption {
  id: string;
  name: string;
}

const styles = StyleSheet.create({
  tenantSelectorCard: { borderRadius: 8, borderWidth: 1, padding: 8 },
});

interface UserFormTenantSelectorProps {
  tenants: TenantOption[];
  selectedTenantId: string;
  onSelectTenant: (id: string) => void;
  disabled: boolean;
}

const UserFormTenantSelector: React.FC<UserFormTenantSelectorProps> = ({
  tenants,
  selectedTenantId,
  onSelectTenant,
  disabled,
}) => {
  const { theme } = useTheme();
  const colors = theme.colors;

  const tenantOptions = tenants.map((tenant) => ({ value: tenant.id, label: tenant.name }));

  return (
    <Field required label={FM('common.tenant')}>
      <View style={[styles.tenantSelectorCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <ChipSelector
          disabled={disabled}
          options={tenantOptions}
          spacing="gap"
          value={selectedTenantId}
          onChange={onSelectTenant}
        />
      </View>
    </Field>
  );
};

export default UserFormTenantSelector;
