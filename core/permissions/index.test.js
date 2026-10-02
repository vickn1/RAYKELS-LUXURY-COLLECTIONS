import assert from 'node:assert/strict';
import { CorePermissions } from './index.js';

const permissions = CorePermissions.load([
  {
    id: 'product.created.001',
    type: 'product.created',
    source: 'products',
    contractId: 'products.catalog',
    payload: { productId: 'product-001' }
  },
  {
    id: 'product.failed.001',
    type: 'product.failed',
    source: 'products',
    contractId: 'products.catalog',
    status: 'failed',
    payload: { productId: 'product-002' }
  }
]);

assert.equal(permissions.list().length, 2);

assert.equal(
  permissions.isAllowed(
    'products',
    'read',
    'product.created.001'
  ),
  true
);

assert.equal(
  permissions.isAllowed(
    'products',
    'read',
    'product.failed.001'
  ),
  false
);

assert.equal(
  permissions.get('permission.product.created.001.read').status,
  'active'
);

assert.equal(
  permissions.get('permission.product.failed.001.read').status,
  'disabled'
);

console.log('Core Permissions connection: 5/5 passed');
