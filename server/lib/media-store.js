import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const UPLOAD_ROOT = path.resolve(
  process.cwd(),
  'uploads/products'
);

const IMAGE_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp'
]);

const VIDEO_TYPES = new Set([
  'video/mp4',
  'video/webm',
  'video/quicktime'
]);

const IMAGE_MAX_BYTES = 10 * 1024 * 1024;
const VIDEO_MAX_BYTES = 100 * 1024 * 1024;

const EXTENSIONS = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
  'video/mp4': '.mp4',
  'video/webm': '.webm',
  'video/quicktime': '.mov'
};

function assertProductId(productId) {
  if (
    typeof productId !== 'string' ||
    !/^[a-zA-Z0-9_-]+$/.test(productId)
  ) {
    throw new Error('Invalid product id.');
  }
}

function getMediaType(mimeType) {
  if (IMAGE_TYPES.has(mimeType)) return 'image';
  if (VIDEO_TYPES.has(mimeType)) return 'video';
  return null;
}

export function validateMediaUpload({
  mimeType,
  size
}) {
  const type = getMediaType(mimeType);

  if (!type) {
    return {
      valid: false,
      error: 'Unsupported media type.'
    };
  }

  const limit =
    type === 'image'
      ? IMAGE_MAX_BYTES
      : VIDEO_MAX_BYTES;

  if (!Number.isInteger(size) || size <= 0) {
    return {
      valid: false,
      error: 'Invalid media size.'
    };
  }

  if (size > limit) {
    return {
      valid: false,
      error:
        type === 'image'
          ? 'Image exceeds the 10MB limit.'
          : 'Video exceeds the 100MB limit.'
    };
  }

  return {
    valid: true,
    type,
    extension: EXTENSIONS[mimeType]
  };
}

export function saveMedia({
  productId,
  mimeType,
  size,
  buffer
}) {
  assertProductId(productId);

  const validation = validateMediaUpload({
    mimeType,
    size
  });

  if (!validation.valid) {
    throw new Error(validation.error);
  }

  if (!Buffer.isBuffer(buffer) || buffer.length !== size) {
    throw new Error('Invalid media buffer.');
  }

  const directory = path.join(
    UPLOAD_ROOT,
    productId
  );

  fs.mkdirSync(directory, {
    recursive: true
  });

  const id = `${Date.now()}-${crypto.randomBytes(6).toString('hex')}`;

  const filename =
    `${id}${validation.extension}`;

  const filePath = path.join(
    directory,
    filename
  );

  fs.writeFileSync(filePath, buffer, {
    flag: 'wx'
  });

  return {
    id: `${productId}-${validation.type}-${id}`,
    type: validation.type,
    url: `/uploads/products/${productId}/${filename}`
  };
}

export function deleteMedia(productId, filename) {
  assertProductId(productId);

  if (
    typeof filename !== 'string' ||
    filename !== path.basename(filename) ||
    filename.includes('..')
  ) {
    throw new Error('Invalid media filename.');
  }

  const directory = path.join(
    UPLOAD_ROOT,
    productId
  );

  const filePath = path.join(
    directory,
    filename
  );

  if (!filePath.startsWith(`${directory}${path.sep}`)) {
    throw new Error('Invalid media path.');
  }

  if (!fs.existsSync(filePath)) {
    return false;
  }

  fs.unlinkSync(filePath);
  return true;
}

export function deleteProductMedia(productId) {
  assertProductId(productId);

  const directory = path.join(
    UPLOAD_ROOT,
    productId
  );

  if (!fs.existsSync(directory)) {
    return false;
  }

  fs.rmSync(directory, {
    recursive: true,
    force: true
  });

  return true;
}
