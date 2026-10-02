import { CoreStorage } from '../storage/index.js';
import { createCanonicalFilesystem } from './canonical-filesystem.js';

export function loadCanonicalFilesystem(source = []) {
  const storage = CoreStorage.load(source);

  const filesystem = storage.list().map(record => ({
    id: `filesystem.${record.id}`,
    owner: record.owner,
    path: `storage://${record.id}`,
    status: record.status === 'active'
      ? 'active'
      : 'disabled',
    metadata: {
      storageId: record.id,
      storageType: record.type
    }
  }));

  return createCanonicalFilesystem(filesystem);
}

export const CoreFilesystem = Object.freeze({
  load: loadCanonicalFilesystem
});
