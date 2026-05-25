import { DESIGNER_PNG_EXPORT_SCALE, DESIGNER_QR_SOURCE_ID } from './qrDesignerConstants';

const MAX_FILENAME_LENGTH = 50;
const SVG_MIME_TYPE = 'image/svg+xml';
const PNG_MIME_TYPE = 'image/png';
const PDF_MIME_TYPE = 'application/pdf';
const PDF_DPI_TO_MM = 0.264_583;
const JPEG_QUALITY = 0.95;

/** Sanitizes a string for use as a filename. */
export function sanitizeFilename(name: string): string {
  return name.replace(/[^a-zA-Z0-9-_]/g, '_').substring(0, MAX_FILENAME_LENGTH);
}

/** Triggers a browser download of a blob with the given filename. */
function triggerBlobDownload(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}

/**
 * Extracts the QR code SVG from the hidden source element and
 * converts it to a data URI for embedding in designer templates.
 */
export function extractQrDataUri(): string {
  const container = document.getElementById(DESIGNER_QR_SOURCE_ID);
  if (!container) return '';
  const svg = container.querySelector('svg');
  if (!svg) return '';
  const serialized = new XMLSerializer().serializeToString(svg);
  const encoded = btoa(unescape(encodeURIComponent(serialized)));
  return `data:${SVG_MIME_TYPE};base64,${encoded}`;
}

/** Renders an SVG string to a canvas and returns a PNG blob. */
async function svgToPngBlob(svgString: string, width: number, height: number): Promise<Blob | null> {
  return new Promise((resolve) => {
    const scaledWidth = width * DESIGNER_PNG_EXPORT_SCALE;
    const scaledHeight = height * DESIGNER_PNG_EXPORT_SCALE;
    const svgBlob = new Blob([svgString], { type: `${SVG_MIME_TYPE};charset=utf-8` });
    const url = URL.createObjectURL(svgBlob);
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = scaledWidth;
      canvas.height = scaledHeight;
      const ctx = canvas.getContext('2d');
      if (!ctx) { URL.revokeObjectURL(url); resolve(null); return; }
      ctx.drawImage(img, 0, 0, scaledWidth, scaledHeight);
      canvas.toBlob((blob) => { URL.revokeObjectURL(url); resolve(blob); }, PNG_MIME_TYPE, JPEG_QUALITY);
    };
    img.onerror = () => { URL.revokeObjectURL(url); resolve(null); };
    img.src = url;
  });
}

/** Downloads the designer template as a PNG file. Returns true on success. */
export async function downloadDesignAsPng(
  svgString: string,
  width: number,
  height: number,
  menuName: string,
): Promise<boolean> {
  try {
    const blob = await svgToPngBlob(svgString, width, height);
    if (!blob) return false;
    triggerBlobDownload(blob, `qr-design-${sanitizeFilename(menuName)}.png`);
    return true;
  } catch {
    return false;
  }
}

/** Downloads the designer template as an SVG file. Returns true on success. */
export function downloadDesignAsSvg(svgString: string, menuName: string): boolean {
  try {
    const blob = new Blob([svgString], { type: SVG_MIME_TYPE });
    triggerBlobDownload(blob, `qr-design-${sanitizeFilename(menuName)}.svg`);
    return true;
  } catch {
    return false;
  }
}

/** Downloads the designer template as a PDF file using lazy-loaded jsPDF. Returns true on success. */
export async function downloadDesignAsPdf(
  svgString: string,
  width: number,
  height: number,
  menuName: string,
): Promise<boolean> {
  try {
    const blob = await svgToPngBlob(svgString, width, height);
    if (!blob) return false;

    const { jsPDF } = await import('jspdf');
    const widthMm = width * PDF_DPI_TO_MM;
    const heightMm = height * PDF_DPI_TO_MM;
    const orientation = height >= width ? 'portrait' : 'landscape';
    const pdf = new jsPDF({ orientation, unit: 'mm', format: [widthMm, heightMm] });

    const arrayBuffer = await blob.arrayBuffer();
    const uint8 = new Uint8Array(arrayBuffer);
    const base64 = btoa(String.fromCharCode(...uint8));
    const imgData = `data:${PNG_MIME_TYPE};base64,${base64}`;

    pdf.addImage(imgData, 'PNG', 0, 0, widthMm, heightMm);
    const pdfBlob = pdf.output('blob');
    triggerBlobDownload(new Blob([pdfBlob], { type: PDF_MIME_TYPE }), `qr-design-${sanitizeFilename(menuName)}.pdf`);
    return true;
  } catch {
    return false;
  }
}
