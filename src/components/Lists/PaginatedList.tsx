import React, { useCallback, useMemo } from 'react';

import { View, FlatList, StyleSheet } from 'react-native';

import { usePagedRows } from '@dloizides/ui-tables';

import { PaginationControls } from './PaginationControls';
import { DEFAULT_PAGE_SIZE } from '../../shared/constants';
import EmptyListState from '../Shared/EmptyListState';
import LoadingFallback from '../Shared/Fallbacks/LoadingFallback';

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

interface Props<T> {
  data: T[];
  renderItem: (item: T, index: number) => React.ReactElement;
  keyExtractor: (item: T, index: number) => string;
  pageSize?: number;
  isLoading?: boolean;
  emptyMessageKey?: string;
  showPagination?: boolean;
  listHeaderComponent?: React.ComponentType<unknown> | React.ReactElement | null;
  listFooterComponent?: React.ComponentType<unknown> | React.ReactElement | null;
  contentContainerStyle?: object;
  testID?: string;
}

const PaginatedList = <T,>({
  data,
  renderItem,
  keyExtractor,
  pageSize = DEFAULT_PAGE_SIZE,
  isLoading = false,
  emptyMessageKey = 'common.noResults',
  showPagination = true,
  listHeaderComponent,
  listFooterComponent,
  contentContainerStyle,
  testID = 'paginated-list',
}: Props<T>): React.ReactElement => {
  const pagingOptions = useMemo(() => ({ pageSize }), [pageSize]);
  const { pageRows, currentPage, totalPages, setPage, hasPages } = usePagedRows(data, pagingOptions);

  const renderListItem = useCallback(
    ({ item, index }: { item: T; index: number }): React.ReactElement => renderItem(item, index),
    [renderItem],
  );

  if (isLoading)
    return <LoadingFallback />;


  if (data.length === 0)
    return (
      <EmptyListState
        messageKey={emptyMessageKey}
        testID={`${testID}-empty`}
      />
    );


  const shouldShowPagination = showPagination && hasPages;

  return (
    <View style={styles.container}>
      <FlatList
        showsVerticalScrollIndicator
        contentContainerStyle={contentContainerStyle}
        data={pageRows}
        keyExtractor={keyExtractor}
        ListFooterComponent={listFooterComponent}
        ListHeaderComponent={listHeaderComponent}
        renderItem={renderListItem}
      />

      {shouldShowPagination ? (
        <PaginationControls
          currentPage={currentPage}
          pageSize={pageSize}
          totalItems={data.length}
          totalPages={totalPages}
          onPageChange={setPage}
        />
      ) : null}
    </View>
  );
};

export default PaginatedList;
