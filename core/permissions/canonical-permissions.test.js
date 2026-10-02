import assert from 'node:assert/strict';
import { createCanonicalPermissions } from './canonical-permissions.js';

const permissions = createCanonicalPermissions([
  {
    id: 'permission.products.read',
    actor: 'admin',
    action: 'read',
    resource: 'products'
  },
  {
    id: 'permission.products.write',
    actor: 'admin',
    action: 'write',
    resource: 'products'
  },
  {
    id: 'permission.products.revoked',
    actor: 'developer',
    action: 'write',
    resource: 'products',
    status: 'revoked'
  }
]);

assert.equal(permissions.list().length, 3);
assert.equal(permissions.get('permission.products.read').actor, 'admin');
assert.equal(permissions.has('permission.products.write'), true);

assert.equal(
  permissions.isAllowed('admin', 'read', 'products'),
  true
);

assert.equal(
  permissions.isAllowed('developer', 'write', 'products'),
  false
);

assert.equal(
  permissions.isAllowed('admin', 'delete', 'products'),
  false
);

assert.equal(
  permissions.validate({
    id: '',
    actor: 'admin',
    action: 'read',
    resource: 'products'
  }).valid,
  false
);

const normalized = permissions.normalize({
  id: 'permission.orders.read',
  actor: 'admin',
  action: 'read',
  resource: 'orders'
});

assert.equal(normalized.status, 'active');

assert.equal(
  permissions.search('products').length,
  3
);

console.log('Canonical Permissions: 9/9 passed');
