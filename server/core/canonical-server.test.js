import assert from 'node:assert/strict';
import {
  createCanonicalServer,
  CanonicalServer
} from './canonical-server.js';

const server = createCanonicalServer([
  {
    id: 'server.products',
    owner: 'products',
    method: 'GET',
    path: '/api/products',
    contractId: 'products.catalog'
  },
  {
    id: 'server.orders',
    owner: 'orders',
    method: 'POST',
    path: '/api/orders',
    status: 'stopped',
    contractId: 'orders.create'
  }
]);

assert.equal(server.list().length, 2);
assert.equal(server.has('server.products'), true);
assert.equal(server.get('server.products').owner, 'products');
assert.equal(server.get('server.products').status, 'active');
assert.equal(server.get('server.orders').status, 'stopped');

assert.equal(server.isActive('server.products'), true);
assert.equal(server.isActive('server.orders'), false);

assert.equal(
  server.validate({
    id: 'server.test',
    owner: 'test',
    method: 'GET',
    path: '/test'
  }).valid,
  true
);

assert.equal(
  server.validate({
    id: '',
    owner: '',
    method: 'INVALID',
    path: ''
  }).valid,
  false
);

assert.throws(
  () => createCanonicalServer([
    {
      id: 'server.x',
      owner: 'test',
      method: 'GET',
      path: '/x'
    },
    {
      id: 'server.x',
      owner: 'test',
      method: 'POST',
      path: '/y'
    }
  ]),
  /Duplicate server id/
);

assert.deepEqual(
  server.search('products'),
  [
    {
      id: 'server.products',
      owner: 'products',
      method: 'GET',
      path: '/api/products',
      contractId: 'products.catalog',
      status: 'active'
    }
  ]
);

const snapshot = server.get('server.products');
snapshot.owner = 'changed';

assert.equal(
  server.get('server.products').owner,
  'products'
);

assert.deepEqual(
  CanonicalServer.methods,
  ['GET', 'POST', 'PUT', 'PATCH', 'DELETE']
);

assert.deepEqual(
  CanonicalServer.statuses,
  ['active', 'stopped', 'degraded', 'disabled']
);

console.log('Canonical Server: 12/12 passed');
