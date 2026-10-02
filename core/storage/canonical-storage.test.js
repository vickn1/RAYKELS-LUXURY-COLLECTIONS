import assert from 'node:assert/strict';
import {
  createCanonicalStorage
} from './canonical-storage.js';

const storage = createCanonicalStorage([
  {
    id: 'storage.products',
    owner: 'products',
    type: 'json',
    value: {
      location: 'data/products.json'
    }
  },
  {
    id: 'storage.archive',
    owner: 'core',
    type: 'json',
    status: 'readonly',
    value: {
      location: 'data/archive.json'
    }
  },
  {
    id: 'storage.disabled',
    owner: 'core',
    type: 'json',
    status: 'disabled',
    value: {
      location: 'data/disabled.json'
    }
  }
]);

assert.equal(storage.list().length, 3);
assert.equal(storage.has('storage.products'), true);
assert.equal(storage.get('storage.products').owner, 'products');

assert.deepEqual(
  storage.read('storage.products'),
  { location: 'data/products.json' }
);

assert.deepEqual(
  storage.read('storage.missing', { fallback: true }),
  { fallback: true }
);

assert.equal(storage.canWrite('storage.products'), true);
assert.equal(storage.canWrite('storage.archive'), false);
assert.equal(storage.canWrite('storage.disabled'), false);

assert.equal(
  storage.validate({
    id: '',
    owner: 'core',
    type: 'json'
  }).valid,
  false
);

const normalized = storage.normalize({
  id: 'storage.test',
  owner: 'core',
  type: 'json'
});

assert.equal(normalized.status, 'active');
assert.deepEqual(normalized.value, {});

assert.equal(
  storage.search('products').length,
  1
);

console.log('Canonical Storage: 11/11 passed');
