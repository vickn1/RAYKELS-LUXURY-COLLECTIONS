import { CoreFilesystem } from '../filesystem/index.js';
import { createCanonicalAudit } from './canonical-audit.js';

export function loadCanonicalAudit(source = []) {
  const filesystem = CoreFilesystem.load(source);

  const audit = filesystem.list().map(record => ({
    id: `audit.${record.id}`,
    actor: record.owner,
    action: record.status === 'active'
      ? 'access'
      : 'blocked',
    resource: record.id,
    status: record.status === 'active'
      ? 'recorded'
      : 'dismissed',
    details: {
      filesystemPath: record.path,
      filesystemStatus: record.status,
      filesystemMetadata: record.metadata
    }
  }));

  return createCanonicalAudit(audit);
}

export const CoreAudit = Object.freeze({
  load: loadCanonicalAudit
});
