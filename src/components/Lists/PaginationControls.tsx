import React from 'react';

import { Pager } from '@dloizides/ui-tables';

const PAGE_INDEX_OFFSET = 1;

interface PaginationControlsProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  totalItems: number;
  pageSize: number;
}

// eslint-disable-next-line no-empty-function
function noopPageSizeChange(): void {
}

export const PaginationControls = ({
  currentPage,
  totalPages,
  onPageChange,
  totalItems,
  pageSize,
}: PaginationControlsProps): React.ReactElement | null => {
  if (totalPages <= 1) return null;

  return (
    <Pager
      boldNumbers
      showFirstLast
      page={currentPage + PAGE_INDEX_OFFSET}
      pageSize={pageSize}
      pageSizeOptions={[pageSize]}
      total={totalItems}
      onPageChange={(page) => onPageChange(page - PAGE_INDEX_OFFSET)}
      onPageSizeChange={noopPageSizeChange}
    />
  );
};
