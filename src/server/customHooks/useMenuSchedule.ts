/**
 * Custom hooks for menu schedule management.
 * Handles PUT /api/v1/TenantMenus/{ExternalId}/schedule (set schedule)
 * and DELETE /api/v1/TenantMenus/{ExternalId}/schedule (remove schedule).
 */
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { customInstance } from '@/server/mutators/onlineMenuMutator';

import type { MenuSchedule } from '../../types/menuTypes';
import type { UseMutationResult } from '@tanstack/react-query';

const SCHEDULE_ENDPOINT = '/api/v1/TenantMenus';
const MENU_QUERY_KEY = 'onlineMenuWebMenuList';

interface SetScheduleRequest {
  scheduledDays: number;
  startTime: string;
  endTime: string;
  isEnabled: boolean;
  timeZoneId: string;
}

interface SetScheduleVariables {
  externalId: string;
  schedule: MenuSchedule;
}

interface RemoveScheduleVariables {
  externalId: string;
}

async function setMenuSchedule(
  externalId: string,
  schedule: MenuSchedule,
): Promise<undefined> {
  const request: SetScheduleRequest = {
    scheduledDays: schedule.scheduledDays,
    startTime: schedule.startTime,
    endTime: schedule.endTime,
    isEnabled: schedule.isEnabled,
    timeZoneId: schedule.timeZoneId,
  };

  await customInstance<undefined>({
    url: `${SCHEDULE_ENDPOINT}/${externalId}/schedule`,
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    data: request,
  });

  return undefined;
}

async function removeMenuSchedule(externalId: string): Promise<undefined> {
  await customInstance<undefined>({
    url: `${SCHEDULE_ENDPOINT}/${externalId}/schedule`,
    method: 'DELETE',
  });

  return undefined;
}

/** Hook for setting or updating a menu schedule. */
export function useSetMenuSchedule(options?: {
  onSuccess?: () => void;
  onError?: (error: unknown) => void;
}): UseMutationResult<undefined, unknown, SetScheduleVariables> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ['setMenuSchedule'],
    mutationFn: async (variables: SetScheduleVariables) =>
      setMenuSchedule(variables.externalId, variables.schedule),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: [MENU_QUERY_KEY] });
      options?.onSuccess?.();
    },
    onError: options?.onError,
  });
}

/** Hook for removing a menu schedule. */
export function useRemoveMenuSchedule(options?: {
  onSuccess?: () => void;
  onError?: (error: unknown) => void;
}): UseMutationResult<undefined, unknown, RemoveScheduleVariables> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ['removeMenuSchedule'],
    mutationFn: async (variables: RemoveScheduleVariables) =>
      removeMenuSchedule(variables.externalId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: [MENU_QUERY_KEY] });
      options?.onSuccess?.();
    },
    onError: options?.onError,
  });
}
