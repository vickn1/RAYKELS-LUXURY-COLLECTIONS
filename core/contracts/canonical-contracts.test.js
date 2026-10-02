import assert from 'node:assert/strict';
import {
  createCanonicalContracts,
  CanonicalContracts
} from './canonical-contracts.js';

const contracts = createCanonicalContracts([
  {
    id: 'products.catalog',
    owner: 'products',
    type: 'api',
    method: 'GET',
    path: '/api/products',
    status: 'active',
    version: '1.0.0',
    dependencies: ['products.store'],
    consumers: ['storefront', 'admin.products']
  },
  {
    id: 'storefront.product.presentation',
    owner: 'storefront',
    type: 'frontend',
    status: 'active',
    version: '1.0.0',
    dependencies: ['products.catalog'],
    consumers: ['storefront']
  }
]);

assert.equal(contracts.list().length, 2);
assert.equal(contracts.get('products.catalog').owner, 'products');
assert.equal(contracts.get('products.catalog').method, 'GET');
assert.equal(
  contracts.get('products.catalog').dependencies[0],
  'products.store'
);

assert.equal(contracts.has('products.catalog'), true);
assert.equal(contracts.has('missing.contract'), false);

assert.equal(
  contracts.validate({
    id: 'test.contract',
    owner: 'test',
    type: 'api'
  }).valid,
  true
);

assert.equal(
  contracts.validate({
    id: '',
    owner: 'test',
    type: 'invalid'
  }).valid,
  false
);

const normalized = contracts.normalize({
  id: 'new.contract',
  owner: 'test',
  type: 'service'
});

assert.equal(normalized.status, 'active');
assert.equal(normalized.version, '1.0.0');
assert.deepEqual(normalized.dependencies, []);
assert.deepEqual(normalized.consumers, []);

assert.equal(
  contracts.search('products.catalog').length,
  2
);

assert.deepEqual(
  CanonicalContracts.types,
  [
    'api',
    'frontend',
    'backend',
    'service',
    'event',
    'storage',
    'configuration'
  ]
);

const snapshot = contracts.get('products.catalog');
snapshot.owner = 'MUTATED';

assert.equal(
  contracts.get('products.catalog').owner,
  'products'
);

console.log('Canonical Contracts: 12/12 passed');
