import React from 'react';

import { StyleSheet, Text, View } from 'react-native';

import { FM } from '@/localization/helpers';

import { useTheme } from '../../theme/hooks/useTheme';
import { ChipSelector } from '../Forms';

interface TenantOption {
  id: string;
  name: string;
}

const styles = StyleSheet.create({
  tenantSection: { marginBottom: 16 },
  tenantLabel: { marginBottom: 4, fontWeight: '600' },
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
  const errorColor = theme.semantic.error['500'];

  const tenantOptions = tenants.map((tenant) => ({ value: tenant.id, label: tenant.name }));

  return (
    <View style={styles.tenantSection}>
      <Text style={[styles.tenantLabel, { color: colors.text }]}>
        {FM('common.tenant')} <Text style={{ color: errorColor }}>{FM('common.required')}</Text>
      </Text>
      <View style={[styles.tenantSelectorCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <ChipSelector disabled={disabled} options={tenantOptions} value={selectedTenantId} onChange={onSelectTenant} />
      </View>
    </View>
  );
};

export default UserFormTenantSelector;
