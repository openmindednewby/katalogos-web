/**
 * Hook for exporting menu data in CSV or JSON format.
 * Handles format selection, data formatting, and file download.
 */
import { useCallback, useState } from 'react';

import { FM } from '@/localization/helpers';

import ExportFormat from '../../../../shared/enums/ExportFormat';
import { isValueDefined } from '../../../../utils/is';
import { buildExportFilename, downloadFile } from '../utils/downloadFile';
import { formatMenuCsv } from '../utils/formatMenuCsv';
import { formatMenuJson } from '../utils/formatMenuJson';

import type { MenuContents } from '../../../../types/menuTypes';

interface UseMenuExportParams {
  contents: MenuContents | null | undefined;
  menuName?: string;
}

interface UseMenuExportResult {
  selectedFormat: ExportFormat;
  setSelectedFormat: (format: ExportFormat) => void;
  exportMenu: () => { success: boolean; message: string };
  hasData: boolean;
}

/** Map of format to its formatting function. */
const FORMAT_HANDLERS: Record<string, (c: MenuContents | null | undefined) => string> = {
  [ExportFormat.Csv]: formatMenuCsv,
  [ExportFormat.Json]: formatMenuJson,
};

/**
 * Format menu contents to string based on the selected format.
 * Returns empty string if format is not recognized or no data.
 */
function formatContents(contents: MenuContents | null | undefined, format: ExportFormat): string {
  const handler = FORMAT_HANDLERS[format];
  return isValueDefined(handler) ? handler(contents) : '';
}

export function useMenuExport({ contents, menuName }: UseMenuExportParams): UseMenuExportResult {
  const [selectedFormat, setSelectedFormat] = useState<ExportFormat>(ExportFormat.Csv);

  const hasData = (contents?.categories?.length ?? 0) > 0 &&
    contents?.categories?.some((cat) => (cat.items?.length ?? 0) > 0) === true;

  const exportMenu = useCallback((): { success: boolean; message: string } => {
    if (!hasData)
      return { success: false, message: FM('menuExport.noDataToExport') };

    const formatted = formatContents(contents, selectedFormat);
    if (formatted === '')
      return { success: false, message: FM('menuExport.noDataToExport') };

    const filename = buildExportFilename(menuName ?? 'menu', selectedFormat);
    downloadFile(formatted, filename, selectedFormat);
    return { success: true, message: FM('menuExport.exportSuccess') };
  }, [contents, hasData, menuName, selectedFormat]);

  return { selectedFormat, setSelectedFormat, exportMenu, hasData };
}
