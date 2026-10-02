import assert from 'node:assert/strict';
import { CoreState } from './index.js';

const state = CoreState.load([
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

assert.equal(state.list().length, 2);
assert.equal(state.get('product.created.001').owner, 'products');
assert.equal(state.get('product.created.001').status, 'active');
assert.equal(state.get('product.failed.001').status, 'error');
assert.equal(state.get('product.failed.001').value.payload.productId, 'product-002');

console.log('Core State connection: 5/5 passed');
