import React, { useState, useCallback, useMemo } from 'react';

import { View, FlatList, StyleSheet } from 'react-native';

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
  const [currentPage, setCurrentPage] = useState(0);

  const totalPages = Math.ceil(data.length / pageSize);

  // Reset to first page when data changes significantly
  React.useEffect(() => {
    const shouldReset = currentPage >= totalPages && totalPages > 0;
    if (shouldReset)
      setCurrentPage(totalPages - 1);

  }, [data.length, totalPages, currentPage]);

  const paginatedData = useMemo(() => {
    const start = currentPage * pageSize;
    const end = start + pageSize;
    return data.slice(start, end);
  }, [data, currentPage, pageSize]);

  const handlePageChange = useCallback((page: number): void => {
    setCurrentPage(page);
  }, []);

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


  const shouldShowPagination = showPagination && totalPages > 1;

  return (
    <View style={styles.container}>
      <FlatList
        showsVerticalScrollIndicator
        contentContainerStyle={contentContainerStyle}
        data={paginatedData}
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
          onPageChange={handlePageChange}
        />
      ) : null}
    </View>
  );
};

export default PaginatedList;
