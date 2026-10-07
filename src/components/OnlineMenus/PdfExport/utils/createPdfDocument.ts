
import type { PdfDocument } from './menuPdfRenderer';

interface PdfDocumentWithSave {
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
