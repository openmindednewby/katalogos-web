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
  // The card's own 8px padding supplies the spacing under the chips, so the ChipSelector must not
  // add `Field`'s container margin a second time INSIDE the card.
  chipsInCard: { marginBottom: 0 },
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
        <ChipSelector
          containerStyle={styles.chipsInCard}
          disabled={disabled}
          options={tenantOptions}
          value={selectedTenantId}
          onChange={onSelectTenant}
        />
      </View>
    </Field>
  );
};

export default UserFormTenantSelector;
