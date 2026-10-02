import assert from 'node:assert/strict';
import {
  createCanonicalService,
  CanonicalService
} from './canonical-service.js';

const service = createCanonicalService([
  {
    id: 'service.products.catalog',
    owner: 'products',
    endpointId: 'server.products.catalog'
  },
  {
    id: 'service.orders',
    owner: 'orders',
    endpointId: 'server.orders',
    status: 'stopped'
  }
]);

assert.equal(service.list().length, 2);
assert.equal(service.has('service.products.catalog'), true);
assert.equal(
  service.get('service.products.catalog').owner,
  'products'
);
assert.equal(
  service.get('service.products.catalog').endpointId,
  'server.products.catalog'
);
assert.equal(
  service.get('service.products.catalog').status,
  'running'
);

assert.equal(
  service.isRunning('service.products.catalog'),
  true
);

assert.equal(
  service.isRunning('service.orders'),
  false
);

assert.equal(
  service.validate({
    id: 'service.test',
    owner: 'test',
    endpointId: 'server.test'
  }).valid,
  true
);

assert.equal(
  service.validate({
    id: '',
    owner: '',
    endpointId: ''
  }).valid,
  false
);

assert.throws(
  () => createCanonicalService([
    {
      id: 'service.x',
      owner: 'test',
      endpointId: 'server.x'
    },
    {
      id: 'service.x',
      owner: 'test',
      endpointId: 'server.y'
    }
  ]),
  /Duplicate service id/
);

assert.deepEqual(
  service.search('products'),
  [
    {
      id: 'service.products.catalog',
      owner: 'products',
      endpointId: 'server.products.catalog',
      status: 'running'
    }
  ]
);

const snapshot = service.get('service.products.catalog');
snapshot.owner = 'changed';

assert.equal(
  service.get('service.products.catalog').owner,
  'products'
);

assert.deepEqual(
  CanonicalService.statuses,
  ['running', 'stopped', 'degraded', 'disabled']
);

console.log('Canonical Service: 10/10 passed');
