import assert from 'node:assert/strict';
import { CoreFilesystem, loadCanonicalFilesystem } from './index.js';

const source = [
  {
    id: 'event.x',
    type: 'test',
    source: 'test',
    status: 'pending',
    payload: { value: 1 }
  }
];

const filesystem = loadCanonicalFilesystem(source);

assert.equal(filesystem.has('filesystem.storage.config.event.x'), true);

const record = filesystem.get('filesystem.storage.config.event.x');

assert.equal(record.owner, 'test');
assert.equal(record.path, 'storage://storage.config.event.x');
assert.equal(record.status, 'active');
assert.equal(record.metadata.storageId, 'storage.config.event.x');
assert.equal(record.metadata.storageType, 'configuration');

assert.equal(
  filesystem.resolve('filesystem.storage.config.event.x'),
  'storage://storage.config.event.x'
);

assert.equal(
  filesystem.canWrite('filesystem.storage.config.event.x'),
  true
);

assert.equal(CoreFilesystem.load, loadCanonicalFilesystem);

console.log('Filesystem connection: 8/8 passed');
