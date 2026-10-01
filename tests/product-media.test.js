import test from 'node:test';
import assert from 'node:assert/strict';

import {
  getProductMedia,
  getProductPrimaryMedia,
  getProductImageForVariant,
  getProductImages,
  getProductVideos
} from '../products/lib/product-media.js';

const product = {
  id: 'product-1',

  images: [
    {
      id: 'image-1',
      url: '/image-1.jpg'
    },
    {
      id: 'image-2',
      url: '/image-2.jpg'
    }
  ],

  videos: [
    {
      id: 'video-1',
      url: '/video-1.mp4',
      poster: '/poster.jpg'
    }
  ],

  mediaOrder: [
    'image-1',
    'video-1',
    'image-2'
  ]
};

test('returns mixed media in canonical order', () => {
  const media = getProductMedia(product);

  assert.deepEqual(
    media.map(item => item.id),
    ['image-1', 'video-1', 'image-2']
  );

  assert.deepEqual(
    media.map(item => item.type),
    ['image', 'video', 'image']
  );
});

test('returns primary media from canonical order', () => {
  assert.equal(
    getProductPrimaryMedia(product)?.id,
    'image-1'
  );
});

test('returns variant image by image id', () => {
  const result = getProductImageForVariant(
    product,
    { imageIds: ['image-2'] }
  );

  assert.equal(result?.id, 'image-2');
});

test('falls back to first image for variant without match', () => {
  const result = getProductImageForVariant(
    product,
    { imageIds: ['missing-image'] }
  );

  assert.equal(result?.id, 'image-1');
});

test('filters images and videos from canonical media', () => {
  assert.deepEqual(
    getProductImages(product).map(item => item.id),
    ['image-1', 'image-2']
  );

  assert.deepEqual(
    getProductVideos(product).map(item => item.id),
    ['video-1']
  );
});

test('legacy products still work without mediaOrder', () => {
  const legacy = {
    id: 'legacy',
    images: ['/legacy-1.jpg'],
    videos: ['/legacy.mp4']
  };

  const media = getProductMedia(legacy);

  assert.deepEqual(
    media.map(item => item.type),
    ['image', 'video']
  );
});
