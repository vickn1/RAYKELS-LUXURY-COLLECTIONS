import assert from 'node:assert/strict';
import {
  createCanonicalAudit,
  CanonicalAudit
} from './canonical-audit.js';

const audit = createCanonicalAudit([
  {
    id: 'audit.1',
    actor: 'developer',
    action: 'read',
    resource: 'filesystem.storage.config.event.x',
    details: {
      source: 'filesystem'
    }
  },
  {
    id: 'audit.2',
    actor: 'admin',
    action: 'update',
    resource: 'product.1',
    status: 'resolved',
    details: {
      changed: true
    }
  }
]);

assert.equal(audit.list().length, 2);
assert.equal(audit.has('audit.1'), true);
assert.equal(audit.get('audit.1').actor, 'developer');
assert.equal(audit.get('audit.1').status, 'recorded');
assert.equal(audit.get('audit.2').status, 'resolved');

assert.equal(
  audit.isResolved('audit.2'),
  true
);

assert.equal(
  audit.isResolved('audit.1'),
  false
);

assert.equal(
  audit.validate({
    id: 'audit.x',
    actor: 'test',
    action: 'read',
    resource: 'x'
  }).valid,
  true
);

assert.equal(
  audit.validate({
    id: '',
    actor: '',
    action: '',
    resource: ''
  }).valid,
  false
);

assert.throws(
  () => createCanonicalAudit([
    {
      id: 'audit.1',
      actor: 'a',
      action: 'read',
      resource: 'x'
    },
    {
      id: 'audit.1',
      actor: 'b',
      action: 'write',
      resource: 'y'
    }
  ]),
  /Duplicate audit id/
);

assert.deepEqual(
  audit.search('filesystem'),
  [
    {
      id: 'audit.1',
      actor: 'developer',
      action: 'read',
      resource: 'filesystem.storage.config.event.x',
      status: 'recorded',
      details: {
        source: 'filesystem'
      }
    }
  ]
);

const snapshot = audit.get('audit.1');
snapshot.details.source = 'changed';

assert.equal(
  audit.get('audit.1').details.source,
  'filesystem'
);

assert.deepEqual(
  CanonicalAudit.statuses,
  ['recorded', 'reviewed', 'resolved', 'dismissed']
);

console.log('Canonical Audit: 11/11 passed');
