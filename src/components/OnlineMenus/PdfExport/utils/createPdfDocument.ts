/**
 * Lazy-loads jsPDF and creates a PDF document.
 * Extracted for testability -- this module can be mocked
 * without needing to mock the dynamic import of jspdf.
 */

import type { PdfDocument } from './menuPdfRenderer';

export interface PdfDocumentWithSave {
  doc: PdfDocument;
  save: (filename: string) => Promise<void> | void;
}

/** Loads jsPDF lazily and returns a typed PdfDocument wrapper. */
export async function createPdfDocument(): Promise<PdfDocumentWithSave> {
  const { jsPDF } = await import('jspdf');
  const raw = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  return {
    doc: {
      setFontSize: raw.setFontSize.bind(raw),
      setFont: raw.setFont.bind(raw),
      setDrawColor: raw.setDrawColor.bind(raw),
      setLineWidth: raw.setLineWidth.bind(raw),
      text: raw.text.bind(raw),
      line: raw.line.bind(raw),
      splitTextToSize: raw.splitTextToSize.bind(raw),
      addPage: raw.addPage.bind(raw),
    },
    save: (filename: string): void => { raw.save(filename); },
  };
}
