/**
 * Hook for lazy-loaded menu PDF export.
 * Loads jsPDF only when the user triggers an export.
 */
import { useCallback, useState } from 'react';

import { FM } from '@/localization/helpers';

import { notify, notifySuccess } from '../../../../lib/notifications';
import { createPdfDocument } from '../utils/createPdfDocument';
import { buildPdfMenuData, sanitizePdfFilename } from '../utils/menuPdfHelpers';
import { renderMenuPdf } from '../utils/menuPdfRenderer';

import type { MenuContents } from '../../../../types/menuTypes';

interface UseMenuPdfExportParams {
  menuName: string;
  restaurantName: string;
  contents: MenuContents | null | undefined;
}

interface UseMenuPdfExportResult {
  isExporting: boolean;
  exportPdf: () => Promise<void>;
}

export function useMenuPdfExport({
  menuName,
  restaurantName,
  contents,
}: UseMenuPdfExportParams): UseMenuPdfExportResult {
  const [isExporting, setIsExporting] = useState(false);

  const exportPdf = useCallback(async () => {
    setIsExporting(true);
    try {
      const pdfData = buildPdfMenuData(menuName, restaurantName, contents);
      const { doc, save } = await createPdfDocument();
      renderMenuPdf(doc, pdfData);
      const filename = `menu-${sanitizePdfFilename(menuName)}.pdf`;
      await save(filename);
      notifySuccess(FM('onlineMenus.pdfExport.downloadStarted'));
    } catch {
      notify('error', FM('onlineMenus.pdfExport.downloadFailed'));
    } finally {
      setIsExporting(false);
    }
  }, [menuName, restaurantName, contents]);

  return { isExporting, exportPdf };
}
