import assert from 'node:assert/strict';
import { CoreRegistry } from './index.js';

const registry = CoreRegistry.load();

const snapshot = registry.getRegistry();

assert.equal(snapshot.registryId, 'raykels.system');
assert.equal(snapshot.registryVersion, '2.0.0');
assert.equal(snapshot.status, 'active');

assert.ok(Array.isArray(snapshot.components));
assert.ok(Array.isArray(snapshot.capabilities));
assert.ok(Array.isArray(snapshot.contracts));
assert.ok(Array.isArray(snapshot.settings));

assert.ok(registry.getComponent('products'));
assert.ok(registry.getComponent('orders'));
assert.ok(registry.getComponent('admin'));

assert.equal(
  registry.getContract('products.catalog')?.path,
  '/api/products'
);

assert.ok(registry.getCapability('products.manage'));

assert.ok(
  registry.getSetting('front_page.hero.rotation_seconds')
);

assert.ok(
  registry.search('products').length > 0
);

console.log('Core Registry Connection: 10/10 passed');
