/**
 * Virtualized table body that only renders visible rows plus a buffer.
 * Uses spacer elements above and below to maintain scroll position.
 */
import type { ReactElement, ReactNode } from 'react';

// =============================================================================
// Styles (defined before usage)
// =============================================================================

const spacerCellStyle: React.CSSProperties = {
  padding: 0,
  border: 'none',
};

// =============================================================================
// Types
// =============================================================================

interface Props {
  totalHeight: number;
  offsetY: number;
  visibleStart: number;
  visibleEnd: number;
  rowHeight: number;
  children: ReactNode;
  testID?: string;
}

// =============================================================================
// Component
// =============================================================================

export const VirtualTableBody = ({
  totalHeight,
  offsetY,
  visibleStart,
  visibleEnd,
  rowHeight,
  children,
  testID,
}: Props): ReactElement => {
  const bottomSpacerHeight = totalHeight - offsetY - ((visibleEnd - visibleStart) * rowHeight);
  const safeBottomHeight = Math.max(0, bottomSpacerHeight);

  return (
    <tbody data-testid={testID}>
      {offsetY > 0 && (
        <tr aria-hidden="true" className="table-native-virtual-spacer-top">
          <td style={{ ...spacerCellStyle, height: offsetY }} />
        </tr>
      )}

      {children}

      {safeBottomHeight > 0 && (
        <tr aria-hidden="true" className="table-native-virtual-spacer-bottom">
          <td style={{ ...spacerCellStyle, height: safeBottomHeight }} />
        </tr>
      )}
    </tbody>
  );
};
