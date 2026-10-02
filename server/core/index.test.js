import assert from 'node:assert/strict';
import {
  CoreServer,
  loadCanonicalServer
} from './index.js';

const server = loadCanonicalServer();

assert.equal(server.list().length, 1);

const productApi = server.get('server.products.catalog');

assert.equal(productApi.owner, 'products');
assert.equal(productApi.method, 'GET');
assert.equal(productApi.path, '/api/products');
assert.equal(productApi.contractId, 'products.catalog');
assert.equal(productApi.status, 'active');

assert.equal(
  server.has('server.products.media.normalized'),
  false
);

assert.equal(
  server.isActive('server.products.catalog'),
  true
);

assert.equal(
  CoreServer.load,
  loadCanonicalServer
);

console.log('Server connection: 10/10 passed');
