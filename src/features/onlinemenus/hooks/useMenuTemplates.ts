import { useQuery } from '@tanstack/react-query';

import type { MenuTemplateDto } from '@/features/onlinemenus/types';
import { customInstance } from '@/server/mutators/onlineMenuMutator';

// MUST be the versioned path (`/api/v1/...`) that every other OnlineMenu hook
// uses. An unversioned `/api/menu-templates` 308-redirects on the BFF to a bare
// `/api/v1/menu-templates` that escapes the `/bff/api/menus` proxy and is
// answered by the SPA's `index.html` — axios then hands this hook an HTML
// string, and `TemplateGallery`'s `templates.map(...)` throws
// "x.map is not a function" (the P1-08 wizard crash). Keep in sync with the
// generated `onlineMenuWebMenuTemplatesList` path.
const MENU_TEMPLATES_QUERY_KEY = ['/api/v1/menu-templates'] as const;

async function fetchMenuTemplates(signal?: AbortSignal): Promise<MenuTemplateDto[]> {
  return customInstance<MenuTemplateDto[]>({
    url: '/api/v1/menu-templates',
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

  // Defence-in-depth: only ever expose an array to consumers. If a
  // misconfigured proxy/redirect ever returns a non-array body (e.g. SPA HTML),
  // degrade to an empty gallery instead of crashing on `.map`.
  return { templates: Array.isArray(data) ? data : [], isLoading, error };
}
