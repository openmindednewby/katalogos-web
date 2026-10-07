import { PNG_EXPORT_SCALE, QR_CODE_CONTAINER_ID } from './qrCodeConstants';

const MAX_FILENAME_LENGTH = 50;
const SVG_MIME_TYPE = 'image/svg+xml';
const PNG_MIME_TYPE = 'image/png';

function findQrSvgElement(): SVGSVGElement | null {
  const container = document.getElementById(QR_CODE_CONTAINER_ID);
  if (!container) return null;
  return container.querySelector('svg');
}

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

function sanitizeFilename(name: string): string {
  return name.replace(/[^a-zA-Z0-9-_]/g, '_').substring(0, MAX_FILENAME_LENGTH);
}

function serializeSvg(svg: SVGSVGElement): string {
  return new XMLSerializer().serializeToString(svg);
}

async function drawImageToBlob(img: HTMLImageElement, scaledSize: number): Promise<Blob | null> {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    canvas.width = scaledSize;
    canvas.height = scaledSize;
    const ctx = canvas.getContext('2d');
    if (!ctx) { resolve(null); return; }
    ctx.drawImage(img, 0, 0, scaledSize, scaledSize);
    canvas.toBlob((blob) => { resolve(blob); }, PNG_MIME_TYPE);
  });
}

async function renderSvgToCanvas(svgString: string, scaledSize: number): Promise<Blob | null> {
  return new Promise((resolve) => {
    const svgBlob = new Blob([svgString], { type: `${SVG_MIME_TYPE};charset=utf-8` });
    const url = URL.createObjectURL(svgBlob);
    const img = new Image();
    img.onload = async () => {
      const blob = await drawImageToBlob(img, scaledSize);
      URL.revokeObjectURL(url);
      resolve(blob);
    };
    img.onerror = () => { URL.revokeObjectURL(url); resolve(null); };
    img.src = url;
  });
}

/** Downloads the QR code as an SVG file. */
export function downloadQrAsSvg(menuName: string): boolean {
  const svg = findQrSvgElement();
  if (!svg) return false;

  const svgString = serializeSvg(svg);
  const blob = new Blob([svgString], { type: SVG_MIME_TYPE });
  triggerBlobDownload(blob, `qr-${sanitizeFilename(menuName)}.svg`);
  return true;
}

/** Downloads the QR code as a PNG file. */
export async function downloadQrAsPng(menuName: string, size: number): Promise<boolean> {
  const svg = findQrSvgElement();
  if (!svg) return false;

  const scaledSize = size * PNG_EXPORT_SCALE;
  const svgString = serializeSvg(svg);
  const blob = await renderSvgToCanvas(svgString, scaledSize);
  if (!blob) return false;

  triggerBlobDownload(blob, `qr-${sanitizeFilename(menuName)}.png`);
  return true;
}

/** Copies text to the clipboard. */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}
