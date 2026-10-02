import assert from 'node:assert/strict';
import {
  CoreServices,
  loadCanonicalServices
} from './index.js';

const services = loadCanonicalServices();

assert.equal(services.list().length, 1);

const service = services.get(
  'service.server.products.catalog'
);

assert.equal(service.owner, 'products');
assert.equal(
  service.endpointId,
  'server.products.catalog'
);
assert.equal(service.status, 'running');

assert.equal(
  services.isRunning('service.server.products.catalog'),
  true
);

assert.equal(
  CoreServices.load,
  loadCanonicalServices
);

assert.equal(
  services.has('service.server.products.media.normalized'),
  false
);

console.log('Service connection: 6/6 passed');
