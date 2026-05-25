import { useQuery } from '@tanstack/react-query';

import type { MenuTemplateDto } from '@/features/onlinemenus/types';
import { customInstance } from '@/server/mutators/onlineMenuMutator';

const MENU_TEMPLATES_QUERY_KEY = ['/api/menu-templates'] as const;

async function fetchMenuTemplates(signal?: AbortSignal): Promise<MenuTemplateDto[]> {
  return customInstance<MenuTemplateDto[]>({
    url: '/api/menu-templates',
    method: 'GET',
    signal,
  });
}

interface UseMenuTemplatesResult {
  templates: MenuTemplateDto[];
  isLoading: boolean;
  error: unknown;
}

export function useMenuTemplates(): UseMenuTemplatesResult {
  const { data, isLoading, error } = useQuery({
    queryKey: MENU_TEMPLATES_QUERY_KEY,
    queryFn: async ({ signal }) => fetchMenuTemplates(signal),
  });

  return { templates: data ?? [], isLoading, error };
}
