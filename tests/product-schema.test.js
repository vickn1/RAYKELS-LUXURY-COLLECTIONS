import test from 'node:test';
import assert from 'node:assert/strict';
import { validateProduct } from '../server/lib/product-schema.js';

const baseProduct = {
  id: 'product-1',
  name: 'Luxury Wig',
  category: 'hair',
  currency: 'NGN',
  pricing: {
    price: 150000,
    salePrice: null
  },
  images: [
    {
      id: 'image-1',
      url: '/uploads/products/product-1/image-1.jpg'
    },
    {
      id: 'image-2',
      url: '/uploads/products/product-1/image-2.jpg'
    }
  ],
  videos: [
    {
      id: 'video-1',
      url: '/uploads/products/product-1/video-1.mp4'
    }
  ],
  mediaOrder: [
    'image-1',
    'video-1',
    'image-2'
  ]
};

test('accepts valid mixed media order', () => {
  const result = validateProduct(baseProduct);
  assert.equal(result.valid, true);
});

test('rejects duplicate mediaOrder ids', () => {
  const result = validateProduct({
    ...baseProduct,
    mediaOrder: ['image-1', 'video-1', 'image-1']
  });

  assert.equal(result.valid, false);
});

test('rejects unknown mediaOrder ids', () => {
  const result = validateProduct({
    ...baseProduct,
    mediaOrder: ['image-1', 'video-does-not-exist']
  });

  assert.equal(result.valid, false);
});

test('allows legacy products without mediaOrder', () => {
  const legacy = { ...baseProduct };
  delete legacy.mediaOrder;

  const result = validateProduct(legacy);
  assert.equal(result.valid, true);
});

test('rejects invalid category', () => {
  const result = validateProduct({
    ...baseProduct,
    category: 'invalid'
  });

  assert.equal(result.valid, false);
});
