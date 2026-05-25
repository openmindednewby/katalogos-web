

/**
 * Utility functions for HTTP service modules.
 */
import { isNotEmptyArray } from '../../../utils/is';

import type { DefaultPayload } from '../types';

export function buildFormDataPayload(formData: FormData): FormData {
  return formData;
}

export function buildPayload<P>(payload: P): P & DefaultPayload {
  const defaultPayloadParameters = getDefaultPayload();
  return { ...payload, ...defaultPayloadParameters };
}

export function buildQueryParams<Q extends object>(queryParameters: Q): Q {
  const defaultQueryParameters = getDefaultQueryParameters();
  const merged: Q = Object.assign({}, queryParameters, defaultQueryParameters);
  return merged;
}

export function buildURL(endpoint: string, urlIds?: string[]): string {
  if (!isNotEmptyArray(urlIds)) return endpoint;
  let url: string = endpoint;

  urlIds.forEach((id, index) => {
    const placeholder = `{id${index + 1}}`;
    if (isNotEmptyString(id)) url = url.replace(placeholder, id);
  });

  return url;
}

function isNotEmptyString(s?: string): boolean {
  return typeof s === 'string' && s.trim().length > 0;
}

function getDefaultPayload(): DefaultPayload {
  return getDefaultQueryParameters();
}

function getDefaultQueryParameters(): object {
  return {};
}
