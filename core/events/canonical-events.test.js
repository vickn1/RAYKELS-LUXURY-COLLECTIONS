import assert from 'node:assert/strict';
import {
  createCanonicalEvents,
  CanonicalEvents
} from './canonical-events.js';

const events = createCanonicalEvents([
  {
    id: 'product.created.001',
    type: 'product.created',
    source: 'products',
    contractId: 'products.catalog',
    status: 'published',
    timestamp: '2026-10-02T10:00:00.000Z',
    payload: {
      productId: 'product-001'
    }
  },
  {
    id: 'product.updated.001',
    type: 'product.updated',
    source: 'products',
    contractId: 'products.catalog',
    payload: {
      productId: 'product-001'
    }
  }
]);

assert.equal(events.list().length, 2);

assert.equal(
  events.get('product.created.001').type,
  'product.created'
);

assert.equal(
  events.get('product.created.001').contractId,
  'products.catalog'
);

assert.equal(
  events.get('product.created.001').payload.productId,
  'product-001'
);

assert.equal(
  events.get('product.updated.001').status,
  'pending'
);

assert.equal(events.has('product.created.001'), true);
assert.equal(events.has('missing.event'), false);

assert.equal(
  events.validate({
    id: 'test.event',
    type: 'test.created',
    source: 'test'
  }).valid,
  true
);

assert.equal(
  events.validate({
    id: '',
    type: '',
    source: ''
  }).valid,
  false
);

const normalized = events.normalize({
  id: 'normalized.event',
  type: 'test.normalized',
  source: 'test'
});

assert.equal(normalized.status, 'pending');
assert.equal(typeof normalized.timestamp, 'string');
assert.deepEqual(normalized.payload, {});

assert.equal(
  events.search('product.created').length,
  1
);

assert.deepEqual(
  CanonicalEvents.statuses,
  [
    'pending',
    'published',
    'processed',
    'failed',
    'cancelled'
  ]
);

const snapshot = events.get('product.created.001');
snapshot.source = 'MUTATED';

assert.equal(
  events.get('product.created.001').source,
  'products'
);

console.log('Canonical Events: 15/15 passed');
