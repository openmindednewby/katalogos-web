import { HttpMethod } from '@dloizides/api-client-base';

import { type Endpoints } from './endpoints';

export { HttpMethod };

export interface EndpointMeta {
  path: string;
  method: HttpMethod;
}

// Use the enum member NAMES as keys to avoid collisions when multiple enum members map to the same path string.
export type EndpointKey = keyof typeof Endpoints;

export const endpointMeta: Partial<Record<EndpointKey, EndpointMeta>> = {
  // Tenants
  onlinemenuWebTenantsCreate: { path: '/Tenants', method: HttpMethod.Post },
  onlinemenuWebTenantsList: { path: '/Tenants', method: HttpMethod.Get },
  onlinemenuWebTenantsUpdate: { path: '/Tenants', method: HttpMethod.Put },
  onlinemenuWebTenantsDelete: { path: '/Tenants/{tenantId}', method: HttpMethod.Delete },
  onlinemenuWebTenantsGetById: { path: '/Tenants/{tenantId}', method: HttpMethod.Get },
  onlinemenuWebTenantsUsersList: { path: '/Tenants/users', method: HttpMethod.Get },

  // TenantMenus
  onlinemenuWebMenuDelete: { path: '/TenantMenus/{externalId}', method: HttpMethod.Delete },
  onlinemenuWebMenuGetById: { path: '/TenantMenus/{externalId}', method: HttpMethod.Get },
  onlinemenuWebMenuList: { path: '/TenantMenus/list', method: HttpMethod.Get },
  onlinemenuWebMenuListAll: { path: '/TenantMenus/list/all', method: HttpMethod.Get },
  onlinemenuWebMenuUpdate: { path: '/TenantMenus', method: HttpMethod.Put },
  onlinemenuWebTenantMenusCreate: { path: '/TenantMenus', method: HttpMethod.Post },

  // QuestionerTemplates
  onlinemenuWebQuestionerTemplatesActivateTemplate: { path: '/questionerTemplates/ActivateTemplate/{externalId}', method: HttpMethod.Put },
  onlinemenuWebQuestionerTemplatesCreate: { path: '/questionerTemplates', method: HttpMethod.Post },
  onlinemenuWebQuestionerTemplatesDelete: { path: '/questionerTemplates/{externalId}', method: HttpMethod.Delete },
  onlinemenuWebQuestionerTemplatesGetById: { path: '/questionerTemplates/{externalId}', method: HttpMethod.Get },
  onlinemenuWebQuestionerTemplatesUpdate: { path: '/questionerTemplates/{externalId}', method: HttpMethod.Put },
  onlinemenuWebQuestionerTemplatesList: { path: '/questionerTemplates/list', method: HttpMethod.Get },

  // CompletedQuestioners
  onlinemenuWebCompletedQuestionersCreate: { path: '/completedQuestioners', method: HttpMethod.Post },
  onlinemenuWebCompletedQuestionersDelete: { path: '/completedQuestioners/{externalId}', method: HttpMethod.Delete },
  onlinemenuWebCompletedQuestionersGetById: { path: '/completedQuestioners/{externalId}', method: HttpMethod.Get },
  onlinemenuWebCompletedQuestionersUpdate: { path: '/completedQuestioners/{externalId}', method: HttpMethod.Put },
  onlinemenuWebCompletedQuestionersList: { path: '/completedQuestioners/list', method: HttpMethod.Get },
  
  // Keycloak / Identity
  onlinemenuWebKeycloakUserInfo: { path: '/protocol/openid-connect/userinfo', method: HttpMethod.Get },
};

/**
 * Replace placeholders in the endpoint path with provided params.
 * Example: interpolateEndpoint('onlinemenuWebTenantsGetById', { tenantId: 'abc' }) -> '/Tenants/abc'
 */
export function interpolateEndpoint(e: EndpointKey, params?: Record<string, string | number>): string {
  const meta = endpointMeta[e];
  if (!meta) throw new Error(`Unknown endpoint: ${String(e)}`);
  let path = meta.path;
  if (!params) return path;
  for (const [k, v] of Object.entries(params)) 
    path = path.replace(new RegExp(`\\{${k}\\}`, 'g'), encodeURIComponent(String(v)));
  
  return path;
}

export function getEndpointMethod(e: EndpointKey): HttpMethod {
  const meta = endpointMeta[e];
  if (!meta) throw new Error(`Unknown endpoint: ${String(e)}`);
  return meta.method;
}

export default { endpointMeta, interpolateEndpoint, getEndpointMethod };
