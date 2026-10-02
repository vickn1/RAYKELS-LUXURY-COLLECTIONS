import assert from 'node:assert/strict';
import {
  createCanonicalState,
  CanonicalState
} from './canonical-state.js';

const state = createCanonicalState([
  {
    id: 'products.system',
    owner: 'products',
    status: 'active',
    value: {
      productCount: 12
    }
  },
  {
    id: 'orders.system',
    owner: 'orders',
    status: 'stale',
    version: '2.0.0',
    value: {
      pending: 3
    }
  }
]);

assert.equal(state.list().length, 2);
assert.equal(state.get('products.system').owner, 'products');
assert.equal(state.get('products.system').value.productCount, 12);
assert.equal(state.get('orders.system').status, 'stale');
assert.equal(state.get('orders.system').version, '2.0.0');

assert.equal(state.has('products.system'), true);
assert.equal(state.has('missing.state'), false);

assert.equal(
  state.validate({
    id: 'test.state',
    owner: 'test'
  }).valid,
  true
);

assert.equal(
  state.validate({
    id: '',
    owner: ''
  }).valid,
  false
);

const normalized = state.normalize({
  id: 'normalized.state',
  owner: 'test'
});

assert.equal(normalized.status, 'active');
assert.equal(normalized.version, '1.0.0');
assert.deepEqual(normalized.value, {});

assert.equal(state.search('products.system').length, 1);

assert.deepEqual(
  CanonicalState.statuses,
  [
    'active',
    'stale',
    'unknown',
    'error'
  ]
);

const snapshot = state.get('products.system');

snapshot.owner = 'MUTATED';
snapshot.value.productCount = 999;

assert.equal(
  state.get('products.system').owner,
  'products'
);

assert.equal(
  state.get('products.system').value.productCount,
  12
);

console.log('Canonical State: 15/15 passed');
