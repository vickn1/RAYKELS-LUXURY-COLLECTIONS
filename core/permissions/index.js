import { CoreState } from '../state/index.js';
import { createCanonicalPermissions } from './canonical-permissions.js';

export function loadCanonicalPermissions(source = []) {
  const state = CoreState.load(source);

  const permissions = state.list().flatMap(record => {
    const owner = record.owner;

    return [
      {
        id: `permission.${record.id}.read`,
        actor: owner,
        action: 'read',
        resource: record.id,
        status: record.status === 'error'
          ? 'disabled'
          : 'active'
      }
    ];
  });

  return createCanonicalPermissions(permissions);
}

export const CorePermissions = Object.freeze({
  load: loadCanonicalPermissions
});
