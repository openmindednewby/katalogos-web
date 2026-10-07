import AspectRatioPreset from '../../../shared/enums/AspectRatioPreset';
import { isValueDefined } from '../../../utils/is';

import type { FileInfo } from '../../../lib/hooks/content/types';


const SQUARE_RATIO = 1;

const LANDSCAPE_WIDTH = 16;

const LANDSCAPE_HEIGHT = 9;

const LANDSCAPE_RATIO = LANDSCAPE_WIDTH / LANDSCAPE_HEIGHT;

const CLASSIC_WIDTH = 4;

const CLASSIC_HEIGHT = 3;

const CLASSIC_RATIO = CLASSIC_WIDTH / CLASSIC_HEIGHT;

const CROP_OUTPUT_QUALITY = 0.85;

/** Minimum zoom level for the cropper. */
export const MIN_ZOOM = 1;

/** Maximum zoom level for the cropper. */
export const MAX_ZOOM = 3;

/** Zoom slider step increment. */
export const ZOOM_STEP = 0.01;


/** Pixel-level crop area returned by react-easy-crop. */
export interface PixelCrop {
  x: number;
  y: number;
  width: number;
  height: number;
}


/** Returns the numeric aspect ratio for a preset. */
export function getAspectRatioValue(preset: AspectRatioPreset): number | undefined {
  if (preset === AspectRatioPreset.Square) return SQUARE_RATIO;
  if (preset === AspectRatioPreset.Landscape) return LANDSCAPE_RATIO;
  if (preset === AspectRatioPreset.Classic) return CLASSIC_RATIO;
  return undefined;
}

/**
 * Wraps a Blob as a FileInfo object for the upload pipeline.
 */
export function blobToFileInfo(blob: Blob, name: string, mimeType: string): FileInfo {
  const blobUrl = URL.createObjectURL(blob);
  return {
    uri: blobUrl,
    name,
    type: mimeType,
    size: blob.size,
  };
}

/** Crops an image using canvas and returns the result as a Blob. */
export async function cropImageToBlob(
  imageUri: string,
  pixelCrop: PixelCrop,
  mimeType: string,
  quality: number = CROP_OUTPUT_QUALITY,
): Promise<Blob> {
  const image = await loadImage(imageUri);
  const canvas = document.createElement('canvas');
  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;

  const ctx = canvas.getContext('2d');
  if (!isValueDefined(ctx)) throw new Error('Canvas 2D context not available');

  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height,
  );

  return canvasToBlob(canvas, mimeType, quality);
}


async function loadImage(uri: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = (): void => resolve(img);
    img.onerror = (_e): void => reject(new Error('Failed to load image for cropping'));
    img.src = uri;
  });
}

async function canvasToBlob(canvas: HTMLCanvasElement, mimeType: string, quality: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!isValueDefined(blob)) {
          reject(new Error('Canvas toBlob returned null'));
          return;
        }
        resolve(blob);
      },
      mimeType,
      quality,
    );
  });
}
