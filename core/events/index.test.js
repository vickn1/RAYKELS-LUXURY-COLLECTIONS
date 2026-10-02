import assert from 'node:assert/strict';
import { CoreEvents } from './index.js';

const events = CoreEvents.load([
  {
    id: 'product.created.001',
    type: 'product.created',
    source: 'products',
    contractId: 'products.catalog',
    payload: {
      productId: 'product-001'
    }
  }
]);

assert.equal(events.list().length, 1);

assert.equal(
  events.get('product.created.001').contractId,
  'products.catalog'
);

assert.equal(
  events.get('product.created.001').type,
  'product.created'
);

assert.throws(
  () =>
    CoreEvents.load([
      {
        id: 'invalid.event.001',
        type: 'test.invalid',
        source: 'test',
        contractId: 'missing.contract'
      }
    ]),
  /Unknown contractId: missing\.contract/
);

console.log('Core Events Connection: 4/4 passed');
