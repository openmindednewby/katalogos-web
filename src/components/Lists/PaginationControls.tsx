/**
 * PaginationControls — first / prev / next / last pager. Reconciled onto the
 * shared `@dloizides/ui-tables` `Pager` (`showFirstLast`) so every list shares one
 * pager; this thin adapter keeps the component's 0-based public API (the `Pager`
 * is 1-based) and preserves the `totalPages <= 1` hide. Labels + the rows control
 * are themed + localized by the shared kit via the app's `FeedbackUiProvider`.
 */
import React from 'react';

import { Pager } from '@dloizides/ui-tables';

const PAGE_INDEX_OFFSET = 1;

interface PaginationControlsProps {
  /** 0-based current page. */
  currentPage: number;
  totalPages: number;
  /** Receives the next 0-based page index. */
  onPageChange: (page: number) => void;
  totalItems: number;
  pageSize: number;
}

/** No rows-per-page choice for this generic pager — the page size is fixed by the caller. */
function noopPageSizeChange(): void {
  /* fixed page size */
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
