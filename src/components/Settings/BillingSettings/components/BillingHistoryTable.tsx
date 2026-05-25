/**
 * BillingHistoryTable - paginated table of past billing transactions.
 */
import React, { useMemo } from 'react';

import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { useBreakpoint } from '../../../../hooks/useBreakpoint';
import { FM, FD } from '../../../../localization/helpers';
import { DISABLED_OPACITY } from '../../../../shared/constants';
import { TestIds } from '../../../../shared/testIds';
import { useTheme } from '../../../../theme/hooks/useTheme';
import Section from '../../../Shared/Section';
import { BODY_FONT_SIZE, MEDIUM_SPACING, TITLE_FONT_SIZE } from '../../constants';
import { TABLE_CELL_FONT_SIZE, TABLE_CELL_PADDING } from '../constants';
import { getInvoiceStatusTranslationKey } from '../utils/billingHelpers';

import type { BillingHistoryItem } from '../../../../lib/hooks/billing';

interface Props {
  items: BillingHistoryItem[];
  page: number;
  totalPages: number;
  onPrevPage: () => void;
  onNextPage: () => void;
}

const EMPTY_PADDING_V = 20;
const PAGE_BUTTON_PADDING_H = 12;
const PAGE_BUTTON_PADDING_V = 6;
const PAGE_BUTTON_BORDER_RADIUS = 6;

const FULL_OPACITY = 1;
const PHONE_TABLE_MIN_WIDTH = 500;

const styles = StyleSheet.create({
  sectionTitle: {
    fontSize: TITLE_FONT_SIZE,
    fontWeight: '600',
    marginBottom: MEDIUM_SPACING,
  },
  tableContainer: { minWidth: PHONE_TABLE_MIN_WIDTH },
  headerRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    paddingBottom: TABLE_CELL_PADDING,
  },
  row: {
    flexDirection: 'row',
    paddingVertical: TABLE_CELL_PADDING,
    borderBottomWidth: 1,
  },
  cell: { fontSize: TABLE_CELL_FONT_SIZE, flex: 1 },
  headerCell: { fontSize: TABLE_CELL_FONT_SIZE, fontWeight: '600', flex: 1 },
  emptyText: {
    fontSize: BODY_FONT_SIZE,
    textAlign: 'center',
    paddingVertical: EMPTY_PADDING_V,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: MEDIUM_SPACING,
  },
  pageButton: {
    paddingHorizontal: PAGE_BUTTON_PADDING_H,
    paddingVertical: PAGE_BUTTON_PADDING_V,
    borderRadius: PAGE_BUTTON_BORDER_RADIUS,
    borderWidth: 1,
  },
  pageText: { fontSize: TABLE_CELL_FONT_SIZE },
  pageIndicator: { fontSize: TABLE_CELL_FONT_SIZE },
});

function formatAmount(currency: string, amount: number): string {
  return `${currency} ${String(amount)}`;
}

const BillingHistoryTable = ({
  items,
  page,
  totalPages,
  onPrevPage,
  onNextPage,
}: Props): React.ReactElement => {
  const { theme } = useTheme();
  const colors = theme.colors;
  const primary = theme.palette.primary['500'];
  const { isPhone } = useBreakpoint();

  const isEmpty = items.length === 0;
  const isFirstPage = page <= 1;
  const isLastPage = page >= totalPages;

  const prevOpacity = useMemo(() => (isFirstPage ? DISABLED_OPACITY : FULL_OPACITY), [isFirstPage]);
  const nextOpacity = useMemo(() => (isLastPage ? DISABLED_OPACITY : FULL_OPACITY), [isLastPage]);

  const tableContent = (
    <View style={isPhone ? styles.tableContainer : undefined} testID={TestIds.BILLING_HISTORY_TABLE}>
      <View style={[styles.headerRow, { borderBottomColor: colors.border }]}>
        <Text style={[styles.headerCell, { color: colors.text }]}>{FM('settings.billing.date')}</Text>
        <Text style={[styles.headerCell, { color: colors.text }]}>{FM('settings.billing.description')}</Text>
        <Text style={[styles.headerCell, { color: colors.text }]}>{FM('settings.billing.amount')}</Text>
        <Text style={[styles.headerCell, { color: colors.text }]}>{FM('settings.billing.invoiceStatus')}</Text>
      </View>

      {items.map((item) => (
        <View
          key={item.id}
          style={[styles.row, { borderBottomColor: colors.border }]}
          testID={TestIds.BILLING_HISTORY_ROW}
        >
          <Text style={[styles.cell, { color: colors.text }]}>{FD(new Date(item.date))}</Text>
          <Text style={[styles.cell, { color: colors.text }]}>{item.description}</Text>
          <Text style={[styles.cell, { color: colors.text }]}>{formatAmount(item.currency, item.amount)}</Text>
          <Text style={[styles.cell, { color: colors.textSecondary }]}>{FM(getInvoiceStatusTranslationKey(item.status))}</Text>
        </View>
      ))}
    </View>
  );

  return (
    <Section>
      <Text style={[styles.sectionTitle, { color: colors.text }]}>
        {FM('settings.billing.billingHistory')}
      </Text>

      {isEmpty ? (
        <Text style={[styles.emptyText, { color: colors.textSecondary }]} testID={TestIds.BILLING_HISTORY_EMPTY}>
          {FM('settings.billing.noHistory')}
        </Text>
      ) : (
        <>
          {isPhone ? (
            <ScrollView horizontal showsHorizontalScrollIndicator>
              {tableContent}
            </ScrollView>
          ) : tableContent}

          <View style={styles.pagination}>
            <TouchableOpacity
              accessibilityHint={FM('settings.billing.previousPageHint')}
              accessibilityLabel={FM('settings.billing.previousPage')}
              accessibilityRole="button"
              disabled={isFirstPage}
              style={[styles.pageButton, { borderColor: colors.border, opacity: prevOpacity }]}
              testID={TestIds.BILLING_HISTORY_PREV_PAGE}
              onPress={onPrevPage}
            >
              <Text style={[styles.pageText, { color: primary }]}>{FM('settings.billing.previousPage')}</Text>
            </TouchableOpacity>

            <Text style={[styles.pageIndicator, { color: colors.textSecondary }]}>
              {FM('settings.billing.pageIndicator', String(page), String(totalPages))}
            </Text>

            <TouchableOpacity
              accessibilityHint={FM('settings.billing.nextPageHint')}
              accessibilityLabel={FM('settings.billing.nextPage')}
              accessibilityRole="button"
              disabled={isLastPage}
              style={[styles.pageButton, { borderColor: colors.border, opacity: nextOpacity }]}
              testID={TestIds.BILLING_HISTORY_NEXT_PAGE}
              onPress={onNextPage}
            >
              <Text style={[styles.pageText, { color: primary }]}>{FM('settings.billing.nextPage')}</Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </Section>
  );
};

export default BillingHistoryTable;
