import { formatDate } from '@dloizides/utils';

import i18n from './i18n';
import { isValueDefined } from '../utils/is';

interface FormatDateOptions {
  year?: 'numeric' | '2-digit';
  month?: 'numeric' | '2-digit' | 'long' | 'short' | 'narrow';
  day?: 'numeric' | '2-digit';
  hour?: 'numeric' | '2-digit';
  minute?: 'numeric' | '2-digit';
  second?: 'numeric' | '2-digit';
  weekday?: 'long' | 'short' | 'narrow';
  timeZone?: string;
  timeZoneName?: 'long' | 'short';
}

/** FM - Format Message */
export function FM(id: string, p1?: string, p2?: string, p3?: string): string {
  const options: Record<string, string> = {};

  if (isValueDefined(p1))
    options.p1 = p1;

  if (isValueDefined(p2))
    options.p2 = p2;

  if (isValueDefined(p3))
    options.p3 = p3;


  return i18n.t(id, options);
}

/** FD - Format Date */
export function FD(date?: Date | null, options?: FormatDateOptions): string {
  return formatDate(date, i18n.language, options);
}
