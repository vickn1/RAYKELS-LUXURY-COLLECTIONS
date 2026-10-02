import assert from 'node:assert/strict';
import { createCanonicalRegistry } from './canonical-registry.js';

const registry = createCanonicalRegistry({
  registryId: 'raykels.system',
  registryVersion: '2.0.0',

  components: [
    {
      id: 'products',
      name: 'Products',
      type: 'domain',
      owner: 'products',
      status: 'active',
      version: '1.0.0',
      dependencies: ['core.registry'],
      consumers: ['storefront', 'admin.products'],
      securityLevel: 3
    },
    {
      id: 'wizard',
      name: 'Wizard',
      type: 'developer-system',
      owner: 'developer',
      status: 'planned',
      version: '1.0.0',
      dependencies: ['core.registry'],
      consumers: [],
      securityLevel: 5
    }
  ],

  capabilities: [
    {
      id: 'products.manage',
      owner: 'products',
      permissionLevel: 3,
      status: 'active'
    }
  ],

  contracts: [
    {
      id: 'products.catalog',
      owner: 'products',
      type: 'api',
      method: 'GET',
      path: '/api/products',
      status: 'active'
    }
  ],

  settings: [
    {
      id: 'front_page.hero.rotation_seconds',
      name: 'Hero Rotation Interval',
      owner: 'front_page',
      type: 'number',
      permissionLevel: 4,
      status: 'active'
    }
  ]
});

assert.equal(registry.getRegistry().registryId, 'raykels.system');
assert.equal(registry.getComponent('products').owner, 'products');
assert.equal(registry.getModule('products').id, 'products');
assert.equal(registry.getCapability('products.manage').permissionLevel, 3);
assert.equal(registry.getContract('products.catalog').path, '/api/products');
assert.equal(
  registry.getSetting('front_page.hero.rotation_seconds').type,
  'number'
);

assert.deepEqual(
  registry.getDependencies('products'),
  ['core.registry']
);

assert.deepEqual(
  registry.getConsumers('products'),
  ['storefront', 'admin.products']
);

assert.equal(registry.search('wizard')[0].id, 'wizard');
assert.equal(registry.search('products.catalog')[0].id, 'products.catalog');

const snapshot = registry.getRegistry();
snapshot.components[0].name = 'MUTATED';

assert.equal(
  registry.getComponent('products').name,
  'Products'
);

console.log('Canonical Registry: 12/12 passed');
