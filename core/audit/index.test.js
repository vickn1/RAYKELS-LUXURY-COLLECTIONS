import assert from 'node:assert/strict';
import { CoreAudit, loadCanonicalAudit } from './index.js';

const source = [
  {
    id: 'event.x',
    type: 'test',
    source: 'test',
    status: 'pending',
    payload: {}
  }
];

const audit = loadCanonicalAudit(source);

const id = 'audit.filesystem.storage.config.event.x';
const record = audit.get(id);

assert.equal(audit.has(id), true);
assert.equal(record.actor, 'test');
assert.equal(record.action, 'access');
assert.equal(record.resource, 'filesystem.storage.config.event.x');
assert.equal(record.status, 'recorded');
assert.equal(
  record.details.filesystemPath,
  'storage://storage.config.event.x'
);
assert.equal(
  record.details.filesystemStatus,
  'active'
);
assert.equal(
  record.details.filesystemMetadata.storageId,
  'storage.config.event.x'
);
assert.equal(
  record.details.filesystemMetadata.storageType,
  'configuration'
);

assert.equal(audit.isResolved(id), false);
assert.equal(CoreAudit.load, loadCanonicalAudit);

console.log('Audit connection: 10/10 passed');
