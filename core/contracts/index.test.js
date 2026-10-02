import assert from 'node:assert/strict';
import { CoreContracts } from './index.js';

const contracts = CoreContracts.load();

assert.equal(contracts.list().length, 2);

assert.equal(
  contracts.get('products.catalog').type,
  'api'
);

assert.equal(
  contracts.get('products.media.normalized').type,
  'frontend'
);

assert.equal(
  contracts.get('products.media.normalized').source,
  'products/catalog.js'
);

assert.equal(
  contracts.has('products.catalog'),
  true
);

assert.equal(
  contracts.has('missing.contract'),
  false
);

console.log('Core Contracts Connection: 6/6 passed');
