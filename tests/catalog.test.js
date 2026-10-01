import test from 'node:test';
import assert from 'node:assert/strict';

import {
  normalizeProduct,
  normalizeProducts
} from '../products/lib/catalog.js';

const product = {
  id: 'catalog_test',
  name: 'Catalog Test',
  category: 'hair',
  images: [
    {
      id: 'img-1',
      url: '/img.jpg'
    }
  ],
  videos: [
    {
      id: 'vid-1',
      url: '/video.mp4'
    }
  ],
  mediaOrder: ['vid-1', 'img-1'],
  variants: [
    {
      name: 'Black',
      imageIds: ['img-1']
    }
  ]
};

test('normalizes product media through canonical domain', () => {
  const result = normalizeProduct(product);

  assert.equal(result.id, 'catalog_test');
  assert.equal(result.media.length, 2);
  assert.equal(result.media[0].id, 'vid-1');
  assert.equal(result.media[1].id, 'img-1');
  assert.equal(result.primaryMedia.id, 'vid-1');
  assert.equal(result.images.length, 1);
  assert.equal(result.videos.length, 1);
});

test('resolves variant image through canonical media', () => {
  const result = normalizeProduct(product);
  const image = result.getVariantImage(product.variants[0]);

  assert.equal(image.id, 'img-1');
  assert.equal(image.type, 'image');
});

test('normalizes product collections', () => {
  const result = normalizeProducts([
    product,
    null,
    undefined
  ]);

  assert.equal(result.length, 1);
  assert.equal(result[0].id, 'catalog_test');
});

test('rejects invalid product input', () => {
  assert.equal(normalizeProduct(null), null);
  assert.deepEqual(normalizeProducts(null), []);
});

test('legacy products without mediaOrder remain supported', () => {
  const result = normalizeProduct({
    id: 'legacy',
    name: 'Legacy',
    category: 'bags',
    images: ['/one.jpg'],
    videos: ['/one.mp4']
  });

  assert.equal(result.media.length, 2);
  assert.equal(result.images.length, 1);
  assert.equal(result.videos.length, 1);
});
