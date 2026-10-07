
import { moduleRegistry } from '@baseclient/core';
import { identityModule } from '@baseclient/identity-module';
import { onlinemenuModule } from '@baseclient/onlinemenu-module';
import { questionerModule } from '@baseclient/questioner-module';
import { tenantThemeEditorModule } from '@baseclient/tenant-theme-editor-module';

import { featureFlags, getServiceConfig } from '../config/featureFlags';
import { logger } from '../utils/logger';

moduleRegistry.configure({
  services: getServiceConfig(),
});

if (__DEV__) {
  logger.debug('modules', 'Feature Flags:', featureFlags);
  logger.debug('modules', 'Service Config:', getServiceConfig());
}

if (featureFlags.identityModule) 
  moduleRegistry.register(identityModule);


if (featureFlags.questionerModule) 
  moduleRegistry.register(questionerModule);


if (featureFlags.onlineMenuModule)
  moduleRegistry.register(onlinemenuModule);


if (featureFlags.tenantThemeEditorModule)
  moduleRegistry.register(tenantThemeEditorModule);


export { moduleRegistry };

export { featureFlags, isModuleEnabled } from '../config/featureFlags';

export { IDENTITY_MODULE_NAME } from '@baseclient/identity-module';
export { QUESTIONER_MODULE_NAME } from '@baseclient/questioner-module';
export { ONLINEMENU_MODULE_NAME } from '@baseclient/onlinemenu-module';
export { TENANT_THEME_EDITOR_MODULE_NAME } from '@baseclient/tenant-theme-editor-module';
