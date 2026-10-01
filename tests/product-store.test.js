import test from 'node:test';
import assert from 'node:assert/strict';

import fs from 'node:fs';
import path from 'node:path';

import {
  listProducts,
  findProduct,
  createProduct,
  updateProduct,
  deleteProduct
} from '../server/lib/product-store.js';

const storeFile = path.resolve(
  process.cwd(),
  'data/products.json'
);

const original = fs.existsSync(storeFile)
  ? fs.readFileSync(storeFile, 'utf8')
  : null;

const testId = `test-${Date.now()}`;

const product = {
  id: testId,
  name: 'Reconstruction Test Product',
  category: 'hair',
  published: false,
  images: [],
  videos: [],
  mediaOrder: []
};

test.after(() => {
  try {
    const current = fs.existsSync(storeFile)
      ? JSON.parse(fs.readFileSync(storeFile, 'utf8'))
      : { products: [] };

    current.products = current.products.filter(
      item => item.id !== testId
    );

    fs.writeFileSync(
      storeFile,
      `${JSON.stringify(current, null, 2)}\n`,
      'utf8'
    );
  } catch {}

  if (original !== null) {
    fs.writeFileSync(storeFile, original, 'utf8');
  }
});

test('lists products', () => {
  assert.ok(Array.isArray(listProducts()));
});

test('creates and finds a product', () => {
  createProduct(product);

  const found = findProduct(testId);

  assert.deepEqual(found, product);
});

test('updates a product', () => {
  const updated = {
    ...product,
    name: 'Updated Reconstruction Product'
  };

  const result = updateProduct(testId, updated);

  assert.deepEqual(result, updated);
  assert.equal(
    findProduct(testId)?.name,
    'Updated Reconstruction Product'
  );
});

test('deletes a product', () => {
  const result = deleteProduct(testId);

  assert.equal(result?.id, testId);
  assert.equal(findProduct(testId), null);
});
