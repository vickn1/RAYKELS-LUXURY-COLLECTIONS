import assert from 'node:assert/strict';
import {
  createCanonicalFilesystem
} from './canonical-filesystem.js';

const filesystem = createCanonicalFilesystem([
  {
    id: 'filesystem.products',
    owner: 'products',
    path: 'data/products.json',
    metadata: {
      type: 'json'
    }
  },
  {
    id: 'filesystem.archive',
    owner: 'core',
    path: 'data/archive.json',
    status: 'readonly'
  },
  {
    id: 'filesystem.disabled',
    owner: 'core',
    path: 'data/disabled.json',
    status: 'disabled'
  }
]);

assert.equal(filesystem.list().length, 3);
assert.equal(filesystem.has('filesystem.products'), true);
assert.equal(
  filesystem.get('filesystem.products').owner,
  'products'
);

assert.equal(
  filesystem.resolve('filesystem.products'),
  'data/products.json'
);

assert.equal(
  filesystem.resolve('filesystem.missing'),
  null
);

assert.equal(
  filesystem.canWrite('filesystem.products'),
  true
);

assert.equal(
  filesystem.canWrite('filesystem.archive'),
  false
);

assert.equal(
  filesystem.canWrite('filesystem.disabled'),
  false
);

assert.equal(
  filesystem.validate({
    id: '',
    owner: 'core',
    path: 'data/test.json'
  }).valid,
  false
);

const normalized = filesystem.normalize({
  id: 'filesystem.test',
  owner: 'core',
  path: 'data/test.json'
});

assert.equal(normalized.status, 'active');
assert.deepEqual(normalized.metadata, {});

assert.equal(
  filesystem.search('products').length,
  1
);

console.log('Canonical Filesystem: 11/11 passed');
