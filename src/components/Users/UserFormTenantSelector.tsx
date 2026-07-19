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
    // Was a hand-rolled `<Text>` label + required asterisk in a `marginBottom: 16` View. `Field`
    // renders the identical structure with the kit's label metrics, and marks the asterisk
    // decorative so a screen reader announces "required" rather than "star" (UX-7f).
    <Field required label={FM('common.tenant')}>
      <View style={[styles.tenantSelectorCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        {/*
          The enclosing card's own 8px padding owns the rhythm under the chips, so the field speaks
          the `gap` model — it contributes no container margin of its own. This replaces an
          anonymous `containerStyle={{ marginBottom: 0 }}` cancel with the named prop ui-forms@1.9.0
          added for exactly this case.
        */}
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
