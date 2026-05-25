export enum Endpoints {
	// Tenants
	onlinemenuWebTenantsCreate = '/Tenants', // POST
	onlinemenuWebTenantsList = '/Tenants', // GET
	onlinemenuWebTenantsUpdate = '/Tenants', // PUT
	onlinemenuWebTenantsDelete = '/Tenants/{tenantId}', // DELETE
	onlinemenuWebTenantsGetById = '/Tenants/{tenantId}', // GET

	// TenantMenus
	onlinemenuWebMenuDelete = '/TenantMenus/{externalId}', // DELETE
	onlinemenuWebMenuGetById = '/TenantMenus/{externalId}', // GET
	onlinemenuWebMenuList = '/TenantMenus/list', // GET
	onlinemenuWebMenuListAll = '/TenantMenus/list/all', // GET
	onlinemenuWebMenuUpdate = '/TenantMenus', // PUT
	onlinemenuWebTenantMenusCreate = '/TenantMenus', // POST

	onlinemenuWebTenantsUsersList = '/Tenants/users', // GET

	// QuestionerTemplates
	onlinemenuWebQuestionerTemplatesActivateTemplate = '/questionerTemplates/ActivateTemplate/{externalId}', // PUT
	onlinemenuWebQuestionerTemplatesCreate = '/questionerTemplates', // POST
	onlinemenuWebQuestionerTemplatesDelete = '/questionerTemplates/{externalId}', // DELETE
	onlinemenuWebQuestionerTemplatesGetById = '/questionerTemplates/{externalId}', // GET
	onlinemenuWebQuestionerTemplatesUpdate = '/questionerTemplates/{externalId}', // PUT
	onlinemenuWebQuestionerTemplatesList = '/questionerTemplates/list', // GET

	// CompletedQuestioners
	onlinemenuWebCompletedQuestionersCreate = '/completedQuestioners', // POST
	onlinemenuWebCompletedQuestionersDelete = '/completedQuestioners/{externalId}', // DELETE
	onlinemenuWebCompletedQuestionersGetById = '/completedQuestioners/{externalId}', // GET
	onlinemenuWebCompletedQuestionersUpdate = '/completedQuestioners/{externalId}', // PUT
	onlinemenuWebCompletedQuestionersList = '/completedQuestioners/list', // GET

	// Keycloak / Identity
	onlinemenuWebKeycloakUserInfo = '/protocol/openid-connect/userinfo', // GET
}
