import assert from 'node:assert/strict';
import {
  createCanonicalConfiguration
} from './canonical-configuration.js';

const configuration = createCanonicalConfiguration([
  {
    id: 'system.runtime',
    owner: 'core',
    value: {
      mode: 'offline-first'
    }
  },
  {
    id: 'system.disabled',
    owner: 'core',
    status: 'disabled',
    value: {
      enabled: false
    }
  }
]);

assert.equal(configuration.list().length, 2);
assert.equal(configuration.get('system.runtime').owner, 'core');
assert.equal(configuration.has('system.runtime'), true);

assert.deepEqual(
  configuration.getValue('system.runtime'),
  { mode: 'offline-first' }
);

assert.deepEqual(
  configuration.getValue('missing.config', { fallback: true }),
  { fallback: true }
);

assert.deepEqual(
  configuration.getValue('system.disabled', { fallback: true }),
  { fallback: true }
);

assert.equal(
  configuration.validate({
    id: '',
    owner: 'core'
  }).valid,
  false
);

const normalized = configuration.normalize({
  id: 'system.test',
  owner: 'core',
  value: {
    enabled: true
  }
});

assert.equal(normalized.status, 'active');
assert.equal(normalized.version, '1.0.0');

assert.equal(
  configuration.search('offline-first').length,
  1
);

console.log('Canonical Configuration: 9/9 passed');
