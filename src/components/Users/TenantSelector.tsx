/**
 * Horizontal scrolling tenant selector for user management.
 */
import React from 'react';

import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { FM } from '@/localization/helpers';

import { TestIds } from '../../shared/testIds';
import { isValueDefined } from '../../utils/is';

const WHITE_COLOR = '#fff';

const styles = StyleSheet.create({
  wrapper: { paddingHorizontal: 16, marginBottom: 16 },
  title: { marginBottom: 8, fontWeight: 'bold' },
  subtitle: { fontSize: 12, marginBottom: 8 },
  loadingBox: { padding: 12 },
  tenantScroll: { marginBottom: 8 },
  tenantRow: { flexDirection: 'row', gap: 8 },
  tenantButton: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 8, borderWidth: 1 },
});

interface Tenant {
  tenantId?: string | null;
  name?: string | null;
}

interface ThemeColors {
  text: string;
  textSecondary: string;
  primary: string;
  surface: string;
  border: string;
}

interface Props {
  tenants: Tenant[];
  selectedTenantId: string | null;
  isLoading: boolean;
  colors: ThemeColors;
  onSelectTenant: (tenantId: string | null) => void;
}

export const TenantSelector = ({
  tenants,
  selectedTenantId,
  isLoading,
  colors,
  onSelectTenant,
}: Props): React.ReactElement => {
  const titleStyle = [styles.title, { color: colors.text }];
  const subtitleStyle = [styles.subtitle, { color: colors.textSecondary }];

  const getButtonStyle = (selected: boolean): object[] => [
    styles.tenantButton,
    selected
      ? { backgroundColor: colors.primary, borderColor: colors.primary }
      : { backgroundColor: colors.surface, borderColor: colors.border },
  ];

  const getTextStyle = (selected: boolean): object =>
    selected
      ? { color: WHITE_COLOR, fontWeight: '600' as const }
      : { color: colors.text, fontWeight: '400' as const };

  if (isLoading) 
    return (
      <View style={styles.wrapper}>
        <Text style={titleStyle}>{FM('users.selectTenant')}</Text>
        <Text style={subtitleStyle}>{FM('users.chooseTenantSubtitle')}</Text>
        <View style={styles.loadingBox}>
          <ActivityIndicator />
        </View>
      </View>
    );


  const isAllUsersSelected = !isValueDefined(selectedTenantId);

  return (
    <View style={styles.wrapper}>
      <Text style={titleStyle}>{FM('users.selectTenant')}</Text>
      <Text style={subtitleStyle}>{FM('users.chooseTenantSubtitle')}</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tenantScroll}>
        <View style={styles.tenantRow}>
          <TouchableOpacity
            accessibilityHint={FM('users.allUsersHint')}
            accessibilityLabel={FM('users.allUsersLabel')}
            accessibilityRole="button"
            style={getButtonStyle(isAllUsersSelected)}
            testID={TestIds.TENANT_SELECTOR_ALL_USERS}
            onPress={() => onSelectTenant(null)}
          >
            <Text style={getTextStyle(isAllUsersSelected)}>{FM('users.allUsers')}</Text>
          </TouchableOpacity>

          {tenants.map((tenant) => {
            const isSelected = selectedTenantId === tenant.tenantId;
            return (
              <TouchableOpacity
                key={tenant.tenantId}
                accessibilityHint={FM('users.filterTenantHint', tenant.name ?? FM('users.unknownTenant'))}
                accessibilityLabel={tenant.name ?? FM('users.unknownTenant')}
                accessibilityRole="button"
                style={getButtonStyle(isSelected)}
                testID={`${TestIds.TENANT_SELECTOR_ITEM}-${tenant.tenantId ?? 'unknown'}`}
                onPress={() => onSelectTenant(tenant.tenantId ?? null)}
              >
                <Text style={getTextStyle(isSelected)}>{tenant.name}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
};
