import assert from 'node:assert/strict';
import { CoreStorage } from './index.js';

const storage = CoreStorage.load([
  {
    id: 'product.created.001',
    type: 'product.created',
    source: 'products',
    contractId: 'products.catalog',
    payload: { productId: 'product-001' }
  },
  {
    id: 'product.failed.001',
    type: 'product.failed',
    source: 'products',
    contractId: 'products.catalog',
    status: 'failed',
    payload: { productId: 'product-002' }
  }
]);

assert.equal(storage.list().length, 2);

assert.equal(
  storage.get('storage.config.product.created.001').owner,
  'products'
);

assert.equal(
  storage.get('storage.config.product.created.001').status,
  'active'
);

assert.equal(
  storage.get('storage.config.product.failed.001').status,
  'disabled'
);

assert.equal(
  storage.canWrite('storage.config.product.created.001'),
  true
);

assert.equal(
  storage.canWrite('storage.config.product.failed.001'),
  false
);

assert.equal(
  storage.read('storage.config.product.created.001')
    .configurationId,
  'config.product.created.001'
);

console.log('Core Storage connection: 7/7 passed');
