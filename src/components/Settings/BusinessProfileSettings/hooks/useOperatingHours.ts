import { useCallback, useState } from 'react';

import DayOfWeek from '../../../../shared/enums/DayOfWeek';
import { isValueDefined } from '../../../../utils/is';
import { DEFAULT_CLOSE_TIME, DEFAULT_OPEN_TIME } from '../constants';

export interface DayHours {
  readonly day: DayOfWeek;
  readonly open: string;
  readonly close: string;
  readonly isClosed: boolean;
}

interface OperatingHoursData {
  readonly hours: readonly DayHours[];
}

const ALL_DAYS: readonly DayOfWeek[] = [
  DayOfWeek.Monday,
  DayOfWeek.Tuesday,
  DayOfWeek.Wednesday,
  DayOfWeek.Thursday,
  DayOfWeek.Friday,
  DayOfWeek.Saturday,
  DayOfWeek.Sunday,
];

function isDayHours(value: unknown): value is DayHours {
  if (typeof value !== 'object' || !isValueDefined(value)) return false;
  const hasDay = 'day' in value && typeof value.day === 'number';
  const hasOpen = 'open' in value && typeof value.open === 'string';
  const hasClose = 'close' in value && typeof value.close === 'string';
  const hasIsClosed = 'isClosed' in value && typeof value.isClosed === 'boolean';
  return hasDay && hasOpen && hasClose && hasIsClosed;
}

function isHoursArray(value: unknown): value is readonly DayHours[] {
  return Array.isArray(value) && value.every(isDayHours);
}

function isOperatingHoursData(value: unknown): value is OperatingHoursData {
  if (typeof value !== 'object' || !isValueDefined(value)) return false;
  return 'hours' in value && isHoursArray(value.hours);
}

function createDefaultDay(day: DayOfWeek): DayHours {
  return { day, open: DEFAULT_OPEN_TIME, close: DEFAULT_CLOSE_TIME, isClosed: false };
}

export function createDefaultHours(): readonly DayHours[] {
  return ALL_DAYS.map(createDefaultDay);
}

export function parseOperatingHours(json: string | null | undefined): readonly DayHours[] {
  if (!isValueDefined(json) || json === '') return createDefaultHours();

  try {
    const parsed: unknown = JSON.parse(json);
    if (!isOperatingHoursData(parsed)) return createDefaultHours();
    return parsed.hours;
  } catch {
    return createDefaultHours();
  }
}

export function serializeOperatingHours(hours: readonly DayHours[]): string {
  return JSON.stringify({ hours });
}

interface UseOperatingHoursReturn {
  readonly hours: readonly DayHours[];
  readonly setHours: (hours: readonly DayHours[]) => void;
  readonly toggleClosed: (day: DayOfWeek) => void;
  readonly updateOpenTime: (day: DayOfWeek, time: string) => void;
  readonly updateCloseTime: (day: DayOfWeek, time: string) => void;
  readonly serialize: () => string;
}

export function useOperatingHours(initialJson?: string | null): UseOperatingHoursReturn {
  const [hours, setHours] = useState<readonly DayHours[]>(() => parseOperatingHours(initialJson));

  const updateDay = useCallback((day: DayOfWeek, updater: (entry: DayHours) => DayHours) => {
    setHours(prev => prev.map(entry => (entry.day === day ? updater(entry) : entry)));
  }, []);

  const toggleClosed = useCallback((day: DayOfWeek) => {
    updateDay(day, entry => ({ ...entry, isClosed: !entry.isClosed }));
  }, [updateDay]);

  const updateOpenTime = useCallback((day: DayOfWeek, time: string) => {
    updateDay(day, entry => ({ ...entry, open: time }));
  }, [updateDay]);

  const updateCloseTime = useCallback((day: DayOfWeek, time: string) => {
    updateDay(day, entry => ({ ...entry, close: time }));
  }, [updateDay]);

  const serialize = useCallback(() => serializeOperatingHours(hours), [hours]);

  return { hours, setHours, toggleClosed, updateOpenTime, updateCloseTime, serialize };
}
