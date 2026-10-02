import { CorePermissions } from '../permissions/index.js';
import { createCanonicalConfiguration } from './canonical-configuration.js';

export function loadCanonicalConfiguration(source = []) {
  const permissions = CorePermissions.load(source);

  const configurations = permissions.list().map(permission => ({
    id: `config.${permission.resource}`,
    owner: permission.actor,
    status: permission.status === 'active'
      ? 'active'
      : 'disabled',
    version: '1.0.0',
    value: {
      permissionId: permission.id,
      action: permission.action,
      resource: permission.resource
    }
  }));

  return createCanonicalConfiguration(configurations);
}

export const CoreConfiguration = Object.freeze({
  load: loadCanonicalConfiguration
});
