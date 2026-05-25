/**
 * Detail row component that renders an expandable section below a table row.
 * Uses CSS max-height transition for smooth expand/collapse animation.
 */
import type { ReactElement } from 'react';

import type { DetailTemplate } from './types';

// =============================================================================
// Constants
// =============================================================================

const ANIMATION_DURATION_MS = '300ms';
const EXPANDED_MAX_HEIGHT = '2000px';
const COLLAPSED_MAX_HEIGHT = '0px';
const DETAIL_PADDING = '12px 16px';

// =============================================================================
// Styles (defined before usage)
// =============================================================================

const cellStyle: React.CSSProperties = {
  padding: 0,
  border: 'none',
};

const innerPadding: React.CSSProperties = {
  padding: DETAIL_PADDING,
  backgroundColor: 'var(--component-datagrid-detailRowBackground, #fafafa)',
};

// =============================================================================
// Types
// =============================================================================

interface Props {
  row: Record<string, unknown>;
  isExpanded: boolean;
  colSpan: number;
  detailTemplate: DetailTemplate;
  testID?: string;
}

// =============================================================================
// Component
// =============================================================================

export const DetailRow = ({
  row,
  isExpanded,
  colSpan,
  detailTemplate,
  testID,
}: Props): ReactElement => {
  const contentStyle: React.CSSProperties = {
    maxHeight: isExpanded ? EXPANDED_MAX_HEIGHT : COLLAPSED_MAX_HEIGHT,
    overflow: 'hidden',
    transition: `max-height ${ANIMATION_DURATION_MS} ease-in-out`,
  };

  return (
    <tr className="table-native-detail-row" data-testid={testID}>
      <td colSpan={colSpan} style={cellStyle}>
        <div style={contentStyle}>
          {isExpanded ? <div style={innerPadding}>{detailTemplate(row)}</div> : null}
        </div>
      </td>
    </tr>
  );
};
