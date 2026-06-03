/**
 * Utility functions for client-side image cropping.
 *
 * Converts crop coordinates into a canvas-rendered Blob, then wraps
 * it as a FileInfo compatible with the existing upload pipeline.
 */
import AspectRatioPreset from '../../../shared/enums/AspectRatioPreset';
import { isValueDefined } from '../../../utils/is';

import type { FileInfo } from '../../../lib/hooks/content/types';

// ---------------------------------------------------------------------------
// Constants (private first, then exported — to satisfy enforce-function-style)
// ---------------------------------------------------------------------------

/** Aspect ratio for a 1:1 square crop. */
const SQUARE_RATIO = 1;

/** Landscape width component (16:9). */
const LANDSCAPE_WIDTH = 16;

/** Landscape height component (16:9). */
const LANDSCAPE_HEIGHT = 9;

/** Aspect ratio for a 16:9 landscape crop. */
const LANDSCAPE_RATIO = LANDSCAPE_WIDTH / LANDSCAPE_HEIGHT;

/** Classic width component (4:3). */
const CLASSIC_WIDTH = 4;

/** Classic height component (4:3). */
const CLASSIC_HEIGHT = 3;

/** Aspect ratio for a 4:3 classic crop. */
const CLASSIC_RATIO = CLASSIC_WIDTH / CLASSIC_HEIGHT;

/** JPEG output quality for cropped images (0-1). */
const CROP_OUTPUT_QUALITY = 0.85;

/** Minimum zoom level for the cropper. */
export const MIN_ZOOM = 1;

/** Maximum zoom level for the cropper. */
export const MAX_ZOOM = 3;

/** Zoom slider step increment. */
export const ZOOM_STEP = 0.01;

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** Pixel-level crop area returned by react-easy-crop. */
export interface PixelCrop {
  x: number;
  y: number;
  width: number;
  height: number;
}

// ---------------------------------------------------------------------------
// Exported helpers
// ---------------------------------------------------------------------------

/**
 * Returns the numeric aspect ratio for a preset.
 * Returns `undefined` for Free (unconstrained).
 */
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

/**
 * Crops an image using canvas and returns the result as a Blob.
 *
 * Loads the image from `imageUri`, draws the `pixelCrop` region onto
 * an offscreen canvas, and exports it as a Blob of the given MIME type.
 */
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

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

/** Loads an HTMLImageElement from a URI. */
async function loadImage(uri: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = (): void => resolve(img);
    img.onerror = (_e): void => reject(new Error('Failed to load image for cropping'));
    img.src = uri;
  });
}

/** Converts a canvas to a Blob. */
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
