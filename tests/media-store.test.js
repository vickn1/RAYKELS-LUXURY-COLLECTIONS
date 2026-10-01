import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

import {
  validateMediaUpload,
  saveMedia,
  deleteMedia,
  deleteProductMedia
} from '../server/lib/media-store.js';

const productId = 'media_test_product';
const uploadDir = path.resolve(
  process.cwd(),
  'uploads/products',
  productId
);

test.after(() => {
  deleteProductMedia(productId);
});

test('accepts supported image', () => {
  const result = validateMediaUpload({
    mimeType: 'image/jpeg',
    size: 1024
  });

  assert.equal(result.valid, true);
  assert.equal(result.type, 'image');
});

test('accepts supported video', () => {
  const result = validateMediaUpload({
    mimeType: 'video/mp4',
    size: 1024
  });

  assert.equal(result.valid, true);
  assert.equal(result.type, 'video');
});

test('rejects unsupported media type', () => {
  const result = validateMediaUpload({
    mimeType: 'application/pdf',
    size: 1024
  });

  assert.equal(result.valid, false);
});

test('rejects oversized image', () => {
  const result = validateMediaUpload({
    mimeType: 'image/jpeg',
    size: 10 * 1024 * 1024 + 1
  });

  assert.equal(result.valid, false);
});

test('rejects oversized video', () => {
  const result = validateMediaUpload({
    mimeType: 'video/mp4',
    size: 100 * 1024 * 1024 + 1
  });

  assert.equal(result.valid, false);
});

test('saves media with generated safe filename', () => {
  const buffer = Buffer.from('test-image');

  const result = saveMedia({
    productId,
    mimeType: 'image/jpeg',
    size: buffer.length,
    buffer
  });

  assert.equal(result.type, 'image');
  assert.match(result.url, /^\/uploads\/products\/media_test_product\/.+\.jpg$/);

  const filename = path.basename(result.url);

  assert.equal(
    fs.existsSync(path.join(uploadDir, filename)),
    true
  );

  assert.equal(deleteMedia(productId, filename), true);
});

test('rejects path traversal product id', () => {
  assert.throws(
    () => deleteProductMedia('../escape'),
    /Invalid product id/
  );
});

test('rejects path traversal filename', () => {
  assert.throws(
    () => deleteMedia(productId, '../escape.jpg'),
    /Invalid media filename/
  );
});
