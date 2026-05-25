import React from 'react';

import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { FM } from '@/localization/helpers';
import { DISABLED_OPACITY } from '@/shared/constants';

import { useTheme } from '../../theme/hooks/useTheme';

import type { ThemeModeColors } from '../../theme/types';

const PAGINATION_TEXT_COLOR = '#fff';

const styles = StyleSheet.create({
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderTopWidth: 1,
  },
  paginationInfo: {
    fontSize: 14,
  },
  paginationButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  paginationButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    borderWidth: 1,
  },
  paginationButtonDisabled: {
    opacity: DISABLED_OPACITY,
  },
  paginationButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  pageIndicator: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  pageIndicatorText: {
    color: PAGINATION_TEXT_COLOR,
    fontSize: 14,
    fontWeight: '600',
  },
});

export interface PaginationControlsProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  totalItems: number;
  pageSize: number;
}

interface PageButtonProps {
  label: string;
  onPress: () => void;
  disabled: boolean;
  colors: ThemeModeColors;
}

const PageButton = ({ label, onPress, disabled, colors }: PageButtonProps): React.ReactElement => (
  <TouchableOpacity
    accessibilityHint={`Navigate to ${label} page`}
    accessibilityLabel={label}
    accessibilityRole="button"
    disabled={disabled}
    style={[
      styles.paginationButton,
      { backgroundColor: colors.surface, borderColor: colors.border },
      disabled && styles.paginationButtonDisabled,
    ]}
    onPress={onPress}
  >
    <Text style={[styles.paginationButtonText, { color: disabled ? colors.textSecondary : colors.text }]}>{label}</Text>
  </TouchableOpacity>
);

export const PaginationControls = ({
  currentPage,
  totalPages,
  onPageChange,
  totalItems,
  pageSize,
}: PaginationControlsProps): React.ReactElement | null => {
  const { theme } = useTheme();
  const colors = theme.colors;
  const primaryColor = theme.palette.primary['500'];

  const startItem = currentPage * pageSize + 1;
  const endItem = Math.min((currentPage + 1) * pageSize, totalItems);

  if (totalPages <= 1) return null;

  const isFirstPage = currentPage === 0;
  const isLastPage = currentPage >= totalPages - 1;

  return (
    <View style={[styles.paginationContainer, { borderTopColor: colors.border }]}>
      <Text style={[styles.paginationInfo, { color: colors.textSecondary }]}>
        {FM('common.showingRange', String(startItem), String(endItem), String(totalItems))}
      </Text>

      <View style={styles.paginationButtons}>
        <PageButton colors={colors} disabled={isFirstPage} label={FM('common.first')} onPress={() => onPageChange(0)} />
        <PageButton colors={colors} disabled={isFirstPage} label={FM('common.prev')} onPress={() => onPageChange(currentPage - 1)} />

        <View style={[styles.pageIndicator, { backgroundColor: primaryColor }]}>
          <Text style={styles.pageIndicatorText}>
            {FM('common.pageIndicator', String(currentPage + 1), String(totalPages))}
          </Text>
        </View>

        <PageButton colors={colors} disabled={isLastPage} label={FM('common.next')} onPress={() => onPageChange(currentPage + 1)} />
        <PageButton colors={colors} disabled={isLastPage} label={FM('common.last')} onPress={() => onPageChange(totalPages - 1)} />
      </View>
    </View>
  );
};
