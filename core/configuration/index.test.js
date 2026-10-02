import assert from 'node:assert/strict';
import { CoreConfiguration } from './index.js';

const configuration = CoreConfiguration.load([
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

assert.equal(configuration.list().length, 2);

assert.equal(
  configuration.get('config.product.created.001').owner,
  'products'
);

assert.equal(
  configuration.get('config.product.created.001').status,
  'active'
);

assert.equal(
  configuration.get('config.product.failed.001').status,
  'disabled'
);

assert.equal(
  configuration.getValue('config.product.created.001').action,
  'read'
);

assert.deepEqual(
  configuration.getValue('config.missing', { fallback: true }),
  { fallback: true }
);

console.log('Core Configuration connection: 6/6 passed');
